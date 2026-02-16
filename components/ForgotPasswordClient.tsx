"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Footer from "@/components/layout/Footer";
import { LockClosedIcon } from "@heroicons/react-v1/outline";

type Step = "email" | "verify" | "reset";

export default function ForgotPasswordClient() {
  const [step, setStep] = useState<Step>("email");
  const [isLoading, setIsLoading] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [verifyError, setVerifyError] = useState("");

  // Step 1: Email & Binding Email
  const [email, setEmail] = useState("");
  const [bindingEmail, setBindingEmail] = useState("");
  const [requestBlockedUntil, setRequestBlockedUntil] = useState<Date | null>(
    null,
  );
  const [requestCountdown, setRequestCountdown] = useState(0);

  // Step 2: OTP Verification
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [resetToken, setResetToken] = useState("");
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(
    null,
  );
  const [blockedUntil, setBlockedUntil] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(0);
  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Step 3: New Password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  // Countdown timer for blocked state
  useEffect(() => {
    if (!blockedUntil) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.ceil((blockedUntil.getTime() - now.getTime()) / 1000);

      if (diff <= 0) {
        setBlockedUntil(null);
        setCountdown(0);
        setAttemptsRemaining(5);
      } else {
        setCountdown(diff);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [blockedUntil]);

  // Countdown timer for request blocked state
  useEffect(() => {
    if (!requestBlockedUntil) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.ceil(
        (requestBlockedUntil.getTime() - now.getTime()) / 1000,
      );

      if (diff <= 0) {
        setRequestBlockedUntil(null);
        setRequestCountdown(0);
      } else {
        setRequestCountdown(diff);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [requestBlockedUntil]);

  // Format countdown
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const clearVerifyState = () => {
    if (verifyError) setVerifyError("");
    if (blockedUntil) {
      setBlockedUntil(null);
      setCountdown(0);
    }
  };

  // Step 1: Request password reset
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setRequestError("");
    setIsLoading(true);

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/password/forgot`,
        {
          email: email,
          binding_email: bindingEmail || undefined,
        },
      );

      toast({
        description: bindingEmail
          ? `Verification code sent to ${bindingEmail}`
          : "Verification code sent to your email.",
        variant: "default",
      });

      setStep("verify");
      setAttemptsRemaining(5);

      // Focus first OTP input
      setTimeout(() => {
        otpRefs[0].current?.focus();
      }, 100);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const data = error.response.data as {
          message?: string;
          blocked_until?: string;
        };
        if (data.blocked_until) {
          setRequestBlockedUntil(new Date(data.blocked_until));
          setRequestError(
            data.message || "Too many failed attempts. Try again in 5 minutes.",
          );
        } else {
          setRequestError(data.message || "Failed to send code.");
        }
      } else {
        // Don't reveal if user exists - show generic message
        setRequestError(
          "If this email exists, a verification code has been sent.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // OTP input handling
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    clearVerifyState();

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    clearVerifyState();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 4);
    const newOtp = [...otp];

    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }

    setOtp(newOtp);
    const focusIndex = Math.min(pastedData.length, 3);
    otpRefs[focusIndex].current?.focus();
  };

  // Step 2: Verify code
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 4) return;

    if (blockedUntil) {
      setVerifyError(
        `Too many failed attempts. Try again in ${formatCountdown(countdown)}.`,
      );
      return;
    }

    setVerifyError("");
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/password/verify-code`,
        { email, code },
      );

      setResetToken(response.data.reset_token);
      setStep("reset");

      toast({
        description: "Code verified successfully.",
        variant: "default",
      });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const data = error.response.data;

        if (data.blocked_until) {
          setBlockedUntil(new Date(data.blocked_until));
          setVerifyError("Too many failed attempts. Try again in 5 minutes.");
        } else if (data.attempts_remaining !== undefined) {
          setAttemptsRemaining(data.attempts_remaining);
          setVerifyError(
            data.attempts_remaining === 1
              ? "One more attempt before access is blocked."
              : data.message || "Invalid verification code.",
          );
        } else {
          setVerifyError(data.message || "Invalid verification code.");
        }
      } else {
        setVerifyError("Failed to verify code. Please try again.");
      }

      setOtp(["", "", "", ""]);
      otpRefs[0].current?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  // Resend code
  const handleResendCode = async () => {
    setIsLoading(true);

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/password/forgot`,
        {
          email,
          binding_email: bindingEmail || undefined,
        },
      );

      toast({
        description: bindingEmail
          ? `Verification code resent to ${bindingEmail}`
          : "Verification code resent to your email.",
        variant: "default",
      });

      setOtp(["", "", "", ""]);
      setAttemptsRemaining(5);
      setBlockedUntil(null);
      otpRefs[0].current?.focus();
    } catch {
      toast({
        description: "Failed to resend code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) return;

    if (newPassword !== confirmPassword) {
      toast({
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/password/reset`,
        {
          email: email,
          reset_token: resetToken,
          new_password: newPassword,
        },
      );

      router.push("/?reset=success");
    } catch (error) {
      let errorMessage = "Failed to reset password. Please try again.";
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      toast({
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = email.trim() !== "" && bindingEmail.trim() !== "";

  useEffect(() => {
    if (!requestBlockedUntil && !requestError) return;
    setRequestBlockedUntil(null);
    setRequestCountdown(0);
    if (requestError) setRequestError("");
  }, [email, bindingEmail]);

  return (
    <>
      <div className="min-h-screen bg-neutral-50 flex flex-col justify-between items-center p-4 md:p-8 overflow-hidden relative">
        {/* Main content */}
        <div className="flex-1 flex items-center justify-center w-full max-w-sm z-10">
          {/* Card */}
          <div className="w-full bg-white rounded-xl shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] border border-neutral-200">
            <div className="flex flex-col gap-4 p-4 lg:p-6">
              {/* Logo */}
              <Image
                src="/mailria.png"
                alt="Mailria"
                width={112}
                height={40}
                className="h-10 w-28"
                priority
              />

              {/* Email & Binding Email Step */}
              {step === "email" && (
                <>
                  <div className="my-2 text-neutral-800 text-2xl font-medium">
                    Forgot Password
                  </div>
                  <form
                    onSubmit={handleRequestReset}
                    className="flex flex-col gap-5"
                  >
                    <div className="flex flex-col gap-3">
                      {/* Email Field */}
                      <div className="relative flex flex-col">
                        <div className="h-3.5" />
                        <div
                          className={cn(
                            "h-10 px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] flex items-center gap-3",
                            requestError
                              ? "outline-red-500"
                              : "outline-neutral-200",
                          )}
                        >
                          <div className="flex-1 flex items-center gap-2">
                            <Mail className="w-5 h-5 text-neutral-400" />
                            <input
                              id="email"
                              type="email"
                              autoComplete="email"
                              placeholder="example@mailria.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="flex-1 text-sm font-normal text-neutral-800 placeholder:text-neutral-200 bg-transparent outline-none"
                              required
                            />
                          </div>
                        </div>
                        <div className="px-1 absolute left-2 top-0 bg-white">
                          <span className="text-[10px] font-normal text-neutral-800 leading-4">
                            Email
                          </span>
                        </div>
                      </div>

                      {/* Binding Email Field */}
                      <div className="relative flex flex-col">
                        <div className="h-3.5" />
                        <div
                          className={cn(
                            "h-10 px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] flex items-center gap-3",
                            requestError
                              ? "outline-red-500"
                              : "outline-neutral-200",
                          )}
                        >
                          <div className="flex-1 flex items-center gap-2">
                            <Mail className="w-5 h-5 text-neutral-400" />
                            <input
                              id="binding-email"
                              type="email"
                              autoComplete="off"
                              placeholder="example@gmail.com"
                              value={bindingEmail}
                              onChange={(e) => setBindingEmail(e.target.value)}
                              className="flex-1 text-sm font-normal text-neutral-800 placeholder:text-neutral-200 bg-transparent outline-none"
                              required
                            />
                          </div>
                        </div>
                        <div className="px-1 absolute left-2 top-0 bg-white">
                          <span className="text-[10px] font-normal text-neutral-800 leading-4">
                            Binding email
                          </span>
                        </div>
                      </div>

                      {requestError && (
                        <p className="text-[12px] font-normal text-red-500">
                          {requestError}
                        </p>
                      )}
                      {/* Helper text */}
                      <p className="text-neutral-500 text-xs leading-5">
                        Binding email is an alternative email used to recover
                        your password via the settings menu.
                      </p>
                    </div>

                    <div className="flex flex-col gap-1">
                      <Button
                        type="submit"
                        disabled={
                          isLoading || !isFormValid || !!requestBlockedUntil
                        }
                        className="w-full text-base font-medium"
                      >
                        {requestBlockedUntil ? (
                          <span className="inline-flex items-center gap-2">
                            <LockClosedIcon className="h-4 w-4" />
                            <span>
                              Reset password (
                              {formatCountdown(requestCountdown)})
                            </span>
                          </span>
                        ) : isLoading ? (
                          "Sending..."
                        ) : (
                          "Reset password"
                        )}
                      </Button>

                      <Link
                        href="/"
                        className="h-9 flex items-center justify-center text-primary-500 text-base font-medium hover:text-primary-500"
                      >
                        Back to login
                      </Link>
                    </div>
                  </form>

                  {/* Support */}
                  <p className="mt-4 text-xs font-normal text-center">
                    <span className="text-neutral-800">Support by: </span>
                    <a
                      className="text-primary-500 font-medium underline"
                      href="https://gamemarket.gg"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      GameMarket.gg
                    </a>{" "}
                    <span className="text-neutral-800">
                      Ultimate gaming marketplace!
                    </span>
                  </p>
                </>
              )}

              {/* Verify Code Step */}
              {step === "verify" && (
                <>
                  <div className="flex flex-col gap-1">
                    <div className="text-neutral-800 text-2xl font-medium">
                      Enter Verification Code
                    </div>
                    <p className="text-sm text-neutral-800">
                      An email with verification code just sent to{" "}
                      <span className="font-medium">
                        {bindingEmail || email}
                      </span>
                    </p>
                  </div>
                  <form
                    onSubmit={handleVerifyCode}
                    className="flex flex-col gap-5"
                  >
                    <div className="flex flex-col">
                      {/* Warning for last attempt */}
                      {!blockedUntil && attemptsRemaining === 1 && (
                        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                          <p className="text-sm text-yellow-700">
                            One more attempt before access is blocked.
                          </p>
                        </div>
                      )}

                      <div className="mb-2 text-sm font-medium leading-4 text-neutral-900">
                        Enter code
                      </div>

                      {/* OTP Input */}
                      <div
                        className="flex w-full gap-2"
                        onPaste={handleOtpPaste}
                      >
                        {otp.map((digit, index) => (
                          <Input
                            key={index}
                            ref={otpRefs[index]}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) =>
                              handleOtpChange(index, e.target.value)
                            }
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            disabled={!!blockedUntil}
                            className={cn(
                              "flex-1 h-12 bg-white text-center text-xl font-normal border-neutral-200 rounded-lg",
                              verifyError &&
                                "outline outline-1 outline-offset-[-1px] outline-red-500 border-transparent",
                              blockedUntil && "cursor-not-allowed",
                            )}
                          />
                        ))}
                      </div>

                      {attemptsRemaining !== null &&
                        !blockedUntil &&
                        attemptsRemaining < 5 && (
                          <p className="text-xs text-center text-neutral-500">
                            {attemptsRemaining} attempts remaining
                          </p>
                      )}
                      {verifyError && (
                        <p
                          className="mt-2 text-left text-[12px] font-normal leading-[14px]"
                          style={{ color: "var(--destructive-500-main, #EF4444)" }}
                        >
                          {verifyError}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <Button
                        type="submit"
                        disabled={
                          isLoading ||
                          otp.join("").length !== 4 ||
                          !!blockedUntil
                        }
                        className="w-full text-base font-medium"
                      >
                        {blockedUntil ? (
                          <span className="inline-flex items-center gap-2">
                            <LockClosedIcon className="h-4 w-4" />
                            <span>Next ({formatCountdown(countdown)})</span>
                          </span>
                        ) : isLoading ? (
                          "Verifying..."
                        ) : (
                          "Next"
                        )}
                      </Button>

                      {/* <Button
                      type="button"
                      variant="ghost"
                      onClick={handleResendCode}
                      disabled={isLoading}
                      className="h-9 text-primary-500 text-base font-medium hover:text-primary-500 hover:bg-transparent"
                    >
                      Resend code
                    </Button> */}

                      {/* <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setStep("email");
                        setOtp(["", "", "", ""]);
                      }}
                      className="h-9 text-neutral-500 text-sm hover:text-neutral-700 hover:bg-transparent"
                    >
                      Back
                    </Button> */}
                      <Link
                        href="/"
                        className="h-9 flex items-center justify-center text-primary-500 text-base font-medium hover:text-primary-500"
                      >
                        Back to login
                      </Link>

                      {/* Support */}
                      <p className="mt-4 text-xs font-normal text-center">
                        <span className="text-neutral-800">Support by: </span>
                        <a
                          className="text-primary-500 font-medium underline"
                          href="https://gamemarket.gg"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          GameMarket.gg
                        </a>{" "}
                        <span className="text-neutral-800">
                          Ultimate gaming marketplace!
                        </span>
                      </p>
                    </div>
                  </form>
                </>
              )}

              {/* Reset Password Step */}
              {step === "reset" && (
                <div className="self-stretch flex flex-[1_0_0] flex-col items-start gap-4">
                  <div className="text-neutral-800 text-2xl font-medium">
                    Change password
                  </div>
                  <p className="text-sm text-neutral-800">
                    Create a new password with at least 6 characters for{" "}
                    <span className="font-normal">{email}</span>.
                  </p>
                  <form
                    onSubmit={handleResetPassword}
                    className="w-full flex flex-col gap-5"
                  >
                    <div className="flex flex-col gap-3">

                      {/* New Password Field */}
                      <div className="relative flex flex-col">
                        <div className="h-3.5" />
                        <div className="h-10 px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-neutral-200 flex items-center gap-3">
                          <div className="flex-1 flex items-center gap-2">
                            <LockClosedIcon className="w-5 h-5 text-neutral-400" />
                            <input
                              id="new-password"
                              type={showNewPassword ? "text" : "password"}
                              placeholder="Enter new password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="flex-1 text-sm font-normal text-neutral-800 placeholder:text-neutral-200 bg-transparent outline-none"
                              required
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="h-auto w-auto p-0 hover:bg-transparent"
                          >
                            {showNewPassword ? (
                              <Eye className="w-5 h-5 text-neutral-800" />
                            ) : (
                              <EyeOff className="w-5 h-5 text-neutral-800" />
                            )}
                          </Button>
                        </div>
                        <div className="px-1 absolute left-2 top-0 bg-white">
                          <span className="text-[10px] font-normal text-neutral-800 leading-4">
                            New Password
                          </span>
                        </div>
                      </div>

                      {/* Confirm Password Field */}
                      <div className="relative flex flex-col">
                        <div className="h-3.5" />
                        <div
                          className={cn(
                            "h-10 px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] flex items-center gap-3",
                            confirmPassword && newPassword !== confirmPassword
                              ? "outline-red-500"
                              : "outline-neutral-200",
                          )}
                        >
                          <div className="flex-1 flex items-center gap-2">
                            <LockClosedIcon className="w-5 h-5 text-neutral-400" />
                            <input
                              id="confirm-password"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm new password"
                              value={confirmPassword}
                              onChange={(e) =>
                                setConfirmPassword(e.target.value)
                              }
                              className="flex-1 text-sm font-normal text-neutral-800 placeholder:text-neutral-200 bg-transparent outline-none"
                              required
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="h-auto w-auto p-0 hover:bg-transparent"
                          >
                            {showConfirmPassword ? (
                              <Eye className="w-5 h-5 text-neutral-800" />
                            ) : (
                              <EyeOff className="w-5 h-5 text-neutral-800" />
                            )}
                          </Button>
                        </div>
                        <div className="px-1 absolute left-2 top-0 bg-white">
                          <span className="text-[10px] font-normal text-neutral-800 leading-4">
                            Confirm Password
                          </span>
                        </div>
                        {confirmPassword && newPassword !== confirmPassword && (
                          <p className="text-xs text-red-500 mt-1">
                            Your confirmation password doesn&apos;t match
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <Button
                        type="submit"
                        disabled={
                          isLoading ||
                          !newPassword ||
                          !confirmPassword ||
                          newPassword !== confirmPassword
                        }
                        className="w-full text-base font-medium"
                      >
                        {isLoading ? "Resetting..." : "Reset password"}
                      </Button>

                      <Link
                        href="/"
                        className="h-9 flex items-center justify-center text-primary-500 text-base font-medium hover:text-primary-500"
                      >
                        Back to login
                      </Link>
                    </div>
                  </form>

                  <p className="mt-4 w-full text-xs font-normal text-center">
                    <span className="text-neutral-800">Support by: </span>
                    <a
                      className="text-primary-500 font-medium underline"
                      href="https://gamemarket.gg"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      GameMarket.gg
                    </a>{" "}
                    <span className="text-neutral-800">
                      Ultimate gaming marketplace!
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <Footer className="z-10" />
      </div>

      <Toaster />
    </>
  );
}

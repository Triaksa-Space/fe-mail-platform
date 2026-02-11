"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, CheckCircle, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Footer from "@/components/layout/Footer";
import { LockClosedIcon } from "@heroicons/react-v1/outline"

type Step = "email" | "verify" | "reset" | "success";

export default function ForgotPasswordClient() {
  const [step, setStep] = useState<Step>("email");
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Email & Binding Email
  const [email, setEmail] = useState("");
  const [bindingEmail, setBindingEmail] = useState("");

  // Step 2: OTP Verification
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [resetToken, setResetToken] = useState("");
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
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

  // Format countdown
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Step 1: Request password reset
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/password/forgot`, {
        email: email,
        binding_email: bindingEmail || undefined,
      });

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
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        toast({
          description: error.response.data.error,
          variant: "destructive",
        });
      } else {
        // Don't reveal if user exists - show generic message
        toast({
          description: "If this email exists, a verification code has been sent.",
          variant: "default",
        });
        setStep("verify");
        setAttemptsRemaining(5);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // OTP input handling
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
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
      toast({
        description: `Too many failed attempts. Try again in ${formatCountdown(countdown)}.`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/password/verify-code`,
        { email, code }
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
          toast({
            description: "Too many failed attempts. Try again in 5 minutes.",
            variant: "destructive",
          });
        } else if (data.attempts_remaining !== undefined) {
          setAttemptsRemaining(data.attempts_remaining);
          toast({
            description: data.attempts_remaining === 1
              ? "One more attempt before access is blocked."
              : data.error || "Invalid verification code.",
            variant: "destructive",
          });
        } else {
          toast({
            description: data.error || "Invalid verification code.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          description: "Failed to verify code. Please try again.",
          variant: "destructive",
        });
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
      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/password/forgot`, {
        email,
        binding_email: bindingEmail || undefined,
      });

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
      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/password/reset`, {
        email: email,
        reset_token: resetToken,
        new_password: newPassword,
      });

      setStep("success");

      toast({
        description: "Password reset successfully!",
        variant: "default",
      });
    } catch (error) {
      let errorMessage = "Failed to reset password. Please try again.";
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        errorMessage = error.response.data.error;
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

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex flex-col justify-between items-center p-4 overflow-hidden relative">
        {/* Background glow */}
        <div className="absolute w-[5000px] h-[5000px] -left-[2305px] top-[788px] bg-blue-100 rounded-full blur-[32px]" />

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center w-full max-w-sm z-10">
          {/* Card */}
          <div className="w-full p-4 bg-white rounded-xl shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] border border-gray-200 flex flex-col gap-4">
            {/* Logo */}
            <Image
              src="/mailria.png"
              alt="Mailria"
              width={112}
              height={40}
              className="h-10 w-28"
              priority
            />

            {/* Success State */}
            {step === "success" && (
              <>
                <div className="text-gray-800 text-2xl font-medium">Password Reset</div>
                <div className="flex flex-col items-center py-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Success!</h2>
                  <p className="text-sm text-gray-500 text-center mb-6">
                    Your password has been reset successfully. You can now login with your new password.
                  </p>
                  <Button onClick={() => router.push("/")} className="w-full text-base font-medium">
                    Back to Login
                  </Button>
                </div>
              </>
            )}

            {/* Email & Binding Email Step */}
            {step === "email" && (
              <>
                <div className="text-gray-800 text-2xl font-medium">Forgot Password</div>
                <form onSubmit={handleRequestReset} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-3">
                    {/* Email Field */}
                    <div className="relative flex flex-col">
                      <div className="h-3.5" />
                      <div className="h-10 px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] border border-gray-200 flex items-center gap-3">
                        <div className="flex-1 flex items-center gap-2">
                          <Mail className="w-5 h-5 text-gray-400" />
                          <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            placeholder="example@mailria.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex-1 text-sm font-normal text-gray-800 placeholder:text-gray-400 bg-transparent outline-none"
                            required
                          />
                        </div>
                      </div>
                      <div className="px-1 absolute left-2 top-0 bg-white">
                        <span className="text-[10px] font-normal text-gray-800 leading-4">Email</span>
                      </div>
                    </div>

                    {/* Binding Email Field */}
                    <div className="relative flex flex-col">
                      <div className="h-3.5" />
                      <div className="h-10 px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] border border-gray-200 flex items-center gap-3">
                        <div className="flex-1 flex items-center gap-2">
                          <Mail className="w-5 h-5 text-gray-400" />
                          <input
                            id="binding-email"
                            type="email"
                            autoComplete="off"
                            placeholder="example@gmail.com"
                            value={bindingEmail}
                            onChange={(e) => setBindingEmail(e.target.value)}
                            className="flex-1 text-sm font-normal text-gray-800 placeholder:text-gray-400 bg-transparent outline-none"
                            required
                          />
                        </div>
                      </div>
                      <div className="px-1 absolute left-2 top-0 bg-white">
                        <span className="text-[10px] font-normal text-gray-800 leading-4">Binding email <span className="text-red-500">*</span></span>
                      </div>
                    </div>

                    {/* Helper text */}
                    <p className="text-gray-500 text-xs leading-5">
                      Binding email is required to reset your password. You can set up a binding email in your account settings.
                    </p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <Button
                      type="submit"
                      disabled={isLoading || !isFormValid}
                      className="w-full text-base font-medium"
                    >
                      {isLoading ? "Sending..." : "Reset password"}
                    </Button>

                    <Link
                      href="/"
                      className="h-9 flex items-center justify-center text-primary-600 text-base font-medium hover:text-primary-700"
                    >
                      Back to login
                    </Link>
                  </div>
                </form>

                {/* Support */}
                <p className="text-xs font-normal text-center">
                  <span className="text-gray-800">Support by: </span>
                  <a
                    className="text-primary-500 font-medium underline"
                    href="https://gamemarket.gg"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GameMarket.gg
                  </a>{" "}
                  <span className="text-gray-800">Ultimate gaming marketplace!</span>
                </p>
              </>
            )}

            {/* Verify Code Step */}
            {step === "verify" && (
              <>
                <div className="text-gray-800 text-2xl font-medium">Enter Verification Code</div>
                <form onSubmit={handleVerifyCode} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-3">
                    <p className="text-sm text-gray-500">
                      Enter the 4-digit code sent to{" "}
                      <span className="font-medium">{bindingEmail || email}</span>
                    </p>

                    {/* Blocked Warning */}
                    {blockedUntil && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <p className="text-sm text-red-600">
                          Too many failed attempts. Try again in{" "}
                          <span className="font-medium">{formatCountdown(countdown)}</span>
                        </p>
                      </div>
                    )}

                    {/* Warning for last attempt */}
                    {!blockedUntil && attemptsRemaining === 1 && (
                      <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                        <p className="text-sm text-yellow-700">
                          One more attempt before access is blocked.
                        </p>
                      </div>
                    )}

                    {/* OTP Input */}
                    <div className="flex justify-center gap-3" onPaste={handleOtpPaste}>
                      {otp.map((digit, index) => (
                        <Input
                          key={index}
                          ref={otpRefs[index]}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          disabled={!!blockedUntil}
                          className={cn(
                            "w-12 h-12 text-center text-xl font-semibold border-gray-200 rounded-lg",
                            blockedUntil && "bg-gray-100 cursor-not-allowed"
                          )}
                        />
                      ))}
                    </div>

                    {attemptsRemaining !== null && !blockedUntil && attemptsRemaining < 5 && (
                      <p className="text-xs text-center text-gray-500">
                        {attemptsRemaining} attempts remaining
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <Button
                      type="submit"
                      disabled={isLoading || otp.join("").length !== 4 || !!blockedUntil}
                      className="w-full text-base font-medium"
                    >
                      {isLoading ? "Verifying..." : "Verify Code"}
                    </Button>

                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={isLoading}
                      className="h-9 flex items-center justify-center text-primary-600 text-base font-medium hover:text-primary-700"
                    >
                      Resend Code
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setStep("email");
                        setOtp(["", "", "", ""]);
                      }}
                      className="h-9 flex items-center justify-center text-gray-500 text-sm hover:text-gray-700"
                    >
                      Back
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* Reset Password Step */}
            {step === "reset" && (
              <>
                <div className="text-gray-800 text-2xl font-medium">Set New Password</div>
                <form onSubmit={handleResetPassword} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-3">
                    <p className="text-sm text-gray-500">
                      Create a strong password for your account
                    </p>

                    {/* New Password Field */}
                    <div className="relative flex flex-col">
                      <div className="h-3.5" />
                      <div className="h-10 px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] border border-gray-200 flex items-center gap-3">
                        <div className="flex-1 flex items-center gap-2">
                          <LockClosedIcon className="w-5 h-5 text-gray-400" />
                          <input
                            id="new-password"
                            type={showNewPassword ? "text" : "password"}
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="flex-1 text-sm font-normal text-gray-800 placeholder:text-gray-400 bg-transparent outline-none"
                            required
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="flex items-center"
                        >
                          {showNewPassword ? (
                            <EyeOff className="w-5 h-5 text-gray-800" />
                          ) : (
                            <Eye className="w-5 h-5 text-gray-800" />
                          )}
                        </button>
                      </div>
                      <div className="px-1 absolute left-2 top-0 bg-white">
                        <span className="text-[10px] font-normal text-gray-800 leading-4">New Password</span>
                      </div>
                    </div>

                    {/* Confirm Password Field */}
                    <div className="relative flex flex-col">
                      <div className="h-3.5" />
                      <div className={cn(
                        "h-10 px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] border flex items-center gap-3",
                        confirmPassword && newPassword !== confirmPassword
                          ? "border-red-300"
                          : "border-gray-200"
                      )}>
                        <div className="flex-1 flex items-center gap-2">
                          <LockClosedIcon className="w-5 h-5 text-gray-400" />
                          <input
                            id="confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="flex-1 text-sm font-normal text-gray-800 placeholder:text-gray-400 bg-transparent outline-none"
                            required
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="flex items-center"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-5 h-5 text-gray-800" />
                          ) : (
                            <Eye className="w-5 h-5 text-gray-800" />
                          )}
                        </button>
                      </div>
                      <div className="px-1 absolute left-2 top-0 bg-white">
                        <span className="text-[10px] font-normal text-gray-800 leading-4">Confirm Password</span>
                      </div>
                      {confirmPassword && newPassword !== confirmPassword && (
                        <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
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
                      {isLoading ? "Resetting..." : "Reset Password"}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <Footer className="z-10" />
      </div>

      <Toaster />
    </>
  );
}

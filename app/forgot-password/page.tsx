"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import PasswordInput from "@/components/PasswordInput";
import { PageLayout, AuthCard, Footer } from "@/components/layout";
import { cn } from "@/lib/utils";

type Step = "email" | "verify" | "reset" | "success";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Email
  const [email, setEmail] = useState("");

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

  // Step 1: Request code
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/password/forgot`, {
        email: email,
      });

      toast({
        description: "Verification code sent to your email.",
        variant: "default",
      });

      setStep("verify");
      setAttemptsRemaining(5);

      // Focus first OTP input
      setTimeout(() => {
        otpRefs[0].current?.focus();
      }, 100);
    } catch {
      // Don't reveal if user exists - show generic message
      toast({
        description: "If this email exists, a verification code has been sent.",
        variant: "default",
      });
      setStep("verify");
      setAttemptsRemaining(5);
    } finally {
      setIsLoading(false);
    }
  };

  // OTP input handling
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only digits

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only last digit
    setOtp(newOtp);

    // Auto-focus next input
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

    // Focus appropriate input
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
        {
          email: email,
          code: code,
        }
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
          const blockedDate = new Date(data.blocked_until);
          setBlockedUntil(blockedDate);
          toast({
            description: "Too many failed attempts. Try again in 5 minutes.",
            variant: "destructive",
          });
        } else if (data.attempts_remaining !== undefined) {
          setAttemptsRemaining(data.attempts_remaining);

          if (data.attempts_remaining === 1) {
            toast({
              description: "One more attempt before access is blocked.",
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

      // Clear OTP
      setOtp(["", "", "", ""]);
      otpRefs[0].current?.focus();
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

  // Stepper indicator
  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {["email", "verify", "reset"].map((s, i) => (
        <React.Fragment key={s}>
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
              step === s || (step === "success" && i === 2)
                ? "bg-blue-600 text-white"
                : ["email", "verify", "reset"].indexOf(step) > i ||
                  step === "success"
                ? "bg-blue-100 text-blue-600"
                : "bg-gray-100 text-gray-400"
            )}
          >
            {i + 1}
          </div>
          {i < 2 && (
            <div
              className={cn(
                "w-8 h-0.5 transition-colors",
                ["email", "verify", "reset"].indexOf(step) > i ||
                step === "success"
                  ? "bg-blue-600"
                  : "bg-gray-200"
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <>
      <PageLayout variant="auth" className="gap-8 py-8 md:py-12">
        <div className="flex-1 flex flex-col items-center justify-center w-full">
          <AuthCard>
            {/* Logo */}
            <div className="text-center mb-6">
              <Image
                src="/mailria.png"
                alt="Mailria"
                width={120}
                height={40}
                className="mx-auto h-10 w-auto"
                priority
              />
            </div>

            {/* Success State */}
            {step === "success" ? (
              <div className="text-center py-6">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Password Reset Successful
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                  Your password has been reset successfully. You can now login
                  with your new password.
                </p>
                <Button
                  onClick={() => router.push("/")}
                  className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Back to Login
                </Button>
              </div>
            ) : (
              <>
                <StepIndicator />

                {/* Back Link */}
                {step !== "email" && (
                  <button
                    onClick={() => {
                      if (step === "verify") setStep("email");
                      if (step === "reset") setStep("verify");
                    }}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                )}

                {/* Step 1: Email Input */}
                {step === "email" && (
                  <form onSubmit={handleRequestCode} className="space-y-4">
                    <div className="text-center mb-4">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Forgot Password
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Enter your email to receive a verification code
                      </p>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="email" className="text-xs text-gray-600">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="example@mailria.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-10 text-sm pl-10 border-gray-200 rounded-lg"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading || !email}
                      className={cn(
                        "w-full h-10 text-sm font-semibold rounded-lg transition-colors",
                        !email
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      )}
                    >
                      {isLoading ? "Sending..." : "Send Code"}
                    </Button>

                    <Link
                      href="/"
                      className="block text-center text-xs text-gray-500 hover:text-gray-700"
                    >
                      Back to Login
                    </Link>
                  </form>
                )}

                {/* Step 2: OTP Verification */}
                {step === "verify" && (
                  <form onSubmit={handleVerifyCode} className="space-y-4">
                    <div className="text-center mb-4">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Verify Code
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Enter the 4-digit code sent to{" "}
                        <span className="font-medium">{email}</span>
                      </p>
                    </div>

                    {/* Blocked Warning */}
                    {blockedUntil && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <p className="text-sm text-red-600">
                          Too many failed attempts. Try again in{" "}
                          <span className="font-medium">
                            {formatCountdown(countdown)}
                          </span>
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

                    <Button
                      type="submit"
                      disabled={isLoading || otp.join("").length !== 4 || !!blockedUntil}
                      className={cn(
                        "w-full h-10 text-sm font-semibold rounded-lg transition-colors",
                        otp.join("").length !== 4 || blockedUntil
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      )}
                    >
                      {isLoading ? "Verifying..." : "Verify Code"}
                    </Button>

                    <button
                      type="button"
                      onClick={handleRequestCode}
                      disabled={isLoading}
                      className="block w-full text-center text-xs text-blue-600 hover:text-blue-700"
                    >
                      Resend Code
                    </button>
                  </form>
                )}

                {/* Step 3: Reset Password */}
                {step === "reset" && (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="text-center mb-4">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Set New Password
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Create a strong password for your account
                      </p>
                    </div>

                    <div className="space-y-1">
                      <Label
                        htmlFor="new-password"
                        className="text-xs text-gray-600"
                      >
                        New Password
                      </Label>
                      <PasswordInput
                        id="new-password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        showPassword={showNewPassword}
                        setShowPassword={setShowNewPassword}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label
                        htmlFor="confirm-password"
                        className="text-xs text-gray-600"
                      >
                        Confirm Password
                      </Label>
                      <PasswordInput
                        id="confirm-password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        showPassword={showConfirmPassword}
                        setShowPassword={setShowConfirmPassword}
                      />
                      {confirmPassword && newPassword !== confirmPassword && (
                        <p className="text-xs text-red-500 mt-1">
                          Passwords do not match
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={
                        isLoading ||
                        !newPassword ||
                        !confirmPassword ||
                        newPassword !== confirmPassword
                      }
                      className={cn(
                        "w-full h-10 text-sm font-semibold rounded-lg transition-colors",
                        !newPassword ||
                          !confirmPassword ||
                          newPassword !== confirmPassword
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      )}
                    >
                      {isLoading ? "Resetting..." : "Reset Password"}
                    </Button>
                  </form>
                )}
              </>
            )}
          </AuthCard>
        </div>

        <Footer />
      </PageLayout>

      <Toaster />
    </>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import PasswordInput from "@/components/PasswordInput";
import FeatureList from "@/components/FeatureList";
import { PageLayout, AuthCard, Footer } from "@/components/layout";
import DOMPurify from "dompurify";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const { setToken, setEmail, setRoleId } = useAuthStore();
  const token = useAuthStore((state) => state.token);

  const router = useRouter();
  const { toast } = useToast();

  // Check existing token and redirect if valid
  useEffect(() => {
    if (!token) return;

    const checkToken = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/get_user_me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const userData = response.data;
        setEmail(userData.Email);
        setRoleId(userData.RoleID);

        // Redirect based on role
        if (userData.RoleID === 0 || userData.RoleID === 2) {
          router.push("/admin");
        } else if (userData.RoleID === 1) {
          router.push("/inbox");
        }
      } catch (error) {
        setToken(null);
        console.error("Token validation failed:", error);
      }
    };

    checkToken();
  }, [token, setEmail, setRoleId, router, setToken]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!loginEmail || !password) return;

    setIsLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/login`,
        { email: loginEmail, password: password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const { token } = response.data;
      setToken(token);
    } catch (error) {
      let errorMessage = "Incorrect email or password. Please try again.";
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

  const handleForgotPassword = () => {
    // TODO: Implement forgot password flow
    toast({
      description: "Please contact support@mailria.com for password reset.",
      variant: "default",
    });
  };

  return (
    <>
      <PageLayout variant="auth" className="gap-8 py-8 md:py-12">
        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center w-full">
          {/* Auth Card */}
          <AuthCard>
            {/* Logo + Tagline */}
            <div className="text-center mb-6">
              <Image
                src="/mailria.png"
                alt="Mailria"
                width={120}
                height={40}
                className="mx-auto h-10 w-auto"
                priority
              />
              <p className="text-xs text-gray-500 italic mt-3">
                Nothing Extra. Just What Matters.
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={onSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs text-gray-600">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    placeholder="example@mailria.com"
                    required
                    value={loginEmail}
                    onChange={(e) => {
                      const value = e.target.value;
                      const sanitizedValue = DOMPurify.sanitize(value).replace(
                        /\s/g,
                        ""
                      );
                      setLoginEmail(sanitizedValue);
                    }}
                    type="text"
                    className="h-10 text-sm pl-10 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <Label htmlFor="password" className="text-xs text-gray-600">
                  Password
                </Label>
                <PasswordInput
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    const value = e.target.value;
                    const sanitizedValue = DOMPurify.sanitize(value).replace(
                      /\s/g,
                      ""
                    );
                    setPassword(sanitizedValue);
                  }}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                />
              </div>

              {/* Remember me + Forgot Password */}
              <div className="flex items-center justify-between">
                <Checkbox
                  id="remember-me"
                  label="Remember me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <button
                  type="button"
                  className="text-xs text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                  onClick={handleForgotPassword}
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <Button
                className={`w-full h-10 text-sm font-semibold rounded-lg transition-colors ${
                  !loginEmail || !password
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
                type="submit"
                disabled={isLoading || !loginEmail || !password}
              >
                {isLoading ? "Signing in..." : "Login"}
              </Button>

              {/* Support By */}
              <p className="text-xs text-gray-500 text-center pt-2">
                Support by:{" "}
                <a
                  className="text-blue-600 hover:underline"
                  href="https://gamemarket.gg"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GameMarket.gg
                </a>{" "}
                - Ultimate gaming marketplace!
              </p>
            </form>
          </AuthCard>

          {/* Why Mailria Section */}
          <div className="mt-10">
            <FeatureList />
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </PageLayout>

      <Toaster />
    </>
  );
}

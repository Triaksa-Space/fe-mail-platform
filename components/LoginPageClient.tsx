"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import FeatureList from "@/components/FeatureList";
import { PageLayout, AuthCard, Footer } from "@/components/layout";
import DOMPurify from "dompurify";
import { LoginResponse } from "@/lib/api-types";

export default function LoginPageClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const { setAuth } = useAuthStore();
  const token = useAuthStore((state) => state.token);
  const roleId = useAuthStore((state) => state.roleId);

  const router = useRouter();
  const { toast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    if (!token || roleId === null) return;

    // Redirect based on stored role
    if (roleId === 0 || roleId === 2) {
      router.push("/admin");
    } else if (roleId === 1) {
      router.push("/inbox");
    }
  }, [token, roleId, router]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!loginEmail || !password) return;

    setIsLoading(true);

    try {
      const response = await axios.post<LoginResponse>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/login`,
        {
          email: loginEmail,
          password: password,
          remember_me: rememberMe,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const { access_token, refresh_token, user } = response.data;

      // Fetch user details to get permissions (for admin users)
      let permissions: string[] = user.permissions || [];
      if (user.role_id === 0 || user.role_id === 2) {
        try {
          const userMeResponse = await axios.get<{ permissions: string[] }>(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/get_user_me`,
            {
              headers: {
                Authorization: `Bearer ${access_token}`,
              },
            }
          );
          permissions = userMeResponse.data.permissions || [];
        } catch {
          // If fetching permissions fails, continue with empty permissions
          console.error("Failed to fetch user permissions");
        }
      }

      // Store all auth data including permissions
      setAuth({
        token: access_token,
        refreshToken: refresh_token,
        email: user.email,
        roleId: user.role_id,
        permissions: permissions,
        rememberMe: rememberMe,
      });

      // Redirect based on role
      if (user.role_id === 0 || user.role_id === 2) {
        router.push("/admin");
      } else if (user.role_id === 1) {
        router.push("/inbox");
      }
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

  const isFormValid = loginEmail && password;

  return (
    <>
      <PageLayout variant="auth" className="gap-8 py-4">
        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center w-full gap-8">
          {/* Auth Card */}
          <AuthCard>
            {/* Logo + Tagline */}
            <div className="flex flex-col items-center gap-0.5 mb-4">
              <Image
                src="/mailria.png"
                alt="Mailria"
                width={112}
                height={40}
                className="h-10 w-28"
                priority
              />
              <p className="text-sm font-normal text-gray-400">
                Nothing Extra. Just What Matters.
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-3">
                  {/* Email Field with Floating Label */}
                  <div className="relative flex flex-col">
                    <div className="h-3.5" />
                    <div className="h-10 px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] border border-gray-200 flex items-center gap-3">
                      <div className="flex-1 flex items-center gap-2">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <input
                          id="email"
                          name="email"
                          type="text"
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
                          className="flex-1 text-sm font-normal text-gray-800 placeholder:text-gray-400 bg-transparent outline-none"
                        />
                      </div>
                    </div>
                    <div className="px-1 absolute left-2 top-0 bg-white">
                      <span className="text-[10px] font-normal text-gray-800 leading-4">
                        Email
                      </span>
                    </div>
                  </div>

                  {/* Password Field with Floating Label */}
                  <div className="relative flex flex-col">
                    <div className="h-3.5" />
                    <div className="h-10 px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] border border-gray-200 flex items-center gap-3">
                      <div className="flex-1 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-gray-400" />
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="***********"
                          required
                          value={password}
                          onChange={(e) => {
                            const value = e.target.value;
                            const sanitizedValue = DOMPurify.sanitize(value).replace(
                              /\s/g,
                              ""
                            );
                            setPassword(sanitizedValue);
                          }}
                          className="flex-1 text-sm font-normal text-gray-800 placeholder:text-gray-400 bg-transparent outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5 text-gray-800" />
                        ) : (
                          <Eye className="w-5 h-5 text-gray-800" />
                        )}
                      </button>
                    </div>
                    <div className="px-1 absolute left-2 top-0 bg-white">
                      <span className="text-[10px] font-normal text-gray-800 leading-4">
                        Password
                      </span>
                    </div>
                  </div>
                </div>

                {/* Remember me + Forgot Password */}
                <div className="flex items-center justify-between">
                  <Checkbox
                    id="remember-me"
                    label="Remember me"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <Link
                    href="/forgot-password"
                    className="text-sm font-normal text-sky-600 hover:text-sky-700 hover:underline transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <Button
                  className={`w-full h-10 px-4 py-2.5 rounded-lg shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] text-base font-medium transition-colors ${
                    !isFormValid
                      ? "bg-blue-400 text-blue-300 border border-blue-300 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white border border-blue-500"
                  }`}
                  type="submit"
                  disabled={isLoading || !isFormValid}
                >
                  {isLoading ? "Signing in..." : "Login"}
                </Button>
              </div>

              {/* Support By */}
              <p className="text-xs font-normal text-center">
                <span className="text-gray-800">Support by: </span>
                <a
                  className="text-sky-600 font-semibold underline"
                  href="https://gamemarket.gg"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GameMarket.gg
                </a>{" "}
                <span className="text-gray-800">Ultimate gaming marketplace!</span>
              </p>
            </form>
          </AuthCard>

          {/* Why Mailria Section */}
          <FeatureList />
        </div>

        {/* Footer */}
        <Footer />
      </PageLayout>

      <Toaster />
    </>
  );
}

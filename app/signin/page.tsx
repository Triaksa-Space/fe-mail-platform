"use client";

import React, { useState, useEffect } from "react";
import { Mail, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

const SignInPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number>(0);

  const { token, setToken, setEmail, setRoleId } = useAuthStore();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const checkToken = async () => {
      if (token) {
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
          if (userData.RoleID === 0) {
            router.push("/admin");
          } else {
            router.push("/inbox");
          }
        } catch (error) {
          console.error("Token validation failed:", error);
        }
      }
    };

    checkToken();
  }, [token, setEmail, setRoleId, router]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (lockoutTime) return;

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();

    if (!email || !password) return;

    setIsLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/login`,
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const { token } = response.data;
      setToken(token);

      // // Get user details
      // const userResponse = await axios.get(
      //   `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/get_user_me`,
      //   {
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //     },
      //   }
      // );

      // const userData = userResponse.data;
      // setEmail(userData.Email);
      // setRoleId(userData.RoleID);

      // // Redirect based on role
      // if (userData.RoleID === 0) {
      //   router.push("/admin");
      // } else {
      //   router.push("/inbox");
      // }
    } catch (error) {
      console.error("Login failed:", error);
      setFailedAttempts((prev) => prev + 1);

      if (failedAttempts + 1 >= 4) {
        setLockoutTime(Date.now() + 10 * 60 * 1000);
      }

      // Show error toast
      toast({
        description: "Incorrect email or password.",
        className: "bg-red-500 text-white border-0",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!lockoutTime) return;

    const interval = setInterval(() => {
      const remaining = lockoutTime - Date.now();

      if (remaining <= 0) {
        clearInterval(interval);
        setLockoutTime(null);
        setFailedAttempts(0);
        setCountdown(0);
      } else {
        setCountdown(Math.ceil(remaining / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockoutTime]);

  return (
    <>
    <div className="flex flex-col min-h-screen justify-between bg-white p-4 pt-8">
      <div className="w-full max-w-sm mx-auto space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-xl font-semibold tracking-tight">
            Where Simplicity Meets Speed.
          </h1>
        </div>
        <form onSubmit={onSubmit} className="space-y-6 p-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-base">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <Input
                id="email"
                name="email"
                placeholder="example@mailria.com"
                required
                type="email"
                className="pl-10 h-12 text-base border-gray-200"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-base">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <Input
                id="password"
                name="password"
                placeholder="Input password"
                required
                type="password"
                className="pl-10 h-12 text-base border-gray-200"
              />
            </div>
          </div>
          <Button
            className={`w-full h-12 text-base font-medium ${
              lockoutTime
                ? "bg-gray-400"
                : "bg-[#F7D65D] hover:bg-[#F7D65D]/90 text-black"
            }`}
            type="submit"
            disabled={isLoading || !!lockoutTime}
          >
            {lockoutTime
              ? `Login (${countdown})`
              : isLoading
              ? "Signing in..."
              : "Login"}
          </Button>
          {failedAttempts === 3 && (
            <p className="text-xs text-red-600 text-center">
              Careful! One more failed attempt will disable login for 10 minutes.
            </p>
          )}
          {lockoutTime ? (
            <p className="text-xs text-red-600 text-left">
              Too many failed attempts. Try again in {Math.ceil(countdown / 60)} minutes.
            </p>
          ) : null}
        </form>
      </div>
      <div className="w-full max-w-sm mx-auto mb-2 space-y-4 p-4 text-left">
        <h2 className="text-l font-semibold">
          Looking for reliable email services?
        </h2>
        <p className="text-sm text-gray-600">
          Mailria has you covered! Drop us a message at{" "}
          <a
            href="mailto:support@mailria.com"
            className="text-blue-600 hover:underline"
          >
            support@mailria.com
          </a>{" "}
          for more details.
        </p>
      </div>
    </div>
    <Toaster />
    </>
  );
};

export default SignInPage;
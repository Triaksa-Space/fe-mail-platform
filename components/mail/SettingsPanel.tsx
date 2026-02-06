"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ChevronLeftIcon } from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/useAuthStore";
import { apiClient } from "@/lib/api-client";
import ChangePasswordForm from "./ChangePasswordForm";
import EmailBindingForm from "./EmailBindingForm";

interface SettingsPanelProps {
  onBack?: () => void;
  showBackButton?: boolean;
  className?: string;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  onBack,
  showBackButton = false,
  className,
}) => {
  const email = useAuthStore((state) => state.email);
  const [bindingEmail, setBindingEmail] = useState<string>("");

  // Fetch user data to get binding email
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await apiClient.get("/user/get_user_me");
        if (response.data?.binding_email) {
          setBindingEmail(response.data.binding_email);
        }
      } catch {
        // Silently fail - binding email is optional
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className={cn("flex-1 flex flex-col bg-gray-50 relative overflow-hidden", className)}>
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 relative z-10">
        <div className="flex items-center gap-4">
          <Image
            src="/mailria.png"
            alt="Mailria"
            width={112}
            height={40}
            className="h-10 w-28"
          />
        </div>
        <span className="text-gray-800 text-sm font-semibold font-['Roboto'] leading-5">{email}</span>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 relative z-10">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="h-9 w-9 rounded-xl hover:bg-gray-100"
            >
              <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
            </Button>
          )}
          <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
        </div>
        <span className="text-sm text-gray-600">{email}</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 lg:pb-6 relative z-10">

        {/* Web View: Horizontal card with both sections */}
        <div className="hidden lg:block">
          <div
            className={cn(
              "bg-white rounded-xl p-6",
              "shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)]",
              "outline outline-1 outline-offset-[-1px] outline-gray-200"
            )}
          >
            <div className="grid grid-cols-2 gap-8">
              {/* Change Password Section */}
              <div className="flex flex-col gap-4">
                <h3 className="text-base font-semibold text-gray-800">Change password</h3>
                <ChangePasswordForm />
              </div>

              {/* Divider */}
              <div className="absolute left-1/2 top-6 bottom-6 w-px bg-gray-200" style={{ display: 'none' }} />

              {/* Email Binding Section */}
              <div className="flex flex-col gap-4 border-l border-gray-200 pl-8">
                <h3 className="text-base font-semibold text-gray-800">Email binding</h3>
                <EmailBindingForm initialEmail={bindingEmail} />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile View: Stacked cards */}
        <div className="lg:hidden flex flex-col gap-4">
          {/* Change Password Card */}
          <div
            className={cn(
              "bg-white rounded-xl p-4",
              "shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)]",
              "outline outline-1 outline-offset-[-1px] outline-gray-200"
            )}
          >
            <h3 className="text-base font-semibold text-gray-800 mb-4">Change password</h3>
            <ChangePasswordForm />
          </div>

          {/* Email Binding Card */}
          <div
            className={cn(
              "bg-white rounded-xl p-4",
              "shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)]",
              "outline outline-1 outline-offset-[-1px] outline-gray-200"
            )}
          >
            <h3 className="text-base font-semibold text-gray-800 mb-4">Email binding</h3>
            <EmailBindingForm initialEmail={bindingEmail} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;

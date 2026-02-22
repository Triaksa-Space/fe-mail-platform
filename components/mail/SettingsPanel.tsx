"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import { apiClient } from "@/lib/api-client";
import ChangePasswordForm from "./ChangePasswordForm";
import EmailBindingForm from "./EmailBindingForm";
import CenterTruncate from "@/components/ui/center-truncate";

interface SettingsPanelProps {
  onBack?: () => void;
  showBackButton?: boolean;
  className?: string;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
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
    <div
      className={cn(
        "flex flex-col h-full relative overflow-hidden gap-5 bg-neutral-50",
        className,
      )}
    >
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between relative z-20">
        <div className="flex items-center gap-4">
          <Image
            src="/mailria.png"
            alt="Mailria"
            width={112}
            height={40}
            className="h-10 w-28"
          />
        </div>
        <CenterTruncate
          side="right"
          className="text-neutral-800 text-sm font-normal font-['Roboto'] leading-5"
        >
          {email}
        </CenterTruncate>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:flex relative z-20">
        <div className="self-stretch h-10 inline-flex justify-between items-center w-full">
          <h2 className="text-neutral-800 text-lg font-medium font-['Roboto'] leading-7">
            Settings
          </h2>
          <CenterTruncate
            side="right"
            className="text-neutral-800 text-base font-medium font-['Roboto'] leading-6"
          >
            {email}
          </CenterTruncate>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24 lg:pb-0 relative z-10">
        {/* Desktop View */}
        <div className="hidden lg:flex flex-col">
          {/* Web View: Horizontal card with both sections */}
          <div
            className={cn(
              "bg-white rounded-lg p-4",
              "shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)]"
            )}
          >
            <div className="flex items-stretch gap-4">
              {/* Change Password Section - Left Side */}
              <div className="flex-1 flex flex-col gap-4">
                <h3 className="text-neutral-800 text-base font-normal font-['Roboto'] leading-6">Change Password</h3>
                <div className="flex-1 flex flex-col">
                  <ChangePasswordForm />
                </div>
              </div>

              {/* Vertical Divider */}
              <div className="w-0 self-stretch outline outline-1 outline-offset-[-0.5px] outline-neutral-200" />

              {/* Email Binding Section - Right Side */}
              <div className="flex-1 flex flex-col gap-4">
                <h3 className="text-neutral-800 text-base font-normal font-['Roboto'] leading-6">Email binding</h3>
                <div className="flex-1 flex flex-col">
                  <EmailBindingForm initialEmail={bindingEmail} />
                </div>
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
              "outline outline-1 outline-offset-[-1px] outline-neutral-200"
            )}
          >
            <h3 className="text-base font-semibold normal-neutral-800 mb-4">Change password</h3>
            <ChangePasswordForm />
          </div>

          {/* Email Binding Card */}
          <div
            className={cn(
              "bg-white rounded-xl p-4",
              "shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)]",
              "outline outline-1 outline-offset-[-1px] outline-neutral-200"
            )}
          >
            <h3 className="text-base font-normal text-neutral-800 mb-4">Email binding</h3>
            <EmailBindingForm initialEmail={bindingEmail} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;

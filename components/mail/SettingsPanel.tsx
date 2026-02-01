"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/useAuthStore";
import { apiClient } from "@/lib/api-client";
import SettingsCard from "./SettingsCard";
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
    <div className={cn("flex-1 flex flex-col bg-[#F9FAFB]", className)}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 md:px-6 py-3 bg-white border-b border-gray-200">
        {showBackButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-9 w-9 rounded-xl hover:bg-gray-100 lg:hidden"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Button>
        )}
        <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-5">
        <div className="max-w-[1440px] mx-auto flex flex-col gap-5">
          {/* Account Info Card */}
          <SettingsCard title="Account" className="max-w-md lg:max-w-none">
            <p className="text-sm text-gray-600">{email}</p>
          </SettingsCard>

          {/* Two Column Grid: Change Password + Email Binding */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Change Password Card */}
            <SettingsCard title="Change password">
              <ChangePasswordForm />
            </SettingsCard>

            {/* Email Binding Card */}
            <SettingsCard title="Email binding">
              <EmailBindingForm initialEmail={bindingEmail} />
            </SettingsCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;

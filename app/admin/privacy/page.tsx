"use client";

import React from "react";
import { Shield } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminContentCard from "@/components/admin/AdminContentCard";
import { privacyData, privacyIntro, privacyEffectiveDate } from "@/lib/privacyData";

const AdminPrivacyPage: React.FC = () => {
  return (
    <AdminLayout>
      <AdminContentCard>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Mailria Privacy Policy
            </h1>
          </div>
          <p className="text-sm text-gray-500 ml-[52px]">
            Effective Date: {privacyEffectiveDate}
          </p>
        </div>

        {/* Introduction */}
        <div className="space-y-3 text-gray-600 text-sm leading-relaxed mb-8">
          {privacyIntro.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        {/* Privacy Content */}
        <div className="space-y-8">
          {privacyData.map((section) => (
            <section key={section.id} className="space-y-3">
              {/* Section Title */}
              <h2 className="text-lg font-semibold text-gray-900">
                {section.id}. {section.title}
              </h2>

              {/* Section Content */}
              <div className="space-y-2 text-gray-600 text-sm leading-relaxed">
                {section.content.map((paragraph, index) => {
                  // Check if paragraph is a bullet point
                  if (paragraph.startsWith("•")) {
                    return (
                      <p key={index} className="pl-4">
                        {paragraph}
                      </p>
                    );
                  }

                  // Check if paragraph contains email link
                  if (paragraph.includes("support@mailria.com")) {
                    const parts = paragraph.split("support@mailria.com");
                    return (
                      <p key={index} className="pl-4">
                        {parts[0]}
                        <a
                          href="mailto:support@mailria.com"
                          className="text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          support@mailria.com
                        </a>
                        {parts[1]}
                      </p>
                    );
                  }

                  return <p key={index}>{paragraph}</p>;
                })}
              </div>
            </section>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-10 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            By using Mailria, you acknowledge that you have read and understood
            this Privacy Policy.
          </p>
        </div>
      </AdminContentCard>
    </AdminLayout>
  );
};

export default AdminPrivacyPage;

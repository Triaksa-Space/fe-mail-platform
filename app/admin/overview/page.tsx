"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/useAuthStore";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminEmailListRow from "@/components/admin/AdminEmailListRow";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { CARD_STYLES, BUTTON_STYLES } from "@/lib/styles";
import {
  ApiInboxEmail,
  ApiSentEmail,
  EmailItem,
  transformInboxEmail,
  transformSentEmail,
} from "@/lib/transformers";
import { EnvelopeIcon, UserGroupIcon, PaperAirplaneIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { EnvelopeOpenIcon } from "@heroicons/react/24/solid";
import { useRequirePermission } from "@/hooks/use-require-permission";

// API Response Types
interface ApiOverviewResponse {
  stats?: {
    total_users_mailria?: number;
    total_users_mailsaja?: number;
    total_inbox?: number;
    total_sent?: number;
  };
  inbox: ApiInboxEmail[];
  sent: ApiSentEmail[];
  generated_at?: string;
}

// Internal types for display
interface OverviewData {
  stats: {
    totalUsersMailria: number;
    totalUsersMailsaja: number;
    totalInbox: number;
    totalSent: number;
  };
  latestInbox: EmailItem[];
  latestSent: EmailItem[];
}

// Format number with commas
function formatNumber(num: number): string {
  return num.toLocaleString();
}

// KPI Card Component
interface KPICardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  isLoading?: boolean;
}

function KPICard({ icon: Icon, label, value, isLoading }: KPICardProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          "flex-1 p-4 bg-white rounded-lg",
          "shadow-[0px_6px_15px_-2px_rgba(16,24,40,0.08)]",
          "inline-flex flex-col justify-start items-start gap-2 overflow-hidden"
        )}
      >
        <Skeleton className="h-4 w-32" />
        <div className="flex justify-start items-center gap-1">
          <Skeleton className="h-7 w-7 rounded-lg" />
          <Skeleton className="h-7 w-20" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex-1 p-4 bg-white rounded-lg",
        "shadow-[0px_6px_15px_-2px_rgba(16,24,40,0.08)]",
        "inline-flex flex-col justify-start items-start gap-2 overflow-hidden"
      )}
    >
      <div className="justify-center text-neutral-600 text-xs font-normal font-['Roboto'] leading-4">
        {label}
      </div>
      <div className="self-stretch inline-flex justify-start items-center gap-1">
        <div className="flex justify-start items-center gap-1">
          <div className="p-1 bg-blue-100 rounded-lg flex justify-start items-center gap-2.5">
            <Icon className="w-5 h-5 text-primary-500" />
          </div>
          <div className="justify-center text-neutral-800 text-xl font-semibold font-['Roboto'] leading-7">
            {formatNumber(value)}
          </div>
        </div>
      </div>
    </div>
  );
}

// Email Row Skeleton
function EmailRowSkeleton() {
  return (
    <div className={cn(CARD_STYLES.base, "px-4 py-2")}>
      <div className="flex-1 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex items-start gap-2">
          <div className="flex-1 flex flex-col gap-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
    </div>
  );
}

// Latest List Card Component
interface LatestListCardProps {
  title: string;
  emails: EmailItem[];
  type: "inbox" | "sent";
  isLoading?: boolean;
  onItemClick?: (id: string) => void;
}

function LatestListCard({
  title,
  emails,
  type,
  isLoading,
  onItemClick,
}: LatestListCardProps) {
  return (
    <div
      className={cn(
        "flex-1 p-4 bg-white rounded-lg",
        "shadow-[0px_6px_15px_-2px_rgba(16,24,40,0.08)]",
        "inline-flex flex-col justify-start items-start gap-4 overflow-hidden",
        "min-h-[550px]"
      )}
    >
      {/* Header */}
      <div className="justify-center text-neutral-800 text-lg font-medium font-['Roboto'] leading-7">
        {title}
      </div>

      {/* Email List */}
      <div className="self-stretch flex-1 flex flex-col justify-start items-start gap-2">
        {isLoading ? (
          <>
            {Array.from({ length: 5 }).map((_, i) => (
              <EmailRowSkeleton key={i} />
            ))}
          </>
        ) : emails.length === 0 ? (
          <div className="self-stretch flex-1 flex flex-col items-center justify-center gap-3 py-12 px-4">
            <div className="w-10 h-10 flex items-center justify-center">
              <EnvelopeOpenIcon className="w-9 h-9 text-neutral-300" />
            </div>
            <div className="flex flex-col justify-start items-center gap-1">
              <p className="text-base font-medium text-neutral-800 font-['Roboto'] leading-6">
                {type === "inbox" ? "No Email Yet" : "No Outgoing Email"}
              </p>
              <p className="text-center text-xs font-normal text-neutral-600 font-['Roboto'] leading-5">
                {type === "inbox"
                  ? "There are no email in inbox\nat the moment."
                  : "Emails sent will appear here"}
              </p>
            </div>
          </div>
        ) : (
          <>
            {emails.map((email) => (
              <AdminEmailListRow
                key={email.id}
                primaryText={type === "sent" ? `To: ${email.name}` : email.name}
                subject={email.subject || "(No subject)"}
                snippet={email.snippet || "No preview available"}
                sideText={email.email || "Unknown"}
                dateText={email.date}
                isUnread={!!email.isUnread}
                onClick={() => onItemClick?.(email.id)}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// Main Page Component
export default function OverviewPage() {
  const { allowed } = useRequirePermission("overview");
  const router = useRouter();
  const roleId = useAuthStore((state) => state.roleId);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [data, setData] = useState<OverviewData | null>(null);

  // Set page title
  useEffect(() => {
    document.title = "Overview - Admin Mailria";
  }, []);

  // Check if user is admin (roleId 0 = SuperAdmin, roleId 2 = Admin)
  const isAdmin = roleId === 0 || roleId === 2;

  const fetchOverviewData = useCallback(async (showRefreshState = false) => {
    try {
      if (showRefreshState) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const response = await apiClient.get<ApiOverviewResponse>("/admin/overview");
      const apiData = response.data;

      // Transform API response to internal format
      const transformedData: OverviewData = {
        stats: {
          totalUsersMailria: apiData.stats?.total_users_mailria ?? 0,
          totalUsersMailsaja: apiData.stats?.total_users_mailsaja ?? 0,
          totalInbox: apiData.stats?.total_inbox ?? 0,
          totalSent: apiData.stats?.total_sent ?? 0,
        },
        latestInbox: (apiData.inbox || []).slice(0, 5).map(transformInboxEmail),
        latestSent: (apiData.sent || []).slice(0, 5).map(transformSentEmail),
      };

      setData(transformedData);
    } catch (error) {
      console.error("Failed to fetch overview data:", error);
      // Set empty data on error
      setData({
        stats: {
          totalUsersMailria: 0,
          totalUsersMailsaja: 0,
          totalInbox: 0,
          totalSent: 0,
        },
        latestInbox: [],
        latestSent: [],
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOverviewData();
  }, [fetchOverviewData]);

  const handleRefresh = () => {
    fetchOverviewData(true);
  };

  const handleInboxItemClick = (id: string) => {
    if (isAdmin) {
      router.push(`/admin/inbox/${id}`);
    } else {
      router.push(`/inbox?email=${id}`);
    }
  };

  const handleSentItemClick = (id: string) => {
    if (isAdmin) {
      router.push(`/admin/sent/${id}`);
    } else {
      router.push(`/inbox`);
    }
  };

  if (!allowed) return null;

  return (
    <AdminLayout>
      <div className="inline-flex flex-col justify-start items-start gap-5 w-full">
        {/* Header */}
        <div className="self-stretch inline-flex justify-between items-center">
          <div className="justify-center text-neutral-800 text-2xl font-semibold font-['Roboto'] leading-8">
            Overview
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className={cn(
              BUTTON_STYLES.icon,
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            aria-label="Refresh data"
          >
            <ArrowPathIcon
              className={cn(
                "w-5 h-5 text-neutral-800",
                isRefreshing && "animate-spin"
              )}
            />
          </Button>
        </div>

        {/* KPI Cards Row 1 */}
        <div className="self-stretch inline-flex justify-start items-start gap-5">
          <KPICard
            icon={UserGroupIcon}
            label="Total @mailria.com user"
            value={data?.stats?.totalUsersMailria ?? 0}
            isLoading={isLoading}
          />
          <KPICard
            icon={UserGroupIcon}
            label="Total @mailsaja.com user"
            value={data?.stats?.totalUsersMailsaja ?? 0}
            isLoading={isLoading}
          />
        </div>

        {/* KPI Cards Row 2 */}
        <div className="self-stretch inline-flex justify-start items-start gap-5">
          <KPICard
            icon={EnvelopeIcon}
            label="Total inbox"
            value={data?.stats?.totalInbox ?? 0}
            isLoading={isLoading}
          />
          <KPICard
            icon={PaperAirplaneIcon}
            label="Total email send"
            value={data?.stats?.totalSent ?? 0}
            isLoading={isLoading}
          />
        </div>

        {/* Latest Lists Row */}
        <div className="self-stretch inline-flex justify-start items-start gap-5">
          <LatestListCard
            title="Latest inbox"
            emails={data?.latestInbox ?? []}
            type="inbox"
            isLoading={isLoading}
            onItemClick={handleInboxItemClick}
          />
          <LatestListCard
            title="Latest sent"
            emails={data?.latestSent ?? []}
            type="sent"
            isLoading={isLoading}
            onItemClick={handleSentItemClick}
          />
        </div>
      </div>
    </AdminLayout>
  );
}




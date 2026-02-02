"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/useAuthStore";
import AdminLayout from "@/components/admin/AdminLayout";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Inbox,
  Send,
  RefreshCw,
} from "lucide-react";

// API Response Types (snake_case from backend)
interface ApiInboxEmail {
  id: string;
  user_id?: string;
  user_email?: string;
  from: string;
  from_name?: string;
  subject: string;
  preview?: string;
  body?: string;
  is_read?: boolean;
  has_attachments?: boolean;
  received_at: string;
}

interface ApiSentEmail {
  id: string;
  user_id?: string;
  user_email?: string;
  from?: string;
  to?: string;
  subject: string;
  preview?: string;
  body?: string;
  status?: string;
  sent_at: string;
}

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
interface EmailItem {
  id: string;
  name: string;
  email: string;
  subject: string;
  snippet: string;
  date: string; // Formatted relative time
  isUnread?: boolean;
}

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

// Format relative time (matching inbox page style)
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

// Transform API inbox email to display format
function transformInboxEmail(email: ApiInboxEmail): EmailItem {
  return {
    id: email.id,
    name: email.from_name || email.from?.split("@")[0] || "Unknown Sender",
    email: email.from,
    subject: email.subject || "(No subject)",
    snippet: email.preview || "No preview available",
    date: formatRelativeTime(email.received_at),
    isUnread: email.is_read === false,
  };
}

// Transform API sent email to display format
function transformSentEmail(email: ApiSentEmail): EmailItem {
  return {
    id: email.id,
    name: email.to?.split("@")[0] || "Unknown",
    email: email.to || "",
    subject: email.subject || "(No subject)",
    snippet: email.preview || "No preview available",
    date: formatRelativeTime(email.sent_at),
  };
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
          "rounded-xl bg-white p-5 border border-gray-100",
          "shadow-[0_6px_15px_-2px_rgba(16,24,40,0.08)]"
        )}
      >
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-20" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl bg-white p-5 border border-gray-100",
        "shadow-[0_6px_15px_-2px_rgba(16,24,40,0.08)]"
      )}
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatNumber(value)}
          </p>
        </div>
      </div>
    </div>
  );
}

// Email Row Component (matching InboxList style)
interface EmailRowProps {
  email: EmailItem;
  type: "inbox" | "sent";
  onClick?: () => void;
}

function EmailRow({ email, type, onClick }: EmailRowProps) {
  const isUnread = type === "inbox" && email.isUnread;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-4 transition-colors border-b border-gray-100",
        "hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Unread indicator dot */}
        <div className="flex-shrink-0 pt-1.5">
          {isUnread ? (
            <div className="w-2 h-2 rounded-full bg-blue-600" />
          ) : (
            <div className="w-2 h-2" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Top row: Sender/Recipient + Time */}
          <div className="flex items-center justify-between gap-3">
            <span
              className={cn(
                "text-base truncate",
                isUnread
                  ? "font-semibold text-slate-900"
                  : "font-medium text-slate-700"
              )}
            >
              {email.name}
            </span>
            <span className="text-sm text-gray-500 whitespace-nowrap flex-shrink-0">
              {email.date}
            </span>
          </div>

          {/* Subject line */}
          <p
            className={cn(
              "text-sm truncate mt-1",
              isUnread
                ? "font-semibold text-slate-900"
                : "font-medium text-slate-700"
            )}
          >
            {email.subject}
          </p>

          {/* Snippet/Preview */}
          <p className="text-sm text-gray-500 line-clamp-1 mt-1">
            {email.snippet}
          </p>
        </div>
      </div>
    </button>
  );
}

// Email Row Skeleton (matching InboxList style)
function EmailRowSkeleton() {
  return (
    <div className="px-4 py-4 border-b border-gray-100">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 pt-1.5">
          <Skeleton className="w-2 h-2 rounded-full" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
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
        "rounded-xl bg-white border border-gray-100",
        "shadow-[0_6px_15px_-2px_rgba(16,24,40,0.08)]",
        "flex flex-col overflow-hidden"
      )}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>

      {/* Email List */}
      <div className="flex-1">
        {isLoading ? (
          <div>
            {Array.from({ length: 5 }).map((_, i) => (
              <EmailRowSkeleton key={i} />
            ))}
          </div>
        ) : emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              {type === "inbox" ? (
                <Inbox className="h-5 w-5 text-gray-400" />
              ) : (
                <Send className="h-5 w-5 text-gray-400" />
              )}
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">
              No {type === "inbox" ? "emails" : "sent emails"} found
            </p>
            <p className="text-xs text-gray-500 text-center">
              {type === "inbox"
                ? "Your inbox is empty"
                : "No emails have been sent yet"}
            </p>
          </div>
        ) : (
          <div>
            {emails.map((email) => (
              <EmailRow
                key={email.id}
                email={email}
                type={type}
                onClick={() => onItemClick?.(email.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Main Page Component
export default function OverviewPage() {
  const router = useRouter();
  const roleId = useAuthStore((state) => state.roleId);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [data, setData] = useState<OverviewData | null>(null);

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

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200",
              "bg-white transition-colors hover:bg-gray-50",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            aria-label="Refresh data"
          >
            <RefreshCw
              className={cn(
                "h-5 w-5 text-gray-600",
                isRefreshing && "animate-spin"
              )}
            />
          </button>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <KPICard
            icon={Users}
            label="Total @mailria.com user"
            value={data?.stats?.totalUsersMailria ?? 0}
            isLoading={isLoading}
          />
          <KPICard
            icon={Users}
            label="Total @mailsaja.com user"
            value={data?.stats?.totalUsersMailsaja ?? 0}
            isLoading={isLoading}
          />
          <KPICard
            icon={Inbox}
            label="Total inbox"
            value={data?.stats?.totalInbox ?? 0}
            isLoading={isLoading}
          />
          <KPICard
            icon={Send}
            label="Total email send"
            value={data?.stats?.totalSent ?? 0}
            isLoading={isLoading}
          />
        </div>

        {/* Latest Lists Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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

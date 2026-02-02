"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { apiClient } from "@/lib/api-client";
import { Toaster } from "@/components/ui/toaster";
import {
  RefreshCw,
  Inbox,
  Send,
  Mail,
  ArrowLeft,
  User,
  Calendar,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminContentCard from "@/components/admin/AdminContentCard";

// Inbox email interface (from /email/by_user/:id)
interface InboxEmail {
  user_encode_id: string;
  email_encode_id: string;
  ID: number;
  SenderEmail: string;
  SenderName: string;
  Subject: string;
  Preview: string;
  Body: string;
  RelativeTime: string;
  IsRead?: boolean;
}

// Sent email interface (from /email/sent/by_user/:id)
interface SentEmail {
  id: string;
  user_id: string;
  from: string;
  to: string;
  subject: string;
  body_preview?: string;
  body?: string;
  attachments?: string;
  has_attachments?: boolean;
  provider?: string;
  status?: string;
  sent_at: string;
  created_at?: string;
}

interface SentEmailsResponse {
  data: SentEmail[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

interface UserDetails {
  ID: number;
  Email: string;
  LastLogin: string;
  CreatedAt: string;
  CreatedByName?: string;
}

// Format relative time for sent emails
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

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const roleId = useAuthStore((state) => state.roleId);
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);
  const storedToken = useAuthStore.getState().getStoredToken();

  // User details state
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Inbox state
  const [inboxEmails, setInboxEmails] = useState<InboxEmail[]>([]);
  const [isLoadingInbox, setIsLoadingInbox] = useState(true);
  const [isRefreshingInbox, setIsRefreshingInbox] = useState(false);

  // Sent state
  const [sentEmails, setSentEmails] = useState<SentEmail[]>([]);
  const [isLoadingSent, setIsLoadingSent] = useState(true);
  const [isRefreshingSent, setIsRefreshingSent] = useState(false);

  // Refs for cleanup
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auth check - redirect if not authenticated
  useEffect(() => {
    if (!_hasHydrated) return;

    if (!storedToken) {
      router.replace("/");
      return;
    }

    if (roleId === 1) {
      router.replace("/not-found");
    }
  }, [_hasHydrated, storedToken, roleId, router]);

  // Fetch user details
  const fetchUserDetails = useCallback(async () => {
    if (!storedToken) return;

    try {
      setIsLoadingUser(true);
      const response = await apiClient.get(`/user/${params.id}`);
      setUserDetails(response.data);
    } catch (err) {
      console.error("Failed to fetch user details:", err);
    } finally {
      setIsLoadingUser(false);
    }
  }, [params.id, storedToken]);

  // Fetch inbox emails
  const fetchInboxEmails = useCallback(
    async (signal?: AbortSignal) => {
      if (!storedToken) return;

      try {
        const response = await apiClient.get(`/email/by_user/${params.id}`, {
          signal,
        });
        setInboxEmails(response.data || []);
      } catch (err) {
        if (!signal?.aborted) {
          console.error("Failed to fetch inbox emails:", err);
        }
      } finally {
        setIsLoadingInbox(false);
        setIsRefreshingInbox(false);
      }
    },
    [params.id, storedToken]
  );

  // Fetch sent emails
  const fetchSentEmails = useCallback(
    async (signal?: AbortSignal) => {
      if (!storedToken) return;

      try {
        const response = await apiClient.get<SentEmailsResponse>(
          `/email/sent/by_user/${params.id}`,
          { signal }
        );
        // New API returns { data: [...], pagination: {...} }
        const emails = response.data?.data || [];
        setSentEmails(emails);
      } catch (err) {
        if (!signal?.aborted) {
          console.error("Failed to fetch sent emails:", err);
        }
      } finally {
        setIsLoadingSent(false);
        setIsRefreshingSent(false);
      }
    },
    [params.id, storedToken]
  );

  // Initial fetch
  useEffect(() => {
    if (!_hasHydrated || !storedToken || roleId === 1) return;

    abortControllerRef.current = new AbortController();

    fetchUserDetails();
    fetchInboxEmails(abortControllerRef.current.signal);
    fetchSentEmails(abortControllerRef.current.signal);

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [_hasHydrated, storedToken, roleId, fetchUserDetails, fetchInboxEmails, fetchSentEmails]);

  // Handle refresh
  const handleRefreshInbox = () => {
    setIsRefreshingInbox(true);
    fetchInboxEmails();
  };

  const handleRefreshSent = () => {
    setIsRefreshingSent(true);
    fetchSentEmails();
  };

  // Handle inbox email click
  const handleInboxEmailClick = (email: InboxEmail) => {
    router.push(`/admin/inbox/${email.email_encode_id}`);
  };

  // Handle sent email click
  const handleSentEmailClick = (email: SentEmail) => {
    router.push(`/admin/sent/${email.id}`);
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  // Don't render content if user is not admin
  if (roleId === 1) {
    return null;
  }

  return (
    <AdminLayout>
      <Toaster />
      <div className="flex flex-col gap-5 h-[calc(100vh-80px)]">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.back()}
              className="h-10 w-10 rounded-xl border-gray-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                {isLoadingUser ? (
                  <div className="h-7 w-48 bg-gray-200 rounded animate-pulse" />
                ) : (
                  <h1 className="text-2xl font-semibold text-gray-900">
                    {userDetails?.Email || "Unknown User"}
                  </h1>
                )}
                <p className="text-sm text-gray-500">User email details</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Info Card */}
        <AdminContentCard className="p-4">
          {isLoadingUser ? (
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-36 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ) : userDetails ? (
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="font-medium">Email:</span>
                <span>{userDetails.Email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="font-medium">Last Login:</span>
                <span>{formatDate(userDetails.LastLogin)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="font-medium">Created:</span>
                <span>{formatDate(userDetails.CreatedAt)}</span>
              </div>
              {userDetails.CreatedByName && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Created By:</span>
                  <span>{userDetails.CreatedByName}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Failed to load user details</p>
          )}
        </AdminContentCard>

        {/* Email Lists - Side by Side */}
        <div className="flex-1 flex gap-5 min-h-0">
          {/* Inbox Panel */}
          <AdminContentCard className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Inbox Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Inbox className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Inbox</h3>
                <span className="text-sm text-gray-500">
                  ({inboxEmails.length})
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefreshInbox}
                disabled={isRefreshingInbox}
                className="h-8 w-8 p-0 rounded-lg"
              >
                <RefreshCw
                  className={cn(
                    "h-4 w-4",
                    isRefreshingInbox && "animate-spin"
                  )}
                />
              </Button>
            </div>

            {/* Inbox List */}
            <div className="flex-1 overflow-y-auto">
              {isLoadingInbox ? (
                <div className="flex items-center justify-center h-32">
                  <div className="flex items-center gap-2 text-gray-500">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Loading...</span>
                  </div>
                </div>
              ) : inboxEmails.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 px-4">
                  <Inbox className="h-8 w-8 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500 text-center">
                    No inbox emails
                  </p>
                </div>
              ) : (
                <div>
                  {inboxEmails.map((email) => (
                    <InboxEmailRow
                      key={email.ID}
                      email={email}
                      onClick={() => handleInboxEmailClick(email)}
                    />
                  ))}
                </div>
              )}
            </div>
          </AdminContentCard>

          {/* Sent Panel */}
          <AdminContentCard className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Sent Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Send className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">Sent</h3>
                <span className="text-sm text-gray-500">
                  ({sentEmails.length})
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefreshSent}
                disabled={isRefreshingSent}
                className="h-8 w-8 p-0 rounded-lg"
              >
                <RefreshCw
                  className={cn(
                    "h-4 w-4",
                    isRefreshingSent && "animate-spin"
                  )}
                />
              </Button>
            </div>

            {/* Sent List */}
            <div className="flex-1 overflow-y-auto">
              {isLoadingSent ? (
                <div className="flex items-center justify-center h-32">
                  <div className="flex items-center gap-2 text-gray-500">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Loading...</span>
                  </div>
                </div>
              ) : sentEmails.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 px-4">
                  <Send className="h-8 w-8 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500 text-center">
                    No sent emails
                  </p>
                </div>
              ) : (
                <div>
                  {sentEmails.map((email) => (
                    <SentEmailRow
                      key={email.id}
                      email={email}
                      onClick={() => handleSentEmailClick(email)}
                    />
                  ))}
                </div>
              )}
            </div>
          </AdminContentCard>
        </div>
      </div>
    </AdminLayout>
  );
}

// Inbox email row component
interface InboxEmailRowProps {
  email: InboxEmail;
  onClick: () => void;
}

const InboxEmailRow: React.FC<InboxEmailRowProps> = ({ email, onClick }) => {
  const isUnread = !email.IsRead;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-3 transition-colors border-b border-gray-100",
        "hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Unread indicator */}
        <div className="flex-shrink-0 pt-1.5">
          {isUnread ? (
            <div className="w-2 h-2 rounded-full bg-blue-600" />
          ) : (
            <div className="w-2 h-2" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Top row */}
          <div className="flex items-center justify-between gap-3">
            <span
              className={cn(
                "text-sm truncate",
                isUnread
                  ? "font-semibold text-gray-900"
                  : "font-medium text-gray-700"
              )}
            >
              {email.SenderName || email.SenderEmail || "Unknown"}
            </span>
            <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
              {email.RelativeTime}
            </span>
          </div>

          {/* Subject */}
          <p
            className={cn(
              "text-sm truncate mt-0.5",
              isUnread
                ? "font-semibold text-gray-900"
                : "font-medium text-gray-700"
            )}
          >
            {email.Subject || "(No subject)"}
          </p>

          {/* Preview */}
          <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">
            {email.Preview || "No preview available"}
          </p>
        </div>
      </div>
    </button>
  );
};

// Sent email row component
interface SentEmailRowProps {
  email: SentEmail;
  onClick: () => void;
}

const SentEmailRow: React.FC<SentEmailRowProps> = ({ email, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-3 transition-colors border-b border-gray-100",
        "hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Sent indicator */}
        <div className="flex-shrink-0 pt-1.5">
          <Send className="w-3 h-3 text-green-500" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Top row */}
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm truncate font-medium text-gray-700">
              To: {email.to || "Unknown"}
            </span>
            <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
              {formatRelativeTime(email.sent_at)}
            </span>
          </div>

          {/* Subject */}
          <p className="text-sm truncate mt-0.5 font-medium text-gray-700">
            {email.subject || "(No subject)"}
          </p>

          {/* Preview */}
          <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">
            {email.body_preview || "No preview available"}
          </p>
        </div>
      </div>
    </button>
  );
};

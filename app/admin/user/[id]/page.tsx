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
  ChevronLeft,
  ChevronRight,
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
  const [inboxPage, setInboxPage] = useState(1);
  const [inboxTotalPages, setInboxTotalPages] = useState(1);
  const [inboxTotal, setInboxTotal] = useState(0);
  const inboxPageSize = 10;

  // Sent state
  const [sentEmails, setSentEmails] = useState<SentEmail[]>([]);
  const [isLoadingSent, setIsLoadingSent] = useState(true);
  const [isRefreshingSent, setIsRefreshingSent] = useState(false);
  const [sentPage, setSentPage] = useState(1);
  const [sentTotalPages, setSentTotalPages] = useState(1);
  const [sentTotal, setSentTotal] = useState(0);
  const sentPageSize = 10;

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
    async (page: number = 1, signal?: AbortSignal) => {
      if (!storedToken) return;

      try {
        const response = await apiClient.get(
          `/email/by_user/${params.id}`,
          {
            params: { page, limit: inboxPageSize },
            signal,
          }
        );

        const data = response.data;

        // Handle different response structures
        if (Array.isArray(data)) {
          // Direct array response (no pagination)
          setInboxEmails(data);
          setInboxTotal(data.length);
          setInboxTotalPages(1);
        } else if (data && Array.isArray(data.data)) {
          // Paginated response: { data: [], pagination: {} }
          setInboxEmails(data.data);
          setInboxTotal(data.pagination?.total || data.data.length);
          setInboxTotalPages(data.pagination?.total_pages || 1);
        } else {
          // Fallback - ensure we always have an array
          setInboxEmails([]);
          setInboxTotal(0);
          setInboxTotalPages(1);
        }
      } catch (err) {
        if (!signal?.aborted) {
          console.error("Failed to fetch inbox emails:", err);
          setInboxEmails([]);
        }
      } finally {
        setIsLoadingInbox(false);
        setIsRefreshingInbox(false);
      }
    },
    [params.id, storedToken, inboxPageSize]
  );

  // Fetch sent emails
  const fetchSentEmails = useCallback(
    async (page: number = 1, signal?: AbortSignal) => {
      if (!storedToken) return;

      try {
        const response = await apiClient.get(
          `/email/sent/by_user/${params.id}`,
          {
            params: { page, limit: sentPageSize },
            signal,
          }
        );

        const data = response.data;

        // Handle different response structures
        if (Array.isArray(data)) {
          // Direct array response (no pagination)
          setSentEmails(data);
          setSentTotal(data.length);
          setSentTotalPages(1);
        } else if (data && Array.isArray(data.data)) {
          // Paginated response: { data: [], pagination: {} }
          setSentEmails(data.data);
          setSentTotal(data.pagination?.total || data.data.length);
          setSentTotalPages(data.pagination?.total_pages || 1);
        } else {
          // Fallback - ensure we always have an array
          setSentEmails([]);
          setSentTotal(0);
          setSentTotalPages(1);
        }
      } catch (err) {
        if (!signal?.aborted) {
          console.error("Failed to fetch sent emails:", err);
          setSentEmails([]);
        }
      } finally {
        setIsLoadingSent(false);
        setIsRefreshingSent(false);
      }
    },
    [params.id, storedToken, sentPageSize]
  );

  // Initial fetch
  useEffect(() => {
    if (!_hasHydrated || !storedToken || roleId === 1) return;

    abortControllerRef.current = new AbortController();

    fetchUserDetails();
    fetchInboxEmails(inboxPage, abortControllerRef.current.signal);
    fetchSentEmails(sentPage, abortControllerRef.current.signal);

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [_hasHydrated, storedToken, roleId, fetchUserDetails]);

  // Fetch inbox when page changes
  useEffect(() => {
    if (!_hasHydrated || !storedToken || roleId === 1) return;
    setIsLoadingInbox(true);
    fetchInboxEmails(inboxPage);
  }, [inboxPage, fetchInboxEmails, _hasHydrated, storedToken, roleId]);

  // Fetch sent when page changes
  useEffect(() => {
    if (!_hasHydrated || !storedToken || roleId === 1) return;
    setIsLoadingSent(true);
    fetchSentEmails(sentPage);
  }, [sentPage, fetchSentEmails, _hasHydrated, storedToken, roleId]);

  // Handle refresh
  const handleRefreshInbox = () => {
    setIsRefreshingInbox(true);
    fetchInboxEmails(inboxPage);
  };

  const handleRefreshSent = () => {
    setIsRefreshingSent(true);
    fetchSentEmails(sentPage);
  };

  // Handle page changes
  const handleInboxPageChange = (page: number) => {
    setInboxPage(page);
  };

  const handleSentPageChange = (page: number) => {
    setSentPage(page);
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
                  ({inboxTotal})
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

            {/* Inbox Pagination */}
            {inboxTotalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100 bg-gray-50/50">
                <span className="text-xs text-gray-500">
                  Page {inboxPage} of {inboxTotalPages}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleInboxPageChange(inboxPage - 1)}
                    disabled={inboxPage <= 1 || isLoadingInbox}
                    className="h-7 w-7 p-0 rounded-md"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleInboxPageChange(inboxPage + 1)}
                    disabled={inboxPage >= inboxTotalPages || isLoadingInbox}
                    className="h-7 w-7 p-0 rounded-md"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </AdminContentCard>

          {/* Sent Panel */}
          <AdminContentCard className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Sent Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Send className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">Sent</h3>
                <span className="text-sm text-gray-500">
                  ({sentTotal})
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

            {/* Sent Pagination */}
            {sentTotalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100 bg-gray-50/50">
                <span className="text-xs text-gray-500">
                  Page {sentPage} of {sentTotalPages}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSentPageChange(sentPage - 1)}
                    disabled={sentPage <= 1 || isLoadingSent}
                    className="h-7 w-7 p-0 rounded-md"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSentPageChange(sentPage + 1)}
                    disabled={sentPage >= sentTotalPages || isLoadingSent}
                    className="h-7 w-7 p-0 rounded-md"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
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

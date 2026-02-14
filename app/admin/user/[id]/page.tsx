"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { apiClient } from "@/lib/api-client";
import { Toaster } from "@/components/ui/toaster";
import { cn, formatRelativeTime } from "@/lib/utils";
import { CARD_STYLES, BUTTON_STYLES } from "@/lib/styles";
import AdminLayout from "@/components/admin/AdminLayout";
import PaginationComponent from "@/components/PaginationComponent";
import { ArrowPathIcon, UserGroupIcon, UserIcon, ArrowLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { EnvelopeOpenIcon } from '@heroicons/react/24/solid';
import AdminLoadingPlaceholder from "@/components/admin/AdminLoadingPlaceholder";
import { Button } from "@/components/ui/button";

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

        if (Array.isArray(data)) {
          setInboxEmails(data);
          setInboxTotal(data.length);
          setInboxTotalPages(1);
        } else if (data && Array.isArray(data.data)) {
          setInboxEmails(data.data);
          setInboxTotal(data.pagination?.total || data.data.length);
          setInboxTotalPages(data.pagination?.total_pages || 1);
        } else {
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

        if (Array.isArray(data)) {
          setSentEmails(data);
          setSentTotal(data.length);
          setSentTotalPages(1);
        } else if (data && Array.isArray(data.data)) {
          setSentEmails(data.data);
          setSentTotal(data.pagination?.total || data.data.length);
          setSentTotalPages(data.pagination?.total_pages || 1);
        } else {
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
  const handleRefresh = () => {
    setIsRefreshingInbox(true);
    setIsRefreshingSent(true);
    fetchInboxEmails(inboxPage);
    fetchSentEmails(sentPage);
  };

  // Handle inbox email click
  const handleInboxEmailClick = (email: InboxEmail) => {
    router.push(`/admin/inbox/${email.email_encode_id}`);
  };

  // Handle sent email click
  const handleSentEmailClick = (email: SentEmail) => {
    router.push(`/admin/sent/${email.id}`);
  };

  // Don't render content if user is not admin
  if (roleId === 1) {
    return null;
  }

  return (
    <AdminLayout>
      <Toaster />
      <div className="inline-flex flex-col justify-start items-start gap-5 w-full flex-1 min-h-0">
        {/* Breadcrumb Header */}
        <div className="self-stretch inline-flex justify-between items-center">
          <div className="flex justify-start items-center gap-1">
            {/* Back */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="w-8 h-8 rounded flex justify-center items-center hover:bg-neutral-100 transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4 text-neutral-600" />
            </Button>
            <ChevronRightIcon className="w-4 h-4 text-neutral-300" />

            {/* User list */}
            <Button
              variant="ghost"
              onClick={() => router.push("/admin")}
              className="h-auto px-1 py-0 flex justify-center items-center gap-1 hover:bg-neutral-100 rounded transition-colors"
            >
              <UserGroupIcon className="w-4 h-4 text-neutral-600" />
              <div className="justify-center text-neutral-600 text-sm font-normal font-['Roboto'] leading-4">User list</div>
            </Button>
            <ChevronRightIcon className="w-4 h-4 text-neutral-300" />

            {/* Current user email */}
            <div className="flex justify-center items-center gap-1">
              <UserIcon className="w-4 h-4 text-primary-500" />
              <div className="justify-center text-primary-500 text-sm font-normal font-['Roboto'] leading-4">
                {isLoadingUser ? "Loading..." : userDetails?.Email || "Unknown"}
              </div>
            </div>
          </div>

          {/* Refresh Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshingInbox || isRefreshingSent}
            className={cn(
              BUTTON_STYLES.icon,
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <ArrowPathIcon className={cn("w-4 h-4 text-neutral-800", (isRefreshingInbox || isRefreshingSent) && "animate-spin")} />
          </Button>
        </div>

        {/* Email Lists - Side by Side */}
        <div className="self-stretch flex-1 min-h-0 inline-flex justify-start items-stretch gap-5">
          {/* Inbox Panel */}
          <div className="flex-1 p-4 bg-white rounded-lg shadow-[0px_6px_15px_-2px_rgba(16,24,40,0.08)] inline-flex flex-col justify-start items-start gap-4 overflow-hidden">
            <div className="justify-center text-neutral-800 text-lg font-medium font-['Roboto'] leading-7">Inbox</div>

            {/* Inbox List */}
            <div className="self-stretch flex-1 flex flex-col justify-start items-start gap-2 overflow-y-auto">
              {isLoadingInbox ? (
                <AdminLoadingPlaceholder heightClassName="h-32" />
              ) : inboxEmails.length === 0 ? (
                <div className="self-stretch flex-1 flex flex-col items-center justify-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center">
                    <EnvelopeOpenIcon className="w-9 h-9 text-neutral-300" />
                  </div>
                  <div className="flex flex-col justify-start items-center gap-1">
                    <p className="text-base font-medium text-neutral-800 font-['Roboto'] leading-6">
                      No Email Yet
                    </p>
                    <p className="text-center text-xs font-normal text-neutral-600 font-['Roboto'] leading-5">
                      There are no email in this inbox
                      <br />
                      at the moment.
                    </p>
                  </div>
                </div>
              ) : (
                inboxEmails.map((email) => (
                  <InboxEmailRow
                    key={email.ID}
                    email={email}
                    onClick={() => handleInboxEmailClick(email)}
                  />
                ))
              )}
            </div>

            {/* Inbox Pagination */}
            {inboxTotalPages > 0 && (
              <PaginationComponent
                totalPages={inboxTotalPages}
                currentPage={inboxPage}
                onPageChange={setInboxPage}
                totalCount={inboxTotal}
                activeCount={inboxTotal}
                pageSize={inboxPageSize}
              />
            )}
          </div>

          {/* Sent Panel */}
          <div className="flex-1 p-4 bg-white rounded-lg shadow-[0px_6px_15px_-2px_rgba(16,24,40,0.08)] inline-flex flex-col justify-start items-start gap-4 overflow-hidden">
            <div className="justify-center text-neutral-800 text-lg font-medium font-['Roboto'] leading-7">Sent</div>

            {/* Sent List */}
            <div className="self-stretch flex-1 flex flex-col justify-start items-start gap-2 overflow-y-auto">
              {isLoadingSent ? (
                <AdminLoadingPlaceholder heightClassName="h-32" />
              ) : sentEmails.length === 0 ? (
                <div className="self-stretch flex-1 flex flex-col items-center justify-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center">
                    <EnvelopeOpenIcon className="w-9 h-9 text-neutral-300" />
                  </div>
                  <div className="flex flex-col justify-start items-center gap-1">
                    <p className="text-base font-medium text-neutral-800 font-['Roboto'] leading-6">
                      No Outgoing Email
                    </p>
                    <p className="text-center text-xs font-normal text-neutral-600 font-['Roboto'] leading-5">
                      Emails sent will appear here
                    </p>
                  </div>
                </div>
              ) : (
                sentEmails.map((email) => (
                  <SentEmailRow
                    key={email.id}
                    email={email}
                    onClick={() => handleSentEmailClick(email)}
                  />
                ))
              )}
            </div>

            {/* Sent Pagination */}
            {sentTotalPages > 0 && (
              <PaginationComponent
                totalPages={sentTotalPages}
                currentPage={sentPage}
                onPageChange={setSentPage}
                totalCount={sentTotal}
                activeCount={sentTotal}
                pageSize={sentPageSize}
              />
            )}
          </div>
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
    <Button
      variant="ghost"
      onClick={onClick}
      className={cn(CARD_STYLES.interactive, "h-auto self-stretch px-4 py-2 inline-flex justify-start items-center gap-2 w-full text-left min-w-0")}
    >
      <div className="flex-1 min-w-0 inline-flex flex-col justify-start items-start gap-1">
        <div className="self-stretch min-w-0 inline-flex justify-start items-start gap-4">
          <div className="flex-1 min-w-0 inline-flex flex-col justify-start items-start gap-0.5">
            <div className="self-stretch inline-flex justify-between items-center">
              <div className={cn(
                "text-base font-['Roboto'] leading-6 truncate",
                isUnread ? "text-neutral-800 font-semibold" : "text-neutral-600 font-normal"
              )}>
                {email.SenderName || email.SenderEmail || "Unknown"}
              </div>
              <div className="flex justify-end items-center gap-0.5">
                <div className={cn(
                  "text-xs font-['Roboto'] leading-5 truncate",
                  isUnread ? "text-neutral-800 font-semibold" : "text-neutral-600 font-normal"
                )}>
                  {email.RelativeTime}
                </div>
                {isUnread && <div className="w-2 h-2 bg-primary-600 rounded-full"></div>}
              </div>
            </div>
            <div className={cn(
              "self-stretch text-sm font-['Roboto'] leading-5 truncate",
              isUnread ? "text-neutral-800 font-semibold" : "text-neutral-600 font-normal"
            )}>
              {email.Subject || "(No subject)"}
            </div>
          </div>
        </div>
        <div className="self-stretch text-neutral-600 text-sm font-normal font-['Roboto'] leading-5 truncate">
          {email.Preview || "No preview available"}
        </div>
      </div>
    </Button>
  );
};

// Sent email row component
interface SentEmailRowProps {
  email: SentEmail;
  onClick: () => void;
}

const SentEmailRow: React.FC<SentEmailRowProps> = ({ email, onClick }) => {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={cn(CARD_STYLES.interactive, "h-auto self-stretch px-4 py-2 inline-flex justify-start items-center gap-2 w-full text-left min-w-0")}
    >
      <div className="flex-1 min-w-0 inline-flex flex-col justify-start items-start gap-1">
        <div className="self-stretch min-w-0 inline-flex justify-start items-start gap-4">
          <div className="flex-1 min-w-0 inline-flex flex-col justify-start items-start gap-0.5">
            <div className="self-stretch inline-flex justify-between items-center">
              <div className="text-neutral-600 text-base font-normal font-['Roboto'] leading-6 truncate">
                To: {email.to || "Unknown"}
              </div>
              <div className="text-neutral-600 text-xs font-normal font-['Roboto'] leading-5 truncate">
                {formatRelativeTime(email.sent_at)}
              </div>
            </div>
            <div className="self-stretch text-neutral-600 text-sm font-normal font-['Roboto'] leading-5 truncate">
              {email.subject || "(No subject)"}
            </div>
          </div>
        </div>
        <div className="self-stretch text-neutral-600 text-sm font-normal font-['Roboto'] leading-5 truncate">
          {email.body_preview || "No preview available"}
        </div>
      </div>
    </Button>
  );
};




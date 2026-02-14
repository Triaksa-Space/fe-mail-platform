"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn, formatRelativeTime } from "@/lib/utils";
import { CARD_STYLES, BUTTON_STYLES } from "@/lib/styles";
import { parseAttachments } from "@/lib/attachmentUtils";
import AdminEmailBodyCard from "@/components/admin/AdminEmailBodyCard";
import {
  Inbox,
  Mail,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminContentCard from "@/components/admin/AdminContentCard";
import PaginationComponent from "@/components/PaginationComponent";
import { Toaster } from "@/components/ui/toaster";
import { ArrowLeftIcon, ChevronRightIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Button } from "@/components/ui/button";
import AdminLoadingPlaceholder from "@/components/admin/AdminLoadingPlaceholder";

// API response interfaces (snake_case from backend)
interface ApiEmail {
  id: string;
  user_id: string;
  user_email: string;
  from: string;
  from_name: string;
  subject: string;
  preview: string;
  is_read: boolean;
  has_attachments: boolean;
  received_at: string;
}

interface PaginationInfo {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

interface AdminInboxResponse {
  data: ApiEmail[];
  pagination: PaginationInfo;
}

interface EmailDetail {
  encode_id: string;
  ID: number;
  SenderEmail: string;
  SenderName: string;
  Subject: string;
  Body: string;
  BodyEml: string;
  RelativeTime: string;
  ListAttachments?: { Filename: string; URL: string }[];
  attachments?: string; // JSON string of URLs from API
  has_attachments?: boolean;
}

export default function AdminAllInboxPage() {
  const token = useAuthStore((state) => state.token);

  // Data state
  const [emails, setEmails] = useState<ApiEmail[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search state
  const [searchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Preview state
  const [selectedEmail, setSelectedEmail] = useState<ApiEmail | null>(null);
  const [emailDetail, setEmailDetail] = useState<EmailDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Set page title
  useEffect(() => {
    document.title = "All Inbox - Admin Mailria";
  }, []);

  // Debounce search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to first page on search
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Fetch emails
  const fetchEmails = useCallback(async () => {
    if (!token) return;

    try {
      const response = await apiClient.get<AdminInboxResponse>(
        `/admin/inbox`,
        {
          params: {
            page,
            page_size: pageSize,
            ...(debouncedSearch && { search: debouncedSearch }),
          },
        }
      );

      const data = response.data;

      // Handle response with pagination object
      if (data && Array.isArray(data.data)) {
        setEmails(data.data);
        setTotal(data.pagination?.total || data.data.length);
        setTotalPages(data.pagination?.total_pages || Math.ceil((data.pagination?.total || data.data.length) / pageSize));
      } else if (Array.isArray(data)) {
        setEmails(data);
        setTotal(data.length);
        setTotalPages(Math.ceil(data.length / pageSize));
      } else {
        setEmails([]);
        setTotal(0);
        setTotalPages(0);
      }
      setError(null);
    } catch (err) {
      console.error("Failed to fetch emails:", err);
      setError("Failed to load emails");
      setEmails([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [token, page, pageSize, debouncedSearch]);

  // Initial fetch
  useEffect(() => {
    setIsLoading(true);
    fetchEmails();
  }, [fetchEmails]);

  // Fetch email detail
  useEffect(() => {
    if (!selectedEmail || !token) {
      setEmailDetail(null);
      return;
    }

    const fetchDetail = async () => {
      setIsLoadingDetail(true);
      try {
        const response = await apiClient.get<EmailDetail>(
          `/admin/inbox/${selectedEmail.id}`
        );
        setEmailDetail(response.data);
      } catch (err) {
        console.error("Failed to fetch email detail:", err);
      } finally {
        setIsLoadingDetail(false);
      }
    };

    fetchDetail();
  }, [selectedEmail, token]);

  // Handlers
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchEmails();
  };

  const handleSelectEmail = (email: ApiEmail) => {
    setSelectedEmail(email);
  };

  const handleClosePreview = () => {
    setSelectedEmail(null);
    setEmailDetail(null);
  };

  return (
    <AdminLayout>
      <Toaster />
      <div className="inline-flex flex-col justify-start items-start gap-5 w-full flex-1 min-h-0">
        {/* Page Header */}
        <div className="self-stretch inline-flex justify-between items-center">
          <div className="justify-center text-neutral-800 text-2xl font-semibold font-['Roboto'] leading-8">
            All inbox
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={cn(
              BUTTON_STYLES.icon,
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            aria-label="Refresh"
          >
            <ArrowPathIcon
              className={cn("w-4 h-4 text-neutral-800", isRefreshing && "animate-spin")}
            />
          </Button>
        </div>

        {/* Main Content - Full width single view */}
        <div className="flex-1 min-h-0 w-full">
          {selectedEmail ? (
            /* Email Detail View - Full Width */
            <div className="h-full flex flex-col gap-5 overflow-y-auto">
              {/* Breadcrumb Navigation */}
              <div className="self-stretch inline-flex justify-start items-center gap-1">
                {/* Back */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClosePreview}
                  className="w-8 h-8 rounded flex justify-center items-center hover:bg-neutral-100 transition-colors"
                >
                  <ArrowLeftIcon className="w-4 h-4 text-neutral-600" />
                </Button>
                <ChevronRightIcon className="w-4 h-4 text-neutral-300" />

                {/* All inbox */}
                <Button
                  variant="ghost"
                  onClick={handleClosePreview}
                  className="h-auto flex justify-center items-center gap-1 hover:bg-neutral-100 rounded px-1 transition-colors"
                >
                  <Inbox className="w-4 h-4 text-neutral-600" />
                  <span className="text-neutral-600 text-sm font-normal font-['Roboto'] leading-4">All inbox</span>
                </Button>
                <ChevronRightIcon className="w-4 h-4 text-neutral-300" />

                {/* Current email subject */}
                <div className="flex justify-center items-center gap-1">
                  <Mail className="w-4 h-4 text-primary-500" />
                  <span className="text-primary-500 text-sm font-normal font-['Roboto'] leading-4 line-clamp-1">
                    {selectedEmail.subject || "(No subject)"}
                  </span>
                </div>
              </div>

              {isLoadingDetail ? (
                <AdminLoadingPlaceholder heightClassName="h-32" />
              ) : (
                <>
                  {/* Email Meta Card */}
                  <div className={cn(CARD_STYLES.base, "p-4 flex flex-col gap-2")}>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex justify-between items-start">
                        <div className="flex justify-start items-center gap-1">
                          <span className="text-neutral-600 text-xs font-normal font-['Roboto'] leading-5">From</span>
                          <span className="text-neutral-600 text-xs font-normal font-['Roboto'] leading-5">:</span>
                          <span className="text-neutral-600 text-xs font-normal font-['Roboto'] leading-5">{selectedEmail.from}</span>
                        </div>
                        <span className="text-neutral-600 text-xs font-normal font-['Roboto'] leading-5">
                          {formatRelativeTime(selectedEmail.received_at)}
                        </span>
                      </div>
                      <div className="flex justify-start items-start gap-1">
                        <div className="flex justify-start items-center gap-1">
                          <span className="w-7 text-neutral-600 text-xs font-normal font-['Roboto'] leading-5">To</span>
                          <span className="text-neutral-600 text-xs font-normal font-['Roboto'] leading-5">:</span>
                          <span className="text-neutral-600 text-xs font-normal font-['Roboto'] leading-5">{selectedEmail.user_email || "Unknown"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Email Body Card */}
                  <AdminEmailBodyCard
                    subject={selectedEmail.subject}
                    body={emailDetail?.Body}
                    fallbackText={selectedEmail.preview || "No content"}
                    attachments={parseAttachments(emailDetail?.attachments, emailDetail?.ListAttachments)}
                    className="self-stretch"
                  />
                </>
              )}
            </div>
          ) : (
            /* Email List View - Full Width */
            <AdminContentCard className="h-full flex flex-col overflow-hidden">
              {/* Search Header
              <div className="flex items-center gap-3 p-4 border-b border-neutral-100">
                <div className="relative flex-1">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <Input
                      placeholder="Search by sender, recipient, or subject..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="search-input pl-10 h-10 rounded-xl border-neutral-200"
                    />
                </div>
                <span className="text-sm text-neutral-500 whitespace-nowrap">
                  {total} emails
                </span>
              </div> */}

              {/* Email List */}
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <AdminLoadingPlaceholder heightClassName="h-32" />
                ) : error ? (
                  <div className="flex items-center justify-center h-32 px-4">
                    <p className="text-sm text-red-600 text-center">{error}</p>
                  </div>
                ) : emails.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 px-4">
                    <Inbox className="h-8 w-8 text-neutral-300 mb-2" />
                    <p className="text-sm text-neutral-500 text-center">
                      {debouncedSearch ? "No emails found" : "No emails yet"}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {emails.map((email) => (
                      <AdminInboxRow
                        key={email.id}
                        email={email}
                        isSelected={false}
                        onClick={() => handleSelectEmail(email)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 0 && (
                <div className="border-t border-neutral-100 pt-4">
                  <PaginationComponent
                    totalPages={totalPages}
                    currentPage={page}
                    onPageChange={setPage}
                    totalCount={total}
                    activeCount={total}
                    pageSize={pageSize}
                  />
                </div>
              )}
            </AdminContentCard>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

// Admin inbox row component
interface AdminInboxRowProps {
  email: ApiEmail;
  isSelected: boolean;
  onClick: () => void;
}

const AdminInboxRow: React.FC<AdminInboxRowProps> = ({
  email,
  isSelected,
  onClick,
}) => {
  const isUnread = !email.is_read;

  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={cn(
        isSelected ? CARD_STYLES.selected : CARD_STYLES.interactive,
        "h-auto self-stretch w-full text-left px-4 py-2 inline-flex justify-start items-center gap-2 min-w-0"
      )}
    >
      <div className="flex-1 min-w-0 inline-flex flex-col justify-start items-start gap-1">
        {/* Row 1: Sender + Time */}
        <div className="self-stretch min-w-0 inline-flex justify-between items-center">
          <div className={cn(
            "text-base font-['Roboto'] leading-6 truncate",
            isUnread ? "text-neutral-800 font-semibold" : "text-neutral-600 font-normal"
          )}>
            {email.from_name || email.from || "Unknown"}
          </div>
          <div className="flex justify-end items-center gap-0.5">
            <div className={cn(
              "text-xs font-['Roboto'] leading-5 truncate",
              isUnread ? "text-neutral-800 font-semibold" : "text-neutral-600 font-normal"
            )}>
              {formatRelativeTime(email.received_at)}
            </div>
            {isUnread && (
              <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
            )}
          </div>
        </div>

        {/* Row 2: Subject + Recipient */}
        <div className="self-stretch min-w-0 inline-flex justify-start items-start gap-2">
          <div className="flex-1 min-w-0 inline-flex flex-col justify-start items-start gap-1">
            <div className={cn(
              "self-stretch text-sm font-['Roboto'] leading-5 truncate",
              isUnread ? "text-neutral-800 font-semibold" : "text-neutral-600 font-normal"
            )}>
              {email.subject || "(No subject)"}
            </div>
            <div className="self-stretch text-neutral-600 text-sm font-normal font-['Roboto'] leading-5 truncate">
              {email.preview || "No preview available"}
            </div>
          </div>
          <div className="text-neutral-600 text-xs font-normal font-['Roboto'] leading-5 truncate">
            {email.user_email || "Unknown"}
          </div>
        </div>
      </div>
    </Button>
  );
};




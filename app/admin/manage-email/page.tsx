"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { saveAs } from "file-saver";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn, formatRelativeTime } from "@/lib/utils";
import { BUTTON_STYLES } from "@/lib/styles";
import { parseAttachments } from "@/lib/attachmentUtils";
import AdminEmailBodyCard from "@/components/admin/AdminEmailBodyCard";
import AdminEmailListRow, { formatEmailListDate } from "@/components/admin/AdminEmailListRow";
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
import { useRequirePermission } from "@/hooks/use-require-permission";
import { useToast } from "@/hooks/use-toast";

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
  Body?: string;
  body?: string;
  BodyEml: string;
  RelativeTime: string;
  ListAttachments?: { Filename: string; URL: string }[];
  attachments?: string; // JSON string of URLs from API
  has_attachments?: boolean;
}

export default function AdminAllInboxPage() {
  const { allowed } = useRequirePermission("all_inbox");
  const token = useAuthStore((state) => state.token);
  const { toast } = useToast();

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
  const [isDownloadingAttachment, setIsDownloadingAttachment] = useState(false);

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
        const nextEmails = selectedEmail
          ? data.data.map((email) =>
              email.id === selectedEmail.id ? { ...email, is_read: true } : email,
            )
          : data.data;
        setEmails(nextEmails);
        setSelectedEmail((prev) => {
          if (!prev) return null;
          return nextEmails.find((email) => email.id === prev.id) || prev;
        });
        setTotal(data.pagination?.total || data.data.length);
        setTotalPages(data.pagination?.total_pages || Math.ceil((data.pagination?.total || data.data.length) / pageSize));
      } else if (Array.isArray(data)) {
        const nextEmails = selectedEmail
          ? data.map((email) =>
              email.id === selectedEmail.id ? { ...email, is_read: true } : email,
            )
          : data;
        setEmails(nextEmails);
        setSelectedEmail((prev) => {
          if (!prev) return null;
          return nextEmails.find((email) => email.id === prev.id) || prev;
        });
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
  }, [token, page, pageSize, debouncedSearch, selectedEmail]);

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
    const readEmail = { ...email, is_read: true };
    setSelectedEmail(readEmail);
    setEmails((prevEmails) =>
      prevEmails.map((item) =>
        item.id === readEmail.id ? { ...item, is_read: true } : item,
      ),
    );
  };

  const handleClosePreview = () => {
    setSelectedEmail(null);
    setEmailDetail(null);
  };

  const handleDownloadAttachment = async (url: string, filename: string) => {
    if (!selectedEmail?.id) return;

    setIsDownloadingAttachment(true);
    try {
      const response = await apiClient.post(
        "/email/by_user/download/file",
        {
          email_id: selectedEmail.id,
          file_url: url,
        },
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });
      saveAs(blob, filename);
    } catch (err) {
      let errorMessage = "Failed to download file. Please try again.";
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      toast({
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDownloadingAttachment(false);
    }
  };

  if (!allowed) return null;

  return (
    <AdminLayout>
      <Toaster />
      <div className="inline-flex flex-col justify-start items-start gap-5 w-full flex-1 min-h-0">
        {/* Page Header */}
        {!selectedEmail && (
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
                isRefreshing
                  ? "bg-neutral-100 cursor-not-allowed"
                  : "bg-white hover:bg-neutral-50"
              )}
              aria-label="Refresh"
            >
              <ArrowPathIcon
                className={cn(
                  "w-4 h-4",
                  isRefreshing
                    ? "text-primary-500 animate-spin"
                    : "text-neutral-800"
                )}
              />
            </Button>
          </div>
        )}

        {/* Main Content - Full width single view */}
        <div className="flex-1 min-h-0 w-full">
          {selectedEmail ? (
            /* Email Detail View - Full Width */
            <div className="h-full min-h-0 flex flex-col gap-5">
              {/* Breadcrumb Navigation */}
              <div className="shrink-0 self-stretch inline-flex justify-start items-center gap-1">
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
                  <div className="shrink-0 p-4 bg-white rounded-lg shadow-[0px_6px_15px_-2px_rgba(16,24,40,0.08)] border border-neutral-100 flex flex-col gap-2">
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
                  <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-5">
                    <AdminEmailBodyCard
                      subject={selectedEmail.subject}
                      body={emailDetail?.Body || emailDetail?.body}
                      fallbackText={selectedEmail.preview || "No content"}
                      attachments={parseAttachments(emailDetail?.attachments, emailDetail?.ListAttachments)}
                      onDownloadAttachment={handleDownloadAttachment}
                      isDownloading={isDownloadingAttachment}
                      className="self-stretch"
                    />
                  </div>
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
                  <div className="flex flex-col gap-2 p-1">
                    {emails.map((email, idx) => (
                      <AdminEmailListRow
                        key={email.id}
                        primaryText={email.from_name || email.from || "Unknown"}
                        subject={email.subject || "(No subject)"}
                        snippet={email.preview || "No preview available"}
                        sideText={email.user_email || "Unknown"}
                        dateText={formatEmailListDate(email.received_at)}
                        isUnread={!email.is_read}
                        isSelected={false}
                        isLast={idx === emails.length - 1}
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




"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { saveAs } from "file-saver";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn, formatRelativeTime } from "@/lib/utils";
import { BUTTON_STYLES } from "@/lib/styles";
import { parseAttachments } from "@/lib/attachmentUtils";
import { ApiSentEmail } from "@/lib/transformers";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminEmailBodyCard from "@/components/admin/AdminEmailBodyCard";
import AttachmentList from "@/components/mail/AttachmentList";
import AdminContentCard from "@/components/admin/AdminContentCard";
import AdminEmailListRow, { formatEmailListDate } from "@/components/admin/AdminEmailListRow";
import PaginationComponent from "@/components/PaginationComponent";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import AdminLoadingPlaceholder from "@/components/admin/AdminLoadingPlaceholder";
import CenterTruncate from "@/components/ui/center-truncate";
import {
  ArrowPathIcon,
  ArrowLeftIcon,
  ChevronRightIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import { EnvelopeOpenIcon } from "@heroicons/react/24/solid";
import { useRequirePermission } from "@/hooks/use-require-permission";
import { useRelativeTimeTicker } from "@/hooks/use-relative-time-ticker";

interface AdminSentResponse {
  data: ApiSentEmail[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}

interface EmailDetail {
  encode_id?: string;
  ID?: number;
  SenderEmail?: string;
  SenderName?: string;
  Subject?: string;
  Body?: string;
  BodyEml?: string;
  RelativeTime?: string;
  ListAttachments?: { Filename: string; URL: string }[];
  Recipients?: string[];
  id?: string;
  from?: string;
  to?: string;
  subject?: string;
  body?: string;
  body_preview?: string;
  attachments?: string;
  sent_at?: string;
}

export default function AdminAllSentPage() {
  useRelativeTimeTicker();

  const { allowed } = useRequirePermission("all_sent");
  const token = useAuthStore((state) => state.token);
  const { toast } = useToast();

  // Data state
  const [emails, setEmails] = useState<ApiSentEmail[]>([]);
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
  const [selectedEmail, setSelectedEmail] = useState<ApiSentEmail | null>(null);
  const [emailDetail, setEmailDetail] = useState<EmailDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isDownloadingAttachment, setIsDownloadingAttachment] = useState(false);

  // Set page title
  useEffect(() => {
    document.title = "All Sent - Admin Mailria";
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
      const response = await apiClient.get<AdminSentResponse>(`/admin/sent`, {
        params: {
          page,
          page_size: pageSize,
          ...(debouncedSearch && { search: debouncedSearch }),
        },
      });

      const data = response.data;

      // Handle response with pagination object
      if (data && Array.isArray(data.data)) {
        setEmails(data.data);
        setTotal(data.pagination?.total || data.data.length);
        setTotalPages(
          data.pagination?.total_pages ||
            Math.ceil((data.pagination?.total || data.data.length) / pageSize),
        );
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
      console.error("Failed to fetch sent emails:", err);
      setError("Failed to load sent emails");
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
          `/admin/sent/${selectedEmail.id}`,
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

  const handleSelectEmail = (email: ApiSentEmail) => {
    setSelectedEmail(email);
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

  const detailAttachments = parseAttachments(
    emailDetail?.attachments,
    emailDetail?.ListAttachments,
  );
  const detailAttachmentItems = detailAttachments.map((att) => ({
    name: att.Filename,
    url: att.URL,
  }));

  if (!allowed) return null;

  return (
    <AdminLayout>
      <Toaster />
      <div className="inline-flex flex-col justify-start items-start gap-5 w-full flex-1 min-h-0">
        {/* Page Header */}
        {!selectedEmail && (
          <div className="self-stretch inline-flex justify-between items-center">
            <div className="justify-center text-neutral-800 text-2xl font-semibold font-['Roboto'] leading-8">
              All sent
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={cn(
                BUTTON_STYLES.icon,
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
              aria-label="Refresh"
            >
              <ArrowPathIcon
                className={cn(
                  "w-4 h-4 text-neutral-800",
                  isRefreshing && "animate-spin",
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

                {/* All sent */}
                <Button
                  variant="ghost"
                  onClick={handleClosePreview}
                  className="h-auto flex justify-center items-center gap-1 hover:bg-neutral-100 rounded px-1 transition-colors"
                >
                  <PaperAirplaneIcon className="w-6 h-6 text-neutral-600" />
                  <span className="text-neutral-600 text-sm font-normal font-['Roboto'] leading-4">
                    All sent
                  </span>
                </Button>
                <ChevronRightIcon className="w-4 h-4 text-neutral-300" />

                {/* Current email subject */}
                <div className="flex justify-center items-center gap-1">
                  <Mail className="w-4 h-4 text-primary-500" />
                  <CenterTruncate className="text-primary-500 text-sm font-normal font-['Roboto'] leading-4">
                    {selectedEmail.subject || "(No subject)"}
                  </CenterTruncate>
                </div>
              </div>

              {isLoadingDetail ? (
                <AdminLoadingPlaceholder heightClassName="h-32" />
              ) : (
                <>
                  {/* Email Meta Card */}
                  <div
                    className="shrink-0 p-4 bg-white rounded-lg shadow-[0px_6px_15px_-2px_rgba(16,24,40,0.08)] border border-neutral-100 flex flex-col gap-2"
                  >
                    <div className="flex flex-col gap-0.5">
                      <div className="flex justify-between items-start">
                        <div className="flex justify-start items-center gap-1">
                          <span className="text-neutral-600 text-xs font-normal font-['Roboto'] leading-5">
                            From
                          </span>
                          <span className="text-neutral-600 text-xs font-normal font-['Roboto'] leading-5">
                            :
                          </span>
                          <span className="text-neutral-600 text-xs font-normal font-['Roboto'] leading-5">
                            {selectedEmail.from || selectedEmail.user_email}
                          </span>
                        </div>
                        <span className="text-neutral-600 text-xs font-normal font-['Roboto'] leading-5">
                          {formatRelativeTime(selectedEmail.sent_at)}
                        </span>
                      </div>
                      <div className="flex justify-start items-start gap-1">
                        <div className="flex justify-start items-center gap-1">
                          <span className="w-7 text-neutral-600 text-xs font-normal font-['Roboto'] leading-5">
                            To
                          </span>
                          <span className="text-neutral-600 text-xs font-normal font-['Roboto'] leading-5">
                            :
                          </span>
                          <span className="text-neutral-600 text-xs font-normal font-['Roboto'] leading-5">
                            {selectedEmail.to || "Unknown"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Email Body Card */}
                  <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-5">
                    <AdminEmailBodyCard
                      subject={selectedEmail.subject}
                      body={emailDetail?.Body || emailDetail?.body}
                      fallbackText={selectedEmail.body_preview || "No content"}
                      attachments={[]}
                      className="self-stretch"
                    />

                    {detailAttachmentItems.length > 0 && (
                      <div className="self-stretch">
                        <AttachmentList
                          attachments={detailAttachmentItems}
                          showCloseIcon
                          wrapContainer={false}
                          onDownload={handleDownloadAttachment}
                          isDownloading={isDownloadingAttachment}
                        />
                      </div>
                    )}
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
                  <div className="flex flex-col items-center justify-center h-full px-4 gap-3">
                    <div className="w-10 h-10 flex items-center justify-center">
                      <EnvelopeOpenIcon className="w-9 h-9 text-neutral-300" />
                    </div>
                    <div className="flex flex-col justify-start items-center gap-1">
                      <p className="text-base font-medium text-neutral-800 font-['Roboto'] leading-6">
                        No Outgoing Email
                      </p>
                      <p className="text-center text-xs font-normal text-neutral-600 font-['Roboto'] leading-5">
                        Emails you send will appear here
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 p-1">
                    {emails.map((email) => (
                      <AdminEmailListRow
                        key={email.id}
                        primaryText={`To: ${email.to || "Unknown"}`}
                        subject={email.subject || "(No subject)"}
                        snippet={email.body_preview || "No preview available"}
                        sideText={email.from || email.user_email || "Unknown"}
                        dateText={formatEmailListDate(email.sent_at)}
                        isUnread={email.is_read === false}
                        isSelected={false}
                        onClick={() => handleSelectEmail(email)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {total > pageSize && (
                <div className="border-t border-neutral-100">
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




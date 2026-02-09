"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn, formatRelativeTime } from "@/lib/utils";
import { CARD_STYLES, BUTTON_STYLES } from "@/lib/styles";
import { parseAttachments, getFileExtension } from "@/lib/attachmentUtils";
import { ApiSentEmail } from "@/lib/transformers";
import { Download, Mail, FileText } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminContentCard from "@/components/admin/AdminContentCard";
import PaginationComponent from "@/components/PaginationComponent";
import { Toaster } from "@/components/ui/toaster";
import {
  ArrowPathIcon,
  ArrowLeftIcon,
  ChevronRightIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import { EnvelopeOpenIcon } from "@heroicons/react/24/solid";

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
  const token = useAuthStore((state) => state.token);

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
  const [iframeHeight, setIframeHeight] = useState("400px");

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

  return (
    <AdminLayout>
      <Toaster />
      <div className="inline-flex flex-col justify-start items-start gap-5 w-full h-[calc(100vh-80px)]">
        {/* Page Header */}
        <div className="self-stretch inline-flex justify-between items-center">
          <div className="justify-center text-gray-800 text-2xl font-semibold font-['Roboto'] leading-8">
            All sent
          </div>
          <button
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
                "w-4 h-4 text-gray-800",
                isRefreshing && "animate-spin",
              )}
            />
          </button>
        </div>

        {/* Main Content - Full width single view */}
        <div className="flex-1 min-h-0 w-full">
          {selectedEmail ? (
            /* Email Detail View - Full Width */
            <div className="h-full flex flex-col gap-5 overflow-y-auto">
              {/* Breadcrumb Navigation */}
              <div className="self-stretch inline-flex justify-start items-center gap-1">
                {/* Back */}
                <button
                  onClick={handleClosePreview}
                  className="w-8 h-8 rounded flex justify-center items-center hover:bg-gray-100 transition-colors"
                >
                  <ArrowLeftIcon className="w-4 h-4 text-gray-600" />
                </button>
                <ChevronRightIcon className="w-4 h-4 text-gray-300" />

                {/* All sent */}
                <button
                  onClick={handleClosePreview}
                  className="flex justify-center items-center gap-1 hover:bg-gray-100 rounded px-1 transition-colors"
                >
                  <PaperAirplaneIcon className="w-6 h-6 text-gray-600" />
                  <span className="text-gray-600 text-sm font-normal font-['Roboto'] leading-4">
                    All sent
                  </span>
                </button>
                <ChevronRightIcon className="w-4 h-4 text-gray-300" />

                {/* Current email subject */}
                <div className="flex justify-center items-center gap-1">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-600 text-sm font-normal font-['Roboto'] leading-4 line-clamp-1">
                    {selectedEmail.subject || "(No subject)"}
                  </span>
                </div>
              </div>

              {isLoadingDetail ? (
                <div className="flex items-center justify-center h-32">
                  <div className="flex items-center gap-2 text-gray-500">
                    <ArrowPathIcon className="w-6 h-6 animate-spin" />
                    <span className="text-sm">Loading...</span>
                  </div>
                </div>
              ) : (
                <>
                  {/* Email Meta Card */}
                  <div
                    className={cn(CARD_STYLES.base, "p-4 flex flex-col gap-2")}
                  >
                    <div className="flex flex-col gap-0.5">
                      <div className="flex justify-between items-start">
                        <div className="flex justify-start items-center gap-1">
                          <span className="text-gray-600 text-xs font-normal font-['Roboto'] leading-5">
                            From
                          </span>
                          <span className="text-gray-600 text-xs font-normal font-['Roboto'] leading-5">
                            :
                          </span>
                          <span className="text-gray-600 text-xs font-normal font-['Roboto'] leading-5">
                            {selectedEmail.from || selectedEmail.user_email}
                          </span>
                        </div>
                        <span className="text-gray-600 text-xs font-normal font-['Roboto'] leading-5">
                          {formatRelativeTime(selectedEmail.sent_at)}
                        </span>
                      </div>
                      <div className="flex justify-start items-start gap-1">
                        <div className="flex justify-start items-center gap-1">
                          <span className="w-7 text-gray-600 text-xs font-normal font-['Roboto'] leading-5">
                            To
                          </span>
                          <span className="text-gray-600 text-xs font-normal font-['Roboto'] leading-5">
                            :
                          </span>
                          <span className="text-gray-600 text-xs font-normal font-['Roboto'] leading-5">
                            {selectedEmail.to || "Unknown"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Email Body Card */}
                  <div
                    className={cn(CARD_STYLES.base, "p-4 flex flex-col gap-2")}
                  >
                    {/* Subject Title */}
                    <div className="text-gray-800 text-lg font-medium font-['Roboto'] leading-7">
                      {selectedEmail.subject || "(No subject)"}
                    </div>

                    {/* Divider */}
                    <div className="w-full h-0 outline outline-1 outline-offset-[-0.5px] outline-gray-200"></div>

                    {/* Email Body Content */}
                    {emailDetail?.Body || emailDetail?.body ? (
                      <iframe
                        srcDoc={emailDetail.Body || emailDetail.body}
                        className="w-full"
                        style={{
                          height: iframeHeight,
                          border: "none",
                          display: "block",
                          minHeight: "300px",
                        }}
                        onLoad={(e) => {
                          const iframe = e.target as HTMLIFrameElement;
                          if (iframe.contentWindow) {
                            const iframeDoc = iframe.contentWindow.document;
                            const style = iframeDoc.createElement("style");
                            style.textContent = `
                              body {
                                margin: 0;
                                padding: 0;
                                font-family: system-ui, -apple-system, sans-serif;
                                font-size: 14px;
                                line-height: 1.6;
                                color: #1F2937;
                                background: white;
                              }
                              img, table { max-width: 100%; height: auto; }
                              a { color: #027AEA; }
                              pre { white-space: pre-wrap; word-wrap: break-word; }
                            `;
                            iframeDoc.head.appendChild(style);

                            const links = iframeDoc.querySelectorAll("a");
                            links.forEach((link) => {
                              link.setAttribute("target", "_blank");
                              link.setAttribute("rel", "noopener noreferrer");
                            });

                            const height = Math.max(
                              iframeDoc.body.scrollHeight + 48,
                              300,
                            );
                            setIframeHeight(`${height}px`);
                          }
                        }}
                        title="Email content"
                        sandbox="allow-same-origin allow-scripts allow-popups"
                      />
                    ) : (
                      <p className="text-gray-900 text-sm font-normal font-['Roboto'] leading-5 whitespace-pre-wrap">
                        {selectedEmail.body_preview || "No content"}
                      </p>
                    )}
                  </div>

                  {/* Attachments - Outside body card */}
                  {(() => {
                    const attachments = parseAttachments(
                      emailDetail?.attachments,
                      emailDetail?.ListAttachments,
                    );
                    if (attachments.length === 0) return null;
                    return (
                      <div className="flex flex-col gap-2.5">
                        <div className="inline-flex justify-start items-start gap-2">
                          {attachments.map((attachment, index) => {
                            const ext = getFileExtension(attachment.Filename);
                            return (
                              <a
                                key={index}
                                href={attachment.URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                  CARD_STYLES.base,
                                  "w-32 p-3 inline-flex flex-col justify-start items-start gap-3 hover:bg-gray-50 transition-colors",
                                )}
                              >
                                <div className="self-stretch inline-flex justify-between items-center">
                                  <div className="flex justify-start items-center gap-0.5">
                                    <FileText className="w-4 h-4 text-blue-600" />
                                    <span className="text-gray-800 text-xs font-normal font-['Roboto'] leading-5">
                                      {ext}
                                    </span>
                                  </div>
                                  <Download className="w-4 h-4 text-gray-800" />
                                </div>
                                <span className="self-stretch text-gray-800 text-sm font-normal font-['Roboto'] leading-5 line-clamp-2">
                                  {attachment.Filename}
                                </span>
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}
            </div>
          ) : (
            /* Email List View - Full Width */
            <AdminContentCard className="h-full flex flex-col overflow-hidden">
              {/* Search Header
              <div className="flex items-center gap-3 p-4 border-b border-gray-100">
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by sender, recipient, or subject..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-10 rounded-xl border-gray-200"
                  />
                </div>
                <span className="text-sm text-gray-500 whitespace-nowrap">
                  {total} emails
                </span>
              </div> */}

              {/* Email List */}
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="flex items-center gap-2 text-gray-500">
                      <ArrowPathIcon className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Loading emails...</span>
                    </div>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center h-32 px-4">
                    <p className="text-sm text-red-600 text-center">{error}</p>
                  </div>
                ) : emails.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full px-4 gap-3">
                    <div className="w-10 h-10 flex items-center justify-center">
                      <EnvelopeOpenIcon className="w-9 h-9 text-gray-300" />
                    </div>
                    <div className="flex flex-col justify-start items-center gap-1">
                      <p className="text-base font-medium text-gray-800 font-['Roboto'] leading-6">
                        No Outgoing Email
                      </p>
                      <p className="text-center text-xs font-normal text-gray-600 font-['Roboto'] leading-5">
                        Emails you send will appear here
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 p-1">
                    {emails.map((email) => (
                      <AdminSentRow
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
                <div className="border-t border-gray-100 pt-4 px-4 pb-4">
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

// Admin sent row component
interface AdminSentRowProps {
  email: ApiSentEmail;
  isSelected: boolean;
  onClick: () => void;
}

const AdminSentRow: React.FC<AdminSentRowProps> = ({
  email,
  isSelected,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        isSelected ? CARD_STYLES.selected : CARD_STYLES.interactive,
        "self-stretch w-full text-left px-4 py-2",
        "inline-flex justify-start items-center gap-2",
        !isSelected && "hover:bg-gray-100",
      )}
    >
      <div className="flex-1 inline-flex flex-col justify-start items-start gap-1">
        {/* Row 1: Recipient + Time */}
        <div className="self-stretch inline-flex justify-between items-center">
          <div className="text-gray-600 text-base font-normal font-['Roboto'] leading-6">
            To: {email.to || "Unknown"}
          </div>
          <div className="text-gray-600 text-xs font-normal font-['Roboto'] leading-5 line-clamp-1">
            {formatRelativeTime(email.sent_at)}
          </div>
        </div>

        {/* Row 2: Subject + Sender email */}
        <div className="self-stretch inline-flex justify-start items-start gap-2">
          <div className="flex-1 inline-flex flex-col justify-start items-start gap-1">
            <div className="self-stretch text-gray-600 text-sm font-normal font-['Roboto'] leading-5 line-clamp-1">
              {email.subject || "(No subject)"}
            </div>
            <div className="self-stretch text-gray-600 text-sm font-normal font-['Roboto'] leading-5 line-clamp-1">
              {email.body_preview || "No preview available"}
            </div>
          </div>
          <div className="text-gray-600 text-xs font-normal font-['Roboto'] leading-5 line-clamp-1">
            {email.from || email.user_email || "Unknown"}
          </div>
        </div>
      </div>
    </button>
  );
};

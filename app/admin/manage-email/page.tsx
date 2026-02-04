"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn } from "@/lib/utils";
import {
  RefreshCw,
  Search,
  ChevronRight,
  Inbox,
  Download,
  ArrowLeft,
  Mail,
  FileText,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminContentCard from "@/components/admin/AdminContentCard";
import PaginationComponent from "@/components/PaginationComponent";
import { Toaster } from "@/components/ui/toaster";

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
  ListAttachments: { Filename: string; URL: string }[];
}

// Helper to format relative time
const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} months ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString();
};

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
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Preview state
  const [selectedEmail, setSelectedEmail] = useState<ApiEmail | null>(null);
  const [emailDetail, setEmailDetail] = useState<EmailDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [iframeHeight, setIframeHeight] = useState("400px");

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
      <div className="inline-flex flex-col justify-start items-start gap-5 w-full h-[calc(100vh-80px)]">
        {/* Page Header */}
        <div className="self-stretch inline-flex justify-between items-center">
          <div className="justify-center text-gray-800 text-2xl font-semibold font-['Roboto'] leading-8">
            All inbox
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={cn(
              "w-10 h-10 px-4 py-2.5 bg-white rounded-lg",
              "shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)]",
              "outline outline-1 outline-offset-[-1px] outline-gray-200",
              "flex justify-center items-center gap-2 overflow-hidden",
              "hover:bg-gray-50 transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            aria-label="Refresh"
          >
            <RefreshCw
              className={cn("w-5 h-5 text-gray-800", isRefreshing && "animate-spin")}
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
                  <ArrowLeft className="w-6 h-6 text-gray-600" />
                </button>
                <ChevronRight className="w-5 h-5 text-gray-300" />

                {/* All inbox */}
                <button
                  onClick={handleClosePreview}
                  className="flex justify-center items-center gap-1 hover:bg-gray-100 rounded px-1 transition-colors"
                >
                  <Inbox className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-600 text-sm font-normal font-['Roboto'] leading-4">All inbox</span>
                </button>
                <ChevronRight className="w-5 h-5 text-gray-300" />

                {/* Current email subject */}
                <div className="flex justify-center items-center gap-1">
                  <Mail className="w-5 h-5 text-sky-600" />
                  <span className="text-sky-600 text-sm font-normal font-['Roboto'] leading-4 line-clamp-1">
                    {selectedEmail.subject || "(No subject)"}
                  </span>
                </div>
              </div>

              {isLoadingDetail ? (
                <div className="flex items-center justify-center h-32">
                  <div className="flex items-center gap-2 text-gray-500">
                    <RefreshCw className="w-6 h-6 animate-spin" />
                    <span className="text-sm">Loading...</span>
                  </div>
                </div>
              ) : (
                <>
                  {/* Email Meta Card */}
                  <div className="p-4 bg-white rounded-xl shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col gap-2">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex justify-between items-start">
                        <div className="flex justify-start items-center gap-1">
                          <span className="text-gray-600 text-xs font-normal font-['Roboto'] leading-5">From</span>
                          <span className="text-gray-600 text-xs font-normal font-['Roboto'] leading-5">:</span>
                          <span className="text-gray-600 text-xs font-normal font-['Roboto'] leading-5">{selectedEmail.from}</span>
                        </div>
                        <span className="text-gray-600 text-xs font-normal font-['Roboto'] leading-5">
                          {formatRelativeTime(selectedEmail.received_at)}
                        </span>
                      </div>
                      <div className="flex justify-start items-start gap-1">
                        <div className="flex justify-start items-center gap-1">
                          <span className="w-7 text-gray-600 text-xs font-normal font-['Roboto'] leading-5">To</span>
                          <span className="text-gray-600 text-xs font-normal font-['Roboto'] leading-5">:</span>
                          <span className="text-gray-600 text-xs font-normal font-['Roboto'] leading-5">{selectedEmail.user_email || "Unknown"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Email Body Card */}
                  <div className="p-4 bg-white rounded-xl shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col gap-4">
                    {/* Subject Title */}
                    <div className="text-gray-800 text-lg font-medium font-['Roboto'] leading-7">
                      {selectedEmail.subject || "(No subject)"}
                    </div>

                    {/* Divider */}
                    <div className="w-full h-0 outline outline-1 outline-offset-[-0.5px] outline-gray-200"></div>

                    {/* Email Body Content */}
                    <div className="flex flex-col">
                      {emailDetail?.Body ? (
                        <iframe
                          srcDoc={emailDetail.Body}
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
                                a { color: #2563EB; }
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
                                300
                              );
                              setIframeHeight(`${height}px`);
                            }
                          }}
                          title="Email content"
                          sandbox="allow-same-origin allow-scripts allow-popups"
                        />
                      ) : (
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">
                          {selectedEmail.preview || "No content"}
                        </p>
                      )}
                    </div>

                    {/* Attachments */}
                    {emailDetail?.ListAttachments &&
                      emailDetail.ListAttachments.length > 0 && (
                        <div className="inline-flex justify-start items-start gap-2 overflow-x-auto">
                          {emailDetail.ListAttachments.map((attachment, index) => {
                            const filename =
                              attachment.Filename.split("_").pop() ||
                              attachment.Filename;
                            const ext = filename.split(".").pop()?.toUpperCase() || "FILE";
                            return (
                              <a
                                key={index}
                                href={attachment.URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-32 p-3 bg-white rounded-xl shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-start items-start gap-3 hover:bg-gray-50 transition-colors"
                              >
                                <div className="self-stretch inline-flex justify-between items-center">
                                  <div className="flex justify-start items-center gap-0.5">
                                    <FileText className="w-5 h-5 text-sky-600" />
                                    <span className="text-gray-800 text-xs font-normal font-['Roboto'] leading-5">{ext}</span>
                                  </div>
                                  <Download className="w-5 h-5 text-gray-800" />
                                </div>
                                <span className="self-stretch text-gray-800 text-sm font-normal font-['Roboto'] leading-5 line-clamp-2">
                                  {filename}
                                </span>
                              </a>
                            );
                          })}
                        </div>
                      )}
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Email List View - Full Width */
            <AdminContentCard className="h-full flex flex-col overflow-hidden">
              {/* Search Header */}
              <div className="flex items-center gap-3 p-4 border-b border-gray-100">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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
              </div>

              {/* Email List */}
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="flex items-center gap-2 text-gray-500">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Loading emails...</span>
                    </div>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center h-32 px-4">
                    <p className="text-sm text-red-600 text-center">{error}</p>
                  </div>
                ) : emails.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 px-4">
                    <Inbox className="h-8 w-8 text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500 text-center">
                      {debouncedSearch ? "No emails found" : "No emails yet"}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 p-4">
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
    <button
      onClick={onClick}
      className={cn(
        "self-stretch w-full text-left px-4 py-2 rounded-xl",
        "shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)]",
        "outline outline-1 outline-offset-[-1px] outline-gray-200",
        "inline-flex justify-start items-center gap-2",
        "transition-colors",
        isSelected ? "bg-gray-100" : "bg-white hover:bg-gray-100"
      )}
    >
      <div className="flex-1 inline-flex flex-col justify-start items-start gap-1">
        {/* Row 1: Sender + Time */}
        <div className="self-stretch inline-flex justify-between items-center">
          <div className={cn(
            "text-base font-['Roboto'] leading-6",
            isUnread ? "text-gray-800 font-semibold" : "text-gray-600 font-normal"
          )}>
            {email.from_name || email.from || "Unknown"}
          </div>
          <div className="flex justify-end items-center gap-0.5">
            <div className={cn(
              "text-xs font-['Roboto'] leading-5 line-clamp-1",
              isUnread ? "text-gray-800 font-semibold" : "text-gray-600 font-normal"
            )}>
              {formatRelativeTime(email.received_at)}
            </div>
            {isUnread && (
              <div className="w-2 h-2 bg-sky-600 rounded-full"></div>
            )}
          </div>
        </div>

        {/* Row 2: Subject + Recipient */}
        <div className="self-stretch inline-flex justify-start items-start gap-2">
          <div className="flex-1 inline-flex flex-col justify-start items-start gap-1">
            <div className={cn(
              "self-stretch text-sm font-['Roboto'] leading-5 line-clamp-1",
              isUnread ? "text-gray-800 font-semibold" : "text-gray-600 font-normal"
            )}>
              {email.subject || "(No subject)"}
            </div>
            <div className="self-stretch text-gray-600 text-sm font-normal font-['Roboto'] leading-5 line-clamp-1">
              {email.preview || "No preview available"}
            </div>
          </div>
          <div className="text-gray-600 text-xs font-normal font-['Roboto'] leading-5 line-clamp-1">
            {email.user_email || "Unknown"}
          </div>
        </div>
      </div>
    </button>
  );
};

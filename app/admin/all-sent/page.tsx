"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/useAuthStore";
import { Email } from "@/types/email";
import { cn } from "@/lib/utils";
import {
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Send,
  Download,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminContentCard from "@/components/admin/AdminContentCard";
import { Toaster } from "@/components/ui/toaster";

interface AdminEmail extends Email {
  UserEmail?: string;
}

interface AdminSentResponse {
  emails: AdminEmail[];
  total: number;
  page: number;
  page_size: number;
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
  Recipients?: string[];
}

export default function AdminAllSentPage() {
  const token = useAuthStore((state) => state.token);

  // Data state
  const [emails, setEmails] = useState<AdminEmail[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Preview state
  const [selectedEmail, setSelectedEmail] = useState<AdminEmail | null>(null);
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
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });

      if (debouncedSearch) {
        params.append("search", debouncedSearch);
      }

      const response = await apiClient.get<AdminSentResponse>(
        `/admin/sent?${params.toString()}`
      );

      setEmails(response.data.emails || []);
      setTotal(response.data.total || 0);
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
          `/admin/sent/${selectedEmail.email_encode_id}`
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

  const handleSelectEmail = (email: AdminEmail) => {
    setSelectedEmail(email);
  };

  const handleClosePreview = () => {
    setSelectedEmail(null);
    setEmailDetail(null);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <AdminLayout>
      <Toaster />
      <div className="flex flex-col gap-5 h-[calc(100vh-80px)]">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">All sent</h1>
            <p className="mt-1 text-sm text-gray-500">
              View all sent emails across all users
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-9 px-3 rounded-xl border-gray-200"
            >
              <RefreshCw
                className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex gap-5 min-h-0">
          {/* Email List Panel */}
          <AdminContentCard className="flex-1 flex flex-col min-w-0 overflow-hidden">
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
                  <Send className="h-8 w-8 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500 text-center">
                    {debouncedSearch ? "No emails found" : "No sent emails yet"}
                  </p>
                </div>
              ) : (
                <div>
                  {emails.map((email) => (
                    <AdminSentRow
                      key={email.email_encode_id}
                      email={email}
                      isSelected={selectedEmail?.email_encode_id === email.email_encode_id}
                      onClick={() => handleSelectEmail(email)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Page {page} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="h-8 px-3 rounded-lg"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="h-8 px-3 rounded-lg"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </AdminContentCard>

          {/* Preview Panel */}
          <div
            className={cn(
              "w-[480px] flex-shrink-0 transition-all duration-200",
              selectedEmail ? "block" : "hidden lg:block"
            )}
          >
            <AdminContentCard className="h-full flex flex-col overflow-hidden">
              {selectedEmail ? (
                <>
                  {/* Preview Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <h3 className="font-medium text-gray-900 truncate flex-1 mr-2">
                      {selectedEmail.Subject || "(No subject)"}
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleClosePreview}
                      className="h-8 w-8 rounded-lg"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Preview Content */}
                  <div className="flex-1 overflow-y-auto p-4">
                    {isLoadingDetail ? (
                      <div className="flex items-center justify-center h-32">
                        <p className="text-sm text-gray-500">Loading...</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Email Meta */}
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-semibold text-green-600">
                                {selectedEmail.SenderName?.charAt(0)?.toUpperCase() || "?"}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900">
                                {selectedEmail.SenderName || "Unknown"}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {selectedEmail.SenderEmail || selectedEmail.UserEmail}
                              </p>
                            </div>
                            <p className="text-xs text-gray-400">
                              {selectedEmail.RelativeTime}
                            </p>
                          </div>

                          {/* Recipient info for admin view */}
                          <div className="bg-gray-50 rounded-lg px-3 py-2">
                            <p className="text-xs text-gray-500">
                              <span className="font-medium">To:</span>{" "}
                              {selectedEmail.Recipient || "Unknown"}
                            </p>
                          </div>
                        </div>

                        {/* Email Body */}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                          {emailDetail?.Body ? (
                            <iframe
                              srcDoc={emailDetail.Body}
                              className="w-full"
                              style={{
                                height: iframeHeight,
                                border: "none",
                                display: "block",
                              }}
                              onLoad={(e) => {
                                const iframe = e.target as HTMLIFrameElement;
                                if (iframe.contentWindow) {
                                  const iframeDoc = iframe.contentWindow.document;
                                  const style = iframeDoc.createElement("style");
                                  style.textContent = `
                                    body {
                                      margin: 0;
                                      padding: 16px;
                                      font-family: system-ui, -apple-system, sans-serif;
                                      font-size: 14px;
                                      line-height: 1.6;
                                      color: #1F2937;
                                      background: white;
                                    }
                                    img, table { max-width: 100%; height: auto; }
                                    a { color: #2563EB; }
                                  `;
                                  iframeDoc.head.appendChild(style);

                                  const links = iframeDoc.querySelectorAll("a");
                                  links.forEach((link) => {
                                    link.setAttribute("target", "_blank");
                                    link.setAttribute("rel", "noopener noreferrer");
                                  });

                                  const height = Math.max(
                                    iframeDoc.body.scrollHeight + 32,
                                    200
                                  );
                                  setIframeHeight(`${height}px`);
                                }
                              }}
                              title="Email content"
                              sandbox="allow-same-origin allow-scripts allow-popups"
                            />
                          ) : (
                            <div className="p-4">
                              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                                {selectedEmail.Preview || "No content"}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Attachments */}
                        {emailDetail?.ListAttachments &&
                          emailDetail.ListAttachments.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium text-gray-900">
                                Attachments ({emailDetail.ListAttachments.length})
                              </h4>
                              {emailDetail.ListAttachments.map((attachment, index) => {
                                const filename =
                                  attachment.Filename.split("_").pop() ||
                                  attachment.Filename;
                                return (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                  >
                                    <span className="text-sm text-gray-700 truncate flex-1">
                                      {filename}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 rounded-lg"
                                    >
                                      <Download className="h-4 w-4 text-gray-600" />
                                    </Button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <Send className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Select an email
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Choose an email from the list to view its contents
                  </p>
                </div>
              )}
            </AdminContentCard>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

// Admin sent row component
interface AdminSentRowProps {
  email: AdminEmail;
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
        "w-full text-left px-4 py-4 transition-colors border-b border-gray-100",
        "hover:bg-gray-50 focus:outline-none focus:bg-gray-50",
        isSelected && "bg-blue-50 hover:bg-blue-100"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Sent indicator icon */}
        <div className="flex-shrink-0 pt-1.5">
          <Send className="w-3 h-3 text-green-500" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Top row: Sender (User) + Time */}
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-gray-700 truncate">
              From: {email.SenderEmail || email.UserEmail || "Unknown"}
            </span>
            <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
              {email.RelativeTime}
            </span>
          </div>

          {/* Recipient */}
          <p className="text-xs text-gray-400 truncate mt-0.5">
            To: {email.Recipient || "Unknown"}
          </p>

          {/* Subject */}
          <p className="text-sm font-medium text-gray-700 truncate mt-1">
            {email.Subject || "(No subject)"}
          </p>

          {/* Preview */}
          <p className="text-sm text-gray-500 line-clamp-1 mt-1">
            {email.Preview || "No preview available"}
          </p>
        </div>
      </div>
    </button>
  );
};

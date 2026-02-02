"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminContentCard from "@/components/admin/AdminContentCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/toaster";
import {
  ChevronLeft,
  RefreshCw,
  Download,
  Paperclip,
} from "lucide-react";

// API Response type
interface InboxEmailDetail {
  id: string;
  user_id?: string;
  user_email?: string;
  from: string;
  from_name?: string;
  subject: string;
  preview?: string;
  body?: string;
  attachments?: string; // JSON string of URLs
  is_read?: boolean;
  has_attachments?: boolean;
  received_at: string;
  created_at?: string;
}

// Format relative time
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

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Parse attachments from JSON string
function parseAttachments(attachments?: string): string[] {
  if (!attachments) return [];
  try {
    const parsed = JSON.parse(attachments);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Loading skeleton
function DetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-start gap-4">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-60" />
            <Skeleton className="h-8 w-full mt-2" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  );
}

export default function AdminInboxDetailPage() {
  const router = useRouter();
  const params = useParams();
  const emailId = params.id as string;

  const [email, setEmail] = useState<InboxEmailDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [iframeHeight, setIframeHeight] = useState("400px");

  const fetchEmailDetail = useCallback(async () => {
    if (!emailId) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get<InboxEmailDetail>(
        `/admin/inbox/${emailId}`
      );
      setEmail(response.data);
    } catch (err) {
      console.error("Failed to fetch email detail:", err);
      setError("Failed to load email. It may have been deleted or you don't have permission to view it.");
    } finally {
      setIsLoading(false);
    }
  }, [emailId]);

  useEffect(() => {
    fetchEmailDetail();
  }, [fetchEmailDetail]);

  const handleBack = () => {
    router.back();
  };

  const attachmentUrls = parseAttachments(email?.attachments);

  return (
    <AdminLayout>
      <Toaster />
      <div className="flex flex-col gap-5 h-[calc(100vh-80px)]">
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="h-10 w-10 rounded-xl"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-gray-900 truncate">
              {isLoading ? "Loading..." : email?.subject || "(No subject)"}
            </h1>
            <p className="text-sm text-gray-500">Inbox email detail</p>
          </div>
        </div>

        {/* Main Content */}
        <AdminContentCard className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto p-6">
            {isLoading ? (
              <DetailSkeleton />
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-64">
                <p className="text-sm text-red-600 mb-4">{error}</p>
                <Button
                  variant="outline"
                  onClick={fetchEmailDetail}
                  className="rounded-xl"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try again
                </Button>
              </div>
            ) : email ? (
              <div className="max-w-4xl mx-auto space-y-4">
                {/* Email Meta */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-base font-semibold text-blue-600">
                        {email.from_name?.charAt(0)?.toUpperCase() ||
                          email.from?.charAt(0)?.toUpperCase() ||
                          "?"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {email.from_name || "Unknown Sender"}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {email.from}
                          </p>
                        </div>
                        <p className="text-sm text-gray-400 whitespace-nowrap">
                          {formatRelativeTime(email.received_at)}
                        </p>
                      </div>
                      <div className="mt-3 bg-gray-50 rounded-lg px-3 py-2">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium text-gray-700">To:</span>{" "}
                          {email.user_email || "Unknown"}
                        </p>
                      </div>
                      {email.has_attachments && (
                        <div className="mt-2 flex items-center gap-1 text-sm text-gray-500">
                          <Paperclip className="h-4 w-4" />
                          <span>Has attachments</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Email Subject */}
                <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {email.subject || "(No subject)"}
                  </h2>
                </div>

                {/* Email Body */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  {email.body ? (
                    <iframe
                      srcDoc={email.body}
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
                              padding: 24px;
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
                    <div className="p-6">
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">
                        {email.preview || "No content available"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Attachments */}
                {attachmentUrls.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Paperclip className="h-4 w-4" />
                      Attachments ({attachmentUrls.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {attachmentUrls.map((url, index) => {
                        const filename = url.split("/").pop() || `Attachment ${index + 1}`;
                        return (
                          <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <span className="text-sm text-gray-700 truncate flex-1 mr-2">
                              {filename}
                            </span>
                            <Download className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </AdminContentCard>
      </div>
    </AdminLayout>
  );
}

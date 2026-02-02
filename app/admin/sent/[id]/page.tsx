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
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Image as ImageIcon,
} from "lucide-react";

// API Response type
interface SentEmailDetail {
  id: string;
  user_id?: string;
  user_email?: string;
  from?: string;
  to?: string;
  subject: string;
  body_preview?: string;
  body?: string;
  attachments?: string; // JSON string of URLs
  provider?: string;
  status?: string;
  sent_at: string;
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

// Check if URL is an image
function isImageUrl(url: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
  const lowerUrl = url.toLowerCase();
  return imageExtensions.some(ext => lowerUrl.includes(ext));
}

// Get filename from URL
function getFilename(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.split('/').pop() || 'attachment';
    // Decode URL-encoded characters
    return decodeURIComponent(filename);
  } catch {
    return url.split('/').pop() || 'attachment';
  }
}

// Status badge component
function StatusBadge({ status }: { status?: string }) {
  const statusLower = status?.toLowerCase() || "unknown";

  const config: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
    delivered: {
      icon: CheckCircle,
      color: "text-green-700",
      bg: "bg-green-50",
      label: "Delivered",
    },
    sent: {
      icon: CheckCircle,
      color: "text-green-700",
      bg: "bg-green-50",
      label: "Sent",
    },
    pending: {
      icon: Clock,
      color: "text-yellow-700",
      bg: "bg-yellow-50",
      label: "Pending",
    },
    failed: {
      icon: XCircle,
      color: "text-red-700",
      bg: "bg-red-50",
      label: "Failed",
    },
    bounced: {
      icon: XCircle,
      color: "text-red-700",
      bg: "bg-red-50",
      label: "Bounced",
    },
  };

  const { icon: Icon, color, bg, label } = config[statusLower] || {
    icon: Clock,
    color: "text-gray-700",
    bg: "bg-gray-50",
    label: status || "Unknown",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        color,
        bg
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
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

export default function AdminSentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const emailId = params.id as string;

  const [email, setEmail] = useState<SentEmailDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [iframeHeight, setIframeHeight] = useState("400px");

  const fetchEmailDetail = useCallback(async () => {
    if (!emailId) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get<SentEmailDetail>(
        `/admin/sent/${emailId}`
      );
      setEmail(response.data);
    } catch (err) {
      console.error("Failed to fetch sent email detail:", err);
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
            <p className="text-sm text-gray-500">Sent email detail</p>
          </div>
          {email?.status && (
            <StatusBadge status={email.status} />
          )}
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
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-base font-semibold text-green-600">
                        {email.from?.charAt(0)?.toUpperCase() ||
                          email.user_email?.charAt(0)?.toUpperCase() ||
                          "?"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {email.from || email.user_email || "Unknown Sender"}
                          </p>
                          <p className="text-sm text-gray-500">
                            Sent by: {email.user_email || "Unknown"}
                          </p>
                        </div>
                        <p className="text-sm text-gray-400 whitespace-nowrap">
                          {formatRelativeTime(email.sent_at)}
                        </p>
                      </div>
                      <div className="mt-3 bg-gray-50 rounded-lg px-3 py-2">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium text-gray-700">To:</span>{" "}
                          {email.to || "Unknown"}
                        </p>
                      </div>
                      {email.provider && (
                        <div className="mt-2 text-xs text-gray-400">
                          Provider: {email.provider}
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
                        {email.body_preview || "No content available"}
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
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {attachmentUrls.map((url, index) => {
                        const filename = getFilename(url);
                        const isImage = isImageUrl(url);

                        return (
                          <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex flex-col bg-gray-50 rounded-lg overflow-hidden hover:bg-gray-100 transition-colors border border-gray-200 hover:border-gray-300"
                          >
                            {/* Thumbnail or Icon */}
                            <div className="relative aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                              {isImage ? (
                                <>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={url}
                                    alt={filename}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                    onError={(e) => {
                                      // If image fails to load, show icon instead
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      const parent = target.parentElement;
                                      if (parent) {
                                        parent.innerHTML = '<div class="flex items-center justify-center w-full h-full"><svg class="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                                      }
                                    }}
                                  />
                                  {/* Hover overlay */}
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                    <Download className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                                  </div>
                                </>
                              ) : (
                                <div className="flex flex-col items-center justify-center gap-2 p-4">
                                  <FileText className="h-12 w-12 text-gray-400" />
                                </div>
                              )}
                            </div>

                            {/* Filename */}
                            <div className="p-2 border-t border-gray-200">
                              <p className="text-xs text-gray-600 truncate" title={filename}>
                                {filename}
                              </p>
                            </div>
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

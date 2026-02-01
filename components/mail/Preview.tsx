"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Reply,
  Forward,
  Download,
  MoreHorizontal,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Mail, EmailDetail } from "./types";
import { apiClient } from "@/lib/api-client";
import { saveAs } from "file-saver";
import { useAuthStore } from "@/stores/useAuthStore";
import { PreviewSkeleton } from "./PreviewSkeleton";
import { useMinimumLoading } from "@/hooks/use-minimum-loading";

interface PreviewProps {
  email: Mail | null;
  onBack?: () => void;
  onReply?: () => void;
  onForward?: () => void;
  showBackButton?: boolean;
  className?: string;
}

const Preview: React.FC<PreviewProps> = ({
  email,
  onBack,
  onReply,
  onForward,
  showBackButton = false,
  className,
}) => {
  const [emailDetail, setEmailDetail] = useState<EmailDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [iframeHeight, setIframeHeight] = useState("400px");
  const token = useAuthStore((state) => state.token);

  // Use minimum loading time to prevent skeleton flicker
  const { shouldShowLoading, isTransitioning } = useMinimumLoading(isLoading, {
    minimumDuration: 300,
  });

  // Fetch email details when email changes
  useEffect(() => {
    if (!email || !token) {
      setEmailDetail(null);
      return;
    }

    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/email/by_user/detail/${email.email_encode_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setEmailDetail(data);
        }
      } catch (err) {
        console.error("Failed to fetch email detail:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email?.email_encode_id, token]);

  const handleDownload = async (url: string, filename: string) => {
    if (!token || !email) return;

    setIsDownloading(true);
    try {
      const response = await apiClient.post(
        "/email/by_user/download/file",
        {
          email_id: email.email_encode_id,
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
    } catch (error) {
      console.error("Failed to download file:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Empty state
  if (!email) {
    return (
      <div
        className={cn(
          "flex-1 flex flex-col items-center justify-center bg-[#F9FAFB]",
          className
        )}
      >
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            Select an email to read
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Choose an email from the list to view its contents
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex-1 flex flex-col bg-[#F9FAFB]", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="h-9 w-9 rounded-xl hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Button>
          )}
          <h2 className="text-base font-medium text-gray-900 truncate max-w-[200px] md:max-w-none">
            {email.subject || "(No subject)"}
          </h2>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={onReply}
            className="h-9 px-3 rounded-xl border-gray-200 hover:bg-gray-50"
          >
            <Reply className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">Reply</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onForward}
            className="h-9 px-3 rounded-xl border-gray-200 hover:bg-gray-50"
          >
            <Forward className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">Forward</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl hover:bg-gray-100"
          >
            <MoreHorizontal className="h-5 w-5 text-gray-600" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {shouldShowLoading ? (
          <div className="max-w-4xl mx-auto space-y-4" role="status" aria-busy="true">
            {/* Skeleton for email header card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-5 animate-pulse">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="h-5 w-32 bg-gray-200 rounded" />
                    <div className="h-4 w-48 bg-gray-200 rounded mt-1" />
                  </div>
                </div>
                <div className="h-4 w-20 bg-gray-200 rounded flex-shrink-0 ml-4" />
              </div>
            </div>
            {/* Skeleton for email body card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 animate-pulse">
              <div className="space-y-3">
                <div className="h-4 w-full bg-gray-200 rounded" />
                <div className="h-4 w-11/12 bg-gray-200 rounded" />
                <div className="h-4 w-4/5 bg-gray-200 rounded" />
                <div className="h-4 w-full bg-gray-200 rounded" />
                <div className="h-4 w-3/4 bg-gray-200 rounded" />
                <div className="pt-2" />
                <div className="h-4 w-full bg-gray-200 rounded" />
                <div className="h-4 w-5/6 bg-gray-200 rounded" />
              </div>
            </div>
            <span className="sr-only">Loading email content...</span>
          </div>
        ) : (
          <div className={cn(
            "max-w-4xl mx-auto space-y-4",
            isTransitioning && "animate-fade-in"
          )}>
            {/* Email Header Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-blue-600">
                        {email.from?.charAt(0)?.toUpperCase() || "?"}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {email.from}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {emailDetail?.SenderEmail || email.fromEmail}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 flex-shrink-0 ml-4">
                  {emailDetail?.RelativeTime || email.date}
                </p>
              </div>
            </div>

            {/* Email Body Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
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

                      // Add meta viewport tag
                      const meta = iframeDoc.createElement("meta");
                      meta.name = "viewport";
                      meta.content = "width=device-width, initial-scale=1";
                      iframeDoc.head.appendChild(meta);

                      // Apply styles to iframe content
                      const style = iframeDoc.createElement("style");
                      style.textContent = `
                        body {
                          margin: 0;
                          padding: 20px;
                          font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
                          font-size: 14px;
                          line-height: 1.6;
                          color: #1F2937;
                          width: 100%;
                          box-sizing: border-box;
                          overflow-y: auto !important;
                          background: white;
                        }
                        img, table {
                          max-width: 100%;
                          height: auto;
                        }
                        pre {
                          white-space: pre-wrap;
                          word-wrap: break-word;
                          overflow: hidden !important;
                        }
                        table, tr, td, th, div, p, img {
                          max-width: 100% !important;
                          box-sizing: border-box;
                        }
                        a {
                          color: #2563EB;
                        }
                      `;
                      iframeDoc.head.appendChild(style);

                      // Ensure links open in a new tab
                      const links = iframeDoc.querySelectorAll("a");
                      links.forEach((link) => {
                        link.setAttribute("target", "_blank");
                        link.setAttribute("rel", "noopener noreferrer");
                      });

                      // Adjust iframe height
                      const height = Math.max(
                        iframeDoc.body.scrollHeight + 40,
                        200
                      );
                      setIframeHeight(`${height}px`);
                    }
                  }}
                  title="Email content"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation-by-user-activation"
                />
              ) : (
                <div className="p-5">
                  <p className="text-sm text-gray-500 whitespace-pre-wrap">
                    {email.snippet || "No content"}
                  </p>
                </div>
              )}
            </div>

            {/* Attachments */}
            {emailDetail?.ListAttachments &&
              emailDetail.ListAttachments.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-5">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Attachments ({emailDetail.ListAttachments.length})
                  </h4>
                  <div className="space-y-2">
                    {emailDetail.ListAttachments.map((attachment, index) => {
                      const filename =
                        attachment.Filename.split("_").pop() || attachment.Filename;
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                        >
                          <span className="text-sm text-gray-700 truncate flex-1">
                            {filename}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDownload(attachment.URL, filename)
                            }
                            disabled={isDownloading}
                            className="h-8 w-8 p-0 rounded-lg hover:bg-gray-200"
                          >
                            <Download className="h-4 w-4 text-gray-600" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Preview;

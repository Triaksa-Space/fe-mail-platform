"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Reply,
  Forward,
  Download,
  Inbox,
  FileText,
} from "lucide-react";
import { Mail, EmailDetail } from "./types";
import { apiClient } from "@/lib/api-client";
import { saveAs } from "file-saver";
import { useAuthStore } from "@/stores/useAuthStore";
import { useMinimumLoading } from "@/hooks/use-minimum-loading";
import { ChevronLeftIcon } from "@heroicons/react/24/outline"

interface PreviewProps {
  email: Mail | null;
  onBack?: () => void;
  onReply?: () => void;
  onForward?: () => void;
  showBackButton?: boolean;
  className?: string;
  isSentView?: boolean;
  isSentDetailLoading?: boolean;
}

const Preview: React.FC<PreviewProps> = ({
  email,
  onBack,
  onReply,
  onForward,
  showBackButton = false,
  className,
  isSentView = false,
  isSentDetailLoading = false,
}) => {
  const [emailDetail, setEmailDetail] = useState<EmailDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [iframeHeight, setIframeHeight] = useState("400px");
  const token = useAuthStore((state) => state.token);
  const userEmail = useAuthStore((state) => state.email);

  // Use minimum loading time to prevent skeleton flicker
  // For sent view, use external loading state; for inbox view, use internal loading state
  const effectiveLoading = isSentView ? isSentDetailLoading : isLoading;
  const { shouldShowLoading, isTransitioning } = useMinimumLoading(effectiveLoading, {
    minimumDuration: 300,
  });

  // Fetch email details when email changes (skip for sent view)
  useEffect(() => {
    if (!email || !token) {
      setEmailDetail(null);
      return;
    }

    // Skip fetching for sent emails - we already have the data
    if (isSentView) {
      setEmailDetail(null);
      setIsLoading(false);
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
  }, [email?.email_encode_id, token, isSentView]);

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

  // Helper function to get file extension
  const getFileExtension = (filename: string): string => {
    const ext = filename.split(".").pop()?.toUpperCase() || "FILE";
    return ext;
  };

  // Helper function to get filename from URL
  const getFilenameFromUrl = (url: string): string => {
    const parts = url.split("/");
    const fullFilename = parts[parts.length - 1] || "file";
    // Remove UUID prefix if present (format: uuid_filename.ext)
    const underscoreIndex = fullFilename.indexOf("_");
    if (underscoreIndex !== -1) {
      return fullFilename.substring(underscoreIndex + 1);
    }
    return fullFilename;
  };

  // Parse sent email attachments (comes as JSON string or MailAttachment[])
  const getSentAttachments = (): string[] => {
    if (!isSentView || !email?.attachments) return [];
    try {
      if (typeof email.attachments === "string") {
        return JSON.parse(email.attachments);
      }
      if (Array.isArray(email.attachments)) {
        // Handle MailAttachment[] - extract URLs
        return email.attachments.map((att) => att.URL);
      }
    } catch {
      return [];
    }
    return [];
  };

  const sentAttachments = getSentAttachments();

  return (
    <div className={cn("flex-1 flex flex-col bg-gray-50 relative overflow-hidden", className)}>
      {/* Content */}
      <div className="flex-1 overflow-y-auto py-4 pb-24 lg:pb-4">
        {shouldShowLoading ? (
          <div className="flex flex-col gap-4" role="status" aria-busy="true">
            {/* Skeleton for header */}
            <div className="px-4 flex justify-between items-center">
              <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
              <div className="flex gap-3">
                <div className="w-20 h-10 bg-gray-200 rounded-lg animate-pulse" />
                <div className="w-24 h-10 bg-gray-200 rounded-lg animate-pulse" />
              </div>
            </div>
            {/* Skeleton for email info card */}
            <div className="px-4">
              <div className="p-4 bg-white rounded-xl shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] outline outline-1 outline-offset-[-1px] outline-gray-200 animate-pulse">
                <div className="space-y-2">
                  <div className="h-4 w-3/4 bg-gray-200 rounded" />
                  <div className="h-4 w-1/2 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
            {/* Skeleton for email body card */}
            <div className="px-4">
              <div className="p-4 bg-white rounded-xl shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] outline outline-1 outline-offset-[-1px] outline-gray-200 animate-pulse">
                <div className="h-6 w-1/3 bg-gray-200 rounded mb-4" />
                <div className="h-px bg-gray-200 mb-4" />
                <div className="space-y-3">
                  <div className="h-4 w-full bg-gray-200 rounded" />
                  <div className="h-4 w-11/12 bg-gray-200 rounded" />
                  <div className="h-4 w-4/5 bg-gray-200 rounded" />
                  <div className="h-4 w-full bg-gray-200 rounded" />
                </div>
              </div>
            </div>
            <span className="sr-only">Loading email content...</span>
          </div>
        ) : (
          <div className={cn(
            "flex flex-col gap-4",
            isTransitioning && "animate-fade-in"
          )}>
            {/* Header with Back and Action Buttons */}
            <div className="px-4 flex justify-between items-center">
              {showBackButton && (
                <button
                  onClick={onBack}
                  className="w-10 h-10 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex justify-center items-center hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeftIcon className="w-4 h-4 text-gray-800" />
                </button>
              )}
              {!showBackButton && <div />}

              {!isSentView && (
                <div className="flex justify-end items-center gap-3">
                  <button
                    onClick={onReply}
                    className="h-10 px-4 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex justify-center items-center gap-2 hover:bg-gray-50 transition-colors"
                  >
                    <Reply className="w-4 h-4 text-gray-800" />
                    <span className="text-center text-gray-700 text-base font-medium font-['Roboto'] leading-4">Reply</span>
                  </button>
                  <button
                    onClick={onForward}
                    className="h-10 px-4 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex justify-center items-center gap-2 hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-center text-gray-700 text-base font-medium font-['Roboto'] leading-4">Forward</span>
                    <Forward className="w-4 h-4 text-gray-800" />
                  </button>
                </div>
              )}
            </div>

            {/* Email Info Card */}
            <div className="px-4">
              <div className="p-4 bg-white rounded-xl shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col gap-2">
                <div className="flex flex-col gap-0.5">
                  {/* From row */}
                  <div className="flex justify-between items-start">
                    <div className="flex justify-start items-center gap-1">
                      <span className="text-gray-600 text-xs font-normal font-['Roboto'] leading-5">From</span>
                      <span className="text-gray-600 text-xs font-normal font-['Roboto'] leading-5">:</span>
                      <span className="text-gray-600 text-xs font-normal font-['Roboto'] leading-5 line-clamp-1">
                        {isSentView ? email.from : (emailDetail?.SenderEmail || email.fromEmail || email.from)}
                      </span>
                    </div>
                    <span className="text-gray-600 text-xs font-normal font-['Roboto'] leading-5 line-clamp-1">
                      {emailDetail?.RelativeTime || email.date}
                    </span>
                  </div>
                  {/* To row */}
                  <div className="flex justify-start items-start gap-1">
                    <div className="flex justify-start items-center gap-1">
                      <span className="w-7 text-gray-600 text-xs font-normal font-['Roboto'] leading-5">To</span>
                      <span className="text-gray-600 text-xs font-normal font-['Roboto'] leading-5">:</span>
                      <span className="text-gray-600 text-xs font-normal font-['Roboto'] leading-5 line-clamp-1">
                        {isSentView ? email.to : (userEmail || "Unknown")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Body Card */}
            <div className="px-4">
              <div className="p-4 bg-white rounded-xl shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col gap-2">
                {/* Subject */}
                <h2 className="text-gray-800 text-lg font-medium font-['Roboto'] leading-7">
                  {email.subject || "(No subject)"}
                </h2>
                {/* Divider */}
                <div className="h-px bg-gray-200" />
                {/* Body */}
                {(emailDetail?.Body || (isSentView && email.body)) ? (
                  <iframe
                    srcDoc={isSentView ? email.body : emailDetail?.Body}
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
                            padding: 0;
                            font-family: 'Roboto', system-ui, -apple-system, sans-serif;
                            font-size: 14px;
                            line-height: 1.5;
                            color: #111827;
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
                            color: #027AEA;
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
                          iframeDoc.body.scrollHeight + 20,
                          100
                        );
                        setIframeHeight(`${height}px`);
                      }
                    }}
                    title="Email content"
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation-by-user-activation"
                  />
                ) : (
                  <p className="text-gray-900 text-sm font-normal font-['Roboto'] leading-5 whitespace-pre-wrap">
                    {email.snippet || "No content"}
                  </p>
                )}
              </div>
            </div>

            {/* Attachments for Inbox */}
            {!isSentView && emailDetail?.ListAttachments &&
              emailDetail.ListAttachments.length > 0 && (
                <div className="px-4">
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {emailDetail.ListAttachments.map((attachment, index) => {
                      const filename =
                        attachment.Filename.split("_").pop() || attachment.Filename;
                      const fileExt = getFileExtension(filename);
                      return (
                        <div
                          key={index}
                          className="w-32 flex-shrink-0 p-3 bg-white rounded-xl shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col gap-3"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex justify-start items-center gap-0.5">
                              <FileText className="w-5 h-5 text-primary-600" />
                              <span className="text-gray-800 text-xs font-normal font-['Roboto'] leading-5">{fileExt}</span>
                            </div>
                            <button
                              onClick={() => handleDownload(attachment.URL, filename)}
                              disabled={isDownloading}
                              className="w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
                            >
                              <Download className="w-4 h-4 text-gray-800" />
                            </button>
                          </div>
                          <span className="text-gray-800 text-sm font-normal font-['Roboto'] leading-5 line-clamp-2">
                            {filename}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            {/* Attachments for Sent */}
            {isSentView && sentAttachments.length > 0 && (
              <div className="px-4">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {sentAttachments.map((url, index) => {
                    const filename = getFilenameFromUrl(url);
                    const fileExt = getFileExtension(filename);
                    return (
                      <div
                        key={index}
                        className="w-32 flex-shrink-0 p-3 bg-white rounded-xl shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col gap-3"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex justify-start items-center gap-0.5">
                            <FileText className="w-5 h-5 text-primary-600" />
                            <span className="text-gray-800 text-xs font-normal font-['Roboto'] leading-5">{fileExt}</span>
                          </div>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={filename}
                            className="w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
                          >
                            <Download className="w-4 h-4 text-gray-800" />
                          </a>
                        </div>
                        <span className="text-gray-800 text-sm font-normal font-['Roboto'] leading-5 line-clamp-2">
                          {filename}
                        </span>
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

"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Reply,
  Forward,
  Inbox,
} from "lucide-react";
import { Mail, EmailDetail } from "./types";
import { apiClient } from "@/lib/api-client";
import { saveAs } from "file-saver";
import { useAuthStore } from "@/stores/useAuthStore";
import { useMinimumLoading } from "@/hooks/use-minimum-loading";
import { ChevronLeftIcon } from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button";
import EmailBodyCard from "./EmailBodyCard";
import { Attachment } from "@/lib/attachmentUtils";

interface PreviewProps {
  email: Mail | null;
  onBack?: () => void;
  onReply?: () => void;
  onForward?: () => void;
  showBackButton?: boolean;
  className?: string;
  isSentView?: boolean;
  isSentDetailLoading?: boolean;
  pinAttachments?: boolean;
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
  pinAttachments = false,
}) => {
  const [emailDetail, setEmailDetail] = useState<EmailDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
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
          <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-medium text-neutral-900">
            Select an email to read
          </h3>
          <p className="mt-1 text-sm text-neutral-500">
            Choose an email from the list to view its contents
          </p>
        </div>
      </div>
    );
  }

  // Build attachments list for EmailBodyCard
  const getAttachments = (): Attachment[] => {
    if (isSentView) {
      if (!email?.attachments) return [];
      try {
        let urls: string[] = [];
        if (typeof email.attachments === "string") {
          urls = JSON.parse(email.attachments);
        } else if (Array.isArray(email.attachments)) {
          urls = email.attachments.map((att) => att.URL);
        }
        return urls.map((url) => {
          const parts = url.split("/");
          const fullFilename = parts[parts.length - 1] || "file";
          const underscoreIndex = fullFilename.indexOf("_");
          const filename = underscoreIndex !== -1 ? fullFilename.substring(underscoreIndex + 1) : fullFilename;
          return { Filename: filename, URL: url };
        });
      } catch {
        return [];
      }
    }
    return emailDetail?.ListAttachments || [];
  };

  const attachments = getAttachments();

  return (
    <div className={cn("flex-1 flex flex-col bg-neutral-50 relative overflow-hidden", className)}>
      {/* Content */}
      <div className={cn(
        "flex-1 overflow-y-auto py-4",
        pinAttachments ? "pb-4" : "pb-24 lg:pb-4"
      )}>
        {shouldShowLoading ? (
          <div className="flex flex-col gap-4" role="status" aria-busy="true">
            {/* Skeleton for header */}
            <div className="px-4 flex justify-between items-center">
              <div className="w-10 h-10 bg-neutral-200 rounded-lg animate-pulse" />
              <div className="flex gap-3">
                <div className="w-20 h-10 bg-neutral-200 rounded-lg animate-pulse" />
                <div className="w-24 h-10 bg-neutral-200 rounded-lg animate-pulse" />
              </div>
            </div>
            {/* Skeleton for email info card */}
            <div className="px-4">
              <div className="p-4 bg-white rounded-xl shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] outline outline-1 outline-offset-[-1px] outline-neutral-200 animate-pulse">
                <div className="space-y-2">
                  <div className="h-4 w-3/4 bg-neutral-200 rounded" />
                  <div className="h-4 w-1/2 bg-neutral-200 rounded" />
                </div>
              </div>
            </div>
            {/* Skeleton for email body card */}
            <div className="px-4">
              <div className="p-4 bg-white rounded-xl shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] outline outline-1 outline-offset-[-1px] outline-neutral-200 animate-pulse">
                <div className="h-6 w-1/3 bg-neutral-200 rounded mb-4" />
                <div className="h-px bg-neutral-200 mb-4" />
                <div className="space-y-3">
                  <div className="h-4 w-full bg-neutral-200 rounded" />
                  <div className="h-4 w-11/12 bg-neutral-200 rounded" />
                  <div className="h-4 w-4/5 bg-neutral-200 rounded" />
                  <div className="h-4 w-full bg-neutral-200 rounded" />
                </div>
              </div>
            </div>
            <span className="sr-only">Loading email content...</span>
          </div>
        ) : (
          <div className={cn(
            "flex flex-col gap-4",
            pinAttachments && "min-h-full",
            isTransitioning && "animate-fade-in"
          )}>
            {/* Header with Back and Action Buttons */}
            <div className="px-4 flex justify-between items-center">
              {showBackButton && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onBack}
                  className="w-10 h-10 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline-neutral-200 hover:bg-neutral-50"
                >
                  <ChevronLeftIcon className="w-4 h-4 text-neutral-800" />
                </Button>
              )}
              {!showBackButton && <div />}

              {!isSentView && (
                <div className="flex justify-end items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={onReply}
                    className="h-10 px-4 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline-neutral-200 gap-2 hover:bg-neutral-50"
                  >
                    <Reply className="w-4 h-4 text-neutral-800" />
                    <span className="text-center text-neutral-700 text-base font-medium font-['Roboto'] leading-4">Reply</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onForward}
                    className="h-10 px-4 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline-neutral-200 gap-2 hover:bg-neutral-50"
                  >
                    <span className="text-center text-neutral-700 text-base font-medium font-['Roboto'] leading-4">Forward</span>
                    <Forward className="w-4 h-4 text-neutral-800" />
                  </Button>
                </div>
              )}
            </div>

            {/* Email Info Card */}
            <div className="px-4">
              <div className="p-4 bg-white rounded-xl shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] outline outline-1 outline-offset-[-1px] outline-neutral-200 flex flex-col gap-2">
                <div className="flex flex-col gap-0.5">
                  {/* From row */}
                  <div className="flex justify-between items-start">
                    <div className="flex justify-start items-center gap-1">
                      <span className="text-neutral-600 text-xs font-normal font-['Roboto'] leading-5">From</span>
                      <span className="text-neutral-600 text-xs font-normal font-['Roboto'] leading-5">:</span>
                      <span className="text-neutral-600 text-xs font-normal font-['Roboto'] leading-5 line-clamp-1">
                        {isSentView ? email.from : (emailDetail?.SenderEmail || email.fromEmail || email.from)}
                      </span>
                    </div>
                    <span className="text-neutral-600 text-xs font-normal font-['Roboto'] leading-5 line-clamp-1">
                      {emailDetail?.RelativeTime || email.date}
                    </span>
                  </div>
                  {/* To row */}
                  <div className="flex justify-start items-start gap-1">
                    <div className="flex justify-start items-center gap-1">
                      <span className="w-7 text-neutral-600 text-xs font-normal font-['Roboto'] leading-5">To</span>
                      <span className="text-neutral-600 text-xs font-normal font-['Roboto'] leading-5">:</span>
                      <span className="text-neutral-600 text-xs font-normal font-['Roboto'] leading-5 line-clamp-1">
                        {isSentView ? email.to : (userEmail || "Unknown")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Body Card */}
            <div className={cn("px-4", pinAttachments && "flex-1 flex flex-col")}>
              <EmailBodyCard
                subject={email.subject}
                body={isSentView ? email.body : emailDetail?.Body}
                fallbackText={email.snippet}
                attachments={attachments}
                onDownloadAttachment={!isSentView ? handleDownload : undefined}
                isDownloading={isDownloading}
                className={cn(pinAttachments && "flex-1")}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Preview;




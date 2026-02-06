"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { cn, formatRelativeTime } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/toaster";
import { CARD_STYLES } from "@/lib/styles";
import { parseAttachments, extractFilenameFromUrl, getFileExtension } from "@/lib/attachmentUtils";
import {
  Inbox,
  Mail,
  FileText,
} from "lucide-react";
import { UserGroupIcon, UserIcon, ArrowLeftIcon, ChevronRightIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

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
        `/admin/inbox/${emailId}`,
      );
      setEmail(response.data);
    } catch (err) {
      console.error("Failed to fetch email detail:", err);
      setError(
        "Failed to load email. It may have been deleted or you don't have permission to view it.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [emailId]);

  useEffect(() => {
    fetchEmailDetail();
  }, [fetchEmailDetail]);

  const attachments = parseAttachments(email?.attachments);
  const subject = email?.subject || "(No subject)";
  const userEmail = email?.user_email || "Unknown";

  return (
    <AdminLayout>
      <Toaster />
      <div className="inline-flex flex-col justify-start items-start gap-5 w-full">
        {/* Breadcrumb Header */}
        <div className="self-stretch inline-flex justify-between items-center">
          <div className="flex justify-start items-center gap-1">
            {/* Back */}
            <button
              onClick={() => router.back()}
              className="w-8 h-8 rounded flex justify-center items-center hover:bg-gray-100 transition-colors"
            >
              <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
            </button>
            <ChevronRightIcon className="h-5 w-5 text-gray-300" />
            
            {/* User list */}
            <button
              onClick={() => router.push("/admin")}
              className="flex justify-center items-center gap-1 hover:bg-gray-100 rounded px-1 transition-colors"
            >
              <UserGroupIcon className="w-5 h-5 text-gray-600" />
              <div className="justify-center text-gray-600 text-sm font-normal font-['Roboto'] leading-4">User list</div>
            </button>
            <ChevronRightIcon className="w-5 h-5 text-gray-300" />
            
            <div className="flex justify-center items-center gap-1">
              <UserIcon className="w-5 h-5 text-gray-600" />
              <div className="justify-center text-gray-600 text-sm font-normal font-['Roboto'] leading-4">
                {userEmail}
              </div>
            </div>
            <ChevronRightIcon className="h-5 w-5 text-gray-300" />
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Inbox className="h-5 w-5" />
              <span>Inbox</span>
            </div>
            <ChevronRightIcon className="h-5 w-5 text-gray-300" />
            <div className="flex items-center gap-1 text-sm text-blue-600">
              <Mail className="h-5 w-5" />
              <span className="line-clamp-1">
                {isLoading ? "Loading..." : subject}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <DetailSkeleton />
        ) : error ? (
          <div className={cn(CARD_STYLES.base, "flex flex-col items-center justify-center h-64")}>
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <Button
              variant="outline"
              onClick={fetchEmailDetail}
              className="rounded-xl"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Try again
            </Button>
          </div>
        ) : email ? (
          <div className="self-stretch inline-flex flex-col justify-start items-start gap-5">
            <div className={cn(CARD_STYLES.base, "self-stretch p-4 flex flex-col justify-start items-start gap-2")}>
              <div className="self-stretch flex flex-col justify-start items-start gap-0.5">
                <div className="self-stretch inline-flex justify-between items-start">
                  <div className="flex justify-start items-center gap-1">
                    <div className="text-gray-600 text-xs font-normal leading-5 line-clamp-1">
                      From
                    </div>
                    <div className="text-gray-600 text-xs font-normal leading-5 line-clamp-1">
                      :
                    </div>
                    <div className="text-gray-600 text-xs font-normal leading-5 line-clamp-1">
                      {email.from || "Unknown Sender"}
                    </div>
                  </div>
                  <div className="text-gray-600 text-xs font-normal leading-5 line-clamp-1">
                    {formatRelativeTime(email.received_at)}
                  </div>
                </div>
                <div className="self-stretch inline-flex justify-start items-start gap-1">
                  <div className="flex justify-start items-center gap-1">
                    <div className="w-7 text-gray-600 text-xs font-normal leading-5 line-clamp-1">
                      To
                    </div>
                    <div className="text-gray-600 text-xs font-normal leading-5 line-clamp-1">
                      :
                    </div>
                    <div className="text-gray-600 text-xs font-normal leading-5 line-clamp-1">
                      {userEmail}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={cn(CARD_STYLES.base, "self-stretch p-4 flex flex-col justify-start items-start gap-2")}>
              <div className="text-gray-800 text-lg font-medium leading-7">
                {subject}
              </div>
              <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-gray-200"></div>
              <div className="self-stretch text-gray-900 text-sm font-normal leading-5">
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
                            padding: 0;
                            font-family: system-ui, -apple-system, sans-serif;
                            font-size: 14px;
                            line-height: 1.6;
                            color: #111827;
                            background: white;
                          }
                          img, table { max-width: 100%; height: auto; }
                          a { color: #0284C7; }
                          pre { white-space: pre-wrap; word-wrap: break-word; }
                        `;
                        iframeDoc.head.appendChild(style);

                        const links = iframeDoc.querySelectorAll("a");
                        links.forEach((link) => {
                          link.setAttribute("target", "_blank");
                          link.setAttribute("rel", "noopener noreferrer");
                        });

                        const height = Math.max(
                          iframeDoc.body.scrollHeight + 8,
                          300,
                        );
                        setIframeHeight(`${height}px`);
                      }
                    }}
                    title="Email content"
                    sandbox="allow-same-origin allow-scripts allow-popups"
                  />
                ) : (
                  <p className="whitespace-pre-wrap">
                    {email.preview || "No content available"}
                  </p>
                )}
              </div>
            </div>

            {attachments.length > 0 && (
              <div className="flex flex-col justify-start items-start gap-2.5">
                <div className="inline-flex justify-start items-start gap-2 flex-wrap">
                  {attachments.map((attachment, index) => {
                    const filename = extractFilenameFromUrl(attachment.URL);
                    const fileType = getFileExtension(filename);

                    return (
                      <a
                        key={index}
                        href={attachment.URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(CARD_STYLES.interactive, "w-32 p-3 inline-flex flex-col justify-start items-start gap-3")}
                      >
                        <div className="self-stretch inline-flex justify-between items-center">
                          <div className="flex justify-start items-center gap-0.5">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <div className="text-gray-800 text-xs font-normal leading-5">
                              {fileType}
                            </div>
                          </div>
                        </div>
                        <div
                          className="self-stretch text-gray-800 text-sm font-normal leading-5 line-clamp-2"
                          title={filename}
                        >
                          {filename}
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
    </AdminLayout>
  );
}

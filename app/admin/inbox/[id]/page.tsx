"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { saveAs } from "file-saver";
import { formatRelativeTime } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { parseAttachments } from "@/lib/attachmentUtils";
import AdminEmailBodyCard from "@/components/admin/AdminEmailBodyCard";
import {
  Inbox,
  Mail,
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
      <div className="bg-white rounded-xl border border-neutral-200 p-4">
        <div className="flex items-start gap-4">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-60" />
            <Skeleton className="h-8 w-full mt-2" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
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
  const { toast } = useToast();

  const [email, setEmail] = useState<InboxEmailDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleDownloadAttachment = async (url: string, filename: string) => {
    if (!emailId) return;

    setIsDownloading(true);
    try {
      const response = await apiClient.post(
        "/email/by_user/download/file",
        {
          email_id: emailId,
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
      setIsDownloading(false);
    }
  };

  const attachments = parseAttachments(email?.attachments);
  const subject = email?.subject || "(No subject)";
  const userEmail = email?.user_email || "Unknown";

  return (
    <AdminLayout>
      <Toaster />
      <div className="flex flex-col w-full h-full gap-5">
        {/* Breadcrumb Header */}
        <div className="shrink-0 self-stretch inline-flex justify-between items-center">
          <div className="flex justify-start items-center gap-1">
            {/* Back */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="w-8 h-8 rounded flex justify-center items-center hover:bg-neutral-100 transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4 text-neutral-600" />
            </Button>
            <ChevronRightIcon className="h-4 w-4 text-neutral-300" />
            
            {/* User list */}
            <Button
              variant="ghost"
              onClick={() => router.push("/admin")}
              className="h-auto px-1 py-0 flex justify-center items-center gap-1 hover:bg-neutral-100 rounded transition-colors"
            >
              <UserGroupIcon className="w-5 h-5 text-neutral-600" />
              <div className="justify-center text-neutral-600 text-sm font-normal font-['Roboto'] leading-4">User list</div>
            </Button>
            <ChevronRightIcon className="w-5 h-5 text-neutral-300" />
            
            <div className="flex justify-center items-center gap-1">
              <UserIcon className="w-5 h-5 text-neutral-600" />
              <div className="justify-center text-neutral-600 text-sm font-normal font-['Roboto'] leading-4">
                {userEmail}
              </div>
            </div>
            <ChevronRightIcon className="h-4 w-4 text-neutral-300" />
            <div className="flex items-center gap-1 text-sm text-neutral-600">
              <Inbox className="h-4 w-4" />
              <span>Inbox</span>
            </div>
            <ChevronRightIcon className="h-4 w-4 text-neutral-300" />
            <div className="flex items-center gap-1 text-sm text-primary-500 min-w-0">
              <Mail className="h-4 w-4 shrink-0" />
              <span className="truncate max-w-[300px] text-primary-500 text-sm font-normal font-['Roboto'] leading-4" title={isLoading ? "Loading..." : subject}>
                {isLoading ? "Loading..." : subject}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <DetailSkeleton />
        ) : error ? (
          <div className="p-4 bg-white rounded-lg shadow-[0px_6px_15px_-2px_rgba(16,24,40,0.08)] border border-neutral-100 flex flex-col items-center justify-center h-64">
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
          <div className="self-stretch flex-1 min-h-0 flex flex-col gap-5">
            {/* From/To - tidak ikut scroll */}
            <div className="self-stretch shrink-0 p-4 bg-white rounded-lg shadow-[0px_6px_15px_-2px_rgba(16,24,40,0.08)] border border-neutral-100 flex flex-col justify-start items-start gap-2">
              <div className="self-stretch flex flex-col justify-start items-start gap-0.5">
                <div className="self-stretch inline-flex justify-between items-start">
                  <div className="flex justify-start items-center gap-1">
                    <div className="text-neutral-600 text-xs font-normal leading-5 line-clamp-1">
                      From
                    </div>
                    <div className="text-neutral-600 text-xs font-normal leading-5 line-clamp-1">
                      :
                    </div>
                    <div className="text-neutral-600 text-xs font-normal leading-5 line-clamp-1">
                      {email.from || "Unknown Sender"}
                    </div>
                  </div>
                  <div className="text-neutral-600 text-xs font-normal leading-5 line-clamp-1">
                    {formatRelativeTime(email.received_at)}
                  </div>
                </div>
                <div className="self-stretch inline-flex justify-start items-start gap-1">
                  <div className="flex justify-start items-center gap-1">
                    <div className="w-7 text-neutral-600 text-xs font-normal leading-5 line-clamp-1">
                      To
                    </div>
                    <div className="text-neutral-600 text-xs font-normal leading-5 line-clamp-1">
                      :
                    </div>
                    <div className="text-neutral-600 text-xs font-normal leading-5 line-clamp-1">
                      {userEmail}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable: body email + attachments */}
            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-5">
              <AdminEmailBodyCard
                subject={subject}
                body={email.body}
                fallbackText={email.preview || "No content available"}
                attachments={attachments}
                onDownloadAttachment={handleDownloadAttachment}
                isDownloading={isDownloading}
                className="self-stretch"
              />
            </div>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
}




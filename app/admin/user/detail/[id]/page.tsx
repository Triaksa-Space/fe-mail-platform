"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Mail,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/useAuthStore";
import axios from "axios";
import { apiClient } from "@/lib/api-client";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminContentCard from "@/components/admin/AdminContentCard";
import { ArrowPathIcon, UserIcon, ChevronLeftIcon, XMarkIcon } from "@heroicons/react/24/outline";
import AdminLoadingPlaceholder from "@/components/admin/AdminLoadingPlaceholder";

interface EmailDetail {
  ID: number;
  SenderEmail: string;
  SenderName: string;
  From: string;
  Subject: string;
  Body: string;
  BodyEml: string;
  RelativeTime: string;
  Recipient?: string;
  ListAttachments: { Filename: string; URL: string }[];
}

const EmailDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const roleId = useAuthStore((state) => state.roleId);
  const storedToken = useAuthStore.getState().getStoredToken();
  const { toast } = useToast();

  const [email, setEmail] = useState<EmailDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [iframeHeight, setIframeHeight] = useState("400px");
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [authLoaded, setAuthLoaded] = useState(false);

  // Auth check
  useEffect(() => {
    setAuthLoaded(true);
  }, []);

  useEffect(() => {
    if (!authLoaded) return;

    if (!storedToken) {
      router.replace("/");
      return;
    }

    if (roleId === 1) {
      router.replace("/not-found");
    }
  }, [authLoaded, storedToken, roleId, router]);

  // Fetch email detail
  const fetchEmailDetail = useCallback(async () => {
    if (!storedToken) return;

    try {
      setIsLoading(true);
      const response = await apiClient.get(`/email/by_user/detail/${params.id}`);
      setEmail(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch email:", err);
      setError("Failed to load email");
    } finally {
      setIsLoading(false);
    }
  }, [params.id, storedToken]);

  useEffect(() => {
    if (!authLoaded || !storedToken || roleId === 1) return;
    fetchEmailDetail();
  }, [authLoaded, storedToken, roleId, fetchEmailDetail]);

  // Handle file download
  const handleDownload = async (url: string, filename: string) => {
    if (!storedToken) return;

    setIsDownloading(true);
    setDownloadingFile(filename);

    try {
      const response = await apiClient.post(
        "/email/by_user/download/file",
        {
          email_id: params.id,
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

      toast({
        description: `Downloaded ${filename}`,
        variant: "default",
      });
    } catch (error) {
      let errorMessage = "Failed to download file. Please try again.";
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        errorMessage = error.response.data.message;
      }
      toast({
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
      setDownloadingFile(null);
    }
  };

  // Handle iframe load
  const handleIframeLoad = (e: React.SyntheticEvent<HTMLIFrameElement>) => {
    const iframe = e.target as HTMLIFrameElement;
    if (!iframe.contentWindow) {
      setIframeLoaded(true);
      return;
    }

    const iframeDoc = iframe.contentWindow.document;

    const style = iframeDoc.createElement("style");
    style.textContent = `
      body {
        margin: 0;
        padding: 0;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        line-height: 1.6;
        color: #1F2937;
        background: white;
      }
      img, table {
        max-width: 100%;
        height: auto;
      }
      a {
        color: #027AEA;
      }
      pre {
        white-space: pre-wrap;
        word-wrap: break-word;
      }
    `;
    iframeDoc.head.appendChild(style);

    const links = iframeDoc.querySelectorAll("a");
    links.forEach((link) => {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    });

    const finalizeHeight = () => {
      requestAnimationFrame(() => {
        const height = Math.max(iframeDoc.body.scrollHeight + 8, 200);
        setIframeHeight(`${height}px`);
        setIframeLoaded(true);
      });
    };

    // Wait for all images to finish loading before calculating height,
    // so scrollHeight reflects the true content size (avoids half-page jump).
    const images = Array.from(iframeDoc.querySelectorAll<HTMLImageElement>("img"));
    const pending = images.filter((img) => !img.complete);

    if (pending.length === 0) {
      finalizeHeight();
      return;
    }

    let remaining = pending.length;
    const fallbackTimer = setTimeout(finalizeHeight, 5000);

    const onSettled = () => {
      remaining--;
      if (remaining <= 0) {
        clearTimeout(fallbackTimer);
        finalizeHeight();
      }
    };

    pending.forEach((img) => {
      img.addEventListener("load", onSettled, { once: true });
      img.addEventListener("error", onSettled, { once: true });
    });
  };

  // Get filename from path
  const getFilename = (filename: string) => {
    return filename.split("_").pop() || filename;
  };

  if (!authLoaded || roleId === 1) {
    return (
      <div className="flex items-center justify-center h-screen">
        <ArrowPathIcon className="h-6 w-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <AdminLayout>
      <Toaster />
      <div className="flex flex-col gap-5 h-[calc(100vh-80px)]">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.back()}
              className="h-10 w-10 rounded-xl border-neutral-200"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50">
                <Mail className="h-6 w-6 text-primary-500" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-neutral-900">
                  Email Detail
                </h1>
                <p className="text-sm text-neutral-500">
                  {email?.Subject || "Loading..."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <AdminLoadingPlaceholder heightClassName="h-64" />
        ) : error ? (
          <AdminContentCard className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={fetchEmailDetail} variant="outline">
                Try Again
              </Button>
            </div>
          </AdminContentCard>
        ) : email ? (
          <div className="flex-1 flex flex-col gap-5 min-h-0 overflow-auto">
            {/* Email Meta Card */}
            <AdminContentCard className="p-5">
              <div className="space-y-4">
                {/* From */}
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 flex-shrink-0">
                    <span className="text-sm font-semibold text-primary-500">
                      {email.SenderName?.charAt(0)?.toUpperCase() || "?"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-neutral-900">
                          {email.SenderName || "Unknown Sender"}
                        </p>
                        <p className="text-sm text-neutral-500">
                          {email.SenderEmail}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-neutral-500">
                        <Clock className="h-4 w-4" />
                        <span>{email.RelativeTime}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* To (if available) */}
                {email.Recipient && (
                  <div className="flex items-center gap-2 text-sm text-neutral-600 pl-14">
                    <UserIcon className="h-4 w-4 text-neutral-400" />
                    <span className="font-medium">To:</span>
                    <span>{email.Recipient}</span>
                  </div>
                )}

                {/* Subject */}
                <div className="pl-14">
                  <h2 className="text-lg font-semibold text-neutral-900">
                    {email.Subject || "(No Subject)"}
                  </h2>
                </div>
              </div>
            </AdminContentCard>

            {/* Email Body Card */}
            <AdminContentCard className="flex-1 min-h-0 overflow-hidden">
              <div className="h-full overflow-auto relative">
                {!iframeLoaded && email.Body && (
                  <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-[1px] flex items-center justify-center rounded-lg">
                    <ArrowPathIcon className="animate-spin h-6 w-6 text-neutral-400" />
                  </div>
                )}
                {email.Body ? (
                  <iframe
                    srcDoc={email.Body}
                    className="w-full"
                    style={{
                      height: iframeHeight,
                      border: "none",
                      display: "block",
                      minHeight: "300px",
                    }}
                    onLoad={handleIframeLoad}
                    title="Email content"
                    sandbox="allow-same-origin allow-scripts allow-popups"
                  />
                ) : (
                  <div className="p-6 text-neutral-500 text-center">
                    No content available
                  </div>
                )}
              </div>
            </AdminContentCard>

            {/* Attachments Card */}
            {email.ListAttachments && email.ListAttachments.length > 0 && (
              <AdminContentCard className="p-5">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <XMarkIcon className="h-5 w-5 text-neutral-500" />
                    <h3 className="font-semibold text-neutral-900">
                      Attachments ({email.ListAttachments.length})
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {email.ListAttachments.map((attachment, index) => {
                      const filename = getFilename(attachment.Filename);
                      const isDownloadingThis = downloadingFile === filename;

                      return (
                        <div
                          key={index}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-xl border border-neutral-200",
                            "hover:bg-neutral-50 transition-colors"
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 flex-shrink-0">
                              <XMarkIcon className="h-5 w-5 text-neutral-500" />
                            </div>
                            <span className="text-sm text-neutral-700 truncate">
                              {filename}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDownload(attachment.URL, filename)
                            }
                            disabled={isDownloading}
                            className="h-9 w-9 p-0 rounded-lg flex-shrink-0"
                          >
                            {isDownloadingThis ? (
                              <ArrowPathIcon className="h-4 w-4 animate-spin text-neutral-600" />
                            ) : (
                              <XMarkIcon className="h-4 w-4 text-neutral-600" />
                            )}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </AdminContentCard>
            )}
          </div>
        ) : (
          <AdminContentCard className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Mail className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-500">Email not found</p>
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="mt-4"
              >
                Go Back
              </Button>
            </div>
          </AdminContentCard>
        )}
      </div>
    </AdminLayout>
  );
};

export default EmailDetailPage;




"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Attachment } from "@/lib/attachmentUtils";
import AttachmentList from "@/components/mail/AttachmentList";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

interface AdminEmailBodyCardProps {
  subject: string;
  body?: string;
  fallbackText?: string;
  attachments?: Attachment[];
  onDownloadAttachment?: (url: string, filename: string) => void;
  isDownloading?: boolean;
  className?: string;
}

const IFRAME_STYLES = `
  html, body {
    overflow-y: hidden;
    overflow-x: auto;
  }
  body {
    margin: 0;
    padding: 0;
    font-family: Roboto, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 14px;
    line-height: 1.6;
    color: #1F2937;
    background: white;
    overflow-wrap: anywhere;
    word-break: break-word;
  }
  div, p, span, a, td, th, li, blockquote {
    overflow-wrap: anywhere;
    word-break: break-word;
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
    overflow-wrap: anywhere;
    word-break: break-word;
  }
`;

const AdminEmailBodyCard: React.FC<AdminEmailBodyCardProps> = ({
  subject,
  body,
  fallbackText,
  attachments = [],
  onDownloadAttachment,
  isDownloading = false,
  className,
}) => {
  const [iframeHeight, setIframeHeight] = useState("auto");
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    setIframeLoaded(false);
    setIframeHeight("auto");
  }, [body]);

  const handleIframeLoad = (e: React.SyntheticEvent<HTMLIFrameElement>) => {
    const iframe = e.target as HTMLIFrameElement;
    if (!iframe.contentWindow) {
      setIframeLoaded(true);
      return;
    }

    const iframeDoc = iframe.contentWindow.document;

    const style = iframeDoc.createElement("style");
    style.textContent = IFRAME_STYLES;
    iframeDoc.head.appendChild(style);

    const links = iframeDoc.querySelectorAll("a");
    links.forEach((link) => {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    });

    const finalizeHeight = () => {
      requestAnimationFrame(() => {
        const height = iframeDoc.body.scrollHeight;
        setIframeHeight(`${height}px`);
        setIframeLoaded(true);
      });
    };

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

  const attachmentItems = attachments.map((att) => ({
    name: att.Filename,
    url: att.URL,
  }));

  return (
    <div className={cn(
      "px-4 pt-4 bg-white rounded-xl shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] outline outline-1 outline-offset-[-1px] outline-neutral-200 flex flex-col gap-[16px]",
      attachmentItems.length > 0 ? "pb-4" : "pb-0",
      className
    )}>
      {/* Subject */}
      <h2 className="text-neutral-800 text-lg font-medium font-['Roboto'] leading-7 shrink-0">
        {subject || "(No subject)"}
      </h2>

      {/* Divider */}
      <div className="h-px bg-neutral-200 shrink-0" />

      {/* Body */}
      <div className="relative">
        {!iframeLoaded && body && (
          <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-[1px] flex items-center justify-center rounded-lg">
            <ArrowPathIcon className="animate-spin h-6 w-6 text-neutral-400" />
          </div>
        )}
        {body ? (
          <iframe
            srcDoc={body}
            className="w-full"
            style={{
              height: iframeHeight,
              width: "100%",
              border: "none",
              display: "block",
              margin: 0,
              padding: 0,
            }}
            onLoad={handleIframeLoad}
            title="Email content"
            sandbox="allow-same-origin allow-scripts allow-popups"
            scrolling="no"
          />
        ) : (
          <p className="text-neutral-800 text-sm font-normal font-['Roboto'] leading-5 whitespace-pre-wrap break-words">
            {fallbackText || "No content"}
          </p>
        )}
      </div>

      {/* Attachments */}
      <div className="shrink-0">
        <AttachmentList
          attachments={attachmentItems}
          showCloseIcon
          wrapContainer={false}
          onDownload={onDownloadAttachment}
          isDownloading={isDownloading}
        />
      </div>
    </div>
  );
};

export default AdminEmailBodyCard;

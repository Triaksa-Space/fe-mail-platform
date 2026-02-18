"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Attachment } from "@/lib/attachmentUtils";
import AttachmentList from "./AttachmentList";

interface EmailBodyCardProps {
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
  pre {
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-wrap: anywhere;
    word-break: break-word;
  }
  a {
    color: #027AEA;
  }
`;

const EmailBodyCard: React.FC<EmailBodyCardProps> = ({
  subject,
  body,
  fallbackText,
  attachments = [],
  onDownloadAttachment,
  isDownloading = false,
  className,
}) => {
  const [iframeHeight, setIframeHeight] = useState("auto");

  const handleIframeLoad = (e: React.SyntheticEvent<HTMLIFrameElement>) => {
    const iframe = e.target as HTMLIFrameElement;
    if (iframe.contentWindow) {
      const iframeDoc = iframe.contentWindow.document;

      const style = iframeDoc.createElement("style");
      style.textContent = IFRAME_STYLES;
      iframeDoc.head.appendChild(style);

      const links = iframeDoc.querySelectorAll("a");
      links.forEach((link) => {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
      });

      const height = iframeDoc.body.scrollHeight;
      setIframeHeight(`${height}px`);
    }
  };

  // Convert Attachment[] to AttachmentList format
  const attachmentItems = attachments.map((att) => ({
    name: att.Filename,
    url: att.URL,
  }));

  return (
    <div className={cn(
      "p-4 bg-white rounded-xl shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] outline outline-1 outline-offset-[-1px] outline-neutral-200 flex flex-col gap-[16px] min-h-0 overflow-hidden",
      className
    )}>
      {/* Subject */}
      <h2 className="text-neutral-800 text-lg font-medium font-['Roboto'] leading-7 shrink-0">
        {subject || "(No subject)"}
      </h2>

      {/* Divider */}
      <div className="h-px bg-neutral-200 shrink-0" />

      {/* Body */}
      <div className="min-h-0 overflow-auto">
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
          <p className="text-neutral-900 text-sm font-normal font-['Roboto'] leading-5 whitespace-pre-wrap">
            {fallbackText || "No content"}
          </p>
        )}
      </div>

      {/* Attachments */}
      <div className="shrink-0">
        <AttachmentList
          attachments={attachmentItems}
          onDownload={onDownloadAttachment}
          isDownloading={isDownloading}
          showCloseIcon
          wrapContainer={false}
        />
      </div>
    </div>
  );
};

export default EmailBodyCard;

"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Attachment } from "@/lib/attachmentUtils";
import AttachmentList from "@/components/mail/AttachmentList";

interface AdminEmailBodyCardProps {
  subject: string;
  body?: string;
  fallbackText?: string;
  attachments?: Attachment[];
  className?: string;
}

const IFRAME_STYLES = `
  html, body {
    overflow-y: hidden;
    overflow-x: auto;
  }
  body {
    margin: 0;
    padding: 16px;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
  className,
}) => {
  const [iframeHeight, setIframeHeight] = useState("160px");

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

      const height = Math.max(iframeDoc.body.scrollHeight + 24, 140);
      setIframeHeight(`${height}px`);
    }
  };

  const attachmentItems = attachments.map((att) => ({
    name: att.Filename,
    url: att.URL,
  }));

  return (
    <div className={cn(
      "p-4 bg-white rounded-lg shadow-[0px_6px_15px_-2px_rgba(16,24,40,0.08)] border border-neutral-100 flex flex-col gap-4 min-h-0 overflow-hidden",
      className
    )}>
      {/* Subject */}
      <h2 className="text-neutral-800 text-lg font-medium font-['Roboto'] leading-7 shrink-0">
        {subject || "(No subject)"}
      </h2>

      {/* Divider */}
      <div className="h-px bg-neutral-200 shrink-0" />

      {/* Body */}
      <div className="min-h-0 overflow-x-auto overflow-y-hidden">
        {body ? (
          <iframe
            srcDoc={body}
            className="w-full"
            style={{
              height: iframeHeight,
              width: "100%",
              border: "none",
              display: "block",
            }}
            onLoad={handleIframeLoad}
            title="Email content"
            sandbox="allow-same-origin allow-scripts allow-popups"
            scrolling="no"
          />
        ) : (
          <p className="text-neutral-900 text-sm font-normal font-['Roboto'] leading-5 whitespace-pre-wrap break-words">
            {fallbackText || "No content"}
          </p>
        )}
      </div>

      {/* Attachments */}
      <div className="shrink-0">
        <AttachmentList attachments={attachmentItems} showCloseIcon />
      </div>
    </div>
  );
};

export default AdminEmailBodyCard;

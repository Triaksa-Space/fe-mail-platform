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
    overflow-x: auto !important;
    background: white;
  }
  img, table {
    max-width: 100%;
    height: auto;
  }
  table {
    width: 100% !important;
    table-layout: fixed;
  }
  pre {
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow: hidden !important;
  }
  table, tr, td, th, div, p, img {
    max-width: 100% !important;
    box-sizing: border-box;
    word-break: break-word;
  }
  * {
    box-sizing: border-box;
  }
  a {
    color: #027AEA;
  }
`;

const AdminEmailBodyCard: React.FC<AdminEmailBodyCardProps> = ({
  subject,
  body,
  fallbackText,
  attachments = [],
  className,
}) => {
  const [iframeHeight, setIframeHeight] = useState("400px");

  const handleIframeLoad = (e: React.SyntheticEvent<HTMLIFrameElement>) => {
    const iframe = e.target as HTMLIFrameElement;
    if (iframe.contentWindow) {
      const iframeDoc = iframe.contentWindow.document;

      const meta = iframeDoc.createElement("meta");
      meta.name = "viewport";
      meta.content = "width=device-width, initial-scale=1";
      iframeDoc.head.appendChild(meta);

      const style = iframeDoc.createElement("style");
      style.textContent = IFRAME_STYLES;
      iframeDoc.head.appendChild(style);

      const links = iframeDoc.querySelectorAll("a");
      links.forEach((link) => {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
      });

      const height = Math.max(iframeDoc.body.scrollHeight + 20, 100);
      setIframeHeight(`${height}px`);
    }
  };

  const attachmentItems = attachments.map((att) => ({
    name: att.Filename,
    url: att.URL,
  }));

  return (
    <div className={cn(
      "p-4 bg-white rounded-lg shadow-[0px_6px_15px_-2px_rgba(16,24,40,0.08)] border border-neutral-100 flex flex-col gap-4 overflow-hidden",
      className
    )}>
      {/* Subject */}
      <h2 className="text-neutral-800 text-lg font-medium font-['Roboto'] leading-7">
        {subject || "(No subject)"}
      </h2>

      {/* Divider */}
      <div className="h-px bg-neutral-200" />

      {/* Body */}
      <div className="flex-1 min-h-[200px] overflow-x-auto">
        {body ? (
          <iframe
            srcDoc={body}
            className="w-full"
            style={{
              height: iframeHeight,
              border: "none",
              display: "block",
            }}
            onLoad={handleIframeLoad}
            title="Email content"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation-by-user-activation"
          />
        ) : (
          <p className="text-neutral-900 text-sm font-normal font-['Roboto'] leading-5 whitespace-pre-wrap">
            {fallbackText || "No content"}
          </p>
        )}
      </div>

      {/* Attachments */}
      <AttachmentList attachments={attachmentItems} />
    </div>
  );
};

export default AdminEmailBodyCard;

"use client";

import React from "react";
import { DocumentTextIcon } from "@heroicons/react/24/solid";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { getFileExtension, extractFilenameFromUrl } from "@/lib/attachmentUtils";

interface AttachmentItem {
  name: string;
  url: string;
}

interface AttachmentListProps {
  attachments: AttachmentItem[];
  onRemove?: (index: number) => void;
  onDownload?: (url: string, filename: string) => void;
  isDownloading?: boolean;
}

const AttachmentList: React.FC<AttachmentListProps> = ({
  attachments,
  onRemove,
  onDownload,
  isDownloading = false,
}) => {
  if (attachments.length === 0) return null;

  return (
    <div className="mt-3 min-w-0 w-full">
      <div className="flex gap-2 overflow-x-auto">
        {attachments.map((file, index) => {
          const filename = extractFilenameFromUrl(file.url) || file.name;
          const fileExt = getFileExtension(filename);

          // Compose mode: show remove button
          if (onRemove) {
            return (
              <div
                key={index}
                className="w-32 flex-shrink-0 p-3 bg-white rounded-xl shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] outline outline-1 outline-offset-[-1px] outline-neutral-200 flex flex-col gap-3"
              >
                <div className="flex justify-between items-center">
                  <div className="flex justify-start items-center gap-0.5">
                    <DocumentTextIcon className="w-5 h-5 text-primary-500" />
                    <span className="text-neutral-800 text-xs font-normal font-['Roboto'] leading-5">
                      {fileExt}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemove(index)}
                    className="w-5 h-5 text-neutral-800 hover:text-red-600 hover:bg-transparent"
                    aria-label={`Remove ${filename}`}
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </Button>
                </div>
                <div className="w-full text-neutral-800 text-sm font-normal font-['Roboto'] leading-5 line-clamp-2 break-all overflow-hidden">
                  {filename}
                </div>
              </div>
            );
          }

          // Download mode: clickable button triggering download handler
          if (onDownload) {
            return (
              <button
                key={index}
                onClick={() => onDownload(file.url, filename)}
                disabled={isDownloading}
                className="w-32 flex-shrink-0 p-3 bg-white rounded-xl shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] outline outline-1 outline-offset-[-1px] outline-neutral-200 flex flex-col gap-3 hover:bg-neutral-50 transition-colors text-left disabled:opacity-50"
              >
                <div className="flex justify-start items-center gap-0.5">
                  <DocumentTextIcon className="w-5 h-5 text-primary-500" />
                  <span className="text-neutral-800 text-xs font-normal font-['Roboto'] leading-5">
                    {fileExt}
                  </span>
                </div>
                <div className="w-full text-neutral-800 text-sm font-normal font-['Roboto'] leading-5 line-clamp-2 break-all overflow-hidden">
                  {filename}
                </div>
              </button>
            );
          }

          // Default: link to open attachment
          return (
            <a
              key={index}
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-32 flex-shrink-0 p-3 bg-white rounded-xl shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] outline outline-1 outline-offset-[-1px] outline-neutral-200 flex flex-col gap-3 hover:bg-neutral-50 transition-colors"
            >
              <div className="flex justify-start items-center gap-0.5">
                <DocumentTextIcon className="w-5 h-5 text-primary-500" />
                <span className="text-neutral-800 text-xs font-normal font-['Roboto'] leading-5">
                  {fileExt}
                </span>
              </div>
              <div className="w-full text-neutral-800 text-sm font-normal font-['Roboto'] leading-5 line-clamp-2 break-all overflow-hidden">
                {filename}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default AttachmentList;

"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { X, Paperclip, Send, Loader2, Mail, FileText } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { apiClient } from "@/lib/api-client";
import DOMPurify from "dompurify";
import ConfirmDiscardModal from "./ConfirmDiscardModal";

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSent?: () => void;
  replyTo?: {
    email: string;
    subject: string;
  };
  sentCount?: number;
  maxDailySend?: number;
}

interface UploadedAttachment {
  name: string;
  url: string;
}

interface FormState {
  to: string;
  subject: string;
  message: string;
  attachmentUrls: string[];
}

const MAX_FILES = 10;
const MAX_FILE_SIZE_MB = 10;

// Helper to get file extension
const getFileExtension = (filename: string): string => {
  const ext = filename.split('.').pop()?.toUpperCase() || 'FILE';
  return ext.length > 4 ? ext.substring(0, 4) : ext;
};

const ComposeModal: React.FC<ComposeModalProps> = ({
  isOpen,
  onClose,
  onSent,
  replyTo,
  sentCount = 0,
  maxDailySend = 3,
}) => {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<UploadedAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  // Track initial form state for dirty detection
  const initialStateRef = useRef<FormState>({
    to: "",
    subject: "",
    message: "",
    attachmentUrls: [],
  });

  const { toast } = useToast();
  const email = useAuthStore((state) => state.email);
  const token = useAuthStore.getState().getStoredToken();

  const isLimitReached = sentCount >= maxDailySend;

  // Check if form is dirty (has unsaved changes)
  const isDirty = useCallback((): boolean => {
    const initial = initialStateRef.current;
    const currentAttachmentUrls = attachments.map((a) => a.url).sort();
    const initialAttachmentUrls = [...initial.attachmentUrls].sort();

    // Compare each field
    if (to !== initial.to) return true;
    if (subject !== initial.subject) return true;
    if (message !== initial.message) return true;

    // Compare attachments
    if (currentAttachmentUrls.length !== initialAttachmentUrls.length) return true;
    for (let i = 0; i < currentAttachmentUrls.length; i++) {
      if (currentAttachmentUrls[i] !== initialAttachmentUrls[i]) return true;
    }

    return false;
  }, [to, subject, message, attachments]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      const initialTo = replyTo?.email || "";
      const initialSubject = replyTo
        ? replyTo.subject.startsWith("Re:")
          ? replyTo.subject
          : `Re: ${replyTo.subject}`
        : "";

      setTo(initialTo);
      setSubject(initialSubject);
      setMessage("");
      setAttachments([]);
      setShowDiscardConfirm(false);

      // Capture initial state for dirty detection
      initialStateRef.current = {
        to: initialTo,
        subject: initialSubject,
        message: "",
        attachmentUrls: [],
      };
    }
  }, [isOpen, replyTo]);

  // Handle ESC key to request close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !showDiscardConfirm) {
        e.preventDefault();
        requestClose();
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, showDiscardConfirm]);

  // Clean up attachments from server
  const cleanupAttachments = useCallback(async () => {
    if (attachments.length > 0) {
      try {
        await apiClient.post("/email/delete-attachment", {
          url: attachments.map((att) => att.url),
        });
      } catch (error) {
        console.error("Failed to clean up attachments:", error);
      }
    }
  }, [attachments, token]);

  // Request close - checks for dirty state
  const requestClose = useCallback(() => {
    if (isDirty()) {
      setShowDiscardConfirm(true);
    } else {
      // Not dirty, close immediately (no need to cleanup as no attachments)
      onClose();
    }
  }, [isDirty, onClose]);

  // Handle discard confirmation
  const handleDiscard = useCallback(async () => {
    setShowDiscardConfirm(false);
    await cleanupAttachments();
    onClose();
  }, [cleanupAttachments, onClose]);

  // Handle cancel discard (return to compose)
  const handleCancelDiscard = useCallback(() => {
    setShowDiscardConfirm(false);
  }, []);

  const handleSend = async () => {
    if (!to || !subject || !message) {
      toast({
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);
    if (!isValidEmail(to)) {
      toast({
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    if (isLimitReached) {
      toast({
        description: "Daily send limit reached. Try again tomorrow.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    try {
      await apiClient.post("/email/send/resend", {
        to,
        subject,
        body: message,
        attachments: attachments.map((att) => att.url),
      });

      toast({
        description: "Email sent successfully!",
        variant: "default",
      });

      // After successful send, close without confirmation
      // Attachments are now sent, no need to clean up
      onSent?.();
      onClose();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        toast({
          description: "Daily send email limit reached. Try again tomorrow.",
          variant: "destructive",
        });
      } else {
        let errorMessage = "Failed to send email. Please try again.";
        if (axios.isAxiosError(error) && error.response?.data?.error) {
          errorMessage = error.response.data.error;
        }
        toast({
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);

    if (attachments.length + selectedFiles.length > MAX_FILES) {
      toast({
        description: "You can only send up to 10 files.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    for (const file of selectedFiles) {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        toast({
          description: `The file "${file.name}" exceeds 10 MB.`,
          variant: "destructive",
        });
        continue;
      }

      const formData = new FormData();
      formData.append("attachment", file);

      try {
        const response = await apiClient.post("/email/upload/attachment", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        setAttachments((prev) => [
          ...prev,
          { name: file.name, url: response.data.url },
        ]);
      } catch {
        toast({
          description: `Failed to upload "${file.name}".`,
          variant: "destructive",
        });
      }
    }

    setIsUploading(false);
    e.target.value = "";
  };

  const handleRemoveAttachment = async (index: number) => {
    const attachment = attachments[index];

    try {
      await apiClient.post("/email/delete-attachment", {
        url: [attachment.url],
      });

      setAttachments((prev) => prev.filter((_, i) => i !== index));
    } catch {
      toast({
        description: `Failed to remove "${attachment.name}".`,
        variant: "destructive",
      });
    }
  };

  const isFormValid = to && subject && message && !isLimitReached;
  const isDisabled = isSending || isUploading || !isFormValid;

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40"
          onClick={requestClose}
          aria-hidden="true"
        />

        {/* Modal Container */}
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="compose-title"
          className={cn(
            "relative w-full bg-[#F9FAFB] flex flex-col",
            // Mobile: full screen
            "h-full",
            // Desktop: centered modal with max dimensions
            "md:h-auto md:max-h-[90vh] md:max-w-2xl lg:max-w-3xl md:rounded-2xl md:shadow-xl"
          )}
        >
          {/* Header Action Row */}
          <div className="flex items-center justify-between px-4 py-3 bg-white md:rounded-t-2xl">
            {/* Left: Close Button */}
            <button
              type="button"
              onClick={requestClose}
              className={cn(
                "flex items-center justify-center h-10 w-10",
                "rounded-xl border border-gray-200 bg-white shadow-sm",
                "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                "transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200"
              )}
              aria-label="Close compose"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>

            {/* Right: Daily Send Badge, Attachment & Send Buttons */}
            <div className="flex items-center gap-3">
              {/* Daily Send Badge */}
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-600 font-normal">Daily send</span>
                <span
                  className={cn(
                    "inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium",
                    isLimitReached
                      ? "text-red-600 border border-red-200"
                      : "text-blue-600 border border-blue-600"
                  )}
                >
                  {sentCount} of {maxDailySend}
                </span>
              </div>

              {/* Attachment Button */}
              <input
                type="file"
                id="compose-attachments"
                multiple
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,.jpg,.jpeg,.png,.gif,.zip,.rar"
                disabled={isUploading}
              />
              <label
                htmlFor="compose-attachments"
                className={cn(
                  "flex items-center justify-center h-10 w-10",
                  "rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] border border-gray-200 bg-white",
                  "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  "transition-colors cursor-pointer",
                  "focus-within:ring-2 focus-within:ring-blue-200",
                  isUploading && "opacity-50 cursor-not-allowed"
                )}
                aria-label="Add attachment"
              >
                {isUploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Paperclip className="h-5 w-5" />
                )}
              </label>

              {/* Send Button */}
              <button
                type="button"
                onClick={handleSend}
                disabled={isDisabled}
                className={cn(
                  "flex items-center gap-1.5 h-10 px-4",
                  "rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] font-medium text-base",
                  "transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300",
                  isDisabled
                    ? "bg-blue-300 text-white cursor-not-allowed border border-blue-300"
                    : "bg-blue-600 hover:bg-blue-700 text-white border border-blue-600"
                )}
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="hidden sm:inline">Sending...</span>
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="h-5 w-5" />
                    <span>Send</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Form Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
            {/* Card A: From / To */}
            <div className="px-4 py-3 bg-white rounded-xl shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] outline outline-1 outline-offset-[-1px] outline-gray-200 space-y-3">
              {/* From Field */}
              <div className="relative pt-2">
                <label className="absolute -top-1 left-1 px-1 bg-white text-[10px] text-gray-500 font-medium z-10">
                  From
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={email || ""}
                    disabled
                    className={cn(
                      "w-full pl-10 pr-4 py-2 text-xs",
                      "rounded-lg border border-gray-200",
                      "bg-gray-50 text-gray-500",
                      "focus:outline-none"
                    )}
                    aria-label="From email address"
                  />
                </div>
              </div>

              {/* To Field */}
              <div className="relative pb-2">
                <label
                  htmlFor="compose-to"
                  className="absolute -top-2 left-1 px-1 bg-white text-[10px] text-gray-500 font-medium z-10"
                >
                  To
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="compose-to"
                    type="email"
                    placeholder="recipient@example.com"
                    value={to}
                    onChange={(e) =>
                      setTo(DOMPurify.sanitize(e.target.value).replace(/\s/g, ""))
                    }
                    className={cn(
                      "w-full pl-10 pr-4 py-2 text-xs",
                      "rounded-lg border border-gray-200 bg-white",
                      "placeholder:text-gray-400",
                      "focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400",
                      "transition-colors"
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Card B: Subject & Body */}
            <div className="px-4 py-3 bg-white rounded-xl shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex-1 flex flex-col min-h-[200px] md:min-h-[280px] space-y-3">
              {/* Subject Field */}
              <div className="relative pt-2">
                <label
                  htmlFor="compose-subject"
                  className="absolute -top-2 left-3 px-1 bg-white text-[10px] text-gray-500 font-medium z-10"
                >
                  
                </label>
                <input
                  id="compose-subject"
                  type="text"
                  placeholder="Enter subject"
                  value={subject}
                  onChange={(e) => setSubject(DOMPurify.sanitize(e.target.value))}
                  className={cn(
                    "w-full px-4 py-2 text-xs",
                    "rounded-lg border border-gray-200 bg-white",
                    "placeholder:text-gray-400",
                    "focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400",
                    "transition-colors"
                  )}
                />
              </div>

              {/* Body Field */}
              <div className="relative flex-1 flex flex-col pb-2">
                <label
                  htmlFor="compose-body"
                  className="absolute -top-2 left-3 px-1 bg-white text-[10px] text-gray-500 font-medium z-10"
                >
                  
                </label>
                <textarea
                  id="compose-body"
                  placeholder="Compose your email..."
                  value={message}
                  onChange={(e) => setMessage(DOMPurify.sanitize(e.target.value))}
                  className={cn(
                    "flex-1 w-full px-4 py-3 text-xs",
                    "rounded-lg border border-gray-200 bg-white",
                    "placeholder:text-gray-400",
                    "focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400",
                    "transition-colors resize-none",
                    "min-h-[120px] md:min-h-[180px]"
                  )}
                />
              </div>
            </div>

            {/* Attachments List */}
            {attachments.length > 0 && (
              <div className="self-stretch inline-flex justify-start items-start gap-2 flex-wrap">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="w-32 p-3 bg-white rounded-xl shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-start items-start gap-3"
                  >
                    {/* Header: File type + Close button */}
                    <div className="self-stretch inline-flex justify-between items-center">
                      <div className="flex justify-start items-center gap-0.5">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="text-gray-800 text-xs font-normal leading-5">
                          {getFileExtension(file.name)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(index)}
                        className="w-5 h-5 flex items-center justify-center text-gray-800 hover:text-red-600 transition-colors"
                        aria-label={`Remove ${file.name}`}
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                    {/* Filename */}
                    <div className="self-stretch text-gray-800 text-sm font-normal leading-5 truncate">
                      {file.name}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Limit Reached Warning */}
            {isLimitReached && (
              <div className="px-4 py-3 bg-red-50 rounded-xl shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] outline outline-1 outline-offset-[-1px] outline-red-200">
                <p className="text-sm text-red-600 font-medium">
                  You have reached your daily send limit. Please try again tomorrow.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Discard Modal */}
      <ConfirmDiscardModal
        isOpen={showDiscardConfirm}
        onCancel={handleCancelDiscard}
        onDiscard={handleDiscard}
      />
    </>
  );
};

export default ComposeModal;

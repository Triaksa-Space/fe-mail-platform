"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { Paperclip, Loader2, Mail } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { apiClient } from "@/lib/api-client";
import DOMPurify from "dompurify";
import ConfirmDiscardModal from "./ConfirmDiscardModal";
import { XMarkIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline"

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
          errorMessage = error.response.data.message;
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
            "relative w-full bg-gray-50 flex flex-col",
            // Mobile: full screen with py-4 and gap-4
            "h-full py-4 gap-4",
            // Desktop: centered modal with max dimensions
            "md:h-auto md:py-0 md:gap-0 md:max-h-[90vh] md:max-w-2xl lg:max-w-3xl md:rounded-2xl md:shadow-xl md:bg-[#F9FAFB]"
          )}
        >
          {/* Header Action Row */}
          <div className="flex items-center justify-between px-4 md:py-3 md:bg-white md:rounded-t-2xl">
            {/* Left: Close Button */}
            <button
              type="button"
              onClick={requestClose}
              className={cn(
                "flex items-center justify-center h-10 w-10",
                "rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] border border-gray-200 bg-white",
                "text-gray-800 hover:bg-gray-50",
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
                <span className="text-sm text-gray-600 font-normal font-['Roboto'] leading-5">Daily send</span>
                <span
                  className={cn(
                    "inline-flex items-center justify-center w-11 h-5 px-1.5 py-0.5 rounded-3xl text-xs font-medium font-['Roboto'] leading-5",
                    isLimitReached
                      ? "text-red-600 outline outline-1 outline-offset-[-1px] outline-red-200"
                      : "text-gray-400 outline outline-1 outline-offset-[-1px] outline-gray-200"
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
                  "text-gray-800 hover:bg-gray-50",
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
                  "flex items-center gap-1.5 h-10 px-4 font-medium text-base font-['Roboto'] leading-4",
                  "btn-primary-skin",
                  "transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
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
          <div className="flex-1 overflow-y-auto px-4 flex flex-col justify-start items-start gap-4 md:p-4 md:bg-white">
            {/* Card A: From / To */}
            <div className="self-stretch p-3 bg-white rounded-xl shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-start gap-3">
              {/* From Field */}
              <div className="self-stretch flex flex-col justify-start items-start gap-2">
                <div className="self-stretch relative flex flex-col justify-start items-start">
                  <div className="self-stretch h-3.5"></div>
                  <div className="self-stretch h-10 px-3 py-2 bg-gray-100 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-start items-center gap-3 overflow-hidden">
                    <div className="flex-1 flex justify-start items-center gap-2">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div className="flex justify-start items-center gap-0.5">
                        <span className="text-gray-400 text-sm font-normal font-['Roboto'] leading-4">{email || ""}</span>
                      </div>
                    </div>
                  </div>
                  <div className="px-1 left-[8px] top-0 absolute bg-white inline-flex justify-center items-center gap-2.5">
                    <span className="text-gray-400 text-[10px] font-normal font-['Roboto'] leading-4">From</span>
                  </div>
                </div>
              </div>

              {/* To Field */}
              <div className="self-stretch flex flex-col justify-start items-start gap-2">
                <div className="self-stretch relative flex flex-col justify-start items-start">
                  <div className="self-stretch h-3.5"></div>
                  <div className="self-stretch h-10 px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-start items-center gap-3">
                    <div className="flex-1 flex justify-start items-center gap-2">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <input
                        id="compose-to"
                        type="email"
                        placeholder="recipient@example.com"
                        value={to}
                        onChange={(e) =>
                          setTo(DOMPurify.sanitize(e.target.value).replace(/\s/g, ""))
                        }
                        className="flex-1 bg-transparent border-none outline-none text-gray-800 text-sm font-normal font-['Roboto'] leading-4 placeholder:text-neutral-200"
                      />
                    </div>
                  </div>
                  <div className="px-1 left-[8px] top-0 absolute bg-white inline-flex justify-center items-center gap-2.5">
                    <span className="text-gray-800 text-[10px] font-normal font-['Roboto'] leading-4">To</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card B: Subject & Body */}
            <div className="self-stretch flex-1 p-3 bg-white rounded-xl shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-start gap-3">
              {/* Subject Field */}
              <div className="self-stretch flex flex-col justify-start items-start gap-2">
                <div className="self-stretch h-10 px-3 py-2 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-start items-center gap-3 overflow-hidden">
                  <div className="flex-1 flex justify-start items-center gap-2">
                    <input
                      id="compose-subject"
                      type="text"
                      placeholder="Enter subject"
                      value={subject}
                      onChange={(e) => setSubject(DOMPurify.sanitize(e.target.value))}
                      className="flex-1 bg-transparent border-none outline-none text-gray-800 text-sm font-normal font-['Roboto'] leading-4 placeholder:text-neutral-200"
                    />
                  </div>
                </div>
              </div>

              {/* Body Field */}
              <div className="self-stretch flex-1 flex flex-col justify-start items-start gap-2">
                <div className="self-stretch flex-1 flex flex-col justify-start items-start gap-1">
                  <div className="self-stretch flex-1 px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-start items-start gap-3">
                    <div className="flex-1 flex justify-start items-start gap-2">
                      <textarea
                        id="compose-body"
                        placeholder="Compose your email..."
                        value={message}
                        onChange={(e) => setMessage(DOMPurify.sanitize(e.target.value))}
                        className="flex-1 bg-transparent border-none outline-none text-gray-900 text-sm font-normal font-['Roboto'] leading-5 placeholder:text-neutral-200 resize-none min-h-[200px] md:min-h-[280px]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Attachments List */}
            {attachments.length > 0 && (
              <div className="self-stretch overflow-x-auto">
                <div className="inline-flex justify-start items-start gap-2">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="w-32 h-[88px] p-3 bg-white rounded-xl shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-start items-start gap-3 flex-shrink-0"
                    >
                      {/* Header: File type + Close button */}
                      <div className="self-stretch inline-flex justify-between items-center">
                        <div className="flex justify-start items-center gap-0.5">
                          <XMarkIcon className="w-5 h-5 text-primary-500" />
                          <span className="text-gray-800 text-xs font-normal font-['Roboto'] leading-5">
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
                      {/* Filename - truncated to 2 lines */}
                      <div className="self-stretch text-gray-800 text-sm font-normal font-['Roboto'] leading-5 line-clamp-2">
                        {file.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Limit Reached Warning */}
            {isLimitReached && (
              <div className="self-stretch px-4 py-3 bg-red-50 rounded-xl shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] outline outline-1 outline-offset-[-1px] outline-red-200">
                <p className="text-sm text-red-600 font-medium font-['Roboto']">
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




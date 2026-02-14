"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2, Mail } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { apiClient } from "@/lib/api-client";
import DOMPurify from "dompurify";
import ConfirmDiscardModal from "./ConfirmDiscardModal";
import { XMarkIcon, PaperAirplaneIcon, PaperClipIcon } from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button";
import AttachmentList from "./AttachmentList";
import { Toaster } from "@/components/ui/toaster";

export interface ForwardData {
  from: string;
  to: string;
  date: string;
  subject: string;
  body: string;
  attachments: { name: string; url: string }[];
}

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSent?: () => void;
  replyTo?: {
    email: string;
    subject: string;
  };
  forwardData?: ForwardData;
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

const ComposeModal: React.FC<ComposeModalProps> = ({
  isOpen,
  onClose,
  onSent,
  replyTo,
  forwardData,
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
  const [hasShownLimitToast, setHasShownLimitToast] = useState(false);

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
      let initialTo = "";
      let initialSubject = "";
      let initialMessage = "";
      let initialAttachments: UploadedAttachment[] = [];

      if (forwardData) {
        // Forward mode
        initialSubject = forwardData.subject.startsWith("Fwd:")
          ? forwardData.subject
          : `Fwd: ${forwardData.subject}`;

        initialMessage = [
          "",
          "",
          "---------- Forwarded message ---------",
          `From: ${forwardData.from}`,
          `Date: ${forwardData.date}`,
          `Subject: ${forwardData.subject}`,
          `To: ${forwardData.to}`,
          "",
          forwardData.body,
        ].join("\n");

        initialAttachments = forwardData.attachments;
      } else if (replyTo) {
        // Reply mode
        initialTo = replyTo.email;
        initialSubject = replyTo.subject.startsWith("Re:")
          ? replyTo.subject
          : `Re: ${replyTo.subject}`;
      }

      setTo(initialTo);
      setSubject(initialSubject);
      setMessage(initialMessage);
      setAttachments(initialAttachments);
      setShowDiscardConfirm(false);
      setHasShownLimitToast(false);

      // Capture initial state for dirty detection
      initialStateRef.current = {
        to: initialTo,
        subject: initialSubject,
        message: initialMessage,
        attachmentUrls: initialAttachments.map((a) => a.url),
      };
    }
  }, [isOpen, replyTo, forwardData]);

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

  useEffect(() => {
    if (isOpen && isLimitReached && !hasShownLimitToast) {
      toast({
        description: "Daily send limit reached. Try again tomorrow.",
        variant: "destructive",
      });
      setHasShownLimitToast(true);
    }
  }, [hasShownLimitToast, isLimitReached, isOpen, toast]);

  // Clean up only newly uploaded attachments (not forwarded ones)
  const cleanupAttachments = useCallback(async () => {
    const forwardedUrls = new Set(initialStateRef.current.attachmentUrls);
    const newAttachments = attachments.filter((att) => !forwardedUrls.has(att.url));
    if (newAttachments.length > 0) {
      try {
        await apiClient.post("/email/delete-attachment", {
          url: newAttachments.map((att) => att.url),
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
            "relative w-full bg-neutral-50 flex flex-col overflow-hidden",
            // Mobile: full screen with py-4 and gap-4
            "h-full py-4 gap-4",
            // Desktop: centered modal with max dimensions
            "md:h-auto md:py-0 md:gap-0 md:max-h-[90vh] md:max-w-sm lg:max-w-3xl md:rounded-sm md:shadow-xl md:bg-[#F9FAFB]"
          )}
        >
          {/* Header Action Row */}
          <div className="flex items-center justify-between px-4 md:py-3 md:bg-white md:rounded-t-sm">
            {/* Left: Close Button */}
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={requestClose}
              className={cn(
                "h-10 w-10",
                "rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] border-neutral-200 bg-white",
                "text-neutral-800 hover:bg-neutral-50",
                "focus:outline-none focus:ring-2 focus:ring-blue-200"
              )}
              aria-label="Close compose"
            >
              <XMarkIcon className="h-5 w-5" />
            </Button>

            {/* Right: Daily Send Badge, Attachment & Send Buttons */}
            <div className="flex items-center gap-3">
              {/* Daily Send Badge */}
              <div className="flex items-center gap-1">
                <span className="text-sm text-neutral-600 font-normal font-['Roboto'] leading-5">Daily send</span>
                <span
                  className={cn(
                    "inline-flex items-center justify-center w-11 h-5 px-1.5 py-0.5 rounded-3xl text-xs font-medium font-['Roboto'] leading-5 outline outline-1 outline-offset-[-1px]",
                    isLimitReached
                      ? "text-red-600 outline-red-200"
                      : "text-primary-500 outline-primary-500"
                  )}
                >
                  {sentCount + 1 > maxDailySend ? maxDailySend : sentCount + 1} of {maxDailySend}
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
                  "rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] border border-neutral-200 bg-white",
                  "text-neutral-800 hover:bg-neutral-50",
                  "transition-colors cursor-pointer",
                  "focus-within:ring-2 focus-within:ring-blue-200",
                  isUploading && "opacity-50 cursor-not-allowed"
                )}
                aria-label="Add attachment"
              >
                {isUploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <PaperClipIcon className="h-5 w-5 text-neutral-800" />
                )}
              </label>

              {/* Send Button */}
              <Button
                type="button"
                onClick={handleSend}
                disabled={isDisabled}
                className={cn(
                  "gap-1.5 h-10 px-4 font-medium text-base font-['Roboto'] leading-4",
                  "btn-primary-skin",
                  "focus:outline-none focus:ring-2 focus:ring-blue-300"
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
              </Button>
            </div>
          </div>

          {/* Form Content - Scrollable */}
          <div className="flex-1 overflow-y-auto px-4 flex flex-col justify-start items-start gap-4 md:p-4 md:bg-white">
            {/* Card A: From / To */}
            <div className="self-stretch p-3 bg-white rounded-xl shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] outline outline-1 outline-offset-[-1px] outline-neutral-200 flex flex-col justify-start items-start gap-3">
              {/* From Field */}
              <div className="self-stretch flex flex-col justify-start items-start gap-2">
                <div className="self-stretch relative flex flex-col justify-start items-start">
                  <div className="self-stretch h-3.5"></div>
                  <div className="self-stretch h-10 px-3 py-2 bg-neutral-100 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-200 inline-flex justify-start items-center gap-3 overflow-hidden">
                    <div className="flex-1 flex justify-start items-center gap-2">
                      <Mail className="w-5 h-5 text-neutral-400" />
                      <div className="flex justify-start items-center gap-0.5">
                        <span className="text-neutral-400 text-sm font-normal font-['Roboto'] leading-4">{email || ""}</span>
                      </div>
                    </div>
                  </div>
                  <div className="px-1 left-[8px] top-0 absolute bg-white inline-flex justify-center items-center gap-2.5">
                    <span className="text-neutral-400 text-[10px] font-normal font-['Roboto'] leading-4">From</span>
                  </div>
                </div>
              </div>

              {/* To Field */}
              <div className="self-stretch flex flex-col justify-start items-start gap-2">
                <div className="self-stretch relative flex flex-col justify-start items-start">
                  <div className="self-stretch h-3.5"></div>
                  <div className="self-stretch h-10 px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-neutral-200 inline-flex justify-start items-center gap-3">
                    <div className="flex-1 flex justify-start items-center gap-2">
                      <Mail className="w-5 h-5 text-neutral-400" />
                      <input
                        id="compose-to"
                        type="email"
                        placeholder="recipient@example.com"
                        value={to}
                        onChange={(e) =>
                          setTo(DOMPurify.sanitize(e.target.value).replace(/\s/g, ""))
                        }
                        className="flex-1 bg-transparent border-none outline-none text-neutral-800 text-sm font-normal font-['Roboto'] leading-4 placeholder:text-neutral-200"
                      />
                    </div>
                  </div>
                  <div className="px-1 left-[8px] top-0 absolute bg-white inline-flex justify-center items-center gap-2.5">
                    <span className="text-neutral-800 text-[10px] font-normal font-['Roboto'] leading-4">To</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card B: Subject & Body */}
            <div className="self-stretch flex-1 min-w-0 p-3 bg-white rounded-xl shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] outline outline-1 outline-offset-[-1px] outline-neutral-200 flex flex-col justify-start items-start gap-3 overflow-hidden">
              {/* Subject Field */}
              <div className="self-stretch flex flex-col justify-start items-start gap-2">
                <div className="self-stretch h-10 px-3 py-2 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-200 inline-flex justify-start items-center gap-3 overflow-hidden">
                  <div className="flex-1 flex justify-start items-center gap-2">
                    <input
                      id="compose-subject"
                      type="text"
                      placeholder="Enter subject"
                      value={subject}
                      onChange={(e) => setSubject(DOMPurify.sanitize(e.target.value))}
                      className="flex-1 bg-transparent border-none outline-none text-neutral-800 text-sm font-normal font-['Roboto'] leading-4 placeholder:text-neutral-200"
                    />
                  </div>
                </div>
              </div>

              {/* Body Field */}
              <div className="self-stretch flex-1 flex flex-col min-h-0">
                <div className="self-stretch flex-1 px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-neutral-200 flex flex-col">
                  <textarea
                    id="compose-body"
                    placeholder="Compose your email..."
                    value={message}
                    onChange={(e) => setMessage(DOMPurify.sanitize(e.target.value))}
                    className="flex-1 w-full bg-transparent border-none outline-none text-neutral-900 text-sm font-normal font-['Roboto'] leading-5 placeholder:text-neutral-200 resize-none min-h-[200px]"
                  />
                </div>
              </div>

              {/* Attachments inside body card */}
              <AttachmentList
                attachments={attachments.map((file) => ({ name: file.name, url: file.url }))}
                onRemove={handleRemoveAttachment}
              />
            </div>

          </div>
        </div>
      </div>
      <Toaster />

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




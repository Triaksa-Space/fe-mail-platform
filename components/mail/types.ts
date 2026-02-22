// Mail types for the Gmail-style UI
import { Email } from "@/types/email";
import { formatRelativeTime } from "@/lib/utils";

export interface MailAttachment {
  Filename: string;
  URL: string;
}

export interface Mail {
  id: string;
  email_encode_id: string;
  user_encode_id: string;
  from: string;
  fromEmail?: string;
  to?: string;
  subject: string;
  snippet: string;
  body: string;
  date: string;
  unread: boolean;
  attachments?: MailAttachment[] | string; // MailAttachment[] for inbox, JSON string for sent
}

// Sent email type
export interface SentMail {
  id: string;
  user_id: string;
  from: string;
  to: string;
  subject: string;
  snippet: string;
  body?: string;
  date: string;
  status?: string;
  has_attachments?: boolean;
  attachments?: string; // JSON string array of URLs
}

// API response for sent email list item
export interface ApiSentEmail {
  id: string;
  from_email: string;
  to_email?: string;
  to?: string; // API may return 'to' instead of 'to_email'
  subject: string;
  body?: string;
  body_preview?: string;
  status?: string;
  sent_at: string;
  created_at?: string;
  has_attachments?: boolean;
}

// API response for sent email detail
export interface ApiSentEmailDetail {
  id: string;
  from: string;
  to: string;
  subject: string;
  body?: string;
  body_preview?: string;
  status?: string;
  sent_at: string;
  has_attachments?: boolean;
  attachments?: string | string[]; // Can be JSON string or array
}

function cleanPreviewText(text?: string): string {
  return (text || "")
    .replace(/\\r\\n|\\n|\\r/g, " ")
    .replace(/\r\n|\n|\r/g, " ")
    .replace(/\s+/g, " ")
    .replace(/(?:\.{3,}|\u2026+)\s*$/, "")
    .trim();
}

// Transform API sent email to SentMail type
export function transformSentEmail(email: ApiSentEmail): SentMail {
  return {
    id: email.id,
    user_id: "",
    from: email.from_email,
    to: email.to_email || email.to || "",
    subject: email.subject,
    snippet: cleanPreviewText(email.body || email.body_preview),
    date: formatRelativeTime(email.sent_at),
    status: email.status,
    has_attachments: email.has_attachments,
  };
}

export interface EmailDetail {
  encode_id: string;
  ID: number;
  SenderEmail: string;
  SenderName: string;
  Subject: string;
  Body: string;
  BodyEml: string;
  RelativeTime: string;
  ListAttachments: MailAttachment[];
}

// Transform API response to Mail type
export function transformEmailToMail(email: Email): Mail {
  // Handle attachments - API returns a single Attachment object with FileUrl
  const attachments: MailAttachment[] = [];
  if (email.ListAttachments && email.ListAttachments.Filename) {
    attachments.push({
      Filename: email.ListAttachments.Filename,
      URL: email.ListAttachments.FileUrl,
    });
  }

  return {
    id: String(email.ID),
    email_encode_id: email.email_encode_id,
    user_encode_id: email.user_encode_id,
    from: email.SenderName,
    fromEmail: email.SenderEmail,
    subject: email.Subject,
    snippet: email.Preview,
    body: email.Body,
    date: email.RelativeTime,
    unread: !email.IsRead,
    attachments,
  };
}

export type ViewType = "inbox" | "sent" | "settings" | "compose";

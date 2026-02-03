// Mail types for the Gmail-style UI
import { Email } from "@/types/email";

export interface MailAttachment {
  Filename: string;
  URL: string;
}

export interface Mail {
  id: string;
  email_encode_id: string;
  user_encode_id: string;
  from: string;
  fromEmail: string;
  subject: string;
  snippet: string;
  body: string;
  date: string;
  unread: boolean;
  attachments?: MailAttachment[];
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
}

// API response for sent email list item
export interface ApiSentEmail {
  id: string;
  from_email: string;
  to_email?: string;
  to?: string; // API may return 'to' instead of 'to_email'
  subject: string;
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
  attachments?: string[];
}

// Transform API sent email to SentMail type
export function transformSentEmail(email: ApiSentEmail): SentMail {
  const sentDate = new Date(email.sent_at);
  const now = new Date();
  const diffMs = now.getTime() - sentDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  let relativeTime: string;
  if (diffMins < 1) {
    relativeTime = "Just now";
  } else if (diffMins < 60) {
    relativeTime = `${diffMins}m ago`;
  } else if (diffHours < 24) {
    relativeTime = `${diffHours}h ago`;
  } else if (diffDays < 7) {
    relativeTime = `${diffDays}d ago`;
  } else {
    relativeTime = sentDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  return {
    id: email.id,
    user_id: "",
    from: email.from_email,
    to: email.to_email || email.to || "",
    subject: email.subject,
    snippet: email.body_preview || "",
    date: relativeTime,
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

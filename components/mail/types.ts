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

export interface Attachment {
  Name: string;
  Url: string;
}

export interface Email {
  ID: number;
  UserID: number,
  SenderEmail: string;
  SenderName: string;
  Subject: string;
  Preview: string;
  RelativeTime: string;
  Body: string; // May contain HTML content
  Recipient: string;
  Timestamp: string;
  Attachments?: Attachment[];
}
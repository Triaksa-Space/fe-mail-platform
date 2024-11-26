export interface Attachment {
  name: string;
  url: string;
}

export interface Email {
  id: number;
  sender: string;
  recipient: string;
  timestamp: string;
  subject: string;
  preview: string;
  body: string; // May contain HTML content
  attachments?: Attachment[];
}
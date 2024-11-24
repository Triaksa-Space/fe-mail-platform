export type Email = {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  timestamp: string;
  body?: string; // Optional body property
};
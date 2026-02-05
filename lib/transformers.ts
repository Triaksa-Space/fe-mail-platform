import { formatRelativeTime } from './utils';

/**
 * Email transformation utilities for converting API responses to display formats
 */

// Common email item interface for display
export interface EmailItem {
  id: string;
  name: string;
  email: string;
  subject: string;
  snippet: string;
  date: string;
  isUnread?: boolean;
  hasAttachments?: boolean;
}

// API Inbox Email interface (snake_case from backend)
export interface ApiInboxEmail {
  id: string;
  user_id?: string;
  user_email?: string;
  from: string;
  from_name?: string;
  subject: string;
  preview?: string;
  body?: string;
  body_preview?: string;
  is_read?: boolean;
  has_attachments?: boolean;
  received_at: string;
  created_at?: string;
}

// API Sent Email interface (snake_case from backend)
export interface ApiSentEmail {
  id: string;
  user_id?: string;
  user_email?: string;
  from?: string;
  from_email?: string;
  from_name?: string;
  to?: string;
  to_email?: string;
  subject: string;
  preview?: string;
  body?: string;
  body_preview?: string;
  status?: string;
  provider?: string;
  has_attachments?: boolean;
  attachments?: string;
  sent_at: string;
  created_at?: string;
}

/**
 * Transform API inbox email to display format
 */
export function transformInboxEmail(email: ApiInboxEmail): EmailItem {
  return {
    id: email.id,
    name: email.from_name || email.from?.split('@')[0] || 'Unknown Sender',
    email: email.from || '',
    subject: email.subject || '(No subject)',
    snippet: email.preview || email.body_preview || '',
    date: formatRelativeTime(email.received_at),
    isUnread: email.is_read === false,
    hasAttachments: email.has_attachments,
  };
}

/**
 * Transform API sent email to display format
 */
export function transformSentEmail(email: ApiSentEmail): EmailItem {
  const recipientEmail = email.to || email.to_email || '';
  return {
    id: email.id,
    name: recipientEmail.split('@')[0] || 'Unknown Recipient',
    email: recipientEmail,
    subject: email.subject || '(No subject)',
    snippet: email.preview || email.body_preview || '',
    date: formatRelativeTime(email.sent_at),
    isUnread: false, // Sent emails are never "unread"
    hasAttachments: email.has_attachments,
  };
}

/**
 * Transform API inbox email for admin overview (includes user info)
 */
export function transformInboxEmailForAdmin(email: ApiInboxEmail): EmailItem & { userEmail?: string } {
  return {
    ...transformInboxEmail(email),
    userEmail: email.user_email,
  };
}

/**
 * Transform API sent email for admin overview (includes user info)
 */
export function transformSentEmailForAdmin(email: ApiSentEmail): EmailItem & { userEmail?: string; senderEmail?: string } {
  return {
    ...transformSentEmail(email),
    userEmail: email.user_email,
    senderEmail: email.from || email.from_email,
  };
}

/**
 * Extract sender name from email or name field
 */
export function extractSenderName(from?: string, fromName?: string): string {
  if (fromName) return fromName;
  if (from) return from.split('@')[0];
  return 'Unknown';
}

/**
 * Extract recipient name from email field
 */
export function extractRecipientName(to?: string): string {
  if (to) return to.split('@')[0];
  return 'Unknown';
}

/**
 * Normalize pagination response from API
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  totalPages: number;
  page: number;
  pageSize: number;
}

export function normalizePaginatedResponse<T, R = T>(
  data: { data?: T[]; pagination?: { total?: number; total_pages?: number; page?: number; page_size?: number } } | T[] | null | undefined,
  pageSize: number,
  transformFn?: (item: T) => R
): PaginatedResponse<R> {
  // Handle paginated response with data array and pagination object
  if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
    const items = transformFn ? data.data.map(transformFn) : (data.data as unknown as R[]);
    return {
      items,
      total: data.pagination?.total ?? items.length,
      totalPages: data.pagination?.total_pages ?? Math.ceil((data.pagination?.total ?? items.length) / pageSize),
      page: data.pagination?.page ?? 1,
      pageSize: data.pagination?.page_size ?? pageSize,
    };
  }

  // Handle simple array response
  if (Array.isArray(data)) {
    const items = transformFn ? data.map(transformFn) : (data as unknown as R[]);
    return {
      items,
      total: items.length,
      totalPages: Math.ceil(items.length / pageSize),
      page: 1,
      pageSize,
    };
  }

  // Default empty response
  return {
    items: [],
    total: 0,
    totalPages: 0,
    page: 1,
    pageSize,
  };
}

// ===================
// Auth Types
// ===================

export interface LoginRequest {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: {
    id: string;
    email: string;
    role_id: number;
    permissions?: string[];
  };
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

// ===================
// Forgot Password Types
// ===================

export interface CheckBindingRequest {
  email: string;
}

export interface CheckBindingResponse {
  has_binding: boolean;
  binding_email?: string;
}

export interface ForgotPasswordRequest {
  email: string;
  binding_email?: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface VerifyCodeRequest {
  email: string;
  code: string;
}

export interface VerifyCodeResponse {
  message: string;
  reset_token: string;
}

export interface VerifyCodeErrorResponse {
  error: string;
  attempts_remaining?: number;
  blocked_until?: string;
}

export interface ResetPasswordRequest {
  reset_token: string;
  new_password: string;
}

export interface ResetPasswordResponse {
  message: string;
}

// ===================
// User Types
// ===================

export interface User {
  ID: number;
  UserEncodeID: string;
  Email: string;
  RoleID: number;
  BindingEmail?: string;
  LastLogin: string;
  CreatedAt: string;
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  page_size: number;
}

// ===================
// Email Types
// ===================

export interface Email {
  id: number;
  email_encode_id: string;
  from: string;
  to: string;
  subject: string;
  body_preview: string;
  received_at: string;
  is_read: boolean;
  has_attachments: boolean;
}

export interface SentEmail {
  id: number;
  email_encode_id: string;
  user_id: number;
  to: string;
  subject: string;
  body_preview: string;
  sent_at: string;
  status: "sent" | "failed" | "pending";
  provider_message_id?: string;
}

export interface EmailListResponse {
  emails: Email[];
  total: number;
  page: number;
  page_size: number;
  unread_count?: number;
}

export interface SentEmailListResponse {
  emails: SentEmail[];
  total: number;
  page: number;
  page_size: number;
}

// ===================
// Admin Overview Types
// ===================

export interface DomainUserCount {
  domain: string;
  count: number;
}

export interface AdminOverviewResponse {
  total_users: number;
  users_by_domain: DomainUserCount[];
  total_inbox: number;
  total_sent: number;
  latest_inbox: Email[];
  latest_sent: SentEmail[];
}

// ===================
// Content Types (Terms/Privacy)
// ===================

export interface ContentResponse {
  content: string;
  effective_date: string;
  updated_at: string;
}

export interface UpdateContentRequest {
  content: string;
  effective_date: string;
}

// ===================
// Bulk Create Types
// ===================

export interface BulkCreateV2Request {
  base_name: string;
  domain: string;
  quantity: number;
  password_length: number;
  send_to?: string;
}

export interface CreatedUser {
  email: string;
  password: string;
}

export interface BulkCreateV2Response {
  message: string;
  created_users: CreatedUser[];
  total_created: number;
}

// ===================
// Pagination & Filter Types
// ===================

export interface PaginationParams {
  page?: number;
  page_size?: number;
  sort_fields?: string;
}

export interface AdminEmailFilterParams extends PaginationParams {
  search?: string;
  date_from?: string;
  date_to?: string;
}

// ===================
// Generic API Response
// ===================

export interface ApiError {
  error: string;
  message?: string;
}

// ===================
// Admin Management Types
// ===================

// API Response Types (matches backend contract)
export interface AdminApiResponse {
  id: string;
  username: string;
  password?: string;
  last_active_at: string | null;
  is_online: boolean;
  permissions: PermissionKey[];
  created_at: string;
}

export interface AdminListApiResponse {
  data: AdminApiResponse[];
  meta: {
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
  };
}

// Frontend Admin User type
export interface AdminUser {
  id: string;
  username: string;
  password?: string;
  last_active_at: string | null;
  is_online: boolean;
  permissions: PermissionKey[];
  created_at: string;
}

export interface CreateAdminRequest {
  username: string;
  password: string;
  permissions: PermissionKey[];
}

export interface UpdateAdminRequest {
  username?: string;
  password?: string;
  permissions: PermissionKey[];
}

// Permission keys as defined in API contract
export type PermissionKey =
  | 'overview'
  | 'user_list'
  | 'create_single'
  | 'create_bulk'
  | 'all_inbox'
  | 'all_sent'
  | 'terms_of_services'
  | 'privacy_policy'
  | 'roles_permissions';

// Available permissions that can be assigned to admins
export const AVAILABLE_PERMISSIONS: { id: PermissionKey; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'user_list', label: 'User list' },
  { id: 'create_single', label: 'Create single' },
  { id: 'create_bulk', label: 'Create bulk' },
  { id: 'all_inbox', label: 'All inbox' },
  { id: 'all_sent', label: 'All sent' },
  { id: 'terms_of_services', label: 'Terms of services' },
  { id: 'privacy_policy', label: 'Privacy policy' },
  { id: 'roles_permissions', label: 'Roles & permissions' },
];

// Helper to get permission label by id
export const getPermissionLabel = (id: string): string => {
  const permission = AVAILABLE_PERMISSIONS.find(p => p.id === id);
  return permission?.label || id;
};

// Helper to format last active time
export const formatLastActive = (
  lastActiveAt: string | null,
  isOnline?: boolean
): { text: string; variant: 'online' | 'recent' | 'away' } => {
  if (isOnline) {
    return { text: 'Online', variant: 'online' };
  }

  if (!lastActiveAt) {
    return { text: '—', variant: 'away' };
  }

  const lastActiveDate = new Date(lastActiveAt);
  const now = new Date();
  const diffMs = now.getTime() - lastActiveDate.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 5) {
    return { text: 'Online', variant: 'online' };
  } else if (diffMinutes < 60) {
    return { text: `${diffMinutes} minutes ago`, variant: 'recent' };
  } else if (diffHours < 24) {
    return { text: `${diffHours} hours ago`, variant: 'recent' };
  } else if (diffDays === 1) {
    return { text: 'Yesterday', variant: 'away' };
  } else {
    return { text: `${diffDays} days ago`, variant: 'away' };
  }
};

// Helper to format date as "DD MMM YYYY" (e.g., "10 Sep 2025")
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// API Query params interface
export interface GetAdminsParams {
  page?: number;
  limit?: number;
  q?: string;
  sort_by?: 'username' | 'last_active_at' | 'created_at';
  sort_dir?: 'asc' | 'desc';
}

// Client function to fetch admins
export const getAdminsQueryString = (params: GetAdminsParams): string => {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.q) searchParams.set('q', params.q);
  if (params.sort_by) searchParams.set('sort_by', params.sort_by);
  if (params.sort_dir) searchParams.set('sort_dir', params.sort_dir);

  return searchParams.toString();
};

# Mailria Frontend Documentation

**"Where Simplicity Meets Speed"**

A Next.js email platform frontend that integrates with AWS for receiving emails and Resend for sending emails.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [Environment Configuration](#environment-configuration)
6. [Architecture](#architecture)
7. [Authentication & Authorization](#authentication--authorization)
8. [User Roles](#user-roles)
9. [Business Flow](#business-flow)
10. [Pages & Routes](#pages--routes)
11. [Components](#components)
12. [State Management](#state-management)
13. [API Integration](#api-integration)
14. [Theming](#theming)
15. [Security Features](#security-features)

---

## Project Overview

Mailria is an email platform that provides:
- **Email receiving** via AWS (SES/S3)
- **Email sending** via Resend third-party service
- **User management** for admins
- **Multi-domain support** for email accounts

The frontend is built with Next.js 15 using the App Router architecture.

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.3.8 | React framework with App Router |
| React | 19.0.0-rc | UI library |
| TypeScript | ^5 | Type safety |
| Tailwind CSS | ^3.4.1 | Styling |
| Zustand | ^5.0.1 | State management |
| Axios | ^1.7.8 | HTTP client |
| Radix UI | Various | Headless UI components |
| Lucide React | ^0.460.0 | Icons |
| DOMPurify | ^3.2.3 | XSS protection |

---

## Project Structure

```
fe-mail-platform/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Login page (/)
│   ├── not-found.tsx             # 404 page
│   ├── theme.ts                  # Theme configuration
│   ├── globals.css               # Global styles
│   ├── fonts/                    # Custom fonts (Geist)
│   ├── api/
│   │   └── webhook/
│   │       └── route.ts          # Webhook endpoint for email bounces
│   ├── inbox/                    # User inbox pages
│   │   ├── page.tsx              # Email list
│   │   ├── [id]/page.tsx         # Email detail view
│   │   ├── send/page.tsx         # Compose email
│   │   └── setting/page.tsx      # User settings
│   ├── admin/                    # Admin pages
│   │   ├── page.tsx              # User dashboard (list all users)
│   │   ├── create-single-email/  # Create single email account
│   │   ├── create-bulk-email/    # Create bulk email accounts
│   │   ├── manage-email/         # Manage emails (Coming Soon)
│   │   ├── settings/             # Admin settings
│   │   │   ├── page.tsx          # Admin management
│   │   │   └── account/page.tsx  # Account settings
│   │   └── user/
│   │       ├── [id]/page.tsx     # View user's inbox
│   │       └── detail/[id]/page.tsx  # View specific email
│   └── secure-page/              # Secure page placeholder
├── components/                   # Reusable components
│   ├── ui/                       # Shadcn/UI components
│   ├── hoc/                      # Higher-order components
│   └── [Various components]      # Feature components
├── hooks/                        # Custom React hooks
│   └── use-toast.ts              # Toast notifications
├── stores/                       # Zustand stores
│   └── useAuthStore.ts           # Authentication state
├── types/                        # TypeScript types
│   └── email.ts                  # Email-related types
├── utils/                        # Utility functions
│   └── fileToBase64.ts           # File conversion utility
├── lib/                          # Shared libraries
│   └── utils.ts                  # Tailwind utilities (cn)
└── public/                       # Static assets
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running (default: http://localhost:8000)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd fe-mail-platform

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Environment Configuration

Create a `.env` file in the root directory:

```env
# Backend API URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# Webhook secret for email bounce notifications (optional)
WEBHOOK_SECRET=your_webhook_secret_here
```

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL | Yes |
| `WEBHOOK_SECRET` | Secret for webhook verification | No |

---

## Architecture

### Application Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐     │
│  │  Login   │   │  Inbox   │   │  Admin   │   │ Settings │     │
│  │  Page    │   │  Pages   │   │  Pages   │   │  Pages   │     │
│  └────┬─────┘   └────┬─────┘   └────┬─────┘   └────┬─────┘     │
│       │              │              │              │            │
│       └──────────────┴──────────────┴──────────────┘            │
│                           │                                      │
│                    ┌──────┴──────┐                               │
│                    │   Zustand   │                               │
│                    │   (Auth)    │                               │
│                    └──────┬──────┘                               │
│                           │                                      │
│                    ┌──────┴──────┐                               │
│                    │    Axios    │                               │
│                    │   (HTTP)    │                               │
│                    └──────┬──────┘                               │
└───────────────────────────┼─────────────────────────────────────┘
                            │
                            ▼
┌───────────────────────────────────────────────────────────────┐
│                      BACKEND API                               │
├───────────────────────────────────────────────────────────────┤
│  Authentication │ User Management │ Email Operations │ Domain  │
└────────┬────────────────┬──────────────────┬─────────────────┘
         │                │                  │
         ▼                ▼                  ▼
┌─────────────┐   ┌─────────────┐   ┌─────────────────────────┐
│   Database  │   │     AWS     │   │        Resend           │
│             │   │  (Receive)  │   │        (Send)           │
└─────────────┘   └─────────────┘   └─────────────────────────┘
```

### Component Architecture

```
App Layout
├── Login Page (/)
│   └── Redirects based on role after login
│
├── User Flow (roleId: 1)
│   └── /inbox
│       ├── /inbox (Email List)
│       ├── /inbox/[id] (Email Detail)
│       ├── /inbox/send (Compose Email)
│       └── /inbox/setting (Change Password + Logout)
│
└── Admin Flow (roleId: 0 or 2)
    └── /admin
        ├── /admin (User Dashboard)
        ├── /admin/create-single-email
        ├── /admin/create-bulk-email
        ├── /admin/user/[id] (View User Inbox)
        ├── /admin/user/detail/[id] (View User Email)
        └── /admin/settings (Admin Management)
```

---

## Authentication & Authorization

### Authentication Flow

1. **Login**: User enters email/password on `/` (landing page)
2. **Token Storage**: JWT token stored in localStorage via Zustand persist
3. **Token Validation**: On page load, token is validated via `/user/get_user_me`
4. **Role-based Redirect**:
   - Super Admin (roleId: 0) → `/admin`
   - Regular User (roleId: 1) → `/inbox`
   - Admin (roleId: 2) → `/admin`

### Auth Store (Zustand)

```typescript
// stores/useAuthStore.ts
interface AuthState {
  token: string | null;      // JWT token
  email: string | null;      // User's email
  roleId: number | null;     // User's role (0, 1, or 2)
  setToken: (token: string | null) => void;
  setEmail: (email: string | null) => void;
  setRoleId: (roleId: number | null) => void;
  logout: () => void;
  getStoredToken: () => string | null;
  getStoredEmail: () => string | null;
  getStoredRoleID: () => number | null;
}
```

### Protected Routes

Each page implements its own auth check:

```typescript
useEffect(() => {
  const storedToken = useAuthStore.getState().getStoredToken();
  if (!storedToken) {
    router.replace("/");  // Redirect to login
    return;
  }

  if (roleId === 1) {  // Check role permissions
    router.replace("/not-found");
  }
}, [authLoaded, storedToken, roleId, router]);
```

---

## User Roles

| Role ID | Role Name | Access |
|---------|-----------|--------|
| 0 | Super Admin | Full admin access, can create/manage admins |
| 1 | Regular User | Inbox access only |
| 2 | Admin | Admin access, limited compared to Super Admin |

### Permissions Matrix

| Feature | Super Admin (0) | Admin (2) | User (1) |
|---------|-----------------|-----------|----------|
| View Inbox | Via admin panel | Via admin panel | Yes |
| Send Email | No | No | Yes (3/day limit) |
| Create Users | Yes | Yes | No |
| Create Bulk Users | Yes | Yes | No |
| Delete Users | Yes | No | No |
| Create Admins | Yes | No | No |
| Delete Admins | Yes | No | No |
| Change User Password | Yes | Yes | Own only |
| Change Admin Password | Yes | No | No |

---

## Business Flow

### 1. Email Receiving Flow (AWS)

```
External Sender → AWS SES → S3 Storage → Backend API → Frontend Display
                                              ↓
                                         Webhook API
                                    (/api/webhook/route.ts)
                                              ↓
                                      Bounce Handling
```

### 2. Email Sending Flow (Resend)

```
User Composes Email → Frontend Validation → Backend API → Resend API → Recipient
       ↓                    ↓                    ↓
  Attachment Upload    Rate Limiting       Email Delivery
  (S3 via Backend)    (3 emails/day)
```

### 3. User Management Flow

```
Admin Creates User → Backend generates account → User receives credentials
        ↓                                              ↓
   Single/Bulk                                    Login to inbox
   Creation
```

### 4. Attachment Flow

```
Select File → Upload to S3 (via backend) → Get URL → Attach to email → Send
                                             ↓
                                    Can remove before send
                                    (deletes from S3)
```

---

## Pages & Routes

### Public Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `app/page.tsx` | Login page |
| `/not-found` | `app/not-found.tsx` | 404 error page |

### User Routes (roleId: 1)

| Route | Component | Description |
|-------|-----------|-------------|
| `/inbox` | `app/inbox/page.tsx` | Email list with auto-refresh |
| `/inbox/[id]` | `app/inbox/[id]/page.tsx` | Email detail view |
| `/inbox/send` | `app/inbox/send/page.tsx` | Compose new email |
| `/inbox/send?emailId=[id]` | `app/inbox/send/page.tsx` | Reply to email |
| `/inbox/setting` | `app/inbox/setting/page.tsx` | User settings |

### Admin Routes (roleId: 0, 2)

| Route | Component | Description |
|-------|-----------|-------------|
| `/admin` | `app/admin/page.tsx` | User management dashboard |
| `/admin/create-single-email` | `app/admin/create-single-email/page.tsx` | Create single user |
| `/admin/create-bulk-email` | `app/admin/create-bulk-email/page.tsx` | Create bulk users |
| `/admin/manage-email` | `app/admin/manage-email/page.tsx` | Coming Soon |
| `/admin/settings` | `app/admin/settings/page.tsx` | Admin management |
| `/admin/settings/account` | `app/admin/settings/account/page.tsx` | Account settings |
| `/admin/user/[id]` | `app/admin/user/[id]/page.tsx` | View user's inbox |
| `/admin/user/detail/[id]` | `app/admin/user/detail/[id]/page.tsx` | View user's email detail |

### API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/webhook` | POST | Handles email bounce notifications |
| `/api/webhook` | OPTIONS | CORS preflight |

---

## Components

### UI Components (Shadcn/UI)

Located in `components/ui/`:

| Component | Description |
|-----------|-------------|
| `button.tsx` | Button with variants |
| `input.tsx` | Text input field |
| `textarea.tsx` | Multi-line text input |
| `dialog.tsx` | Modal dialog |
| `dropdown-menu.tsx` | Dropdown menu |
| `select.tsx` | Select dropdown |
| `table.tsx` | Data table |
| `toast.tsx` / `toaster.tsx` | Toast notifications |
| `card.tsx` | Card container |
| `label.tsx` | Form label |
| `scroll-area.tsx` | Scrollable container |
| `separator.tsx` | Visual separator |
| `pagination.tsx` | Pagination controls |

### Feature Components

| Component | Description |
|-----------|-------------|
| `FooterNav.tsx` | User navigation (Inbox, Send, Settings) |
| `FooterAdminNav.tsx` | Admin navigation (Dashboard, Create, Settings) |
| `Settings.tsx` | Password change form |
| `Send.tsx` | Email composition component |
| `DomainSelector.tsx` | Domain dropdown for email creation |
| `PasswordInput.tsx` | Password field with show/hide toggle |
| `PaginationComponent.tsx` | Table pagination |
| `Loading.tsx` | Full-page loading spinner |
| `ProcessLoading.tsx` | Processing overlay |
| `DownloadLoading.tsx` | Download progress overlay |
| `UploadLoading .tsx` | Upload progress overlay |
| `ButtonConfirm.tsx` | Confirmation button |
| `DropdownMenuComponent.tsx` | Action dropdown menu |

### Higher-Order Components

| Component | Description |
|-----------|-------------|
| `hoc/withAuth.tsx` | Authentication wrapper (validates token) |

---

## State Management

### Zustand Store

The application uses Zustand with persist middleware for state management.

**Auth Store** (`stores/useAuthStore.ts`):

```typescript
// Usage examples:

// Get state
const token = useAuthStore((state) => state.token);
const email = useAuthStore((state) => state.email);
const roleId = useAuthStore((state) => state.roleId);

// Set state
const { setToken, setEmail, setRoleId } = useAuthStore();
setToken("jwt-token");

// Logout
const logout = useAuthStore((state) => state.logout);
logout();

// Get stored values (for SSR safety)
const storedToken = useAuthStore.getState().getStoredToken();
```

**Storage**: Data persisted to `localStorage` with key `auth-storage`.

---

## API Integration

### Backend Endpoints Used

#### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/login` | POST | User login |
| `/user/get_user_me` | GET | Get current user info |

#### User Management
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/user/` | GET | List users (paginated) |
| `/user/` | POST | Create single user |
| `/user/bulk` | POST | Create bulk users |
| `/user/{id}` | GET | Get user details |
| `/user/{id}` | DELETE | Delete user |
| `/user/change_password` | PUT | Change user password |
| `/user/admin` | GET | List admin users |
| `/user/admin` | POST | Create admin |
| `/user/admin/{id}` | DELETE | Delete admin |
| `/user/change_password/admin` | PUT | Change admin password |

#### Email Operations
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/email/by_user` | GET | Get user's emails |
| `/email/by_user/{id}` | GET | Get specific user's emails (admin) |
| `/email/by_user/detail/{id}` | GET | Get email detail |
| `/email/by_user/download/file` | POST | Download attachment |
| `/email/send/resend` | POST | Send email via Resend |
| `/email/upload/attachment` | POST | Upload attachment to S3 |
| `/email/delete-attachment` | POST | Delete attachment from S3 |
| `/email/sent/by_user` | GET | Get sent email count |
| `/email/bounce` | POST | Handle email bounce |

#### Domain
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/domain/dropdown` | GET | Get available domains |

### Request Pattern

```typescript
// Standard authenticated request
const response = await axios.get(
  `${process.env.NEXT_PUBLIC_API_BASE_URL}/endpoint`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

// With request body
const response = await axios.post(
  `${process.env.NEXT_PUBLIC_API_BASE_URL}/endpoint`,
  { data: "value" },
  {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  }
);
```

---

## Theming

### Theme Configuration

Located in `app/theme.ts`:

```typescript
export const theme = {
  colors: {
    primary: '#ffeeac',           // Yellow/gold accent
    primaryHover: '#f7d65d',      // Darker yellow
    secondary: '#f0f0f0',         // Light gray
    textPrimary: '#333',          // Dark text
    textSecondary: '#666',        // Gray text
    error: '#e3342f',             // Red
    background: '#ffffff',        // White
    border: '#e2e8f0',            // Light border
    inputBackground: '#f7fafc',   // Input bg
    inputBorder: '#cbd5e0',       // Input border
  },
  shadows: {
    card: '0 4px 6px rgba(0, 0, 0, 0.1)',
    input: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  borders: {
    radius: '8px',
  },
};
```

### Brand Colors

- **Primary**: Yellow/Gold (`#ffeeac`) - Used for buttons, active states
- **Hover**: Darker yellow (`#F5E193`, `#f7d65d`)
- **Background**: White (`#ffffff`)
- **Text**: Dark gray (`#333`)

---

## Security Features

### XSS Protection

All user inputs are sanitized using DOMPurify:

```typescript
import DOMPurify from 'dompurify';

// In input handlers
onChange={(e) => {
  const value = e.target.value;
  const sanitizedValue = DOMPurify.sanitize(value).replace(/\s/g, '');
  setValue(sanitizedValue);
}}
```

### Email Body Rendering

Email content is rendered in a sandboxed iframe:

```typescript
<iframe
  srcDoc={email.Body}
  sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation-by-user-activation"
/>
```

### Rate Limiting

- Users limited to **3 emails per day**
- Displayed in inbox header: "Daily Send 0/3"

### Input Validation

- Email validation with regex
- Password minimum 6 characters
- Username alphanumeric only (no special characters)
- Space removal from sensitive fields

### Authentication

- JWT token-based authentication
- Token validation on protected routes
- Automatic logout on invalid token

---

## Auto-Refresh Behavior

### Inbox Page

- **Auto-refresh interval**: 60 seconds
- **Idle timeout**: 5 minutes (stops refresh when user is idle)
- **Visibility check**: Pauses refresh when tab is not visible
- **Manual refresh**: Available via refresh button

### Admin User View

- **Auto-refresh interval**: 10 seconds
- **Manual refresh**: Available via refresh button

---

## File Upload Constraints

| Constraint | Value |
|------------|-------|
| Max files per email | 10 |
| Max file size | 10 MB |
| Allowed file types | pdf, doc, docx, xls, xlsx, ppt, pptx, txt, rtf, odt, ods, odp, jpg, jpeg, png, gif, bmp, tiff, mp3, wav, aac, ogg, mp4, mov, avi, mkv, zip, rar, 7z, tar, gz, webp |

---

## Development Notes

### Adding New Pages

1. Create page in `app/` directory following Next.js App Router conventions
2. Add authentication check using `useAuthStore`
3. Add role-based access control
4. Update navigation components if needed

### Adding New API Endpoints

1. Use axios with proper headers
2. Include error handling with toast notifications
3. Sanitize user inputs with DOMPurify

### Component Patterns

- Use `"use client"` directive for client components
- Wrap with `Suspense` for loading states
- Include `authLoaded` state for hydration safety

---

## Troubleshooting

### Common Issues

1. **Blank page after login**: Check if `NEXT_PUBLIC_API_BASE_URL` is set correctly
2. **Token validation fails**: Ensure backend is running and accessible
3. **Emails not loading**: Check network tab for API errors
4. **Attachments fail to upload**: Verify file size and type constraints

### Debug Tips

- Check browser console for errors
- Verify localStorage has `auth-storage` key
- Check network requests in DevTools
- Ensure backend CORS is configured properly

---

## Contact & Support

For issues or questions, contact: support@mailria.com

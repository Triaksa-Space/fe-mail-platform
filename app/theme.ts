// theme.ts - Mailria Design System
// This file provides a centralized theme configuration for the application

export const theme = {
  colors: {
    // Primary Colors (Blue) - New Design System
    blue: {
      50: '#E6F2FF',
      100: '#CDE5FF',
      200: '#9BCCFF',
      300: '#69B2FF',
      400: '#3697FF',
      500: '#027AEA',
      600: '#026AD1',
      700: '#025BAF',
      800: '#01498D',
      900: '#01366A',
    },
    // Yellow Colors - Legacy Brand Colors
    yellow: {
      50: '#FFFEF0',
      100: '#FFF9DB',
      200: '#FFEEAC',
      300: '#F5E193',
      400: '#F7D65D',
      500: '#FFEEAC',
      600: '#EAB308',
    },
    // Neutral Colors
    neutral: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
    // Semantic Colors - Legacy string values for backward compatibility
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    // Semantic Color Scales (for new components)
    errorScale: {
      50: '#FEF2F2',
      500: '#EF4444',
      600: '#DC2626',
    },
    successScale: {
      50: '#ECFDF5',
      500: '#10B981',
      600: '#059669',
    },
    warningScale: {
      50: '#FFFBEB',
      500: '#F59E0B',
      600: '#D97706',
    },
    // Legacy colors (for backward compatibility with existing pages)
    // TODO: Migrate these to use the new color system
    primary: '#ffeeac',       // Yellow - used in inbox/admin headers
    primaryHover: '#F5E193',  // Yellow hover
    secondary: '#F3F4F6',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    background: '#F9FAFB',
    border: '#E5E7EB',
    inputBackground: '#FFFFFF',
    inputBorder: '#D1D5DB',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    card: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    input: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  },
  borders: {
    // Legacy - single radius value for backward compatibility
    radius: '8px',
    // New radius scale
    radiusScale: {
      sm: '4px',
      md: '8px',
      lg: '12px',
      xl: '16px',
      full: '9999px',
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
  },
  typography: {
    fontFamily: {
      sans: 'Roboto, system-ui, -apple-system, sans-serif',
      mono: 'Geist Mono, monospace',
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
    },
  },
};

// Layout configurations
export const layouts = {
  mobile: {
    maxWidth: '390px',
    minHeight: '844px',
    padding: '16px',
  },
  desktop: {
    maxWidth: '1440px',
    minHeight: '1024px',
    paddingX: '180px',
    paddingY: '32px',
  },
};

// Tailwind class utilities
export const tw = {
  // Background classes
  bg: {
    page: 'bg-[#F9FAFB]',
    card: 'bg-white',
    primary: 'bg-blue-600',
    primaryHover: 'hover:bg-blue-700',
    muted: 'bg-gray-100',
  },
  // Text classes
  text: {
    primary: 'text-gray-900',
    secondary: 'text-gray-500',
    muted: 'text-gray-400',
    link: 'text-blue-600 hover:text-blue-700',
    white: 'text-white',
  },
  // Border classes
  border: {
    default: 'border-gray-200',
    focus: 'focus:border-blue-500 focus:ring-2 focus:ring-blue-100',
  },
  // Button classes
  button: {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    ghost: 'hover:bg-gray-100 text-gray-700',
  },
  // Input classes
  input: {
    base: 'h-10 text-sm border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 placeholder:text-gray-400',
  },
};

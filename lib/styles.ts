/**
 * Shared Tailwind CSS class constants for consistent styling across the app
 */

// Card styles
export const CARD_STYLES = {
  base: "bg-white rounded-xl shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] outline outline-1 outline-offset-[-1px] outline-neutral-200",
  interactive: "bg-white rounded-xl shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] outline outline-1 outline-offset-[-1px] outline-neutral-200 hover:bg-blue-100 transition-colors",
  selected: "bg-blue-100 rounded-xl shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] outline outline-1 outline-offset-[-1px] outline-neutral-200",
} as const;

// Button styles
export const BUTTON_STYLES = {
  primary:
    "h-10 px-4 py-2.5 rounded-lg border border-[var(--primary-500-main)] bg-[var(--primary-500-main)] text-white text-base font-medium font-['Roboto'] leading-4 shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] transition-colors hover:border-[var(--primary-600-main)] hover:bg-[var(--primary-600-main)] disabled:bg-[var(--primary-300-main)] disabled:border-[var(--primary-400-main)] disabled:text-white disabled:opacity-100 disabled:cursor-not-allowed",
  secondary: "h-10 px-4 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-neutral-200 hover:bg-neutral-50 text-neutral-700 text-base font-medium font-['Roboto'] leading-4",
  danger: "h-10 px-4 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-red-600 text-white text-base font-medium font-['Roboto'] leading-4",
  icon: "w-10 h-10 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-neutral-200 flex justify-center items-center hover:bg-neutral-50 transition-colors",
  iconSmall: "w-8 h-8 bg-white rounded-md shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-neutral-200 flex justify-center items-center hover:bg-neutral-50 transition-colors",
} as const;

// Input styles
export const INPUT_STYLES = {
  base: "h-10 px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-neutral-200 text-neutral-800 text-sm font-normal font-['Roboto'] leading-4 placeholder:text-neutral-200",
  withIcon: "h-10 pl-10 pr-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-neutral-200 text-neutral-800 text-sm font-normal font-['Roboto'] leading-4 placeholder:text-neutral-200",
  disabled: "h-10 px-3 py-2 bg-neutral-50 rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-neutral-200 text-neutral-500 text-sm font-normal font-['Roboto'] leading-4 cursor-not-allowed",
} as const;

// Text styles
export const TEXT_STYLES = {
  label: "text-neutral-800 text-xs font-normal font-['Roboto'] leading-5",
  value: "text-neutral-600 text-xs font-normal font-['Roboto'] leading-5",
  heading: "text-neutral-800 text-lg font-medium font-['Roboto'] leading-7",
  subheading: "text-neutral-800 text-base font-semibold font-['Roboto'] leading-6",
  body: "text-neutral-600 text-sm font-normal font-['Roboto'] leading-5",
  caption: "text-neutral-500 text-xs font-normal font-['Roboto'] leading-4",
} as const;

// Badge/Chip styles
export const BADGE_STYLES = {
  default: "px-2 py-0.5 rounded-full text-xs font-medium",
  success: "bg-green-100 text-green-700",
  warning: "bg-yellow-100 text-yellow-700",
  error: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-primary-700",
  neutral: "bg-neutral-100 text-neutral-700",
} as const;

// Table styles
export const TABLE_STYLES = {
  header: "bg-neutral-50 text-neutral-600 text-xs font-semibold font-['Roboto'] uppercase tracking-wider",
  headerCell: "px-4 py-3 text-left",
  row: "bg-white hover:bg-neutral-50 transition-colors border-b border-neutral-100",
  cell: "px-4 py-3 text-sm text-neutral-600 font-['Roboto']",
} as const;

// Shadow styles
export const SHADOW_STYLES = {
  card: "shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)]",
  button: "shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)]",
  dropdown: "shadow-[0px_4px_12px_0px_rgba(16,24,40,0.12)]",
} as const;

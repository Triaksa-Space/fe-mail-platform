/**
 * Shared Tailwind CSS class constants for consistent styling across the app
 */

// Card styles
export const CARD_STYLES = {
  base: "bg-white rounded-xl shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] outline outline-1 outline-offset-[-1px] outline-gray-200",
  interactive: "bg-white rounded-xl shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] outline outline-1 outline-offset-[-1px] outline-gray-200 hover:bg-sky-100 transition-colors",
  selected: "bg-sky-100 rounded-xl shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] outline outline-1 outline-offset-[-1px] outline-gray-200",
} as const;

// Button styles
export const BUTTON_STYLES = {
  primary: "h-10 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-sky-600 text-white text-base font-medium font-['Roboto'] leading-4",
  secondary: "h-10 px-4 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 hover:bg-gray-50 text-gray-700 text-base font-medium font-['Roboto'] leading-4",
  danger: "h-10 px-4 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-red-600 text-white text-base font-medium font-['Roboto'] leading-4",
  icon: "w-10 h-10 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex justify-center items-center hover:bg-gray-50 transition-colors",
  iconSmall: "w-8 h-8 bg-white rounded-md shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex justify-center items-center hover:bg-gray-50 transition-colors",
} as const;

// Input styles
export const INPUT_STYLES = {
  base: "h-10 px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 text-gray-800 text-sm font-normal font-['Roboto'] leading-4 placeholder:text-gray-400",
  withIcon: "h-10 pl-10 pr-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 text-gray-800 text-sm font-normal font-['Roboto'] leading-4 placeholder:text-gray-400",
  disabled: "h-10 px-3 py-2 bg-gray-50 rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 text-gray-500 text-sm font-normal font-['Roboto'] leading-4 cursor-not-allowed",
} as const;

// Text styles
export const TEXT_STYLES = {
  label: "text-gray-800 text-xs font-normal font-['Roboto'] leading-5",
  value: "text-gray-600 text-xs font-normal font-['Roboto'] leading-5",
  heading: "text-gray-800 text-lg font-medium font-['Roboto'] leading-7",
  subheading: "text-gray-800 text-base font-semibold font-['Roboto'] leading-6",
  body: "text-gray-600 text-sm font-normal font-['Roboto'] leading-5",
  caption: "text-gray-500 text-xs font-normal font-['Roboto'] leading-4",
} as const;

// Badge/Chip styles
export const BADGE_STYLES = {
  default: "px-2 py-0.5 rounded-full text-xs font-medium",
  success: "bg-green-100 text-green-700",
  warning: "bg-yellow-100 text-yellow-700",
  error: "bg-red-100 text-red-700",
  info: "bg-sky-100 text-sky-700",
  neutral: "bg-gray-100 text-gray-700",
} as const;

// Table styles
export const TABLE_STYLES = {
  header: "bg-gray-50 text-gray-600 text-xs font-semibold font-['Roboto'] uppercase tracking-wider",
  headerCell: "px-4 py-3 text-left",
  row: "bg-white hover:bg-gray-50 transition-colors border-b border-gray-100",
  cell: "px-4 py-3 text-sm text-gray-600 font-['Roboto']",
} as const;

// Shadow styles
export const SHADOW_STYLES = {
  card: "shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)]",
  button: "shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)]",
  dropdown: "shadow-[0px_4px_12px_0px_rgba(16,24,40,0.12)]",
} as const;

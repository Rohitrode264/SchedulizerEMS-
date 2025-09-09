// Modern Theme for Consistency - Based on University Portal Design (Lighter Version)
export const theme = {
  // Primary Colors - Slightly lighter black-based theme
  primary: {
    main: 'bg-gray-800',
    hover: 'hover:bg-gray-700',
    text: 'text-gray-800',
    border: 'border-gray-800',
    ring: 'ring-gray-800',
    light: 'bg-gray-700',
    dark: 'bg-gray-900',
  },
  
  // Secondary Colors - Modern accent colors
  secondary: {
    main: 'bg-indigo-500',
    hover: 'hover:bg-indigo-600',
    text: 'text-indigo-500',
    border: 'border-indigo-500',
    ring: 'ring-indigo-500',
    light: 'bg-indigo-50',
    dark: 'bg-indigo-600',
  },
  
  // Success Colors
  success: {
    main: 'bg-green-500',
    hover: 'hover:bg-green-600',
    text: 'text-green-500',
    border: 'border-green-500',
    light: 'bg-green-50',
    dark: 'bg-green-600',
  },
  
  // Surface Colors - Cards and backgrounds
  surface: {
    main: 'bg-white',
    secondary: 'bg-gray-50',
    tertiary: 'bg-gray-100',
    card: 'bg-white rounded-2xl shadow-lg border border-gray-200',
    cardHover: 'bg-white rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl',
  },
  
  // Text Colors
  text: {
    primary: 'text-gray-900',
    secondary: 'text-gray-600',
    tertiary: 'text-gray-500',
    muted: 'text-gray-400',
    white: 'text-white',
  },
  
  // Border Colors
  border: {
    light: 'border-gray-200',
    medium: 'border-gray-300',
    dark: 'border-gray-400',
    primary: 'border-gray-800',
  },
  
  // Shadow Classes
  shadow: {
    sm: 'shadow-sm',
    md: 'shadow-lg',
    lg: 'shadow-xl',
    xl: 'shadow-2xl',
  },
  
  // Rounded Classes
  rounded: {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    full: 'rounded-full',
  },
  
  // Spacing Classes
  spacing: {
    xs: 'p-2',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-12',
  },
  
  // Transition Classes
  transition: {
    all: 'transition-all duration-200',
    transform: 'transform transition-all duration-200',
    hover: 'hover:scale-[1.01] transition-all duration-200',
  },
  
  // Button Styles
  button: {
    primary: 'bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg',
    secondary: 'bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg',
    success: 'bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg',
    outline: 'border-2 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white px-6 py-3 rounded-xl font-medium transition-all duration-200',
  },
  
  // Card Styles
  card: {
    default: 'bg-white rounded-2xl shadow-lg border border-gray-200 p-6',
    hover: 'bg-white rounded-2xl shadow-xl border border-gray-200 p-6 hover:shadow-2xl transition-all duration-200',
    elevated: 'bg-white rounded-2xl shadow-2xl border border-gray-200 p-8',
  },
  
  // Input Styles
  input: {
    default: 'w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-all duration-200',
    error: 'w-full px-4 py-3 border border-red-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200',
  },
  
  // Badge Styles
  badge: {
    default: 'bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-xs font-medium',
    primary: 'bg-gray-800 text-white px-3 py-1.5 rounded-full text-xs font-medium',
    secondary: 'bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-medium',
  }
};
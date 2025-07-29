// Layout and Typography Constants for App Consistency

export const LAYOUT = {
  // Container widths
  maxWidth: "max-w-7xl",
  contentMaxWidth: "max-w-4xl", // For content-heavy pages
  narrowMaxWidth: "max-w-2xl", // For forms and focused content
  
  // Spacing
  containerPadding: "px-6",
  sectionSpacing: "py-8",
  contentSpacing: "py-12",
  
  // Page structure
  pageMinHeight: "min-h-screen",
  pageBackground: "bg-white",
  pageLayout: "flex flex-col",
} as const;

export const TYPOGRAPHY = {
  // Page titles
  pageTitle: "text-3xl font-semibold text-gray-900",
  sectionTitle: "text-xl font-semibold text-gray-900",
  subsectionTitle: "text-lg font-semibold text-gray-900",
  cardTitle: "text-lg font-semibold text-gray-900",
  
  // Content text
  pageDescription: "text-sm text-gray-600 leading-relaxed",
  bodyText: "text-sm text-gray-700",
  helperText: "text-sm text-gray-500",
  
  // Spacing
  titleMargin: "mb-4",
  sectionMargin: "mb-8",
  contentMargin: "mb-6",
} as const;

export const COLORS = {
  // Primary colors
  primary: "bg-blue-500 hover:bg-blue-600",
  primaryText: "text-blue-600",
  
  // Semantic colors
  success: "bg-green-500 hover:bg-green-600",
  successText: "text-green-600",
  warning: "bg-yellow-500 hover:bg-yellow-600",
  warningText: "text-yellow-600",
  danger: "bg-red-600 hover:bg-red-700",
  dangerText: "text-red-600",
  
  // Neutral colors
  secondary: "bg-gray-100 hover:bg-gray-200",
  secondaryText: "text-gray-600",
  muted: "text-gray-500",
  
  // Background colors
  cardBackground: "bg-white",
  sectionBackground: "bg-gray-50",
  overlayBackground: "bg-black/50",
} as const;

export const COMPONENTS = {
  // Cards
  card: "bg-white border border-gray-200 rounded-lg",
  cardPadding: "p-6",
  cardSpacing: "space-y-6",
  
  // Buttons
  primaryButton: "bg-blue-500 hover:bg-blue-600 text-white",
  secondaryButton: "border border-gray-300 bg-white hover:bg-gray-50",
  dangerButton: "bg-red-600 hover:bg-red-700 text-white",
  
  // Forms
  formSpacing: "space-y-4",
  formGroup: "space-y-2",
  
  // Navigation
  navActive: "text-blue-600",
  navInactive: "text-gray-600 hover:text-gray-900",
} as const;

// Helper function to create consistent page layouts
export const createPageLayout = (maxWidth: string = LAYOUT.maxWidth) => 
  `${LAYOUT.pageMinHeight} ${LAYOUT.pageBackground} ${LAYOUT.pageLayout}`;

export const createMainContent = (maxWidth: string = LAYOUT.maxWidth) =>
  `${maxWidth} mx-auto ${LAYOUT.containerPadding} ${LAYOUT.sectionSpacing} flex-1`;

export const createContentSection = () =>
  `${LAYOUT.contentMaxWidth} mx-auto ${LAYOUT.containerPadding} ${LAYOUT.contentSpacing}`;

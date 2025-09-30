import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Checks if a string contains HTML tags
 * @param str - The string to check
 * @returns True if the string contains HTML tags
 */
export function containsHtml(str: string | null | undefined): boolean {
  if (!str || typeof str !== 'string') {
    return false;
  }

  const htmlRegex = /<[^>]*>/;
  return htmlRegex.test(str);
}

/**
 * Safely renders content that might contain HTML
 * @param content - The content that might contain HTML
 * @param fallbackText - Text to display if content is empty
 * @returns Object with __html property for use with dangerouslySetInnerHTML
 */
export function renderHtmlContent(content: string | null | undefined, fallbackText?: string) {
  if (!content) {
    return { __html: fallbackText || '' };
  }

  // If content contains HTML, we'll use it as-is but warn in development
  if (containsHtml(content)) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('HTML content detected in workflow step data:', content);
    }
    return { __html: content };
  }

  return { __html: content };
}

/**
 * Strips HTML tags from a string and returns plain text
 * @param html - HTML content to strip tags from
 * @returns Plain text without HTML tags
 */
export function stripHtml(html: string | null | undefined): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Create a temporary DOM element to extract text content
  if (typeof document !== 'undefined') {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  }

  // Fallback for server-side rendering
  return html.replace(/<[^>]*>/g, '');
}

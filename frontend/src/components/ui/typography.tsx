import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface TypographyProps {
  children: ReactNode;
  className?: string;
}

// Heading Components
export function H1({ children, className, ...props }: TypographyProps & React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1 className={cn("text-4xl font-bold text-gray-900 leading-tight", className)} {...props}>
      {children}
    </h1>
  );
}

export function H2({ children, className, ...props }: TypographyProps & React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={cn("text-3xl font-semibold text-gray-900 leading-tight", className)} {...props}>
      {children}
    </h2>
  );
}

export function H3({ children, className, ...props }: TypographyProps & React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-2xl font-semibold text-gray-900 leading-tight", className)} {...props}>
      {children}
    </h3>
  );
}

export function H4({ children, className, ...props }: TypographyProps & React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h4 className={cn("text-xl font-semibold text-gray-900 leading-tight", className)} {...props}>
      {children}
    </h4>
  );
}

export function H5({ children, className, ...props }: TypographyProps & React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5 className={cn("text-lg font-semibold text-gray-900 leading-tight", className)} {...props}>
      {children}
    </h5>
  );
}

export function H6({ children, className, ...props }: TypographyProps & React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h6 className={cn("text-base font-semibold text-gray-900 leading-tight", className)} {...props}>
      {children}
    </h6>
  );
}

// Paragraph Components
export function P({ children, className, ...props }: TypographyProps & React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-base text-gray-700 leading-relaxed", className)} {...props}>
      {children}
    </p>
  );
}

export function PSmall({ children, className, ...props }: TypographyProps & React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-gray-600 leading-relaxed", className)} {...props}>
      {children}
    </p>
  );
}

export function PXSmall({ children, className, ...props }: TypographyProps & React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-xs text-gray-500 leading-relaxed", className)} {...props}>
      {children}
    </p>
  );
}

// Span Components
export function Span({ children, className, ...props }: TypographyProps & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("text-base text-gray-700", className)} {...props}>
      {children}
    </span>
  );
}

export function SpanSmall({ children, className, ...props }: TypographyProps & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("text-sm text-gray-600", className)} {...props}>
      {children}
    </span>
  );
}

export function SpanXSmall({ children, className, ...props }: TypographyProps & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("text-xs text-gray-500", className)} {...props}>
      {children}
    </span>
  );
}

// Label Components
export function Label({ children, className, ...props }: TypographyProps & React.HTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn("text-sm font-medium text-gray-700", className)} {...props}>
      {children}
    </label>
  );
}

export function LabelSmall({ children, className, ...props }: TypographyProps & React.HTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn("text-xs font-medium text-gray-600", className)} {...props}>
      {children}
    </label>
  );
}

// Caption Component
export function Caption({ children, className, ...props }: TypographyProps & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("text-xs text-gray-500 font-medium", className)} {...props}>
      {children}
    </span>
  );
}

// Display Components for large numbers/statistics
export function DisplayLarge({ children, className, ...props }: TypographyProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("text-display-4xl font-bold text-gray-900", className)} {...props}>
      {children}
    </div>
  );
}

export function DisplayMedium({ children, className, ...props }: TypographyProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("text-display-3xl font-bold text-gray-900", className)} {...props}>
      {children}
    </div>
  );
}

export function DisplaySmall({ children, className, ...props }: TypographyProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("text-display-2xl font-bold text-gray-900", className)} {...props}>
      {children}
    </div>
  );
}

// Link Component
export function Link({ children, className, ...props }: TypographyProps & React.HTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={cn("text-base text-blue-600 hover:text-blue-800 underline", className)} {...props}>
      {children}
    </a>
  );
}

export function LinkSmall({ children, className, ...props }: TypographyProps & React.HTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={cn("text-sm text-blue-600 hover:text-blue-800 underline", className)} {...props}>
      {children}
    </a>
  );
} 
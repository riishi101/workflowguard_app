import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ContentSectionProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "card" | "highlighted";
  spacing?: "tight" | "normal" | "loose";
}

const ContentSection = ({
  children,
  className,
  variant = "default",
  spacing = "normal",
}: ContentSectionProps) => {
  const getSpacingClasses = () => {
    switch (spacing) {
      case "tight":
        return "mb-4";
      case "loose":
        return "mb-12";
      default:
        return "mb-8";
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case "card":
        return "bg-white border border-gray-200 rounded-lg p-6";
      case "highlighted":
        return "bg-gray-50 border border-gray-200 rounded-lg p-6";
      default:
        return "";
    }
  };

  return (
    <section className={cn(
      "w-full",
      getSpacingClasses(),
      getVariantClasses(),
      className
    )}>
      {children}
    </section>
  );
};

export default ContentSection;

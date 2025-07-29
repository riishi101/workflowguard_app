import { ReactNode } from "react";
import { TYPOGRAPHY, COMPONENTS } from "@/lib/layout-constants";
import { cn } from "@/lib/utils";

interface PageSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  variant?: "default" | "card" | "highlighted";
  className?: string;
}

const PageSection = ({
  title,
  description,
  children,
  variant = "default",
  className,
}: PageSectionProps) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "card":
        return cn(COMPONENTS.card, COMPONENTS.cardPadding);
      case "highlighted":
        return "bg-gray-50 p-6 rounded-lg border border-gray-200";
      default:
        return "";
    }
  };

  return (
    <section className={cn(TYPOGRAPHY.contentMargin, className)}>
      {(title || description) && (
        <div className={TYPOGRAPHY.titleMargin}>
          {title && (
            <h2 className={cn(TYPOGRAPHY.sectionTitle, "mb-2")}>
              {title}
            </h2>
          )}
          {description && (
            <p className={TYPOGRAPHY.pageDescription}>
              {description}
            </p>
          )}
        </div>
      )}
      
      <div className={getVariantClasses()}>
        {children}
      </div>
    </section>
  );
};

export default PageSection;

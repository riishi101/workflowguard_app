import { ReactNode } from "react";
import TopNavigation from "./TopNavigation";
import Footer from "./Footer";
import { LAYOUT, TYPOGRAPHY } from "@/lib/layout-constants";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  maxWidth?: "default" | "content" | "narrow";
  showNavigation?: boolean;
  showFooter?: boolean;
  className?: string;
}

const PageLayout = ({
  children,
  title,
  description,
  maxWidth = "default",
  showNavigation = true,
  showFooter = true,
  className,
}: PageLayoutProps) => {
  const getMaxWidth = () => {
    switch (maxWidth) {
      case "content":
        return LAYOUT.contentMaxWidth;
      case "narrow":
        return LAYOUT.narrowMaxWidth;
      default:
        return LAYOUT.maxWidth;
    }
  };

  return (
    <div className={cn(LAYOUT.pageMinHeight, LAYOUT.pageBackground, LAYOUT.pageLayout)}>
      {showNavigation && <TopNavigation />}
      
      <main className={cn(
        getMaxWidth(),
        "mx-auto",
        LAYOUT.containerPadding,
        LAYOUT.sectionSpacing,
        "flex-1",
        className
      )}>
        {(title || description) && (
          <div className={TYPOGRAPHY.sectionMargin}>
            {title && (
              <h1 className={cn(TYPOGRAPHY.pageTitle, TYPOGRAPHY.titleMargin)}>
                {title}
              </h1>
            )}
            {description && (
              <p className={TYPOGRAPHY.pageDescription}>
                {description}
              </p>
            )}
          </div>
        )}
        
        {children}
      </main>
      
      {showFooter && <Footer />}
    </div>
  );
};

export default PageLayout;

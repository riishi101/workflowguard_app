import { ReactNode } from "react";
import TopNavigation from "./TopNavigation";
import Footer from "./Footer";
import { cn } from "@/lib/utils";

interface MainAppLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  headerActions?: ReactNode;
  className?: string;
}

const MainAppLayout = ({
  children,
  title,
  description,
  headerActions,
  className,
}: MainAppLayoutProps) => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <TopNavigation />

      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                {title}
              </h1>
              {description && (
                <p className="text-gray-600 text-sm max-w-3xl">
                  {description}
                </p>
              )}
            </div>
            {headerActions && (
              <div className="flex-shrink-0 ml-6">
                {headerActions}
              </div>
            )}
          </div>
        </div>

        {/* Page Content */}
        <div className={cn("w-full", className)}>
          {children}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default MainAppLayout;

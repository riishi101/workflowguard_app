import { cn } from "@/lib/utils";

interface WorkflowGuardLogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

const WorkflowGuardLogo = ({
  className,
  showText = true,
  size = "md",
}: WorkflowGuardLogoProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10", 
    lg: "w-12 h-12"
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl"
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative flex-shrink-0">
        <img
          src="https://cdn.builder.io/api/v1/image/assets%2Ffae26f580f3f4b359fc5216711c44c53%2F45cc30db991744b88b923c4553fba4a8?format=webp&width=800"
          alt="WorkflowGuard Logo"
          className={cn("rounded-lg shadow-sm", sizeClasses[size])}
        />
      </div>
      {showText && (
        <span className={cn("font-bold text-gray-900 tracking-tight", textSizes[size])}>
          WorkflowGuard
        </span>
      )}
    </div>
  );
};

export default WorkflowGuardLogo;

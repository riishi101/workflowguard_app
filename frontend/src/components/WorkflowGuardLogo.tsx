import { cn } from "@/lib/utils";

interface WorkflowGuardLogoProps {
  className?: string;
  showText?: boolean;
}

const WorkflowGuardLogo = ({
  className,
  showText = true,
}: WorkflowGuardLogoProps) => {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative flex-shrink-0">
        <img
          src="https://cdn.builder.io/api/v1/image/assets%2Ffae26f580f3f4b359fc5216711c44c53%2F45cc30db991744b88b923c4553fba4a8?format=webp&width=800"
          alt="WorkflowGuard Logo"
          className="w-10 h-10 rounded-lg shadow-sm"
        />
      </div>
      {showText && (
        <span className="text-xl font-bold text-gray-900 tracking-tight">
          WorkflowGuard
        </span>
      )}
    </div>
  );
};

export default WorkflowGuardLogo;

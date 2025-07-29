import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { H3, H5, PSmall, SpanSmall } from "@/components/ui/typography";
import WorkflowGuardLogo from "./WorkflowGuardLogo";
import { Shield, RotateCcw, FileText, CheckCircle } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
  onConnectHubSpot: () => void;
}

const WelcomeModal = ({
  open,
  onClose,
  onConnectHubSpot,
}: WelcomeModalProps) => {
  console.log('WelcomeModal render - open:', open);
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-8 bg-gray-50 border-0">
        <VisuallyHidden>
          <DialogTitle>Welcome to WorkflowGuard</DialogTitle>
          <DialogDescription>
            Protect your HubSpot automations from accidental changes and easily recover lost work.
          </DialogDescription>
        </VisuallyHidden>
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <WorkflowGuardLogo />
          </div>

          <div>
            <H3 className="mb-3">
              Welcome to WorkflowGuard!
            </H3>
            <PSmall className="leading-relaxed">
              Protect your HubSpot automations from accidental changes and
              easily recover lost work.
            </PSmall>
          </div>

          <div className="flex justify-center gap-8 py-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Shield className="w-6 h-6 text-blue-500" />
              </div>
              <PSmall className="font-medium">
                Never lose a change
              </PSmall>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <RotateCcw className="w-6 h-6 text-blue-500" />
              </div>
              <PSmall className="font-medium">
                Rollback instantly
              </PSmall>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <FileText className="w-6 h-6 text-blue-500" />
              </div>
              <PSmall className="font-medium">
                Track all modifications
              </PSmall>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">
                Professional Trial Active
              </h3>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                <SpanSmall>
                  Daily & on-publish snapshots
                </SpanSmall>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                <SpanSmall>90 days of history</SpanSmall>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                <SpanSmall>Workflow comparison</SpanSmall>
              </div>
            </div>
          </div>

          <SpanSmall className="leading-relaxed">
            You're currently on a 21-day free trial with access to Professional
            Plan features
          </SpanSmall>

          <Button
            onClick={() => {
              console.log('WelcomeModal - Connect button clicked');
              onConnectHubSpot();
            }}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium"
          >
            Connect Your HubSpot Account
            <svg
              className="w-4 h-4 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;

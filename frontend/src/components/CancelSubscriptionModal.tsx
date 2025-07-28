import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

interface CancelSubscriptionModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const CancelSubscriptionModal = ({
  open,
  onClose,
  onConfirm,
}: CancelSubscriptionModalProps) => {
  const [feedbackReason, setFeedbackReason] = useState("");

  const handleConfirmCancellation = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 bg-white">
        {/* Header */}
        <div className="p-6 pb-4">
          <DialogTitle className="text-xl font-semibold text-gray-900 leading-tight pr-8">
            Are you sure you want to cancel your subscription?
          </DialogTitle>
        </div>

        <div className="px-6 pb-6 space-y-6">
          {/* Main Statement */}
          <p className="text-sm font-medium text-gray-900">
            You are about to cancel your Professional Plan subscription for
            WorkflowGuard
          </p>

          {/* Key Information Section */}
          <div className="space-y-4">
            {/* Active until and billing info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">
                Your plan will remain active until August 18, 2025
              </p>
              <p className="text-sm text-gray-700">
                You will NOT be charged again after this date
              </p>
            </div>

            {/* Loss of access section with horizontal layout */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                After August 18, 2025, you will lose access to:
              </h4>

              {/* Horizontal Chips Layout */}
              <div className="flex flex-wrap gap-2">
                <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-3 py-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-red-700">
                    All Professional/Enterprise features
                  </span>
                </div>
                <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-3 py-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-red-700">
                    Workflow monitoring limited to 3 workflows
                  </span>
                </div>
                <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-3 py-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-red-700">
                    Version history limited to 30 days
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback section */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4">
              We'd love to know why you're canceling (optional)
            </h4>
            <RadioGroup
              value={feedbackReason}
              onValueChange={setFeedbackReason}
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="too-expensive" id="too-expensive" />
                  <Label
                    htmlFor="too-expensive"
                    className="text-sm text-gray-700"
                  >
                    Too expensive
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="missing-feature"
                    id="missing-feature"
                  />
                  <Label
                    htmlFor="missing-feature"
                    className="text-sm text-gray-700"
                  >
                    Missing a key feature
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="not-using" id="not-using" />
                  <Label htmlFor="not-using" className="text-sm text-gray-700">
                    Not using it enough
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="switching-tool" id="switching-tool" />
                  <Label
                    htmlFor="switching-tool"
                    className="text-sm text-gray-700"
                  >
                    Switching to a different tool
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="technical-issues"
                    id="technical-issues"
                  />
                  <Label
                    htmlFor="technical-issues"
                    className="text-sm text-gray-700"
                  >
                    Technical issues / Bugs
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other" className="text-sm text-gray-700">
                    Other
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-4 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Keep My Plan
            </Button>
            <Button
              onClick={handleConfirmCancellation}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CancelSubscriptionModal;

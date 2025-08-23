import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useState } from "react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface CreateNewWorkflowModalProps {
  open: boolean;
  onClose: () => void;
  version: any;
}

const CreateNewWorkflowModal = ({
  open,
  onClose,
  version,
}: CreateNewWorkflowModalProps) => {
  const [workflowName, setWorkflowName] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("");

  const handleCreate = () => {
    // Handle workflow creation logic here
    onClose();
  };

  if (!version) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <VisuallyHidden>
          <DialogTitle>Create New Workflow from Version</DialogTitle>
        </VisuallyHidden>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Create New Workflow from Version
          </h2>
        </div>

        <div className="space-y-6">
          <p className="text-sm text-gray-600 leading-relaxed">
            A new inactive workflow will be created in your HubSpot account
            based on this version. It will not affect your existing workflows.
          </p>

          <div className="space-y-4">
            <div>
              <Label
                htmlFor="workflow-name"
                className="text-sm font-medium text-gray-900"
              >
                New Workflow Name
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="workflow-name"
                placeholder="e.g., Customer Onboarding (V2) - Refactored"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label
                htmlFor="folder"
                className="text-sm font-medium text-gray-900"
              >
                HubSpot Folder (Optional)
              </Label>
              <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="customer-success">
                    Customer Success
                  </SelectItem>
                  <SelectItem value="automation">Sales Automation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-900">
                Based on Version:
              </Label>
              <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-900">
                  April 15, 2024 at 10:00 AM by John Doe (On-Publish Save)
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!workflowName.trim()}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Create Workflow
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateNewWorkflowModal;

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Edit, Trash2 } from "lucide-react";
import AddWebhookModal from "./AddWebhookModal";

const WebhooksConfiguration = () => {
  const [showAddModal, setShowAddModal] = useState(false);

  const webhooks = [
    {
      id: 1,
      name: "Slack Alerts",
      description: "",
      endpointUrl: "https://hooks.slack.com/services/...",
      eventTypes: ["Workflow Rollback", "New Version"],
      status: "Active",
      lastTriggered: "2025-06-23, 10:15 AM",
    },
    {
      id: 2,
      name: "DevOps Pipeline",
      description: "",
      endpointUrl: "https://my-ci-tool.com/webhooks/...",
      eventTypes: ["Audit Log", "Workflow Deleted"],
      status: "Inactive",
      lastTriggered: "Never",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pt-10 pb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Outgoing Webhooks
          </h2>
          <p className="text-sm text-gray-600 mt-3 leading-relaxed">
            Configure endpoints to receive real-time notifications about events
            in your WorkflowGuard account.
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-500 hover:bg-blue-600"
        >
          + Add Webhook
        </Button>
      </div>

      {/* Webhooks Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-medium text-gray-700">
                NAME / DESCRIPTION
              </TableHead>
              <TableHead className="font-medium text-gray-700">
                ENDPOINT URL
              </TableHead>
              <TableHead className="font-medium text-gray-700">
                EVENT TYPE(S)
              </TableHead>
              <TableHead className="font-medium text-gray-700">
                STATUS
              </TableHead>
              <TableHead className="font-medium text-gray-700">
                LAST TRIGGERED
              </TableHead>
              <TableHead className="font-medium text-gray-700">
                ACTIONS
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {webhooks.map((webhook) => (
              <TableRow key={webhook.id} className="hover:bg-gray-50">
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center">
                      <span className="text-orange-600 text-sm font-medium">
                        {webhook.name
                          .split(" ")
                          .map((w) => w[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {webhook.name}
                      </div>
                      {webhook.description && (
                        <div className="text-sm text-gray-500">
                          {webhook.description}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 truncate max-w-xs">
                      {webhook.endpointUrl}
                    </span>
                    <Eye className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {webhook.eventTypes.map((eventType, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-100"
                      >
                        {eventType}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      webhook.status === "Active" ? "default" : "secondary"
                    }
                    className={
                      webhook.status === "Active"
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                    }
                  >
                    {webhook.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {webhook.lastTriggered}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Documentation Link */}
      <div className="flex items-center">
        <Button variant="outline" size="sm" className="text-blue-600">
          📄 View Webhook Documentation
        </Button>
      </div>

      {/* Add Webhook Modal */}
      <AddWebhookModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
};

export default WebhooksConfiguration;

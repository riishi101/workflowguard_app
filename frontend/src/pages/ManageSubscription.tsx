import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CancelSubscriptionModal from "@/components/CancelSubscriptionModal";
import { HelpCircle, Settings, Download } from "lucide-react";

const ManageSubscription = () => {
  const navigate = useNavigate();
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleCancelSubscription = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancellation = () => {
    // Handle the actual cancellation logic here
    console.log("Subscription cancelled");
    // You might want to navigate to a confirmation page or show a success message
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-sm flex items-center justify-center">
                <svg
                  className="w-2 h-2 text-blue-500"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              </div>
            </div>
            <span className="font-semibold text-gray-900">WorkflowGuard</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
              <HelpCircle className="w-4 h-4" />
              Help
            </button>
            <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <button
            onClick={() => navigate("/settings")}
            className="hover:text-gray-900"
          >
            App Settings
          </button>
          <span>&gt;</span>
          <button
            onClick={() => navigate("/settings")}
            className="hover:text-gray-900"
          >
            My Plan & Billing
          </button>
          <span>&gt;</span>
          <span className="text-gray-900">Manage Billing Details</span>
        </nav>

        {/* Title */}
        <h1 className="text-3xl font-semibold text-gray-900 mb-8">
          Manage Your Subscription
        </h1>

        <div className="space-y-8">
          {/* Your Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>Your Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 bg-white border border-gray-200 rounded flex items-center justify-center p-1">
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets%2Ffae26f580f3f4b359fc5216711c44c53%2F10f1b8f91e23476982fae6ce94a988d0?format=webp&width=800"
                      alt="Visa"
                      className="h-full w-auto object-contain"
                    />
                  </div>
                  <div>
                    <div className="font-medium">•••• •••• •••• 1234</div>
                    <div className="text-sm text-gray-600">Expires 12/27</div>
                  </div>
                </div>
                <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                  Update Payment Method
                </Button>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                Your payment information is securely processed by Stripe
              </p>
            </CardContent>
          </Card>

          {/* Next Billing */}
          <Card>
            <CardHeader>
              <CardTitle>Next Billing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">
                Your next payment of $59.00 will be processed on August 18, 2025
              </p>
            </CardContent>
          </Card>

          {/* Billing History */}
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Invoice</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>July 18, 2025</TableCell>
                    <TableCell>$59.00</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Paid</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>June 18, 2025</TableCell>
                    <TableCell>$59.00</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Paid</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>May 18, 2025</TableCell>
                    <TableCell>$59.00</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm">Failed</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>April 18, 2025</TableCell>
                    <TableCell>$59.00</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Paid</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Cancel Subscription */}
          <Card>
            <CardHeader>
              <CardTitle>Cancel Subscription</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                If you wish to stop your WorkflowGuard subscription, you can
                cancel it here. Your plan will remain active until the end of
                your current billing cycle.
              </p>
              <Button
                onClick={handleCancelSubscription}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Cancel Subscription
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            © 2024 WorkflowGuard. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate("/terms-of-service")}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Terms of Service
            </button>
            <button
              onClick={() => navigate("/privacy-policy")}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => navigate("/contact")}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Contact Us
            </button>
          </div>
        </div>
      </footer>

      {/* Cancel Subscription Modal */}
      <CancelSubscriptionModal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancellation}
      />
    </div>
  );
};

export default ManageSubscription;

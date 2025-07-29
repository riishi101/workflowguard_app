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
import TopNavigation from "@/components/TopNavigation";
import Footer from "@/components/Footer";
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
      <TopNavigation />

      <main className="max-w-7xl mx-auto px-6 py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Manage Your Subscription
          </h1>
          <p className="text-gray-600 text-sm">
            Update your billing information, payment methods, and subscription details
          </p>
        </div>

        <div className="space-y-6">
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
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Visa ending in 4242</p>
                    <p className="text-sm text-gray-600">Expires 12/25</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Update
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Billing Address */}
          <Card>
            <CardHeader>
              <CardTitle>Billing Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">John Smith</p>
                  <p className="text-sm text-gray-600">
                    123 Main Street, Suite 100
                  </p>
                  <p className="text-sm text-gray-600">
                    New York, NY 10001, United States
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Current Plan */}
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Professional Plan
                    </h3>
                    <Badge className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    $49/month • Next billing date: August 15, 2024
                  </p>
                  <p className="text-sm text-gray-600">
                    Includes: 500 workflows, 90-day history, Priority support
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Change Plan
                </Button>
              </div>
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
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Invoice</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="text-sm">July 15, 2024</TableCell>
                    <TableCell className="text-sm">
                      Professional Plan - Monthly
                    </TableCell>
                    <TableCell className="text-sm font-medium">$49.00</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">
                        Paid
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-sm">June 15, 2024</TableCell>
                    <TableCell className="text-sm">
                      Professional Plan - Monthly
                    </TableCell>
                    <TableCell className="text-sm font-medium">$49.00</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">
                        Paid
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-sm">May 15, 2024</TableCell>
                    <TableCell className="text-sm">
                      Professional Plan - Monthly
                    </TableCell>
                    <TableCell className="text-sm font-medium">$49.00</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">
                        Paid
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
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
              <CardTitle className="text-red-600">Cancel Subscription</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Cancel your subscription and stop billing at the end of your
                    current billing period.
              </p>
                  <p className="text-xs text-gray-500">
                    You'll continue to have access until August 15, 2024
                  </p>
                </div>
              <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={handleCancelSubscription}
              >
                Cancel Subscription
              </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <CancelSubscriptionModal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancellation}
      />

      <Footer />
    </div>
  );
};

export default ManageSubscription;

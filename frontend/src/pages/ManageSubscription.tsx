import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ContentPageHeader from "@/components/ContentPageHeader";
import PageSection from "@/components/PageSection";
import Footer from "@/components/Footer";
import CancelSubscriptionModal from "@/components/CancelSubscriptionModal";
import { LAYOUT, TYPOGRAPHY, COLORS } from "@/lib/layout-constants";
import { Download } from "lucide-react";

const ManageSubscription = () => {
  const navigate = useNavigate();
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleCancelSubscription = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancellation = () => {
  };

  return (
    <div className={`${LAYOUT.pageMinHeight} ${LAYOUT.pageBackground} ${LAYOUT.pageLayout}`}>
      <ContentPageHeader />

      <main className={`${LAYOUT.contentMaxWidth} mx-auto ${LAYOUT.containerPadding} ${LAYOUT.sectionSpacing} flex-1`}>
        {/* Breadcrumb */}
        <nav className={`flex items-center gap-2 ${TYPOGRAPHY.helperText} ${TYPOGRAPHY.sectionMargin}`}>
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

        <h1 className={`${TYPOGRAPHY.pageTitle} ${TYPOGRAPHY.sectionMargin}`}>
          Manage Your Subscription
        </h1>

        <div className="space-y-8">
          {/* Your Payment Method */}
          <PageSection title="Your Payment Method" variant="card">
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
                  <div className={TYPOGRAPHY.helperText}>Expires 12/27</div>
                </div>
              </div>
              <Button className={`${COLORS.primary} text-white`}>
                Update Payment Method
              </Button>
            </div>
            <p className={`${TYPOGRAPHY.helperText} mt-4`}>
              Your payment information is securely processed by Stripe
            </p>
          </PageSection>

          {/* Next Billing */}
          <PageSection title="Next Billing" variant="card">
            <p className={TYPOGRAPHY.bodyText}>
              Your next payment of $59.00 will be processed on August 18, 2025
            </p>
          </PageSection>

          {/* Billing History */}
          <PageSection title="Billing History" variant="card">
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
                      className={`${COLORS.primaryText} hover:text-blue-700`}
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
                      className={`${COLORS.primaryText} hover:text-blue-700`}
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
                      className={`${COLORS.primaryText} hover:text-blue-700`}
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
                      className={`${COLORS.primaryText} hover:text-blue-700`}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </PageSection>

          {/* Cancel Subscription */}
          <PageSection title="Cancel Subscription" variant="card">
            <p className={`${TYPOGRAPHY.bodyText} mb-4`}>
              If you wish to stop your WorkflowGuard subscription, you can
              cancel it here. Your plan will remain active until the end of
              your current billing cycle.
            </p>
            <Button
              onClick={handleCancelSubscription}
              className={`${COLORS.danger} text-white`}
            >
              Cancel Subscription
            </Button>
          </PageSection>
        </div>
      </main>

      <Footer />

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

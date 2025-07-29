import { useNavigate } from "react-router-dom";
import TopNavigation from "@/components/TopNavigation";
import Footer from "@/components/Footer";

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <TopNavigation />

      <main className="max-w-7xl mx-auto px-6 py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Terms of Service
          </h1>
          <p className="text-gray-600 text-sm">
            Last updated: May 24, 2024
          </p>
        </div>

        <div className="prose prose-gray max-w-none">
          <div className="space-y-6">
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                1. Acceptance of Terms
              </h2>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  By accessing and using WorkflowGuard ("the Service"), you accept
                  and agree to be bound by the terms and provision of this
                  agreement. If you do not agree to abide by the above, please do
                  not use this service.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                2. Description of Service
              </h2>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  WorkflowGuard is a workflow version control and monitoring
                  service that integrates with HubSpot to help protect and manage
                  your automation workflows. Our service includes:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Workflow version control and history tracking</li>
                  <li>Automatic snapshots and backup management</li>
                  <li>Change detection and notification systems</li>
                  <li>Rollback and restoration capabilities</li>
                  <li>Integration with HubSpot automation workflows</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                3. User Accounts and Registration
              </h2>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  To use our Service, you must register for an account. You agree
                  to provide accurate, current, and complete information during
                  registration and to update such information to keep it accurate,
                  current, and complete.
                </p>
                <p>
                  You are responsible for safeguarding your account credentials and
                  for all activities that occur under your account. You agree to
                  notify us immediately of any unauthorized use of your account.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                4. HubSpot Integration
              </h2>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  Our Service integrates with HubSpot to access and monitor your
                  workflow data. By using our Service, you authorize us to:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Read your HubSpot workflow configurations</li>
                  <li>Create snapshots of your workflow versions</li>
                  <li>Monitor changes to your workflows</li>
                  <li>Restore previous versions when requested</li>
                </ul>
                <p>
                  We do not modify your workflows without your explicit consent.
                  All changes to your workflows are made through the HubSpot
                  interface with your authorization.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                5. Subscription and Payment
              </h2>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  We offer various subscription plans with different features and
                  pricing. Subscription fees are billed in advance on a monthly or
                  annual basis.
                </p>
                <p>
                  <strong>Payment Terms:</strong> All fees are non-refundable
                  except as expressly stated in these terms. We reserve the right
                  to change our pricing with 30 days' notice.
                </p>
                <p>
                  <strong>Cancellation:</strong> You may cancel your subscription
                  at any time. Your access will continue until the end of your
                  current billing period.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                6. Acceptable Use
              </h2>
              <div className="text-sm text-gray-600 space-y-2">
                <p>You agree not to use the Service to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe on the rights of others</li>
                  <li>Transmit harmful, offensive, or inappropriate content</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Interfere with the proper operation of the Service</li>
                  <li>Use the Service for any illegal or unauthorized purpose</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                7. Data and Privacy
              </h2>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  Your privacy is important to us. Our collection and use of
                  personal information is governed by our Privacy Policy, which is
                  incorporated into these Terms by reference.
                </p>
                <p>
                  You retain ownership of your data. We process your data only as
                  necessary to provide our Service and as described in our Privacy
                  Policy.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                8. Intellectual Property
              </h2>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  The Service and its original content, features, and
                  functionality are owned by WorkflowGuard and are protected by
                  international copyright, trademark, patent, trade secret, and
                  other intellectual property laws.
                </p>
                <p>
                  You retain ownership of your workflow configurations and data.
                  Our Service does not claim ownership of your content.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                9. Limitation of Liability
              </h2>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  In no event shall WorkflowGuard, nor its directors, employees,
                  partners, agents, suppliers, or affiliates, be liable for any
                  indirect, incidental, special, consequential, or punitive
                  damages, including without limitation, loss of profits, data,
                  use, goodwill, or other intangible losses.
                </p>
                <p>
                  Our total liability to you for any claims arising from the use
                  of our Service shall not exceed the amount you paid us in the
                  12 months preceding the claim.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                10. Service Availability
              </h2>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  We strive to maintain high availability of our Service, but we
                  do not guarantee uninterrupted access. The Service may be
                  temporarily unavailable due to maintenance, updates, or other
                  factors beyond our control.
                </p>
                <p>
                  We are not responsible for any losses or damages that may occur
                  due to Service unavailability.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                11. Termination
              </h2>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  We may terminate or suspend your account and access to the
                  Service immediately, without prior notice, for any reason,
                  including breach of these Terms.
                </p>
                <p>
                  Upon termination, your right to use the Service will cease
                  immediately. We may delete your account and data in accordance
                  with our data retention policies.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                12. Changes to Terms
              </h2>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  We reserve the right to modify these Terms at any time. We will
                  notify users of any material changes by posting the new Terms on
                  this page and updating the "Last updated" date.
                </p>
                <p>
                  Your continued use of the Service after any changes indicates
                  your acceptance of the new Terms.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                13. Governing Law
              </h2>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  These Terms shall be governed by and construed in accordance
                  with the laws of [Your Jurisdiction], without regard to its
                  conflict of law provisions.
                </p>
                <p>
                  Any disputes arising from these Terms or the use of our Service
                  shall be resolved through binding arbitration in accordance with
                  the rules of [Arbitration Organization].
                </p>
                </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                14. Contact Information
              </h2>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  If you have any questions about these Terms of Service, please
                  contact us:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium">WorkflowGuard</p>
                  <p>Email: legal@workflowguard.pro</p>
                  <p>Address: [Your Business Address]</p>
                </div>
        </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfService;

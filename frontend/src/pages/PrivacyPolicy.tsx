import { useNavigate } from "react-router-dom";
import SimpleTopNavigation from "@/components/SimpleTopNavigation";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SimpleTopNavigation />

      <main className="max-w-7xl mx-auto px-6 py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Privacy Policy
          </h1>
          <p className="text-gray-600 text-sm">
            Last updated: May 24, 2024
          </p>
        </div>

        <div className="prose prose-gray max-w-none">
          <div className="space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
                1. Information We Collect
            </h2>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  We collect information you provide directly to us, such as when
                  you create an account, connect your HubSpot account, or contact
                  our support team.
                </p>
                <p>
                  <strong>Account Information:</strong> When you create an account,
                  we collect your name, email address, and company information.
                </p>
                <p>
                  <strong>HubSpot Integration:</strong> When you connect your
                  HubSpot account, we access your workflow data to provide our
                  services. We only read workflow information and do not modify
                  your workflows.
                </p>
                <p>
                  <strong>Usage Data:</strong> We collect information about how
                  you use our service, including which features you use and how
                  often you access the platform.
            </p>
              </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
                2. How We Use Your Information
            </h2>
              <div className="text-sm text-gray-600 space-y-2">
                <p>We use the information we collect to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Provide and maintain our services</li>
                  <li>Process your payments and manage your subscription</li>
                  <li>Send you important updates about our service</li>
                  <li>Provide customer support and respond to your inquiries</li>
                  <li>Improve our services and develop new features</li>
                  <li>Ensure the security and integrity of our platform</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
                3. Information Sharing
            </h2>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  We do not sell, trade, or otherwise transfer your personal
                  information to third parties, except in the following
                  circumstances:
            </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>
                    <strong>Service Providers:</strong> We may share information
                    with trusted third-party service providers who help us operate
                    our platform (e.g., payment processors, hosting providers)
                  </li>
                  <li>
                    <strong>Legal Requirements:</strong> We may disclose
                    information if required by law or to protect our rights and
                    safety
                  </li>
                  <li>
                    <strong>Business Transfers:</strong> In the event of a merger
                    or acquisition, your information may be transferred to the new
                    entity
                  </li>
            </ul>
              </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              4. Data Security
            </h2>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  We implement appropriate technical and organizational measures to
                  protect your personal information against unauthorized access,
                  alteration, disclosure, or destruction.
                </p>
                <p>
                  Your data is encrypted in transit and at rest. We use industry
                  standard security practices and regularly review our security
                  measures.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                5. Your Rights
              </h2>
              <div className="text-sm text-gray-600 space-y-2">
                <p>You have the right to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Access and review your personal information</li>
                  <li>Correct inaccurate or incomplete information</li>
                  <li>Request deletion of your personal information</li>
                  <li>Object to our processing of your information</li>
                  <li>Request a copy of your data in a portable format</li>
                  <li>Withdraw consent for data processing</li>
                </ul>
                <p>
                  To exercise these rights, please contact us at{" "}
                  <a
                    href="mailto:privacy@workflowguard.pro"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    privacy@workflowguard.pro
                  </a>
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                6. Data Retention
              </h2>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  We retain your personal information for as long as necessary to
                  provide our services and fulfill the purposes outlined in this
                  policy.
                </p>
                <p>
                  When you delete your account, we will delete your personal
                  information within 30 days, except where we are required to
                  retain certain information for legal or legitimate business
                  purposes.
            </p>
              </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
                7. Cookies and Tracking
            </h2>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  We use cookies and similar technologies to enhance your
                  experience on our platform. These technologies help us:
            </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Remember your preferences and settings</li>
                  <li>Analyze how our platform is used</li>
                  <li>Provide personalized content and features</li>
                  <li>Ensure the security of our platform</li>
            </ul>
                <p>
                  You can control cookie settings through your browser
                  preferences, though disabling cookies may affect some platform
                  functionality.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                8. International Data Transfers
              </h2>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  Your information may be transferred to and processed in
                  countries other than your own. We ensure that such transfers
                  comply with applicable data protection laws and implement
                  appropriate safeguards to protect your information.
                </p>
              </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
                9. Children's Privacy
            </h2>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  Our services are not intended for children under the age of 13.
                  We do not knowingly collect personal information from children
                  under 13. If you believe we have collected information from a
                  child under 13, please contact us immediately.
                </p>
              </div>
          </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                10. Changes to This Policy
              </h2>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  We may update this Privacy Policy from time to time. We will
                  notify you of any material changes by posting the new policy on
                  this page and updating the "Last updated" date.
                </p>
                <p>
                  Your continued use of our services after any changes indicates
                  your acceptance of the updated policy.
                </p>
        </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                11. Contact Us
              </h2>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  If you have any questions about this Privacy Policy or our
                  data practices, please contact us:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium">WorkflowGuard</p>
                  <p>Email: privacy@workflowguard.pro</p>
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

export default PrivacyPolicy;

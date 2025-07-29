import { useNavigate } from "react-router-dom";
import ContentPageHeader from "@/components/ContentPageHeader";
import Footer from "@/components/Footer";
import { LAYOUT, TYPOGRAPHY } from "@/lib/layout-constants";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className={`${LAYOUT.pageMinHeight} ${LAYOUT.pageBackground} ${LAYOUT.pageLayout}`}>
      <ContentPageHeader />

      <main className={`${LAYOUT.contentMaxWidth} mx-auto ${LAYOUT.containerPadding} ${LAYOUT.contentSpacing} flex-1`}>
        <div className={TYPOGRAPHY.sectionMargin}>
          <h1 className={`${TYPOGRAPHY.pageTitle} mb-2`}>
            Privacy Policy
          </h1>
          <p className={`${TYPOGRAPHY.helperText} mb-6`}>
            Last Updated: July 17, 2025
          </p>
          <p className={TYPOGRAPHY.pageDescription}>
            Your privacy is critically important to us. This Privacy Policy
            explains how WorkflowGuard collects, uses, discloses, and protects
            information about you.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-8 text-sm text-gray-600 leading-relaxed">
          {/* 1. Introduction */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              1. Introduction
            </h2>
            <p>
              This Privacy Policy describes our policies and procedures on the
              collection, use, and disclosure of your information when you use
              the Service and tells you about your privacy rights and how the
              law protects you.
            </p>
          </section>

          {/* 2. Information We Collect */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              2. Information We Collect
            </h2>

            {/* 2.1 Information You Provide to Us */}
            <div className="mb-6">
              <h3 className="text-base font-semibold text-gray-900 mb-3">
                2.1 Information You Provide to Us
              </h3>
              <p className="mb-3">
                While using our Service, we may ask you to provide us with
                certain personally identifiable information that can be used to
                contact or identify you ("Personal Data").
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Email address</li>
                <li>First name and last name</li>
                <li>Usage data</li>
                <li>Account preferences</li>
              </ul>
            </div>

            {/* 2.2 Information We Collect Automatically */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-3">
                2.2 Information We Collect Automatically
              </h3>
              <p className="mb-3">
                When you access or use our Service, we automatically collect
                certain information.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Device information</li>
                <li>IP address</li>
                <li>Browser type</li>
                <li>Operating system</li>
                <li>Access times</li>
              </ul>
            </div>
          </section>

          {/* 3. How We Use Your Information */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              3. How We Use Your Information
            </h2>
            <p className="mb-3">
              We use the collected data for various purposes:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide and maintain our Service</li>
              <li>To notify you about changes to our Service</li>
              <li>To provide customer support</li>
              <li>To gather analysis or valuable information</li>
              <li>To detect, prevent and address technical issues</li>
            </ul>
          </section>

          {/* 4. Data Security */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              4. Data Security
            </h2>
            <p>
              The security of your data is important to us, but remember that no
              method of transmission over the Internet or method of electronic
              storage is 100% secure. While we strive to use commercially
              acceptable means to protect your Personal Data, we cannot
              guarantee its absolute security.
            </p>
          </section>

          {/* 5. Your Data Rights */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              5. Your Data Rights
            </h2>
            <p className="mb-3">
              Under certain circumstances, you have rights under data protection
              laws in relation to your personal data:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>The right to access your personal data</li>
              <li>The right to correct your personal data</li>
              <li>The right to delete your personal data</li>
              <li>The right to restrict processing of your personal data</li>
              <li>The right to data portability</li>
            </ul>
          </section>

          {/* 6. Contact Us */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              6. Contact Us
            </h2>
            <p className="mb-3">
              If you have any questions about this Privacy Policy, please
              contact us:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>By email: privacy@workflowguard.com</li>
              <li>
                By visiting this page on our website:
                https://workflowguard.com/contact
              </li>
            </ul>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;

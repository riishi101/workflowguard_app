import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ContentPageHeader from "@/components/ContentPageHeader";
import PageSection from "@/components/PageSection";
import Footer from "@/components/Footer";
import { LAYOUT, TYPOGRAPHY, COLORS } from "@/lib/layout-constants";
import { Mail, MessageCircle, Clock } from "lucide-react";

const ContactUs = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSendMessage = () => {
    console.log("Sending message:", formData);
  };

  return (
    <div className={`${LAYOUT.pageMinHeight} ${LAYOUT.pageBackground} ${LAYOUT.pageLayout}`}>
      <ContentPageHeader />

      <main className={`${LAYOUT.maxWidth} mx-auto ${LAYOUT.containerPadding} ${LAYOUT.contentSpacing} flex-1`}>
        <div className={TYPOGRAPHY.sectionMargin}>
          <h1 className={`${TYPOGRAPHY.pageTitle} ${TYPOGRAPHY.titleMargin}`}>
            Contact Us
          </h1>
          <p className={TYPOGRAPHY.pageDescription}>
            Have questions, feedback, or need assistance? Reach out to the
            WorkflowGuard team through the options below. We're here to help!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <PageSection title="Send Us a Message" variant="card">
            <div className="space-y-6">
              <div>
                <Label htmlFor="full-name" className="text-sm font-medium text-gray-700">
                  Full Name
                </Label>
                <Input
                  id="full-name"
                  placeholder="Your Full Name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Your Email Address"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="subject" className="text-sm font-medium text-gray-700">
                  Subject
                </Label>
                <Select
                  value={formData.subject}
                  onValueChange={(value) => handleInputChange("subject", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Inquiry</SelectItem>
                    <SelectItem value="technical">Technical Support</SelectItem>
                    <SelectItem value="billing">Billing Question</SelectItem>
                    <SelectItem value="feature">Feature Request</SelectItem>
                    <SelectItem value="bug">Bug Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="message" className="text-sm font-medium text-gray-700">
                  Message
                </Label>
                <Textarea
                  id="message"
                  placeholder="Tell us how we can help..."
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  className="mt-1 min-h-[120px] resize-none"
                />
              </div>

              <Button
                onClick={handleSendMessage}
                className={`w-full ${COLORS.primary} text-white py-3`}
              >
                Send Message
              </Button>
            </div>
          </PageSection>

          {/* Support Options */}
          <div className="space-y-8">
            {/* Email Support */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className={TYPOGRAPHY.subsectionTitle}>Email Support</h3>
                <p className={`${TYPOGRAPHY.bodyText} mb-2`}>
                  For detailed inquiries or attaching files, you can email us directly.
                </p>
                <a
                  href="mailto:contact@workflowguard.pro"
                  className={`text-sm ${COLORS.primaryText} hover:text-blue-700 font-medium`}
                >
                  contact@workflowguard.pro
                </a>
              </div>
            </div>

            {/* Help Center */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className={TYPOGRAPHY.subsectionTitle}>Help Center</h3>
                <p className={`${TYPOGRAPHY.bodyText} mb-2`}>
                  Find answers to common questions and comprehensive guides.
                </p>
                <button
                  onClick={() => navigate("/help")}
                  className={`text-sm ${COLORS.primaryText} hover:text-blue-700 font-medium`}
                >
                  Browse Articles
                </button>
              </div>
            </div>

            {/* Live Chat Support */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className={TYPOGRAPHY.subsectionTitle}>Live Chat Support</h3>
                <p className={`${TYPOGRAPHY.bodyText} mb-2`}>
                  Chat with our support team in real-time.
                </p>
                <button className={`text-sm ${COLORS.primaryText} hover:text-blue-700 font-medium`}>
                  Start Chat
                </button>
              </div>
            </div>

            {/* Business Hours */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className={TYPOGRAPHY.subsectionTitle}>Business Hours</h3>
                <p className={`${TYPOGRAPHY.bodyText} mb-1`}>
                  Monday - Friday, 9 AM - 5 PM EST
                </p>
                <p className={TYPOGRAPHY.helperText}>
                  Expected response time: Within 24 hours
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContactUs;

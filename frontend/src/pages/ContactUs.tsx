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
import TopNavigation from "@/components/TopNavigation";
import Footer from "@/components/Footer";
import { HelpCircle, Settings, Mail, MessageCircle, Clock } from "lucide-react";

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
    // Handle form submission logic here
    console.log("Sending message:", formData);
    // In a real app, this would call an API
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <TopNavigation />

      <main className="max-w-7xl mx-auto px-6 py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Contact Us
          </h1>
          <p className="text-gray-600 text-sm">
            Have questions, feedback, or need assistance? Reach out to the
            WorkflowGuard team through the options below. We're here to help!
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Contact Form */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Send Us a Message
            </h2>
            <div className="space-y-4">
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
                  placeholder="your.email@example.com"
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
                    <SelectValue placeholder="Select a subject" />
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
                  placeholder="Tell us how we can help you..."
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  className="mt-1 min-h-[120px]"
                />
              </div>

              <Button
                onClick={handleSendMessage}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                Send Message
              </Button>
            </div>
          </div>

          {/* Right Side - Contact Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Get in Touch
            </h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Email Support</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    support@workflowguard.pro
                  </p>
                  <p className="text-xs text-gray-500">
                    We typically respond within 24 hours
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Live Chat</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Available during business hours
                  </p>
                  <p className="text-xs text-gray-500">
                    Mon-Fri, 9 AM - 6 PM EST
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Response Times</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Priority support for Professional & Enterprise plans
                  </p>
                  <p className="text-xs text-gray-500">
                    Emergency issues: 2-4 hours
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Resources */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="font-medium text-gray-900 mb-4">Helpful Resources</h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start text-left"
                  onClick={() => navigate("/help-support")}
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Help & Support Center
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left"
                  onClick={() => navigate("/setup-guide")}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Setup Guide
                </Button>
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

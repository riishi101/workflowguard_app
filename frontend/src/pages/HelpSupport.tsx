import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import TopNavigation from "@/components/TopNavigation";
import Footer from "@/components/Footer";
import {
  Search,
  Link,
  RotateCcw,
  Users,
  MessageSquare,
  ChevronDown,
  FileText,
  Lightbulb,
  Rocket,
  AlertTriangle,
  Code,
  Activity,
  MessageCircle,
  Map,
  ExternalLink,
} from "lucide-react";

const HelpSupport = () => {
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  const popularTopics = [
    {
      icon: Link,
      title: "How to connect your HubSpot account",
      color: "text-blue-500",
    },
    {
      icon: RotateCcw,
      title: "Restoring a workflow to a previous state",
      color: "text-blue-500",
    },
    {
      icon: Users,
      title: "Managing user permissions",
      color: "text-blue-500",
    },
    {
      icon: MessageSquare,
      title: "Integrating with Slack",
      color: "text-blue-500",
    },
  ];

  const commonQuestions = [
    {
      id: "1",
      question: "How do I get started with WorkflowGuard?",
      answer:
        "Getting started with WorkflowGuard is easy! First, connect your HubSpot account, then select the workflows you want to protect. Our onboarding guide will walk you through each step.",
    },
    {
      id: "2",
      question: "Can I restore a workflow to a previous version?",
      answer:
        "Yes! WorkflowGuard automatically saves versions of your workflows. You can restore any previous version through the Workflow History page with just a few clicks.",
    },
    {
      id: "3",
      question: "What integrations are currently supported?",
      answer:
        "WorkflowGuard currently supports HubSpot workflows, Slack notifications, and webhook integrations. We're continuously adding new integrations based on user feedback.",
    },
    {
      id: "4",
      question: "How does billing work for team accounts?",
      answer:
        "Team billing is based on the number of workflows monitored and team members. You can add or remove team members at any time, and billing is prorated automatically.",
    },
    {
      id: "5",
      question: "Is my data secure with WorkflowGuard?",
      answer:
        "Absolutely! We use enterprise-grade security with encrypted data transmission, secure storage, and regular security audits. Your workflow data is never shared with third parties.",
    },
  ];

  const documentationCards = [
    {
      icon: FileText,
      title: "User Manual",
      description:
        "Complete step-by-step guide to using all WorkflowGuard features.",
      color: "text-blue-500",
    },
    {
      icon: Lightbulb,
      title: "Feature Spotlights",
      description:
        "In-depth tutorials highlighting specific features and capabilities.",
      color: "text-blue-500",
    },
    {
      icon: Rocket,
      title: "Advanced Use Cases",
      description: "Real-world examples and complex workflow implementations.",
      color: "text-blue-500",
    },
    {
      icon: AlertTriangle,
      title: "Troubleshooting",
      description:
        "Common issues and their solutions to keep your workflows running smoothly.",
      color: "text-blue-500",
    },
    {
      icon: Code,
      title: "API Docs",
      description:
        "Technical documentation for developers integrating with our API.",
      color: "text-blue-500",
    },
  ];

  const connectSections = [
    {
      icon: Activity,
      title: "System Status",
      description:
        "Check real-time status of all WorkflowGuard services and get updates on any ongoing issues.",
      link: "View Status",
    },
    {
      icon: MessageCircle,
      title: "Community Forum",
      description:
        "Join discussions, share tips, and get help from other WorkflowGuard users and experts.",
      link: "Join Forum",
    },
    {
      icon: Map,
      title: "Feature Request & Roadmap",
      description:
        "Submit feature requests, vote on upcoming features, and see what's planned for WorkflowGuard.",
      link: "View Roadmap",
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <TopNavigation />

      <main className="max-w-6xl mx-auto px-6 py-8 flex-1">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Help & Support Center
          </h1>
          <p className="text-gray-600 text-sm">
            Find answers to your questions, explore tutorials, and connect with
            our support team
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-12">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search for articles, topics, or FAQs..."
            className="pl-10 py-3 text-base"
          />
        </div>

        {/* Popular Topics */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Popular Topics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {popularTopics.map((topic, index) => {
              const IconComponent = topic.icon;
              return (
                <Card
                  key={index}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <IconComponent
                        className={`w-5 h-5 ${topic.color} flex-shrink-0`}
                      />
                      <span className="text-sm font-medium text-gray-900">
                        {topic.title}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Common Questions */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Common Questions
          </h2>
          <div className="space-y-3">
            {commonQuestions.map((question) => (
              <Collapsible
                key={question.id}
                open={openQuestion === question.id}
                onOpenChange={(isOpen) =>
                  setOpenQuestion(isOpen ? question.id : null)
                }
              >
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="text-sm font-medium text-gray-900 text-left">
                      {question.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-500 transition-transform ${
                        openQuestion === question.id ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 py-3 text-sm text-gray-600 bg-gray-50 border-l border-r border-b border-gray-200 rounded-b-lg">
                    {question.answer}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </div>

        {/* Comprehensive Guides & Documentation */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Comprehensive Guides & Documentation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documentationCards.map((card, index) => {
              const IconComponent = card.icon;
              return (
                <Card
                  key={index}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <IconComponent
                        className={`w-6 h-6 ${card.color} flex-shrink-0 mt-1`}
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {card.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {card.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Stay Informed & Connect */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Stay Informed & Connect
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {connectSections.map((section, index) => {
              const IconComponent = section.icon;
              return (
                <div key={index} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-5 h-5 text-blue-500" />
                    <h3 className="font-semibold text-gray-900">
                      {section.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600">{section.description}</p>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-blue-600 font-medium text-sm"
                  >
                    {section.link}
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HelpSupport;

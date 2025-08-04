import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PlaceholderProps {
  title: string;
  description?: string;
}

export default function Placeholder({ title, description }: PlaceholderProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Workflow History
              </Button>
              <div className="h-6 border-l border-gray-300" />
              <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-medium text-gray-900">
              {title}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {description ||
                "This page is coming soon. Continue prompting to build out this functionality."}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <div className="w-8 h-8 bg-gray-300 rounded animate-pulse" />
              </div>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Continue chatting with me to add the specific functionality and
                content for this page.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

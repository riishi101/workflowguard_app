import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ApiService } from '@/lib/api';

interface WhatsAppSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WhatsAppSupportModal: React.FC<WhatsAppSupportModalProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [step, setStep] = useState<'form' | 'instructions' | 'success'>('form');

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast({
        title: "Message Required",
        description: "Please enter your support request message.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const response = await ApiService.sendWhatsAppSupport(message, phoneNumber || undefined);
      
      if (response.success) {
        setStep('instructions');
        toast({
          title: "Support Request Sent",
          description: "Your message has been sent to our support team via WhatsApp.",
        });
      } else {
        toast({
          title: "Failed to Send",
          description: response.message || "Failed to send WhatsApp message.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send support request.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setMessage('');
    setPhoneNumber('');
    setStep('form');
    onClose();
  };

  const renderForm = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
        <MessageSquare className="w-5 h-5 text-blue-600" />
        <div>
          <h4 className="font-medium text-blue-900">WhatsApp Support</h4>
          <p className="text-sm text-blue-700">Send your support request directly to our team via WhatsApp</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Support Message *
          </label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your issue or question in detail..."
            className="min-h-[120px]"
            maxLength={1000}
          />
          <p className="text-xs text-gray-500 mt-1">{message.length}/1000 characters</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your WhatsApp Number (Optional)
          </label>
          <Input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+1234567890"
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            Include your WhatsApp number to receive direct replies
          </p>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          onClick={handleSendMessage}
          disabled={isSending || !message.trim()}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
        >
          {isSending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Sending...
            </>
          ) : (
            <>
              <MessageSquare className="w-4 h-4 mr-2" />
              Send via WhatsApp
            </>
          )}
        </Button>
        <Button variant="outline" onClick={handleClose}>
          Cancel
        </Button>
      </div>
    </div>
  );

  const renderInstructions = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <div>
          <h4 className="font-medium text-green-900">Message Sent Successfully!</h4>
          <p className="text-sm text-green-700">Your support request has been forwarded to our team</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">To continue the conversation:</h4>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>1. Save this number: <strong>+1 (415) 523-8886</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span>2. Send "join grown-settlers" to activate the chat</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>3. Then you can chat directly with our support team!</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">What happens next?</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Our support team will receive your message immediately</li>
            <li>• You'll get a response within 2-4 hours during business hours</li>
            <li>• For urgent issues, follow the WhatsApp setup above for instant chat</li>
          </ul>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          onClick={() => setStep('success')}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Open WhatsApp Chat
        </Button>
        <Button variant="outline" onClick={handleClose}>
          Done
        </Button>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="space-y-6 text-center">
      <div className="flex items-center justify-center gap-3 p-6 bg-green-50 rounded-lg">
        <CheckCircle className="w-8 h-8 text-green-600" />
        <div>
          <h4 className="text-lg font-medium text-green-900">All Set!</h4>
          <p className="text-sm text-green-700">You can now chat with our support team on WhatsApp</p>
        </div>
      </div>

      <div className="p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          Your support request has been sent and our team will respond shortly. 
          You can continue the conversation directly on WhatsApp for faster support.
        </p>
      </div>

      <Button onClick={handleClose} className="w-full">
        Close
      </Button>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-600" />
            WhatsApp Support
          </DialogTitle>
        </DialogHeader>
        
        {step === 'form' && renderForm()}
        {step === 'instructions' && renderInstructions()}
        {step === 'success' && renderSuccess()}
      </DialogContent>
    </Dialog>
  );
};

export default WhatsAppSupportModal;

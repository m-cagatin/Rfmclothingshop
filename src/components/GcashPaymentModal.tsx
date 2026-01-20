import { X, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { toast } from 'sonner';

interface GcashPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  paymentType: 'partial' | 'full';
  orderId: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  orderItems: Array<{
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
  }>;
  total?: number;
  onPaymentSubmitted?: (orderId: string) => void;
}

export function GcashPaymentModal({
  isOpen,
  onClose,
  amount,
  paymentType,
  orderId,
  customerInfo,
  orderItems,
  total,
  onPaymentSubmitted,
}: GcashPaymentModalProps) {
  const [copied, setCopied] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [referenceError, setReferenceError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // GCash QR code image path
  const qrCodeImage = '/gcash-qr-code.png';

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handlePaymentSubmitted = async () => {
    // Validate reference number
    if (!referenceNumber.trim()) {
      setReferenceError('Reference number is required');
      return;
    }
    
    setReferenceError('');
    setIsSubmitting(true);

    try {
      // Get API base URL from environment or use default
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
      
      // Prepare order items with subtotal
      const orderItemsWithSubtotal = orderItems.map(item => ({
        ...item,
        subtotal: item.unitPrice * item.quantity,
      }));

      // Submit payment to backend
      const response = await fetch(`${API_BASE}/api/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          amount,
          paymentType,
          referenceNumber: referenceNumber.trim(),
          total: total || amount,
          customerInfo,
          orderItems: orderItemsWithSubtotal,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Payment submission failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Success - notify parent and close
      toast.success('Payment submitted successfully! Waiting for verification.');
      
      if (onPaymentSubmitted) {
        onPaymentSubmitted(orderId);
      }
      onClose();
    } catch (error: any) {
      console.error('Payment submission error:', error);
      setReferenceError(error.message || 'Failed to submit payment. Please try again.');
      toast.error(error.message || 'Failed to submit payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReferenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReferenceNumber(e.target.value);
    if (referenceError && e.target.value.trim()) {
      setReferenceError('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-md max-h-[85vh] flex flex-col p-0 gap-0"
        aria-describedby="gcash-payment-description"
      >
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b">
          <DialogTitle className="text-lg font-bold">GCash Payment</DialogTitle>
          <DialogDescription id="gcash-payment-description" className="text-xs">
            Scan the QR code to complete your payment
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="px-6 space-y-4 overflow-y-auto flex-1 min-h-0 py-4 pb-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400" style={{ maxHeight: 'calc(85vh - 180px)' }}>
          {/* Order Info */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-gray-700">Order ID:</span>
              <div className="flex items-center space-x-1.5">
                <span className="font-semibold text-sm text-gray-900">{orderId}</span>
                <button
                  onClick={() => handleCopy(orderId)}
                  className="p-1 hover:bg-white/50 rounded transition-colors"
                  title="Copy Order ID"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-green-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-gray-600" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-gray-700">Amount:</span>
              <span className="text-xl font-bold text-gray-900">₱{amount.toFixed(2)}</span>
            </div>
            {paymentType === 'partial' && (
              <Badge className="mt-2 text-xs bg-orange-100 text-orange-700 border-orange-200">
                Partial Payment
              </Badge>
            )}
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center">
            <div className="border-2 border-gray-300 rounded-lg p-3 bg-white shadow-md">
              <img
                src={qrCodeImage}
                alt="GCash QR Code"
                className="w-48 h-48 object-contain mx-auto"
                onError={(e) => {
                  // Fallback if image doesn't exist
                  (e.target as HTMLImageElement).src =
                    'https://via.placeholder.com/192x192?text=GCash+QR+Code';
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Scan with GCash app
            </p>
          </div>

          {/* Order Items - Compact */}
          {orderItems.length > 0 && orderItems.length <= 3 && (
            <div className="border-t pt-3 pb-2">
              <h3 className="font-semibold mb-2 text-sm text-gray-900">Items ({orderItems.length}):</h3>
              <div className="space-y-1">
                {orderItems.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-xs">
                    <span className="text-gray-600 truncate flex-1">
                      {item.productName} <span className="text-gray-400">×{item.quantity}</span>
                    </span>
                    <span className="font-medium text-gray-900 ml-2">
                      ₱{(item.unitPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reference Number Input */}
          <div className="border-t pt-3 pb-2">
            <Label htmlFor="reference-number" className="text-sm font-semibold text-gray-900 mb-2 block">
              Reference Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="reference-number"
              type="text"
              placeholder="Enter GCash reference number"
              value={referenceNumber}
              onChange={handleReferenceChange}
              required
              className={`h-9 text-sm ${referenceError ? 'border-red-500 focus-visible:border-red-500' : ''}`}
            />
            {referenceError && (
              <p className="text-xs text-red-500 mt-1">{referenceError}</p>
            )}
          </div>
        </div>

        {/* Fixed Action Buttons */}
        <div className="px-6 pb-6 pt-4 border-t bg-white flex gap-2 flex-shrink-0">
          <Button variant="outline" onClick={onClose} className="flex-1 h-10 text-sm font-medium">
            Cancel
          </Button>
          <Button
            onClick={handlePaymentSubmitted}
            disabled={isSubmitting}
            className="flex-1 h-10 text-sm font-medium bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Payment'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


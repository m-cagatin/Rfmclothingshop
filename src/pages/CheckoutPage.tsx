import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { Truck, ShieldCheck, ArrowLeft, Smartphone, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { CartItem } from '../components/CartDrawer';
import { GcashPaymentModal } from '../components/GcashPaymentModal';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { useAuth } from '../contexts/AuthContext';

interface CheckoutPageProps {
  cartItems: CartItem[];
  onClearCart: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
}

export function CheckoutPage({ cartItems, onClearCart }: CheckoutPageProps) {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const [paymentType, setPaymentType] = useState<'partial' | 'full'>('full');
  const [partialAmount, setPartialAmount] = useState<number>(0);
  const [isGcashModalOpen, setIsGcashModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [emailError, setEmailError] = useState<string>('');
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zip: '',
  });

  // Auto-fill form from logged-in user data
  useEffect(() => {
    if (isLoggedIn && user) {
      const nameParts = (user.name || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      setFormData(prev => ({
        ...prev,
        firstName: prev.firstName || firstName,
        lastName: prev.lastName || lastName,
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [isLoggedIn, user]);

  // Calculate totals - handle empty cart
  const subtotal = (cartItems || []).reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 1000 ? 0 : 50;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;
  
  // Calculate payment amount based on payment type
  const paymentAmount = paymentType === 'full' ? total : partialAmount;
  const remainingBalance = paymentType === 'partial' ? total - partialAmount : 0;
  const minPartialAmount = total * 0.5; // 50% minimum

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    // Clear email error when user types
    if (id === 'email') {
      setEmailError('');
    }
  };

  // Validate email on blur - check if it belongs to another user
  const handleEmailBlur = async () => {
    if (!formData.email) return;
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
      const response = await fetch(`${API_BASE}/api/orders/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: formData.email }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.taken) {
          setEmailError(data.message || 'This email is registered to another account');
        } else {
          setEmailError('');
        }
      }
    } catch {
      // Silently fail - don't block checkout for network issues
    }
  };


  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Validate form data
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
        toast.error('Please fill in all required fields');
        setIsProcessing(false);
        return;
      }

      // Block if email belongs to another account
      if (emailError) {
        toast.error(emailError);
        setIsProcessing(false);
        return;
      }

      // Validate payment type
      if (paymentType === 'partial') {
        if (!partialAmount || partialAmount < minPartialAmount) {
          toast.error(`Partial payment must be at least ₱${minPartialAmount.toFixed(2)} (50% of total)`);
          setIsProcessing(false);
          return;
        }
        if (partialAmount >= total) {
          toast.error('Partial payment amount cannot exceed total amount. Please select Full Payment.');
          setIsProcessing(false);
          return;
        }
      }

      // GCash is the only payment method - open modal
      setIsProcessing(false);
      setIsGcashModalOpen(true);
    } catch (error: any) {
      console.error('Payment error:', error);
      setIsProcessing(false);
      toast.error(error.message || 'Payment failed. Please try again.');
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="mb-4">Your cart is empty</h2>
        <p className="text-gray-600 mb-6">Add some items to your cart to checkout</p>
        <Button onClick={() => navigate('/')}>Continue Shopping</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={() => navigate('/')}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 size-4" />
        Back to Shop
      </Button>

      <h1 className="mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmitOrder} className="space-y-8">
            {/* Shipping Information */}
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                <Truck className="size-5" />
                <h3>Shipping Information</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" required placeholder="John" value={formData.firstName} onChange={handleInputChange} />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" required placeholder="Doe" value={formData.lastName} onChange={handleInputChange} />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    required 
                    placeholder="john@example.com" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    onBlur={handleEmailBlur}
                    className={emailError ? 'border-red-500' : ''}
                  />
                  {emailError && (
                    <p className="text-xs text-red-500 mt-1">{emailError}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input id="address" required placeholder="123 Main St" value={formData.address} onChange={handleInputChange} />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" required placeholder="New York" value={formData.city} onChange={handleInputChange} />
                </div>
                <div>
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input id="zip" required placeholder="10001" value={formData.zip} onChange={handleInputChange} />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" required placeholder="+1 (555) 000-0000" value={formData.phone} onChange={handleInputChange} />
                </div>
              </div>
            </div>

            {/* Payment Type Selection */}
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                <CreditCard className="size-5" />
                <h3>Payment Type</h3>
              </div>

              <RadioGroup value={paymentType} onValueChange={(value) => {
                setPaymentType(value as 'partial' | 'full');
                if (value === 'full') {
                  setPartialAmount(0);
                } else {
                  setPartialAmount(minPartialAmount);
                }
              }} className="space-y-3">
                <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="full" id="full" />
                  <Label htmlFor="full" className="flex-1 cursor-pointer">
                    <div>
                      <div className="font-medium">Full Payment</div>
                      <div className="text-sm text-gray-500">Pay the full amount: ₱{total.toFixed(2)}</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="partial" id="partial" />
                  <Label htmlFor="partial" className="flex-1 cursor-pointer">
                    <div>
                      <div className="font-medium">Partial Payment / Downpayment</div>
                      <div className="text-sm text-gray-500">Minimum 50%: ₱{minPartialAmount.toFixed(2)}</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>

              {/* Partial Payment Amount Input */}
              {paymentType === 'partial' && (
                <div className="mt-6 space-y-4">
                  <div>
                    <Label htmlFor="partialAmount">Payment Amount</Label>
                    <Input
                      id="partialAmount"
                      type="number"
                      min={minPartialAmount}
                      max={total}
                      step="0.01"
                      value={partialAmount || ''}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        if (value >= minPartialAmount && value <= total) {
                          setPartialAmount(value);
                        } else if (value > total) {
                          setPartialAmount(total);
                        } else {
                          setPartialAmount(value);
                        }
                      }}
                      placeholder={`Minimum: ₱${minPartialAmount.toFixed(2)}`}
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum: ₱{minPartialAmount.toFixed(2)} (50% of total)
                    </p>
                    {partialAmount > 0 && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Amount to Pay:</span>
                          <span className="font-semibold">₱{partialAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-gray-600">Remaining Balance:</span>
                          <span className="font-semibold text-orange-600">₱{remainingBalance.toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                <Smartphone className="size-5" />
                <h3>Payment Method</h3>
              </div>

              <div className="flex items-center space-x-3 border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-center size-10 rounded-full bg-blue-100">
                  <Smartphone className="size-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <Label className="text-lg font-medium cursor-pointer">GCash</Label>
                  <p className="text-sm text-gray-500">Pay via GCash QR code</p>
                </div>
                <Badge className="bg-green-100 text-green-700">Selected</Badge>
              </div>
            </div>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <ShieldCheck className="size-4 text-green-600" />
              <span>Your payment information is secure and encrypted</span>
            </div>


            {/* Place Order Button */}
            <Button 
              type="submit" 
              size="lg" 
              className="w-full bg-black text-white hover:bg-black/90 h-14"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : `Place Order - ₱${paymentAmount.toFixed(2)}`}
            </Button>
          </form>

          {/* GCash Payment Modal */}
          <GcashPaymentModal
            isOpen={isGcashModalOpen}
            onClose={() => setIsGcashModalOpen(false)}
            amount={paymentAmount}
            paymentType={paymentType}
            orderId={`ORD-${Date.now().toString().slice(-8)}`}
            customerInfo={{
              name: `${formData.firstName} ${formData.lastName}`,
              email: formData.email,
              phone: formData.phone,
              address: `${formData.address}, ${formData.city} ${formData.zip}`,
            }}
            orderItems={(cartItems || []).map(item => ({
              productId: parseInt(item.id) || 0,
              productName: item.name,
              quantity: item.quantity,
              unitPrice: item.price,
              subtotal: item.price * item.quantity,
              image: item.image,
              size: item.size,
              color: item.color,
              customizationData: item.customizationData,
            }))}
            total={total}
            onPaymentSubmitted={(orderId) => {
              // Store order in localStorage for tracking
              const order = {
                id: orderId,
                date: new Date().toISOString(),
                items: cartItems || [],
                subtotal,
                shipping,
                tax,
                total,
                paymentType,
                paymentAmount,
                remainingBalance,
                status: 'payment_pending',
                paymentMethod: 'gcash',
                customerInfo: {
                  firstName: formData.firstName,
                  lastName: formData.lastName,
                  email: formData.email,
                  phone: formData.phone,
                  address: formData.address,
                  city: formData.city,
                  zip: formData.zip,
                }
              };
              
              const orders = JSON.parse(localStorage.getItem('orders') || '[]');
              orders.push(order);
              localStorage.setItem('orders', JSON.stringify(orders));

              onClearCart();
              navigate(`/order-confirmation/${orderId}`);
            }}
          />
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border rounded-lg p-6 sticky top-4">
            <h3 className="mb-4">Order Summary</h3>
            
            {/* Cart Items */}
            <div className="space-y-4 mb-6">
              {(cartItems || []).map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="size-16 object-cover rounded"
                    />
                    <Badge className="absolute -top-2 -right-2 size-6 flex items-center justify-center p-0">
                      {item.quantity}
                    </Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{item.name}</p>
                    <p className="text-sm text-gray-600">₱{item.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">₱{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            {/* Pricing Details */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>₱{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span>{shipping === 0 ? 'FREE' : `₱${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax (10%)</span>
                <span>₱{tax.toFixed(2)}</span>
              </div>
              
              <Separator className="my-2" />
              
              <div className="flex justify-between">
                <span>Total</span>
                <span>₱{total.toFixed(2)}</span>
              </div>
              {paymentType === 'partial' && (
                <>
                  <Separator className="my-2" />
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Payment Amount</span>
                    <span className="font-semibold">₱{paymentAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Remaining Balance</span>
                    <span className="font-semibold text-orange-600">₱{remainingBalance.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Free Shipping Banner */}
            {shipping > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-900">
                Add ₱{(1000 - subtotal).toFixed(2)} more for FREE shipping!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
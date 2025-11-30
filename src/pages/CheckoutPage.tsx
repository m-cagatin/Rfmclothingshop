import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { CreditCard, Truck, ShieldCheck, ArrowLeft, Smartphone, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { CartItem } from '../components/CartDrawer';
import { mockPaymentProcess, toCentavos } from '../services/paymongo';

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
  cardNumber: string;
  expiry: string;
  cvv: string;
}

export function CheckoutPage({ cartItems, onClearCart }: CheckoutPageProps) {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zip: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 1000 ? 0 : 50;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleCardNumberFormat = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\s/g, '');
    value = value.replace(/(\d{4})/g, '$1 ').trim();
    setFormData(prev => ({ ...prev, cardNumber: value }));
  };

  const handleExpiryFormat = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    setFormData(prev => ({ ...prev, expiry: value }));
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

      // Validate payment method specific fields
      if (paymentMethod === 'card') {
        if (!formData.cardNumber || !formData.expiry || !formData.cvv) {
          toast.error('Please fill in all card details');
          setIsProcessing(false);
          return;
        }

        // Basic card validation
        const cardNumber = formData.cardNumber.replace(/\s/g, '');
        if (cardNumber.length < 15 || cardNumber.length > 16) {
          toast.error('Invalid card number');
          setIsProcessing(false);
          return;
        }
      }

      // Convert amount to centavos (PayMongo requirement)
      const amountInCentavos = toCentavos(total);

      toast.info('Processing payment with PayMongo...');

      // Process payment based on selected method
      let paymentResult;

      if (paymentMethod === 'card') {
        // Process card payment
        const [expMonth, expYear] = formData.expiry.split('/');
        
        paymentResult = await mockPaymentProcess(
          amountInCentavos,
          'card',
          {
            card_number: formData.cardNumber.replace(/\s/g, ''),
            exp_month: parseInt(expMonth),
            exp_year: parseInt('20' + expYear),
            cvc: formData.cvv,
          }
        );
      } else if (paymentMethod === 'gcash') {
        // Process GCash payment
        paymentResult = await mockPaymentProcess(amountInCentavos, 'gcash');
        toast.info('Redirecting to GCash...');
      } else if (paymentMethod === 'paymaya') {
        // Process PayMaya payment
        paymentResult = await mockPaymentProcess(amountInCentavos, 'paymaya');
        toast.info('Redirecting to PayMaya...');
      } else if (paymentMethod === 'grab_pay') {
        // Process GrabPay payment
        paymentResult = await mockPaymentProcess(amountInCentavos, 'grab_pay');
        toast.info('Redirecting to GrabPay...');
      } else {
        // Cash on Delivery
        paymentResult = {
          success: true,
          paymentIntentId: `cod_${Date.now()}`,
          message: 'Order placed with Cash on Delivery'
        };
      }

      if (paymentResult.success) {
        // Generate order ID
        const orderId = `ORD-${Date.now().toString().slice(-8)}`;
        
        // Store order in localStorage for tracking
        const order = {
          id: orderId,
          date: new Date().toISOString(),
          items: cartItems,
          subtotal,
          shipping,
          tax,
          total,
          status: 'processing',
          paymentMethod: paymentMethod,
          paymentIntentId: paymentResult.paymentIntentId,
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

        setIsProcessing(false);
        onClearCart();
        toast.success('Payment successful! Order placed.');
        navigate(`/order-confirmation/${orderId}`);
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setIsProcessing(false);
      toast.error(error.message || 'Payment failed. Please try again.');
    }
  };

  if (cartItems.length === 0) {
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
                  <Input id="firstName" required placeholder="John" onChange={handleInputChange} />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" required placeholder="Doe" onChange={handleInputChange} />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required placeholder="john@example.com" onChange={handleInputChange} />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input id="address" required placeholder="123 Main St" onChange={handleInputChange} />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" required placeholder="New York" onChange={handleInputChange} />
                </div>
                <div>
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input id="zip" required placeholder="10001" onChange={handleInputChange} />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" required placeholder="+1 (555) 000-0000" onChange={handleInputChange} />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                <CreditCard className="size-5" />
                <h3>Payment Method</h3>
              </div>

              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex-1 cursor-pointer">
                    Credit / Debit Card
                  </Label>
                  <div className="flex gap-2">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" className="h-6" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
                  </div>
                </div>
                <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="paypal" id="paypal" />
                  <Label htmlFor="paypal" className="flex-1 cursor-pointer">
                    PayPal
                  </Label>
                </div>
                <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="cod" id="cod" />
                  <Label htmlFor="cod" className="flex-1 cursor-pointer">
                    Cash on Delivery
                  </Label>
                </div>
                <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="gcash" id="gcash" />
                  <Label htmlFor="gcash" className="flex-1 cursor-pointer">
                    GCash
                  </Label>
                  <Smartphone className="size-4 text-gray-500" />
                </div>
                <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="paymaya" id="paymaya" />
                  <Label htmlFor="paymaya" className="flex-1 cursor-pointer">
                    PayMaya
                  </Label>
                  <Wallet className="size-4 text-gray-500" />
                </div>
                <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="grab_pay" id="grab_pay" />
                  <Label htmlFor="grab_pay" className="flex-1 cursor-pointer">
                    GrabPay
                  </Label>
                  <Wallet className="size-4 text-gray-500" />
                </div>
              </RadioGroup>

              {/* Card Details */}
              {paymentMethod === 'card' && (
                <div className="mt-6 space-y-4">
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input 
                      id="cardNumber" 
                      required 
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      onChange={handleCardNumberFormat}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input 
                        id="expiry" 
                        required 
                        placeholder="MM/YY"
                        maxLength={5}
                        onChange={handleExpiryFormat}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input 
                        id="cvv" 
                        required 
                        placeholder="123"
                        maxLength={3}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <ShieldCheck className="size-4 text-green-600" />
              <span>Your payment information is secure and encrypted</span>
            </div>

            {/* PayMongo Badge */}
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="flex items-center justify-center gap-2 text-sm">
                <span>💳 Secure payments powered by <strong>PayMongo</strong></span>
              </AlertDescription>
            </Alert>

            {/* Place Order Button */}
            <Button 
              type="submit" 
              size="lg" 
              className="w-full bg-black text-white hover:bg-black/90 h-14"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : `Place Order - ₹${total.toFixed(2)}`}
            </Button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border rounded-lg p-6 sticky top-4">
            <h3 className="mb-4">Order Summary</h3>
            
            {/* Cart Items */}
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
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
                    <p className="text-sm text-gray-600">₹{item.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            {/* Pricing Details */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span>{shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax (10%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              
              <Separator className="my-2" />
              
              <div className="flex justify-between">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Free Shipping Banner */}
            {shipping > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-900">
                Add ₹{(1000 - subtotal).toFixed(2)} more for FREE shipping!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
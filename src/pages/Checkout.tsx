import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { CartSheet } from '@/components/CartSheet';
import { TransactionOTPModal } from '@/components/TransactionOTPModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useGeofraud } from '@/hooks/useGeofraud';
import { ShoppingBag, CreditCard, Truck, Shield, Loader2, Smartphone, Banknote } from 'lucide-react';
import { formatCurrency } from '@/lib/formatCurrency';
import { triggerAntiGravityDelivery } from '@/services/antiGravity';

const Checkout = () => {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const { logTransaction, captureGeolocation, getRiskMetadata } = useGeofraud();
  const navigate = useNavigate();

  const [isProcessing, setIsProcessing] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'cod'>('card');
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    upiId: '',
    name: user?.name || '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Capture geolocation for FraudX
    await captureGeolocation();

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Show OTP modal for transaction verification
    setShowOTPModal(true);
    setIsProcessing(false);
  };

  const handleOTPVerify = async (_code: string): Promise<boolean> => {
    // OTP has already been verified by the modal against the Twilio backend.
    // This callback handles post-verification logic (FraudX + navigation).

    // Log successful transaction to FraudX
    const transaction = logTransaction({
      type: 'purchase',
      orderId: `ORD-${Date.now()}`,
      amount: total,
      paymentMethod,
      items: items.map((i) => ({
        productId: i.product.id,
        name: i.product.name,
        quantity: i.quantity,
        price: i.product.price,
        category: i.product.category,
      })),
      riskMetadata: getRiskMetadata(),
      timestamp: Date.now(),
    });

    console.log('[FraudX] Transaction completed:', transaction);

    // Trigger AntiGravity Delivery System
    const fullAddress = `${formData.street}, ${formData.city}, ${formData.state} ${formData.zipCode}`;
    triggerAntiGravityDelivery(fullAddress);

    // Clear cart and redirect
    clearCart();
    navigate('/dashboard/orders?success=true');
    return true;
  };

  // Calculate tax (18% GST for India)
  const taxRate = 0.18;
  const taxAmount = total * taxRate;
  const grandTotal = total + taxAmount;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <CartSheet />
        <div className="container py-20 text-center">
          <div className="h-16 w-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Add items to continue to checkout</p>
          <Button onClick={() => navigate('/')} className="gradient-primary border-0">
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartSheet />
      <TransactionOTPModal
        open={showOTPModal}
        onOpenChange={setShowOTPModal}
        onVerify={handleOTPVerify}
        amount={grandTotal}
        phone={formData.phone}
      />

      <div className="container py-8">
        <h1 className="text-2xl font-semibold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handlePlaceOrder}>
              {/* Shipping */}
              <Card className="mb-6 border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Truck className="h-5 w-5 text-primary" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">PIN Code</Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method Selection */}
              <Card className="mb-6 border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(value) => setPaymentMethod(value as 'card' | 'upi' | 'cod')}
                    className="space-y-3"
                  >
                    {/* Card Option */}
                    <div className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-border/50'}`}>
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
                        <CreditCard className="h-4 w-4" />
                        Credit/Debit Card
                      </Label>
                    </div>

                    {/* UPI Option */}
                    <div className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors ${paymentMethod === 'upi' ? 'border-primary bg-primary/5' : 'border-border/50'}`}>
                      <RadioGroupItem value="upi" id="upi" />
                      <Label htmlFor="upi" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Smartphone className="h-4 w-4" />
                        UPI
                      </Label>
                    </div>

                    {/* Cash on Delivery Option */}
                    <div className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-border/50'}`}>
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Banknote className="h-4 w-4" />
                        Cash on Delivery
                      </Label>
                    </div>
                  </RadioGroup>

                  {/* Card Details (shown only when card is selected) */}
                  {paymentMethod === 'card' && (
                    <div className="space-y-4 pt-4 border-t border-border/50">
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          name="cardNumber"
                          placeholder="4242 4242 4242 4242"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          required={paymentMethod === 'card'}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiry">Expiry Date</Label>
                          <Input
                            id="expiry"
                            name="expiry"
                            placeholder="MM/YY"
                            value={formData.expiry}
                            onChange={handleInputChange}
                            required={paymentMethod === 'card'}
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            name="cvv"
                            placeholder="123"
                            value={formData.cvv}
                            onChange={handleInputChange}
                            required={paymentMethod === 'card'}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* UPI Details (shown only when UPI is selected) */}
                  {paymentMethod === 'upi' && (
                    <div className="space-y-4 pt-4 border-t border-border/50">
                      <div>
                        <Label htmlFor="upiId">UPI ID</Label>
                        <Input
                          id="upiId"
                          name="upiId"
                          placeholder="yourname@upi"
                          value={formData.upiId}
                          onChange={handleInputChange}
                          required={paymentMethod === 'upi'}
                        />
                      </div>
                    </div>
                  )}

                  {/* COD Info */}
                  {paymentMethod === 'cod' && (
                    <div className="pt-4 border-t border-border/50">
                      <p className="text-sm text-muted-foreground">
                        Pay with cash when your order is delivered. Please keep exact change ready.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Button
                type="submit"
                className="w-full gradient-primary border-0 text-primary-foreground"
                size="lg"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Place Order - {formatCurrency(grandTotal)}
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24 border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-3">
                    <div className="h-14 w-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium">
                      {formatCurrency(item.product.price * item.quantity)}
                    </p>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-primary">Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">GST (18%)</span>
                    <span>{formatCurrency(taxAmount)}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(grandTotal)}</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Protected by FraudX verification
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

import React, { useState } from 'react';
import { ShieldCheck, Calendar, Lock, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { CartItem, Order } from '../types';

interface CheckoutFormProps {
  cart: CartItem[];
  cartDiscount: number;
  onBackToCart: () => void;
  onClearCart: () => void;
  onOrderSuccess: () => void;
  userToken: string;
}

export function CheckoutForm({
  cart,
  cartDiscount, // e.g. 0.1 for 10%
  onBackToCart,
  onClearCart,
  onOrderSuccess,
  userToken,
}: CheckoutFormProps) {
  // Shipping details state
  const [fullName, setFullName] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('United States');

  // Payment details state
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  // Execution state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  const cartSubtotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const discountAmount = cartSubtotal * cartDiscount;
  const cartTotal = Math.max(0, cartSubtotal - discountAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Validation
    if (!fullName || !street || !city || !state || !zipCode) {
      setError('Please fill in all shipping fields.');
      return;
    }

    if (paymentMethod === 'Credit Card') {
      if (!cardNumber || !cardExpiry || !cardCvc) {
        setError('Please enter complete card details.');
        return;
      }
      if (cardNumber.replace(/\s/g, '').length < 13) {
        setError('Please enter a valid credit card number.');
        return;
      }
    }

    setLoading(true);

    const payload = {
      items: cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      })),
      shippingAddress: {
        fullName,
        street,
        city,
        state,
        zipCode,
        country
      },
      paymentMethod
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Checkout process failed.');
      }

      setPlacedOrder(data);
      onClearCart();
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating order.');
    } finally {
      setLoading(false);
    }
  };

  // Render Order Success confirmation screen
  if (placedOrder) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center animate-fade-in" id="checkout-success-container">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 border border-green-150 text-green-500">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h2 className="mt-6 text-2xl font-sans font-bold tracking-tight text-zinc-900">Order Placed Successfully!</h2>
        <p className="mt-2 text-xs font-mono text-zinc-500" id="success-order-id">
          Reference ID: {placedOrder.id}
        </p>

        <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm text-left font-sans space-y-4">
          <h3 className="font-bold text-zinc-900 text-sm border-b border-zinc-100 pb-2">Order Breakdown</h3>
          <ul className="text-xs text-zinc-650 space-y-2.5">
            {placedOrder.items.map((item, idx) => (
              <li key={idx} className="flex justify-between items-center bg-zinc-50 rounded-xl p-2.5">
                <span className="font-medium text-zinc-900 leading-tight">
                  {item.productName} <span className="text-zinc-500 text-[10px]">x{item.quantity}</span>
                </span>
                <span className="font-mono text-zinc-900">${(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          
          <div className="pt-3 border-t border-zinc-100 text-xs font-sans space-y-2">
            <div className="flex justify-between">
              <span className="text-zinc-500">Shipping To</span>
              <span className="font-semibold text-zinc-900 text-right">{placedOrder.shippingAddress.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Payment Processed</span>
              <span className="font-mono text-zinc-900">{placedOrder.paymentMethod}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-zinc-50 items-baseline">
              <span className="font-bold text-zinc-900">Grand Total</span>
              <span className="font-extrabold text-lg text-zinc-900 font-sans">${placedOrder.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <p className="mt-6 text-sm text-zinc-500 max-w-sm mx-auto leading-relaxed">
          Your order has been recorded into our database. We are processing your package for immediate transport. Check your profile order menu.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={onOrderSuccess}
            className="rounded-xl bg-zinc-900 px-6 py-3 text-sm font-sans font-semibold tracking-tight text-white shadow-sm transition-transform hover:bg-zinc-800 active:scale-95"
            id="checkout-orders-history-btn"
          >
            Review Past Orders
          </button>
        </div>
      </div>
    );
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Format card input to split in groups of 4: "XXXX XXXX XXXX XXXX"
    const val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = val.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(' '));
    } else {
      setCardNumber(val);
    }
  };

  const handleCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Format card MM/YY expiry
    let val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length > 2) {
      val = `${val.substring(0, 2)}/${val.substring(2, 4)}`;
    }
    setCardExpiry(val);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8" id="checkout-form-container">
      
      {/* Back Link */}
      <button
        onClick={onBackToCart}
        className="mb-6 flex items-center gap-1.5 text-xs font-sans font-semibold text-zinc-650 hover:text-zinc-900 transition-colors"
        id="checkout-back-link"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Return to Shopping Cart</span>
      </button>

      <h1 className="text-3xl font-sans font-bold tracking-tight text-zinc-900 mb-8 border-b border-zinc-100 pb-5">Order Checkout</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start" id="checkout-form">
        
        {/* Left Columns - Form Entry (8/12) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Shipping Details */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-sans font-semibold text-zinc-900 border-b border-zinc-100 pb-2">1. Delivery Address</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-sans font-semibold text-zinc-700" htmlFor="shipping-name">Full Name</label>
                <input
                  type="text"
                  id="shipping-name"
                  placeholder="E.g., Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm tracking-tight text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900/10"
                  required
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-sans font-semibold text-zinc-700" htmlFor="shipping-street">Street Address</label>
                <input
                  type="text"
                  id="shipping-street"
                  placeholder="Apartment, suite, unit, building, floor, etc."
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm tracking-tight text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900/10"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-sans font-semibold text-zinc-700" htmlFor="shipping-city">City</label>
                <input
                  type="text"
                  id="shipping-city"
                  placeholder="New York"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm tracking-tight text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900/10"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-sans font-semibold text-zinc-700" htmlFor="shipping-state">State / Prov</label>
                  <input
                    type="text"
                    id="shipping-state"
                    placeholder="NY"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm tracking-tight text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900/10"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-sans font-semibold text-zinc-700" htmlFor="shipping-zip">Zip Code</label>
                  <input
                    type="text"
                    id="shipping-zip"
                    placeholder="10001"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm tracking-tight text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900/10"
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-sans font-semibold text-zinc-700" htmlFor="shipping-country">Country</label>
                <select
                  id="shipping-country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm font-sans tracking-tight text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900/10"
                >
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Germany">Germany</option>
                  <option value="Japan">Japan</option>
                  <option value="Australia">Australia</option>
                  <option value="India">India</option>
                </select>
              </div>
            </div>
          </div>

          {/* Payment details */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-sans font-semibold text-zinc-900 border-b border-zinc-100 pb-2">2. Payment details</h2>
            
            <div className="flex gap-3 grid grid-cols-1 sm:grid-cols-3">
              {['Credit Card', 'PayPal', 'Google Pay'].map((method) => (
                <label
                  key={method}
                  className={`flex items-center gap-3 rounded-xl border p-3.5 cursor-pointer transition-colors ${
                    paymentMethod === method
                      ? 'border-zinc-900 bg-zinc-50'
                      : 'border-zinc-200 hover:bg-zinc-50'
                  }`}
                  id={`paym-label-${method.toLowerCase().replace(' ', '')}`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="h-4 w-4 text-zinc-900 focus:ring-zinc-900"
                  />
                  <span className="text-xs font-sans font-semibold text-zinc-900 select-none">
                    {method}
                  </span>
                </label>
              ))}
            </div>

            {paymentMethod === 'Credit Card' && (
              <div className="space-y-4 border-t border-zinc-100 pt-4 animate-fade-in" id="card-panel-fields">
                <div className="space-y-1.5">
                  <label className="text-xs font-sans font-semibold text-zinc-700" htmlFor="cc-number">Card Number</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      id="cc-number"
                      placeholder="4000 1234 5678 9010"
                      maxLength={19}
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      className="w-full rounded-xl border border-zinc-200 py-2.5 pl-9 pr-4 text-sm tracking-tight text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900/10"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-sans font-semibold text-zinc-700" htmlFor="cc-expiry">Expiration Date</label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        id="cc-expiry"
                        placeholder="MM/YY"
                        maxLength={5}
                        value={cardExpiry}
                        onChange={handleCardExpiryChange}
                        className="w-full rounded-xl border border-zinc-200 py-2.5 pl-9 pr-4 text-sm tracking-tight text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900/10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-sans font-semibold text-zinc-700" htmlFor="cc-cvc">CVC Security Code</label>
                    <input
                      type="password"
                      id="cc-cvc"
                      placeholder="•••"
                      maxLength={4}
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm tracking-tight text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900/10"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod !== 'Credit Card' && (
              <div className="rounded-xl bg-zinc-50 p-4 border border-zinc-150 text-center" id="thirdparty-payment-panel">
                <p className="text-xs font-sans text-zinc-650 leading-relaxed">
                  Upon submission, you will be seamlessly redirected to complete your authentication via secure {paymentMethod} gateway channels.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Right Columns - Details / pricing widget (4/12) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Basket summary lists */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-sans font-bold text-zinc-900 border-b border-zinc-100 pb-2">Your goods</h3>
            
            <ul className="divide-y divide-zinc-50 max-h-[30vh] overflow-y-auto pr-1" id="checkout-sidebar-list">
              {cart.map((item) => (
                <li key={item.product.id} className="flex items-center gap-3.5 py-3">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="h-11 w-11 rounded-lg object-contain bg-zinc-55 border border-zinc-100 flex-shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 text-xs font-sans">
                    <h4 className="font-bold text-zinc-900 line-clamp-1">{item.product.name}</h4>
                    <span className="block text-zinc-500 font-mono mt-0.5">${item.product.price.toFixed(2)} x {item.quantity}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-zinc-900">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="border-t border-zinc-150 pt-4 space-y-2 text-xs font-sans text-zinc-650">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono text-zinc-900">${cartSubtotal.toFixed(2)}</span>
              </div>
              {cartDiscount > 0 && (
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>Applied Discount</span>
                  <span className="font-mono">-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping fee</span>
                <span className="text-green-650 font-bold uppercase">Free</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-zinc-100">
                <span className="font-bold text-zinc-900">Final Total Price</span>
                <span className="font-extrabold text-xl font-sans text-zinc-900">${cartTotal.toFixed(2)}</span>
              </div>
            </div>

            {error && (
              <p className="text-xs font-sans font-medium text-red-500 bg-red-50 border border-red-100 rounded-xl p-3" id="checkout-error-panel">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 text-sm font-sans font-semibold text-white shadow-sm transition-transform hover:bg-zinc-805 active:scale-[0.98] disabled:scale-100 disabled:opacity-65"
              id="checkout-submit-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing Checkout...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4.5 w-4.5" />
                  <span>Execute Order Placements</span>
                </>
              )}
            </button>
          </div>

        </div>

      </form>
    </div>
  );
}
export default CheckoutForm;

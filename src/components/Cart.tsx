import React, { useState } from 'react';
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus, ArrowLeft, Tag, Percent } from 'lucide-react';
import { CartItem, Product } from '../types';

interface CartProps {
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onContinueShopping: () => void;
  onProceedToCheckout: () => void;
  onTriggerAuth: () => void;
  userSignedIn: boolean;
}

export function Cart({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onContinueShopping,
  onProceedToCheckout,
  onTriggerAuth,
  userSignedIn,
}: CartProps) {
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [appliedCode, setAppliedCode] = useState('');

  const cartSubtotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const discountAmount = cartSubtotal * promoDiscount;
  const cartTotal = Math.max(0, cartSubtotal - discountAmount);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    const code = promoCode.trim().toUpperCase();

    if (code === 'SUMMER10') {
      setPromoDiscount(0.1);
      setAppliedCode('SUMMER10 (10% Off)');
      setPromoCode('');
    } else if (code === 'WELCOME20') {
      setPromoDiscount(0.2);
      setAppliedCode('WELCOME20 (20% Off)');
      setPromoCode('');
    } else if (code === '') {
      setPromoError('Please enter a valid promo code.');
    } else {
      setPromoError('Invalid promo code. Try WELCOME20 or SUMMER10.');
    }
  };

  const handleRemovePromo = () => {
    setPromoDiscount(0);
    setAppliedCode('');
  };

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center" id="empty-cart-container">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-50 border border-zinc-150 text-zinc-400">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h2 className="mt-6 text-xl font-sans font-bold tracking-tight text-zinc-900">Your shopping cart is empty</h2>
        <p className="mt-2 text-sm text-zinc-500 leading-relaxed max-w-md mx-auto">
          Explore our handpicked range of sleek minimalist office docks, ceramic drippers, and lifestyle items.
        </p>
        <button
          onClick={onContinueShopping}
          className="mt-8 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-sans font-semibold tracking-tight text-white shadow-sm transition-transform hover:bg-zinc-800 active:scale-95"
          id="cart-browse-btn"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" id="cart-loaded-container">
      {/* Title section */}
      <div className="mb-8 flex items-center justify-between border-b border-zinc-100 pb-5">
        <div>
          <h1 className="text-3xl font-sans font-bold tracking-tight text-zinc-900">Shopping Cart</h1>
          <p className="mt-1 text-xs text-zinc-500">You have {cart.length} unique items in your basket</p>
        </div>
        <button
          onClick={onContinueShopping}
          className="flex items-center gap-1.5 text-xs font-sans font-semibold text-zinc-650 hover:text-zinc-900 transition-colors"
          id="cart-back-link"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Continue Shopping</span>
        </button>
      </div>

      {/* Grid: Cart list on left (8/12), checkout box on right (4/12) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        
        {/* Left lists */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
            <ul className="divide-y divide-zinc-100" id="cart-items-list">
              {cart.map((item) => (
                <li key={item.product.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5" id={`cart-item-row-${item.product.id}`}>
                  
                  {/* Thumbnail and Title */}
                  <div className="flex gap-4 items-center">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="h-16 w-16 rounded-xl object-contain bg-zinc-50 border border-zinc-100 flex-shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">{item.product.category}</span>
                      <h3 className="font-sans text-sm font-bold text-zinc-900 mt-0.5 line-clamp-1">{item.product.name}</h3>
                      <p className="text-xs text-zinc-500 font-mono mt-0.5">${item.product.price.toFixed(2)} each</p>
                    </div>
                  </div>

                  {/* Quantity Actions & Price sums */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t border-zinc-50 sm:border-t-0 pt-3 sm:pt-0">
                    
                    {/* Controls */}
                    <div className="flex items-center border border-zinc-200 rounded-lg p-0.5 bg-zinc-50">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="flex h-7 w-7 items-center justify-center rounded text-zinc-500 hover:bg-white active:scale-90"
                        id={`cart-qty-dec-${item.product.id}`}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center font-sans font-semibold text-zinc-900 text-xs">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="flex h-7 w-7 items-center justify-center rounded text-zinc-500 hover:bg-white active:scale-90 disabled:opacity-40"
                        id={`cart-qty-inc-${item.product.id}`}
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Final Line Cost */}
                    <span className="font-sans text-sm font-bold text-zinc-900 min-w-[70px] text-right" id={`cart-item-subtotal-${item.product.id}`}>
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>

                    {/* Delete Item Button */}
                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="text-zinc-400 hover:text-red-650 p-1 rounded-md transition-colors hover:bg-red-50"
                      id={`cart-qty-dev-${item.product.id}`}
                      title="Remove goods"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Checkout Box */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Promocode box widget */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-sans font-bold tracking-tight uppercase text-zinc-400 flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" />
              <span>Have a Promo Code?</span>
            </h3>

            {appliedCode ? (
              <div className="flex items-center justify-between rounded-xl bg-green-50 border border-green-100 p-2.5 text-green-700 text-xs font-sans font-medium" id="cart-applied-promo">
                <div className="flex items-center gap-1.5">
                  <Percent className="h-4 w-4 text-green-500" />
                  <span>{appliedCode}</span>
                </div>
                <button
                  type="button"
                  onClick={handleRemovePromo}
                  className="text-green-600 hover:text-green-800 underline uppercase text-[10px]"
                  id="cart-remove-promo-btn"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <input
                  type="text"
                  placeholder="WELCOME20 or SUMMER10"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-xs font-sans tracking-tight text-zinc-900 placeholder-zinc-400 uppercase focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900/10"
                  id="promo-input"
                />
                <button
                  type="submit"
                  className="rounded-xl border border-zinc-950 px-4 py-2 text-xs font-sans font-semibold tracking-tight text-zinc-950 hover:bg-zinc-50 active:scale-95"
                  id="promo-submit-btn"
                >
                  Apply
                </button>
              </form>
            )}

            {promoError && (
              <p className="text-[10px] font-sans text-red-500 font-medium" id="promo-error-msg">
                {promoError}
              </p>
            )}
          </div>

          {/* Checkout Totals Summary Box */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-sans font-bold tracking-tight text-zinc-900">Order Summary</h3>
            
            <div className="space-y-2 border-b border-zinc-150 pb-4 text-xs font-sans text-zinc-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono text-zinc-900">${cartSubtotal.toFixed(2)}</span>
              </div>
              
              {promoDiscount > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Promo discount</span>
                  <span className="font-mono">-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-green-650 font-semibold uppercase">Free</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes</span>
                <span className="text-zinc-400 italic">Calculated at checkout</span>
              </div>
            </div>

            <div className="flex items-baseline justify-between pt-2">
              <span className="font-sans text-sm font-bold text-zinc-900">Estimated Total</span>
              <span className="font-sans text-xl font-extrabold text-zinc-900 tracking-tight" id="cart-total-price">
                ${cartTotal.toFixed(2)}
              </span>
            </div>

            {/* Check Sessions and proceed */}
            {userSignedIn ? (
              <button
                onClick={onProceedToCheckout}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 py-3 text-sm font-sans font-semibold text-white shadow-sm transition-transform hover:bg-zinc-800 active:scale-95"
                id="cart-checkout-btn"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={onTriggerAuth}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-zinc-300 py-3 text-sm font-sans font-semibold text-zinc-700 bg-zinc-50 transition-colors hover:bg-zinc-100"
                id="cart-signin-order-btn"
              >
                <span>Sign in to complete order</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

            <div className="text-center">
              <span className="text-[10px] text-zinc-400 font-sans">
                Secure 256-bit SSL encrypted shopping environment
              </span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
export default Cart;

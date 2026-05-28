import React, { useState, useEffect } from 'react';
import { X, Star, ShieldCheck, Heart, Truck, Undo2, Loader2, Minus, Plus, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export function ProductDetailsModal({ product, onClose, onAddToCart }: ProductDetailsModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [isWished, setIsWished] = useState(false);

  // Reset quantity when active product shifts
  useEffect(() => {
    setQuantity(1);
  }, [product]);

  if (!product) return null;

  const isOutOfStock = product.stock === 0;

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        {/* Backdrop filter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm"
          id="details-backdrop"
        />

        {/* Modal content body */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl max-h-[90vh] flex flex-col md:flex-row"
          id="details-modal-content"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 border border-zinc-250/20 text-zinc-500 shadow-sm backdrop-blur-sm hover:bg-white hover:text-zinc-800 transition-colors"
            id="details-close-btn"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Left part: Large image block */}
          <div className="w-full md:w-1/2 bg-zinc-50 flex items-center justify-center relative p-6 aspect-square md:aspect-auto">
            <img
              src={product.image}
              alt={product.name}
              className="max-h-full max-w-full object-contain rounded-lg"
              referrerPolicy="no-referrer"
              id="details-image"
            />
            <span className="absolute bottom-4 left-4 rounded-md bg-zinc-900 px-2.5 py-1 text-[10px] font-sans font-bold text-white uppercase tracking-wider">
              {product.category}
            </span>
          </div>

          {/* Right part: Details panel / settings scrollable */}
          <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col overflow-y-auto max-h-[50vh] md:max-h-[90vh]">
            <span className="font-mono text-xs text-zinc-400 tracking-wider">PREMIUM GOODS / SKU_ID: {product.id.substring(5).toUpperCase()}</span>
            <h2 className="mt-2 text-2xl font-sans font-bold tracking-tight text-zinc-900" id="details-title">
              {product.name}
            </h2>

            {/* Ratings, reviews, category */}
            <div className="mt-2.5 flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(product.rating)
                        ? 'fill-zinc-900 text-zinc-900'
                        : 'text-zinc-200'
                    }`}
                  />
                ))}
                <span className="ml-1 text-xs font-mono font-bold text-zinc-900">{product.rating}</span>
              </div>
              <span className="text-zinc-300">|</span>
              <span className="text-xs font-sans text-zinc-500 font-medium">{product.reviewsCount} verified reviews</span>
            </div>

            {/* Price tag */}
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-sans font-extrabold text-zinc-900 tracking-tight" id="details-price">
                ${product.price.toFixed(2)}
              </span>
              <span className="text-xs text-zinc-500">Free shipping included</span>
            </div>

            {/* Rich product description */}
            <div className="mt-5 border-t border-zinc-100 pt-5">
              <p className="font-sans text-sm leading-relaxed text-zinc-600">
                {product.description}
              </p>
            </div>

            {/* Specifications list */}
            {product.specs && product.specs.length > 0 && (
              <div className="mt-6">
                <h4 className="text-xs font-sans font-semibold tracking-tight uppercase text-zinc-400">Specifications</h4>
                <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans text-zinc-600">
                  {product.specs.map((spec, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-zinc-900 flex-shrink-0" />
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions: Quantity counter, Wishlist toggle, Shopping Add button */}
            <div className="mt-8 border-t border-zinc-100 pt-6 space-y-4">
              
              {/* Instock warnings */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans font-semibold text-zinc-700">Stock Availability:</span>
                {isOutOfStock ? (
                  <span className="text-xs font-sans font-bold text-red-650">Out of Stock</span>
                ) : product.stock <= 5 ? (
                  <span className="text-xs font-sans font-semibold text-amber-600">Only {product.stock} items left in stock</span>
                ) : (
                  <span className="text-xs font-sans font-semibold text-green-650">In Stock ({product.stock} available)</span>
                )}
              </div>

              {/* Counter interaction row */}
              {!isOutOfStock && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center rounded-xl border border-zinc-200 p-1 bg-zinc-50">
                    <button
                      onClick={handleDecrease}
                      disabled={quantity <= 1}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-white active:scale-90 disabled:opacity-40 disabled:hover:bg-transparent"
                      id="details-qty-dec"
                    >
                      <Minus className="h-4.5 w-4.5" />
                    </button>
                    <span className="w-12 text-center font-sans font-semibold text-zinc-900 text-sm">
                      {quantity}
                    </span>
                    <button
                      onClick={handleIncrease}
                      disabled={quantity >= product.stock}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-white active:scale-90 disabled:opacity-40 disabled:hover:bg-transparent"
                      id="details-qty-inc"
                    >
                      <Plus className="h-4.5 w-4.5" />
                    </button>
                  </div>

                  <span className="text-xs font-mono text-zinc-400">
                    Subtotal: ${(product.price * quantity).toFixed(2)}
                  </span>
                </div>
              )}

              {/* Footer buttons action */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    onAddToCart(product, quantity);
                    onClose();
                  }}
                  disabled={isOutOfStock}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 text-sm font-sans font-semibold text-white shadow-sm transition-transform hover:bg-zinc-805 active:scale-95 disabled:scale-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  id="details-add-btn"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>{isOutOfStock ? 'Sold Out' : `Add ${quantity} to Shopping Cart`}</span>
                </button>
                <button
                  onClick={() => setIsWished(!isWished)}
                  className={`flex h-12 w-12 items-center justify-center rounded-xl border transition-colors ${
                    isWished 
                      ? 'border-red-100 bg-red-50 text-red-500 hover:bg-red-100'
                      : 'border-zinc-200 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-650'
                  }`}
                  id="details-wish-btn"
                >
                  <Heart className={`h-5 w-5 ${isWished ? 'fill-red-500' : ''}`} />
                </button>
              </div>
            </div>

            {/* Trust and warranty tags list */}
            <div className="mt-6 border-t border-zinc-100 pt-5 grid grid-cols-3 gap-3 text-center text-[10px] font-sans text-zinc-500">
              <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-zinc-50">
                <ShieldCheck className="h-4 w-4 text-zinc-800" />
                <span className="font-semibold">2-Year Warranty</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-zinc-50">
                <Truck className="h-4 w-4 text-zinc-800" />
                <span className="font-semibold">Fast Delivery</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-zinc-50">
                <Undo2 className="h-4 w-4 text-zinc-800" />
                <span className="font-semibold">30-Day Returns</span>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
export default ProductDetailsModal;

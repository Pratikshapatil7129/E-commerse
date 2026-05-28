import React from 'react';
import { Star, ShieldAlert, ShoppingBag } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  key?: React.Key;
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart, onViewDetails }: ProductCardProps) {
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div 
      className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:border-zinc-300 hover:shadow-md"
      id={`product-card-${product.id}`}
    >
      {/* Product Image Section */}
      <div 
        className="relative aspect-square cursor-pointer overflow-hidden bg-zinc-150"
        onClick={() => onViewDetails(product)}
        id={`product-img-container-${product.id}`}
      >
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          referrerPolicy="no-referrer"
          id={`product-image-${product.id}`}
        />
        
        {/* Category Tag overlay */}
        <span className="absolute top-3 left-3 rounded-md bg-white/90 backdrop-blur-sm px-2 py-1 text-[10px] font-sans font-semibold tracking-tight text-zinc-900 border border-zinc-100 uppercase">
          {product.category}
        </span>

        {/* Low Stock overlay */}
        {isOutOfStock ? (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/40 backdrop-blur-[1px]">
            <span className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-sans font-bold text-white uppercase tracking-wider">
              Out of stock
            </span>
          </div>
        ) : isLowStock ? (
          <span className="absolute top-3 right-3 flex items-center gap-1 rounded-md bg-amber-500 px-2 py-1 text-[10px] font-sans font-semibold tracking-tight text-white shadow-sm">
            <ShieldAlert className="h-3 w-3" />
            <span>Only {product.stock} left</span>
          </span>
        ) : null}
      </div>

      {/* Details Section */}
      <div className="flex flex-1 flex-col p-4">
        <span className="font-mono text-[10px] uppercase text-zinc-400 tracking-wider">SKU: {product.id.slice(5).toUpperCase()}</span>
        <h3 
          onClick={() => onViewDetails(product)}
          className="mt-1 flex-1 font-sans text-sm font-semibold tracking-tight text-zinc-900 hover:text-zinc-600 line-clamp-1 cursor-pointer transition-colors"
          id={`product-title-${product.id}`}
        >
          {product.name}
        </h3>

        {/* Ratings details */}
        <div className="mt-1.5 flex items-center gap-1 text-zinc-400">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < Math.floor(product.rating)
                    ? 'fill-zinc-900 text-zinc-900'
                    : 'text-zinc-200'
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] font-mono text-zinc-500 font-medium">({product.reviewsCount})</span>
        </div>

        {/* Pricing and Action trigger */}
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-zinc-100 pt-3">
          <span className="font-sans text-base font-bold text-zinc-900 tracking-tight" id={`product-price-${product.id}`}>
            ${product.price.toFixed(2)}
          </span>
          <button
            onClick={() => onAddToCart(product)}
            disabled={isOutOfStock}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-sans font-semibold transition-all shadow-sm active:scale-95 ${
              isOutOfStock
                ? 'bg-zinc-100 text-zinc-450 cursor-not-allowed shadow-none'
                : 'bg-zinc-900 text-white hover:bg-zinc-800'
            }`}
            id={`product-add-btn-${product.id}`}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
export default ProductCard;

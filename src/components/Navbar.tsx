import React from 'react';
import { ShoppingCart, LogOut, ClipboardList, LogIn, User, Search } from 'lucide-react';
import { User as UserType } from '../types';

interface NavbarProps {
  user: UserType | null;
  onLogout: () => void;
  cartCount: number;
  currentView: string;
  onViewChange: (view: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenAuth: () => void;
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function Navbar({
  user,
  onLogout,
  cartCount,
  currentView,
  onViewChange,
  searchQuery,
  onSearchChange,
  onOpenAuth,
  categories,
  selectedCategory,
  onCategoryChange,
}: NavbarProps) {
  return (
    <nav className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo */}
          <div 
            className="flex flex-shrink-0 cursor-pointer items-center gap-2"
            onClick={() => onViewChange('catalog')}
            id="navbar-logo"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white font-sans font-bold text-lg shadow-sm">
              S
            </div>
            <div className="hidden sm:block">
              <span className="font-sans font-bold tracking-tight text-zinc-900 text-lg">STOREFRONT</span>
              <span className="block text-[10px] font-mono text-zinc-400 -mt-1 tracking-wider uppercase">Minimalist Lifestyle</span>
            </div>
          </div>

          {/* Search Bar - only show if on catalog or if catalog is primary */}
          <div className="flex-1 max-w-md relative hidden md:block">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-zinc-400" />
            </div>
            <input
              type="text"
              placeholder="Search premium goods..."
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                if (currentView !== 'catalog') onViewChange('catalog');
              }}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-4 text-sm tracking-tight text-zinc-900 transition-colors focus:border-zinc-900 focus:bg-white focus:outline-none"
              id="search-input-desktop"
            />
          </div>

          {/* Navigation Action controls */}
          <div className="flex items-center gap-4">
            {/* Category tabs on navbar for wider screens */}
            <div className="hidden lg:flex items-center gap-1 border-r border-zinc-200 pr-4 mr-2">
              <button
                onClick={() => {
                  onCategoryChange('All');
                  onViewChange('catalog');
                }}
                className={`px-3 py-1.5 text-xs font-sans font-medium tracking-tight rounded-md transition-colors ${
                  selectedCategory === 'All' && currentView === 'catalog'
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
                id="cat-tab-all"
              >
                All Goods
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    onCategoryChange(cat);
                    onViewChange('catalog');
                  }}
                  className={`px-3 py-1.5 text-xs font-sans font-medium tracking-tight rounded-md transition-colors ${
                    selectedCategory === cat && currentView === 'catalog'
                      ? 'bg-zinc-900 text-white'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                  }`}
                  id={`cat-tab-${cat.toLowerCase()}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Shopping Cart Button */}
            <button
              onClick={() => onViewChange('cart')}
              className={`relative flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 text-zinc-700 transition-all hover:bg-zinc-50 ${
                currentView === 'cart' ? 'border-zinc-900 bg-zinc-50 text-zinc-900 ring-1 ring-zinc-900' : ''
              }`}
              id="navbar-cart-btn"
              aria-label="View shopping cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-sans font-bold text-white ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Controls */}
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onViewChange('orders')}
                  className={`flex h-10 items-center gap-2 px-3 sm:px-4 rounded-xl border border-zinc-200 text-zinc-700 transition-colors hover:bg-zinc-50 ${
                    currentView === 'orders' ? 'border-zinc-900 bg-zinc-50 text-zinc-900 ring-1 ring-zinc-900' : ''
                  }`}
                  id="navbar-orders-btn"
                >
                  <ClipboardList className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs font-sans font-medium tracking-tight">Orders</span>
                </button>
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-sans font-semibold text-zinc-900">{user.name}</span>
                  <span className="text-[10px] font-mono text-zinc-400">{user.email}</span>
                </div>
                <button
                  onClick={onLogout}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600 hover:border-red-100"
                  id="navbar-logout-btn"
                  title="Log Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex h-10 items-center gap-2 rounded-xl bg-zinc-900 px-4 text-xs font-sans font-semibold tracking-tight text-white shadow-sm transition-transform hover:bg-zinc-800 active:scale-95"
                id="navbar-login-btn"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </button>
            )}

          </div>
        </div>
        
        {/* Mobile Search Bar - displayed below layout on smaller viewports */}
        <div className="pb-3 md:hidden">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-zinc-400" />
            </div>
            <input
              type="text"
              placeholder="Search premium goods..."
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                if (currentView !== 'catalog') onViewChange('catalog');
              }}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-4 text-xs tracking-tight text-zinc-900 transition-colors focus:border-zinc-900 focus:bg-white focus:outline-none"
              id="search-input-mobile"
            />
          </div>
        </div>

      </div>
    </nav>
  );
}
export default Navbar;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, ChevronRight, RefreshCw, Star, Info, Menu, Heart } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { Cart } from './components/Cart';
import { CheckoutForm } from './components/CheckoutForm';
import { OrderHistoryView } from './components/OrderHistoryView';
import { AuthModal } from './components/AuthModal';
import { User, Product, CartItem } from './types';

export default function App() {
  // System context states
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Navigation & filtering states
  const [currentView, setCurrentView] = useState<string>('catalog'); // 'catalog' | 'cart' | 'checkout' | 'orders'
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<Product | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  
  // Search and Category Query filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Products records from API database
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  // Initialize and retrieve sessions on startup
  useEffect(() => {
    try {
      // 1. Session restore
      const storedUser = localStorage.getItem('storefront_user');
      const storedToken = localStorage.getItem('storefront_token');
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }

      // 2. Cart restore
      const storedCart = localStorage.getItem('storefront_cart');
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
    } catch (e) {
      console.error('Failed to restore browser session data', e);
    }
  }, []);

  // Fetch product listings from backend REST API
  const fetchProducts = async () => {
    setProductsLoading(true);
    setProductsError(null);
    try {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Could not retrieve product listings.');
      }
      const data = await response.json();
      setProducts(data);
    } catch (err: any) {
      setProductsError(err.message || 'Error occurred while loading products catalogue.');
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentView]); // Re-fetch on view toggle to sync stock counts!

  // Save Cart to local memory on state updates
  const saveCart = (updatedCart: CartItem[]) => {
    setCart(updatedCart);
    localStorage.setItem('storefront_cart', JSON.stringify(updatedCart));
  };

  // Cart operations
  const handleAddToCart = (product: Product, quantity: number = 1) => {
    const existingIndex = cart.findIndex((item) => item.product.id === product.id);
    const updatedCart = [...cart];

    if (existingIndex > -1) {
      const currentQty = updatedCart[existingIndex].quantity;
      const targetQty = currentQty + quantity;
      
      if (targetQty > product.stock) {
        updatedCart[existingIndex].quantity = product.stock;
      } else {
        updatedCart[existingIndex].quantity = targetQty;
      }
    } else {
      updatedCart.push({
        product,
        quantity: Math.min(quantity, product.stock),
      });
    }

    saveCart(updatedCart);
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }

    const itemIndex = cart.findIndex((item) => item.product.id === productId);
    if (itemIndex > -1) {
      const limitStock = cart[itemIndex].product.stock;
      const updatedCart = [...cart];
      updatedCart[itemIndex].quantity = Math.min(quantity, limitStock);
      saveCart(updatedCart);
    }
  };

  const handleRemoveFromCart = (productId: string) => {
    const updatedCart = cart.filter((item) => item.product.id !== productId);
    saveCart(updatedCart);
  };

  const handleClearCart = () => {
    saveCart([]);
  };

  // Auth operations
  const handleAuthSuccess = (authUser: User, authToken: string) => {
    setUser(authUser);
    setToken(authToken);
    localStorage.setItem('storefront_user', JSON.stringify(authUser));
    localStorage.setItem('storefront_token', authToken);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('storefront_user');
    localStorage.removeItem('storefront_token');
    setCurrentView('catalog');
  };

  // Catalog Filters
  const categoriesList = ['Kitchen', 'Office', 'Lifestyle'];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const cartItemsCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans antialiased text-zinc-900" id="applet-root">
      
      {/* Navbar segment */}
      <Navbar
        user={user}
        onLogout={handleLogout}
        cartCount={cartItemsCount}
        currentView={currentView}
        onViewChange={setCurrentView}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenAuth={() => setAuthModalOpen(true)}
        categories={categoriesList}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <main className="flex-1">
        
        {/* VIEW: CATALOGUE LISTINGS */}
        {currentView === 'catalog' && (
          <div id="catalog-view" className="animate-fade-in">
            
            {/* Hero Editorial Display Section */}
            <div className="relative overflow-hidden bg-white py-16 sm:py-24 border-b border-zinc-200">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-2xl">
                  <span className="font-mono text-xs uppercase tracking-widest text-zinc-400">STOREFRONT / SUMMER RELEASES</span>
                  <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl font-sans">
                    The Aesthetics of Minimal Living.
                  </h1>
                  <p className="mt-4 font-sans text-base text-zinc-500 leading-relaxed">
                    Designed to provide structural utility. Every product in this collection is sculpted using sustainably sourced white oak, natural hand-beaten clay, matte brass, and organic fabrics.
                  </p>
                  
                  <div className="mt-8 flex flex-wrap gap-4">
                    <button 
                      onClick={() => setSelectedCategory('All')} 
                      className="rounded-xl bg-zinc-900 px-5 py-3 text-xs font-sans font-semibold tracking-tight text-white hover:bg-zinc-800 shadow-sm active:scale-95 transition-all"
                      id="hero-explore-btn"
                    >
                      Browse Entire Catalog
                    </button>
                    <a 
                      href="#products-section"
                      className="inline-flex items-center gap-1 text-xs font-sans font-semibold text-zinc-700 hover:text-zinc-950 transition-colors p-3"
                    >
                      <span>Explore Categories</span>
                      <ChevronRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
              
              {/* Abstract subtle luxury gradient ring */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-zinc-100 opacity-50 blur-3xl pointer-events-none" />
            </div>

            {/* Catalog Grid Section */}
            <div id="products-section" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
              
              {/* Category buttons tabs bar (visible on mobile too) */}
              <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 pb-5">
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedCategory('All')}
                    className={`rounded-xl px-4 py-2 text-xs font-sans font-semibold tracking-tight transition-all ${
                      selectedCategory === 'All'
                        ? 'bg-zinc-900 text-white shadow-sm'
                        : 'border border-zinc-200 text-zinc-600 hover:bg-white'
                    }`}
                    id="grid-tab-all"
                  >
                    All Essentials
                  </button>
                  {categoriesList.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`rounded-xl px-4 py-2 text-xs font-sans font-semibold tracking-tight transition-all ${
                        selectedCategory === cat
                          ? 'bg-zinc-900 text-white shadow-sm'
                          : 'border border-zinc-200 text-zinc-605 hover:bg-white'
                      }`}
                      id={`grid-tab-${cat.toLowerCase()}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <span className="text-xs font-mono text-zinc-400 font-medium">
                  Showing {filteredProducts.length} Premium Options
                </span>
              </div>

              {/* Listings states */}
              {productsLoading ? (
                <div className="py-24 text-center" id="catalog-loading">
                  <RefreshCw className="mx-auto h-8 w-8 animate-spin text-zinc-400" />
                  <p className="mt-4 text-xs font-sans text-zinc-500 font-medium tracking-tight">Syncing available warehouse inventory...</p>
                </div>
              ) : productsError ? (
                <div className="py-16 text-center" id="catalog-error">
                  <div className="mx-auto max-w-md rounded-2xl border border-red-100 bg-red-50 p-6 text-red-700 font-sans">
                    <p className="font-bold text-sm">Failed to Sync Inventory</p>
                    <p className="text-xs mt-1">{productsError}</p>
                    <button
                      onClick={fetchProducts}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-red-650 px-4 py-2 text-xs font-semibold text-white hover:bg-red-705"
                    >
                      <RefreshCw className="h-3 w-3" />
                      <span>Retry Synchronization</span>
                    </button>
                  </div>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-24 text-center" id="catalog-empty">
                  <p className="text-zinc-500 font-sans text-sm">No goods matching your parameters were found.</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                    className="mt-4 rounded-xl border border-zinc-900 px-4 py-2 text-xs font-sans font-semibold tracking-tight text-zinc-900 hover:bg-zinc-50"
                  >
                    Clear Search Query
                  </button>
                </div>
              ) : (
                <div 
                  className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                  id="products-grid"
                >
                  {filteredProducts.map((prod) => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      onAddToCart={(p) => handleAddToCart(p, 1)}
                      onViewDetails={(p) => setSelectedDetailProduct(p)}
                    />
                  ))}
                </div>
              )}

            </div>
          </div>
        )}

        {/* VIEW: CART PAGE */}
        {currentView === 'cart' && (
          <div className="animate-fade-in" id="cart-view">
            <Cart
              cart={cart}
              onUpdateQuantity={handleUpdateCartQuantity}
              onRemoveItem={handleRemoveFromCart}
              onContinueShopping={() => setCurrentView('catalog')}
              onProceedToCheckout={() => setCurrentView('checkout')}
              onTriggerAuth={() => setAuthModalOpen(true)}
              userSignedIn={user !== null}
            />
          </div>
        )}

        {/* VIEW: CHECKOUT FORM ENTRY */}
        {currentView === 'checkout' && (
          <div className="animate-fade-in" id="checkout-view">
            <CheckoutForm
              cart={cart}
              cartDiscount={cart.length > 0 ? (localStorage.getItem('storefront_cart_discount') ? parseFloat(localStorage.getItem('storefront_cart_discount') || '0') : 0) : 0}
              onBackToCart={() => setCurrentView('cart')}
              onClearCart={handleClearCart}
              onOrderSuccess={() => setCurrentView('orders')}
              userToken={token || ''}
            />
          </div>
        )}

        {/* VIEW: ORDER PROCEDURES LOG */}
        {currentView === 'orders' && (
          <div className="animate-fade-in" id="orders-view">
            <OrderHistoryView
              userToken={token || ''}
              onBrowseProducts={() => setCurrentView('catalog')}
            />
          </div>
        )}

      </main>

      {/* FOOTER: Minimal Editorial Info Statement */}
      <footer className="bg-white border-t border-zinc-200 mt-24 py-12 text-zinc-500 font-sans text-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-white font-bold text-sm">
                S
              </div>
              <span className="font-bold tracking-tight text-zinc-900">STOREFRONT</span>
            </div>
            <p className="leading-relaxed text-zinc-400">
              An e-commerce demonstration designed for fast-rendering fluid states and real database integrations. Crafted with secure password hashes and responsive layouts.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-zinc-900 mb-4 tracking-tight uppercase text-[10px]">Client Help & Rules</h4>
            <ul className="space-y-2 text-zinc-400">
              <li><a href="#" className="hover:text-zinc-600 transition-colors">Order Tracker</a></li>
              <li><a href="#" className="hover:text-zinc-600 transition-colors">Return Policy (30 Days)</a></li>
              <li><a href="#" className="hover:text-zinc-650 transition-colors">Frictionless Warranty Protocols</a></li>
              <li><a href="#" className="hover:text-zinc-650 transition-colors">Privacy and Cookie Settings</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-zinc-900 mb-4 tracking-tight uppercase text-[10px]">Security Guarantee</h4>
            <p className="leading-relaxed text-zinc-400">
              All interactions, registrations, and checked credit card credentials are encrypted at transport level. Simulated checkouts are fully processed in memory without physical charges.
            </p>
            <div className="mt-4 flex items-center gap-2 text-zinc-300">
              <span className="border border-zinc-200 rounded px-1.5 py-0.5 text-[9px] font-mono tracking-wider font-semibold">Visa</span>
              <span className="border border-zinc-200 rounded px-1.5 py-0.5 text-[9px] font-mono tracking-wider font-semibold">MC</span>
              <span className="border border-zinc-200 rounded px-1.5 py-0.5 text-[9px] font-mono tracking-wider font-semibold">Amex</span>
              <span className="border border-zinc-200 rounded px-1.5 py-0.5 text-[9px] font-mono tracking-wider font-semibold">Apple</span>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8 pt-8 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-zinc-400 text-[10px] font-mono">
          <span>&copy; {new Date().getFullYear()} Storefront. All rights reserved.</span>
          <span>SYSTEM RUNTIME STATUS: ONLINE</span>
        </div>
      </footer>

      {/* Dynamic Modal Dialog Components */}
      <ProductDetailsModal
        product={selectedDetailProduct}
        onClose={() => setSelectedDetailProduct(null)}
        onAddToCart={handleAddToCart}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

    </div>
  );
}

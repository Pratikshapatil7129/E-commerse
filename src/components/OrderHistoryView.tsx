import React, { useState, useEffect } from 'react';
import { ClipboardList, ShoppingBag, Loader2, Calendar, ShieldCheck, MapPin, Search } from 'lucide-react';
import { Order } from '../types';

interface OrderHistoryViewProps {
  userToken: string;
  onBrowseProducts: () => void;
}

export function OrderHistoryView({ userToken, onBrowseProducts }: OrderHistoryViewProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders', {
          headers: {
            'Authorization': `Bearer ${userToken}`,
          },
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to retrieve orders.');
        }
        setOrders(data);
      } catch (err: any) {
        setError(err.message || 'Error occurred while loading orders.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userToken]);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Pending':
        return 'bg-zinc-100 text-zinc-800 border-zinc-200';
      case 'Processing':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Shipped':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Delivered':
        return 'bg-green-50 text-green-700 border-green-100';
      default:
        return 'bg-zinc-100 text-zinc-800 border-zinc-200';
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-32 text-center" id="orders-loading">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-zinc-500" />
        <p className="mt-4 text-xs font-sans text-zinc-500">Retrieving secure transaction history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center" id="orders-error">
        <div className="rounded-2xl border border-red-105 bg-red-50 p-6 text-red-700 font-sans space-y-3">
          <p className="text-sm font-semibold">Could Not Read Order Histories</p>
          <p className="text-xs">{error}</p>
          <button
            onClick={onBrowseProducts}
            className="mt-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center" id="orders-empty">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-zinc-50 border border-zinc-150 text-zinc-400">
          <ClipboardList className="h-6 w-6" />
        </div>
        <h2 className="mt-6 text-lg font-sans font-bold tracking-tight text-zinc-900">No Past Orders Found</h2>
        <p className="mt-2 text-xs font-sans text-zinc-500 leading-relaxed max-w-sm mx-auto">
          It looks like you haven&apos;t placed any orders yet. Explore our handcrafted, minimal lifestyle collections and products!
        </p>
        <button
          onClick={onBrowseProducts}
          className="mt-6 rounded-xl bg-zinc-900 px-6 py-2.5 text-xs font-sans font-semibold tracking-tight text-white hover:bg-zinc-800 active:scale-95"
          id="orders-browse-btn"
        >
          Explore Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8" id="orders-list-container">
      <div className="mb-8 border-b border-zinc-100 pb-5">
        <h1 className="text-3xl font-sans font-bold tracking-tight text-zinc-900">Your Procurement History</h1>
        <p className="mt-1 text-xs text-zinc-500">Track and review your previous transactions and packages</p>
      </div>

      <div className="space-y-6" id="orders-timeline">
        {orders.map((order) => (
          <div
            key={order.id}
            className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm hover:border-zinc-300 transition-colors"
            id={`order-block-${order.id}`}
          >
            {/* Header banner summary */}
            <div className="bg-zinc-50 border-b border-zinc-200 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 font-sans text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
                <div>
                  <span className="block uppercase text-[9px] font-bold tracking-wider text-zinc-400">Reference ID</span>
                  <span className="font-mono font-bold text-zinc-900">{order.id}</span>
                </div>
                <div>
                  <span className="block uppercase text-[9px] font-bold tracking-wider text-zinc-400">Date Placed</span>
                  <span className="font-semibold text-zinc-800">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="block uppercase text-[9px] font-bold tracking-wider text-zinc-400">Transaction total</span>
                  <span className="font-sans font-bold text-zinc-950">${order.total.toFixed(2)}</span>
                </div>
                <div>
                  <span className="block uppercase text-[9px] font-bold tracking-wider text-zinc-400">Shipping destination</span>
                  <span className="text-zinc-650 truncate block max-w-[120px]" title={order.shippingAddress.street}>
                    {order.shippingAddress.fullName}
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <span className={`self-start sm:self-center rounded-full border px-3 py-1 text-[10px] font-sans font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>

            {/* List items block */}
            <div className="p-5 font-sans">
              <ul className="divide-y divide-zinc-100" id={`order-items-${order.id}`}>
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="h-12 w-12 rounded-xl object-contain bg-zinc-55 border border-zinc-100 flex-shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-zinc-900 leading-snug">{item.productName}</h4>
                        <span className="text-xs text-zinc-500 font-mono inline-block mt-0.5">Quantity: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="text-sm font-mono font-bold text-zinc-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </ul>

              {/* Metadata details panel expansion */}
              <div className="mt-4 border-t border-zinc-100 pt-4 flex flex-col md:flex-row md:items-center justify-between text-xs text-zinc-500 gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-zinc-400" />
                    <span>
                      {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 md:self-end">
                  <ShieldCheck className="h-4 w-4 text-green-500" />
                  <span>Settled via {order.paymentMethod}</span>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default OrderHistoryView;

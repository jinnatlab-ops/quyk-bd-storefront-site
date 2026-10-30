import React from 'react';
import { MessageCircle, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { CartItem, OrderDraftItem, SneakerProduct, SneakerSize } from '../types/store';
import { formatBdtNumber, resolveProductImage } from '../utils/storeHelpers';
import { SneakerImage } from './SneakerImage';

interface CartDrawerProps {
  isOpen: boolean;
  cart: CartItem[];
  products: SneakerProduct[];
  onClose: () => void;
  onUpdateQuantity: (productId: string, size: SneakerSize, delta: number) => void;
  onRemoveItem: (productId: string, size: SneakerSize) => void;
  onClearCart: () => void;
  onProceedWhatsAppCheckout: (items: OrderDraftItem[]) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  cart,
  products,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedWhatsAppCheckout,
}) => {
  if (!isOpen) return null;

  const resolvedItems: OrderDraftItem[] = cart
    .map((ci) => {
      const product = products.find((p) => p.id === ci.productId);
      if (!product) return null;
      return { product, size: ci.size, quantity: ci.quantity };
    })
    .filter((item): item is OrderDraftItem => item !== null);

  let subtotalBdt = 0;
  let hasUnpricedItems = false;

  resolvedItems.forEach((entry) => {
    if (entry.product.priceBdt && entry.product.priceBdt > 0) {
      subtotalBdt += entry.product.priceBdt * entry.quantity;
    } else {
      hasUnpricedItems = true;
    }
  });

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-drawer-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white h-full flex flex-col border-l border-zinc-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-zinc-950" />
            <h2 id="cart-drawer-title" className="text-lg font-bold text-zinc-950">
              অর্ডার ব্যাগ ({resolvedItems.reduce((acc, i) => acc + i.quantity, 0)})
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="বন্ধ করুন"
            className="w-9 h-9 inline-flex items-center justify-center rounded-md border border-zinc-200 text-zinc-700 hover:bg-zinc-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {resolvedItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <ShoppingBag className="w-10 h-10 text-zinc-300 mb-3" />
              <p className="text-base font-semibold text-zinc-900">আপনার অর্ডার ব্যাগ খালি</p>
              <p className="text-sm text-zinc-500 mt-1 max-w-xs">
                শপ সেকশন থেকে আপনার পছন্দের স্নিকার্স এবং সাইজ (40–44) নির্বাচন করে ব্যাগে যুক্ত করুন।
              </p>
              <a
                href="#shop"
                onClick={onClose}
                className="mt-5 inline-flex items-center justify-center min-h-[42px] px-5 py-2 text-sm font-semibold text-white bg-zinc-950 rounded-md hover:bg-zinc-800"
              >
                কালেকশন দেখুন
              </a>
            </div>
          ) : (
            <div className="divide-y divide-zinc-200">
              {resolvedItems.map(({ product, size, quantity }) => {
                const unitPrice = formatBdtNumber(product.priceBdt);
                return (
                  <div key={`${product.id}-${size}`} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                    <div className="w-20 h-20 rounded-md overflow-hidden bg-[#F4F4F5] shrink-0 border border-zinc-200">
                      <SneakerImage
                        src={resolveProductImage(product)}
                        alt={product.nameBn}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-zinc-950 truncate">
                          {product.nameBn}
                        </h3>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(product.id, size)}
                          aria-label="মুছে ফেলুন"
                          className="text-zinc-400 hover:text-zinc-950 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1.5">
                        <span className="font-mono">সাইজ: EU {size}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">{product.sku}</span>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between gap-2">
                        <div className="inline-flex items-center border border-zinc-200 rounded">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(product.id, size, -1)}
                            aria-label="পরিমাণ কমান"
                            className="w-7 h-7 inline-flex items-center justify-center text-zinc-700 hover:bg-zinc-100 cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center font-mono text-xs font-semibold tabular-nums">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(product.id, size, 1)}
                            aria-label="পরিমাণ বাড়ান"
                            className="w-7 h-7 inline-flex items-center justify-center text-zinc-700 hover:bg-zinc-100 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="font-mono text-xs font-semibold text-zinc-900 tabular-nums">
                          {unitPrice ? unitPrice : 'মূল্য নিশ্চিত করুন'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Checkout Summary */}
        {resolvedItems.length > 0 && (
          <div className="p-6 border-t border-zinc-200 bg-zinc-50 space-y-4">
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-zinc-600">পণ্যের উপমোট (Subtotal)</span>
                <span className="font-mono font-semibold text-zinc-950 tabular-nums">
                  {subtotalBdt > 0
                    ? `৳ ${Math.round(subtotalBdt).toLocaleString('en-IN')} BDT`
                    : '৳ — BDT'}
                </span>
              </div>
              {hasUnpricedItems && (
                <p className="text-xs text-zinc-500">
                  কিছু পণ্যের মূল্য এখনো সেট করা হয়নি; হোয়াটসঅ্যাপে অর্ডারের সময় চূড়ান্ত মূল্য নিশ্চিত করা হবে।
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onProceedWhatsAppCheckout(resolvedItems);
              }}
              className="w-full inline-flex items-center justify-center gap-2 min-h-[46px] px-5 py-3 text-sm font-semibold text-white bg-zinc-950 rounded-md hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              <span>হোয়াটসঅ্যাপে অর্ডার সম্পন্ন করুন</span>
            </button>

            <button
              type="button"
              onClick={onClearCart}
              className="w-full text-center text-xs text-zinc-500 hover:text-zinc-900 underline underline-offset-4 py-1 cursor-pointer"
            >
              সব পণ্য ব্যাগ থেকে মুছুন
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

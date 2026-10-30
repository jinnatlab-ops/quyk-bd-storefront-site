import React, { useEffect, useState } from 'react';
import { Check, Copy, ExternalLink, MessageCircle, Minus, Plus, Settings, X } from 'lucide-react';
import {
  DeliveryZone,
  OrderDraftItem,
  SneakerSize,
  StoreSettings,
} from '../types/store';
import {
  ALL_SNEAKER_SIZES,
  buildWhatsAppOrderText,
  buildWhatsAppUrl,
  formatBdtNumber,
  normalizeBangladeshWhatsApp,
} from '../utils/storeHelpers';

interface WhatsAppOrderModalProps {
  isOpen: boolean;
  initialItems: OrderDraftItem[];
  settings: StoreSettings;
  onClose: () => void;
  onOpenStoreSettings: () => void;
  onOrderCompleted?: () => void;
}

export const WhatsAppOrderModal: React.FC<WhatsAppOrderModalProps> = ({
  isOpen,
  initialItems,
  settings,
  onClose,
  onOpenStoreSettings,
  onOrderCompleted,
}) => {
  const [items, setItems] = useState<OrderDraftItem[]>(initialItems);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone>('inside_dhaka');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [copied, setCopied] = useState(false);
  const [orderSentNotice, setOrderSentNotice] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setItems(initialItems);
      setCopied(false);
      setOrderSentNotice(false);
    }
  }, [isOpen, initialItems]);

  if (!isOpen || items.length === 0) return null;

  const waStatus = normalizeBangladeshWhatsApp(settings.whatsappNumber);

  const orderMessage = buildWhatsAppOrderText({
    items,
    customerName,
    customerPhone,
    deliveryZone,
    deliveryAddress,
    customerNote,
    settings,
  });

  const waHref = waStatus.isValid ? buildWhatsAppUrl(waStatus.waNumber, orderMessage) : '';

  const handleSingleItemSizeChange = (newSize: SneakerSize) => {
    setItems((prev) =>
      prev.map((entry, idx) => (idx === 0 ? { ...entry, size: newSize } : entry))
    );
  };

  const handleSingleItemQtyChange = (delta: number) => {
    setItems((prev) =>
      prev.map((entry, idx) =>
        idx === 0
          ? { ...entry, quantity: Math.max(1, Math.min(10, entry.quantity + delta)) }
          : entry
      )
    );
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(orderMessage);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const insideFeeFormatted =
    settings.insideDhakaDeliveryBdt !== null && settings.insideDhakaDeliveryBdt >= 0
      ? `৳ ${Math.round(settings.insideDhakaDeliveryBdt).toLocaleString('en-IN')} BDT`
      : null;

  const outsideFeeFormatted =
    settings.outsideDhakaDeliveryBdt !== null && settings.outsideDhakaDeliveryBdt >= 0
      ? `৳ ${Math.round(settings.outsideDhakaDeliveryBdt).toLocaleString('en-IN')} BDT`
      : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wa-order-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white border border-zinc-200 rounded-lg overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
          <div className="flex items-center gap-2.5">
            <MessageCircle className="w-5 h-5 text-zinc-950" />
            <h2 id="wa-order-modal-title" className="text-lg font-bold text-zinc-950">
              হোয়াটসঅ্যাপ অর্ডার কনফার্মেশন
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

        <div className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
          {/* Selected Item(s) Summary */}
          <div className="border border-zinc-200 rounded-md p-4 bg-zinc-50/70 space-y-3">
            <div className="text-xs font-semibold text-zinc-700">নির্বাচিত স্নিকার্স</div>
            {items.map((entry, idx) => {
              const formattedUnit = formatBdtNumber(entry.product.priceBdt);
              return (
                <div
                  key={`${entry.product.id}-${entry.size}-${idx}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 last:pb-0 border-b last:border-b-0 border-zinc-200/70"
                >
                  <div>
                    <p className="text-sm font-semibold text-zinc-950">
                      {entry.product.nameBn}{' '}
                      <span className="font-mono text-xs text-zinc-500">({entry.product.sku})</span>
                    </p>
                    <p className="text-xs text-zinc-600 font-mono mt-0.5 tabular-nums">
                      সাইজ: EU {entry.size} · পরিমাণ: {entry.quantity} জোড়া ·{' '}
                      {formattedUnit ? formattedUnit : 'মূল্য নিশ্চিত করুন'}
                    </p>
                  </div>

                  {/* Quick size/qty tweak when ordering a single item */}
                  {items.length === 1 && (
                    <div className="flex items-center gap-2">
                      <select
                        aria-label="সাইজ পরিবর্তন করুন"
                        value={entry.size}
                        onChange={(e) =>
                          handleSingleItemSizeChange(Number(e.target.value) as SneakerSize)
                        }
                        className="h-9 px-2.5 text-xs font-mono bg-white border border-zinc-300 rounded-md text-zinc-900"
                      >
                        {ALL_SNEAKER_SIZES.filter((sz) =>
                          entry.product.availableSizes.includes(sz)
                        ).map((sz) => (
                          <option key={sz} value={sz}>
                            সাইজ {sz}
                          </option>
                        ))}
                      </select>

                      <div className="inline-flex items-center bg-white border border-zinc-300 rounded-md h-9">
                        <button
                          type="button"
                          onClick={() => handleSingleItemQtyChange(-1)}
                          aria-label="পরিমাণ কমান"
                          className="w-8 h-full inline-flex items-center justify-center text-zinc-700 hover:bg-zinc-100 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 text-center font-mono text-xs font-semibold tabular-nums">
                          {entry.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleSingleItemQtyChange(1)}
                          aria-label="পরিমাণ বাড়ান"
                          className="w-8 h-full inline-flex items-center justify-center text-zinc-700 hover:bg-zinc-100 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Customer Delivery Details Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="wa-customer-name"
                className="block text-xs font-semibold text-zinc-800 mb-1.5"
              >
                আপনার নাম
              </label>
              <input
                id="wa-customer-name"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="আপনার পূর্ণ নাম লিখুন"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-zinc-300 rounded-md text-zinc-950 focus:outline-none focus:border-zinc-950"
              />
            </div>

            <div>
              <label
                htmlFor="wa-customer-phone"
                className="block text-xs font-semibold text-zinc-800 mb-1.5"
              >
                মোবাইল নম্বর (ঐচ্ছিক)
              </label>
              <input
                id="wa-customer-phone"
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="আপনার সচল মোবাইল নম্বর লিখুন"
                className="w-full px-3.5 py-2.5 text-sm font-mono bg-white border border-zinc-300 rounded-md text-zinc-950 focus:outline-none focus:border-zinc-950"
              />
            </div>

            <div className="sm:col-span-2">
              <span className="block text-xs font-semibold text-zinc-800 mb-1.5">
                ডেলিভারি এরিয়া নির্বাচন করুন
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setDeliveryZone('inside_dhaka')}
                  className={`min-h-[44px] px-4 py-2.5 rounded-md border text-left transition-colors cursor-pointer ${
                    deliveryZone === 'inside_dhaka'
                      ? 'bg-zinc-950 text-white border-zinc-950'
                      : 'bg-white text-zinc-800 border-zinc-300 hover:border-zinc-950'
                  }`}
                >
                  <div className="text-sm font-semibold">ঢাকার ভেতরে</div>
                  <div
                    className={`text-xs mt-0.5 font-mono tabular-nums ${
                      deliveryZone === 'inside_dhaka' ? 'text-zinc-300' : 'text-zinc-500'
                    }`}
                  >
                    {insideFeeFormatted
                      ? `চার্জ: ${insideFeeFormatted}`
                      : settings.deliveryTimeInsideDhakaBn}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryZone('outside_dhaka')}
                  className={`min-h-[44px] px-4 py-2.5 rounded-md border text-left transition-colors cursor-pointer ${
                    deliveryZone === 'outside_dhaka'
                      ? 'bg-zinc-950 text-white border-zinc-950'
                      : 'bg-white text-zinc-800 border-zinc-300 hover:border-zinc-950'
                  }`}
                >
                  <div className="text-sm font-semibold">ঢাকার বাইরে (সারা বাংলাদেশ)</div>
                  <div
                    className={`text-xs mt-0.5 font-mono tabular-nums ${
                      deliveryZone === 'outside_dhaka' ? 'text-zinc-300' : 'text-zinc-500'
                    }`}
                  >
                    {outsideFeeFormatted
                      ? `চার্জ: ${outsideFeeFormatted}`
                      : settings.deliveryTimeOutsideDhakaBn}
                  </div>
                </button>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="wa-customer-address"
                className="block text-xs font-semibold text-zinc-800 mb-1.5"
              >
                পূর্ণ ডেলিভারি ঠিকানা
              </label>
              <textarea
                id="wa-customer-address"
                rows={2}
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="বাসা/রোড, এলাকা, থানা এবং জেলার নাম লিখুন"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-zinc-300 rounded-md text-zinc-950 focus:outline-none focus:border-zinc-950"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="wa-customer-note"
                className="block text-xs font-semibold text-zinc-800 mb-1.5"
              >
                বিশেষ নোট (ঐচ্ছিক)
              </label>
              <input
                id="wa-customer-note"
                type="text"
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                placeholder="ডেলিভারি সংক্রান্ত কোনো নির্দেশনা থাকলে লিখুন"
                className="w-full px-3.5 py-2 text-sm bg-white border border-zinc-300 rounded-md text-zinc-950 focus:outline-none focus:border-zinc-950"
              />
            </div>
          </div>

          {/* Live Order Message Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-zinc-700">
                প্রস্তুতকৃত হোয়াটসঅ্যাপ অর্ডার মেসেজ
              </span>
              <button
                type="button"
                onClick={handleCopyMessage}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-700 hover:text-zinc-950 underline underline-offset-4 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'মেসেজ কপি হয়েছে' : 'মেসেজ কপি করুন'}</span>
              </button>
            </div>
            <pre className="p-3.5 bg-zinc-950 text-zinc-100 text-xs leading-relaxed rounded-md whitespace-pre-wrap font-sans overflow-x-auto">
              {orderMessage}
            </pre>
          </div>

          {/* WhatsApp Number Action or Owner Setup Notice */}
          {waStatus.isValid ? (
            <div className="space-y-3 pt-1">
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  setOrderSentNotice(true);
                  if (onOrderCompleted) onOrderCompleted();
                }}
                className="w-full inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3 text-sm font-semibold text-white bg-zinc-950 rounded-md hover:bg-zinc-800 transition-colors"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span>হোয়াটসঅ্যাপে অর্ডার মেসেজ পাঠান</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>

              {orderSentNotice && (
                <p className="text-xs text-center text-zinc-700 font-medium">
                  হোয়াটসঅ্যাপ ট্যাব খোলা হয়েছে। সেখানে Send বাটন চাপলে আপনার অর্ডারটি QUYK BD টিমের কাছে পৌঁছে যাবে।
                </p>
              )}
            </div>
          ) : (
            <div className="p-4 border border-zinc-300 bg-zinc-50 rounded-md space-y-3">
              <div className="text-sm font-semibold text-zinc-950">
                স্টোরের হোয়াটসঅ্যাপ নম্বর এখনো সেট করা হয়নি
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                সঠিক তথ্যের নিশ্চয়তায় কোনো কাল্পনিক নম্বর যুক্ত করা হয়নি। সরাসরি হোয়াটসঅ্যাপ অর্ডার বাটন সক্রিয় করতে স্টোর সেটিংসে আপনার আসল হোয়াটসঅ্যাপ নম্বর যুক্ত করুন।
              </p>
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenStoreSettings();
                  }}
                  className="inline-flex items-center gap-2 min-h-[42px] px-4 py-2 text-xs font-semibold text-white bg-zinc-950 rounded-md hover:bg-zinc-800 cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>এখনই হোয়াটসঅ্যাপ নম্বর যুক্ত করুন</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="inline-flex items-center gap-1.5 min-h-[42px] px-4 py-2 text-xs font-semibold text-zinc-900 bg-white border border-zinc-300 rounded-md hover:bg-zinc-100 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'কপি হয়েছে' : 'অর্ডার মেসেজ কপি করুন'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

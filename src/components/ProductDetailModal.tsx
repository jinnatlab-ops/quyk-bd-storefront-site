import React, { useEffect, useState } from 'react';
import { Check, MessageCircle, Minus, Pencil, Plus, Ruler, ShoppingBag, X } from 'lucide-react';
import { SneakerProduct, SneakerSize } from '../types/store';
import {
  ALL_SNEAKER_SIZES,
  formatBdtNumber,
  resolveProductImages,
} from '../utils/storeHelpers';
import { SneakerImage } from './SneakerImage';

interface ProductDetailModalProps {
  product: SneakerProduct | null;
  initialSize: SneakerSize;
  onClose: () => void;
  onWhatsAppOrder: (product: SneakerProduct, size: SneakerSize, quantity: number) => void;
  onAddToCart: (product: SneakerProduct, size: SneakerSize, quantity: number) => void;
  onOpenSizeGuide: () => void;
  onEditProduct: (product: SneakerProduct) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  initialSize,
  onClose,
  onWhatsAppOrder,
  onAddToCart,
  onOpenSizeGuide,
  onEditProduct,
}) => {
  const [selectedSize, setSelectedSize] = useState<SneakerSize>(initialSize);
  const [quantity, setQuantity] = useState<number>(1);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  useEffect(() => {
    if (product) {
      const validSize = product.availableSizes.includes(initialSize)
        ? initialSize
        : (product.availableSizes[0] ?? 42);
      setSelectedSize(validSize);
      setQuantity(1);
      setAddedFeedback(false);
      setActiveImageIndex(0);
    }
  }, [product, initialSize]);

  if (!product) return null;

  const formattedPrice = formatBdtNumber(product.priceBdt);
  const formattedCompare = formatBdtNumber(product.compareAtPriceBdt);
  const images = resolveProductImages(product);
  const currentMainImage = images[activeImageIndex] || images[0];
  const canPurchase = product.inStock && product.availableSizes.length > 0;

  const handleBagAdd = () => {
    if (!canPurchase) return;
    onAddToCart(product, selectedSize, quantity);
    setAddedFeedback(true);
    window.setTimeout(() => setAddedFeedback(false), 1400);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdp-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-white border border-zinc-200 rounded-lg overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar inside modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span>{product.category}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">{product.sku}</span>
            <span aria-hidden="true">·</span>
            <span>{product.inStock ? 'স্টকে আছে' : 'স্টক আউট'}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEditProduct(product);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-950 underline underline-offset-4 cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>পণ্য ও মূল্য এডিট</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="বন্ধ করুন"
              className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-zinc-200 text-zinc-700 hover:bg-zinc-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Contiguous Purchase Module Split */}
        <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
          {/* Left Gallery */}
          <div className="md:col-span-6 bg-[#F4F4F5] flex flex-col justify-between border-b md:border-b-0 md:border-r border-zinc-200">
            <div>
              {/* Large Main Image */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100 flex items-center justify-center">
                <SneakerImage
                  src={currentMainImage}
                  alt={`${product.nameBn} - ছবি ${activeImageIndex + 1}`}
                  sku={product.sku}
                  className="w-full h-full object-cover transition-all duration-200"
                />
                {images.length > 1 && (
                  <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-black/75 text-white backdrop-blur-xs select-none">
                    {activeImageIndex + 1} / {images.length}
                  </span>
                )}
              </div>

              {/* Clickable Thumbnails Underneath */}
              {images.length > 1 && (
                <div className="p-3 bg-white border-b border-zinc-200">
                  <div
                    className="flex items-center gap-2 overflow-x-auto pb-1"
                    role="tablist"
                    aria-label="পণ্যের বিভিন্ন অ্যাঙ্গেলের ছবি"
                  >
                    {images.map((imgUrl, idx) => {
                      const isActive = idx === activeImageIndex;
                      return (
                        <button
                          key={idx}
                          type="button"
                          role="tab"
                          aria-selected={isActive}
                          aria-label={`${product.nameBn} অ্যাঙ্গেল ${idx + 1}`}
                          onClick={() => setActiveImageIndex(idx)}
                          className={`relative w-14 h-12 sm:w-16 sm:h-14 rounded-md overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                            isActive
                              ? 'border-zinc-950 ring-2 ring-zinc-950/20'
                              : 'border-zinc-200 hover:border-zinc-400 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={imgUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    বিভিন্ন দিক দেখতে থাম্বনেইলে ক্লিক করুন ({images.length}টি অ্যাঙ্গেল)
                  </p>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-zinc-200/80 bg-zinc-50 space-y-2 text-xs text-zinc-600">
              <div className="flex justify-between gap-4">
                <span className="text-zinc-500">আপার উপাদান</span>
                <span className="text-zinc-900 font-medium text-right">
                  {product.upperMaterialBn}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-zinc-500">আউটসোল গঠন</span>
                <span className="text-zinc-900 font-medium text-right">
                  {product.soleMaterialBn}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-zinc-500">কালারওয়ে</span>
                <span className="text-zinc-900 font-medium text-right">{product.colorwayBn}</span>
              </div>
            </div>
          </div>

          {/* Right Purchase Column */}
          <div className="md:col-span-6 p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <h2 id="pdp-modal-title" className="text-2xl font-bold text-zinc-950 leading-snug">
                {product.nameBn}
              </h2>
              <p className="text-sm text-zinc-600 mt-1">{product.subtitleBn}</p>

              {/* Price */}
              <div className="mt-4 pb-4 border-b border-zinc-200">
                {formattedPrice ? (
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-2xl font-bold text-zinc-950 tabular-nums">
                      {formattedPrice}
                    </span>
                    {formattedCompare && (
                      <span className="font-mono text-sm text-zinc-400 line-through tabular-nums">
                        {formattedCompare}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-lg font-semibold text-zinc-700 tabular-nums">
                      ৳ — BDT (মূল্য এখনো নির্ধারিত হয়নি)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onEditProduct(product);
                      }}
                      className="text-xs font-semibold text-zinc-950 underline underline-offset-4 whitespace-nowrap cursor-pointer"
                    >
                      মূল্য যোগ করুন
                    </button>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="mt-4 text-sm text-zinc-700 leading-relaxed">{product.descriptionBn}</p>

              {/* EU 40-44 Size Picker */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-zinc-900">
                    সাইজ নির্বাচন করুন (EU 40–44)
                  </span>
                  <button
                    type="button"
                    onClick={onOpenSizeGuide}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-700 hover:text-zinc-950 underline underline-offset-4 cursor-pointer"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    <span>সাইজ গাইড</span>
                  </button>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {ALL_SNEAKER_SIZES.map((sz) => {
                    const available = product.inStock && product.availableSizes.includes(sz);
                    const active = selectedSize === sz && available;
                    return (
                      <button
                        key={sz}
                        type="button"
                        disabled={!available}
                        onClick={() => setSelectedSize(sz)}
                        className={`min-h-[44px] rounded-md font-mono text-sm tabular-nums border transition-colors ${
                          !available
                            ? 'border-zinc-100 bg-zinc-50 text-zinc-300 line-through cursor-not-allowed'
                            : active
                              ? 'border-zinc-950 bg-zinc-950 text-white font-semibold cursor-pointer'
                              : 'border-zinc-200 bg-white text-zinc-900 hover:border-zinc-950 cursor-pointer'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity Stepper */}
              <div className="mt-5 flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-800">পরিমাণ (জোড়া)</span>
                <div className="inline-flex items-center border border-zinc-300 rounded-md">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="পরিমাণ কমান"
                    className="w-10 h-10 inline-flex items-center justify-center text-zinc-700 hover:bg-zinc-100 cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-mono text-sm font-semibold tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                    aria-label="পরিমাণ বাড়ান"
                    className="w-10 h-10 inline-flex items-center justify-center text-zinc-700 hover:bg-zinc-100 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Primary & Secondary CTAs */}
            <div className="mt-7 pt-5 border-t border-zinc-200 space-y-2.5">
              <button
                type="button"
                disabled={!canPurchase}
                onClick={() => {
                  onClose();
                  onWhatsAppOrder(product, selectedSize, quantity);
                }}
                className="w-full inline-flex items-center justify-center gap-2 min-h-[46px] px-5 py-3 text-sm font-semibold text-white bg-zinc-950 rounded-md hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span>হোয়াটসঅ্যাপে অর্ডার করুন</span>
              </button>

              <button
                type="button"
                disabled={!canPurchase}
                onClick={handleBagAdd}
                className="w-full inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 text-sm font-semibold text-zinc-950 bg-white border border-zinc-300 rounded-md hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                {addedFeedback ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>অর্ডার ব্যাগে যুক্ত হয়েছে</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>অর্ডার ব্যাগে রাখুন</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

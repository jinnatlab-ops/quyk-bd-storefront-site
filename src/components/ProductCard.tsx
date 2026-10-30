import React, { useEffect, useState } from 'react';
import { Check, MessageCircle, Pencil, Plus } from 'lucide-react';
import { SneakerProduct, SneakerSize } from '../types/store';
import {
  ALL_SNEAKER_SIZES,
  formatBdtNumber,
  resolveProductImage,
} from '../utils/storeHelpers';
import { SneakerImage } from './SneakerImage';

interface ProductCardProps {
  product: SneakerProduct;
  quickEditMode: boolean;
  onSelectProduct: (product: SneakerProduct, initialSize: SneakerSize) => void;
  onWhatsAppOrder: (product: SneakerProduct, selectedSize: SneakerSize) => void;
  onAddToCart: (product: SneakerProduct, selectedSize: SneakerSize) => void;
  onQuickPriceChange: (productId: string, newPriceBdt: number | null) => void;
  onQuickToggleSize: (productId: string, size: SneakerSize) => void;
  onEditFullProduct: (product: SneakerProduct) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quickEditMode,
  onSelectProduct,
  onWhatsAppOrder,
  onAddToCart,
  onQuickPriceChange,
  onQuickToggleSize,
  onEditFullProduct,
}) => {
  const defaultSize: SneakerSize = product.availableSizes[0] ?? 42;
  const [selectedSize, setSelectedSize] = useState<SneakerSize>(defaultSize);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (!product.availableSizes.includes(selectedSize) && product.availableSizes.length > 0) {
      setSelectedSize(product.availableSizes[0]);
    }
  }, [product.availableSizes, selectedSize]);

  const formattedPrice = formatBdtNumber(product.priceBdt);
  const formattedComparePrice = formatBdtNumber(product.compareAtPriceBdt);
  const imageUrl = resolveProductImage(product);
  const canPurchase = product.inStock && product.availableSizes.length > 0;

  const handleAddClick = () => {
    if (!canPurchase) return;
    onAddToCart(product, selectedSize);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1300);
  };

  return (
    <article className="group flex flex-col bg-white border border-zinc-200 rounded-lg overflow-hidden transition-transform duration-200 hover:-translate-y-0.5">
      {/* Image Frame (4:3 neutral stone surface) */}
      <button
        type="button"
        onClick={() => onSelectProduct(product, selectedSize)}
        aria-label={`${product.nameBn} বিস্তারিত দেখুন`}
        className="relative aspect-[4/3] w-full bg-[#F4F4F5] overflow-hidden text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-zinc-950"
      >
        <SneakerImage
          src={imageUrl}
          alt={product.nameBn}
          sku={product.sku}
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
        />
      </button>

      {/* Card Body */}
      <div className="flex flex-col flex-1 p-5">
        {/* Zero-Pill Metadata Row */}
        <div className="flex items-center flex-wrap gap-1.5 text-xs text-zinc-500 mb-1.5">
          <span>{product.category}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono">{product.sku}</span>
          <span aria-hidden="true">·</span>
          <span className={product.inStock ? 'text-zinc-700 font-medium' : 'text-zinc-400'}>
            {product.inStock ? 'স্টকে আছে' : 'স্টক আউট'}
          </span>
        </div>

        {/* Title & Subtitle */}
        <button
          type="button"
          onClick={() => onSelectProduct(product, selectedSize)}
          className="text-left cursor-pointer group/title focus-visible:outline-2 focus-visible:outline-zinc-950"
        >
          <h3 className="text-[17px] font-semibold text-zinc-950 group-hover/title:underline underline-offset-4 leading-snug">
            {product.nameBn}
          </h3>
        </button>
        <p className="text-sm text-zinc-600 mt-1 line-clamp-1">{product.subtitleBn}</p>

        {/* BDT Price Section or Inline Quick-Edit */}
        <div className="mt-3 pt-3 border-t border-zinc-100">
          {quickEditMode ? (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor={`quick-price-${product.id}`}
                  className="text-xs font-medium text-zinc-700"
                >
                  মূল্য (BDT):
                </label>
                <button
                  type="button"
                  onClick={() => onEditFullProduct(product)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-zinc-700 hover:text-zinc-950 underline underline-offset-4 cursor-pointer"
                >
                  <Pencil className="w-3 h-3" />
                  <span>সম্পূর্ণ এডিট</span>
                </button>
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-sm font-mono text-zinc-500 select-none">
                  ৳
                </span>
                <input
                  id={`quick-price-${product.id}`}
                  type="number"
                  min={0}
                  step={1}
                  value={product.priceBdt ?? ''}
                  placeholder="মূল্য লিখুন (BDT)"
                  onChange={(e) => {
                    const raw = e.target.value.trim();
                    if (raw === '') {
                      onQuickPriceChange(product.id, null);
                    } else {
                      const parsed = Number(raw);
                      if (!Number.isNaN(parsed) && parsed >= 0) {
                        onQuickPriceChange(product.id, parsed);
                      }
                    }
                  }}
                  className="w-full pl-8 pr-14 py-2 text-sm font-mono tabular-nums bg-zinc-50 border border-zinc-300 rounded-md text-zinc-950 focus:outline-none focus:border-zinc-950 focus:bg-white"
                />
                <span className="absolute right-3 text-xs font-mono text-zinc-500 select-none">
                  BDT
                </span>
              </div>
              <div>
                <span className="block text-[11px] text-zinc-500 mb-1">
                  উপলব্ধ সাইজ টগল করুন (40–44):
                </span>
                <div className="grid grid-cols-5 gap-1.5">
                  {ALL_SNEAKER_SIZES.map((sz) => {
                    const active = product.availableSizes.includes(sz);
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => onQuickToggleSize(product.id, sz)}
                        className={`min-h-[38px] text-xs font-mono tabular-nums rounded border transition-colors cursor-pointer ${
                          active
                            ? 'bg-zinc-950 text-white border-zinc-950 font-semibold'
                            : 'bg-white text-zinc-400 border-zinc-200 line-through'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-baseline justify-between gap-2">
              {formattedPrice ? (
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-base font-semibold text-zinc-950 tabular-nums">
                    {formattedPrice}
                  </span>
                  {formattedComparePrice && (
                    <span className="font-mono text-xs text-zinc-400 line-through tabular-nums">
                      {formattedComparePrice}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between w-full gap-2">
                  <span className="font-mono text-sm text-zinc-600 tabular-nums">৳ — BDT</span>
                  <button
                    type="button"
                    onClick={() => onEditFullProduct(product)}
                    className="text-xs font-medium text-zinc-700 hover:text-zinc-950 underline underline-offset-4 whitespace-nowrap cursor-pointer"
                  >
                    মূল্য সেট করুন
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Size Selector 40-44 (Customer View) */}
        {!quickEditMode && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-zinc-600 mb-1.5">
              <span>সাইজ নির্বাচন করুন (EU)</span>
              <span className="font-mono tabular-nums text-zinc-900 font-medium">
                সাইজ {selectedSize}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5" role="radiogroup" aria-label="সাইজ নির্বাচন">
              {ALL_SNEAKER_SIZES.map((size) => {
                const available = product.inStock && product.availableSizes.includes(size);
                const isSelected = selectedSize === size && available;
                return (
                  <button
                    key={size}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    disabled={!available}
                    onClick={() => setSelectedSize(size)}
                    className={`min-h-[42px] rounded-md text-xs font-mono tabular-nums border transition-colors duration-150 ${
                      !available
                        ? 'border-zinc-100 bg-zinc-50 text-zinc-300 line-through cursor-not-allowed'
                        : isSelected
                          ? 'border-zinc-950 bg-zinc-950 text-white font-semibold cursor-pointer'
                          : 'border-zinc-200 bg-white text-zinc-800 hover:border-zinc-950 cursor-pointer'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons aligned at bottom */}
        <div className="mt-auto pt-4 flex items-center gap-2">
          <button
            type="button"
            disabled={!canPurchase}
            onClick={() => onWhatsAppOrder(product, selectedSize)}
            className="flex-1 inline-flex items-center justify-center gap-2 min-h-[44px] px-3.5 py-2.5 text-sm font-semibold text-white bg-zinc-950 rounded-md hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400 transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-not-allowed"
          >
            <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>হোয়াটসঅ্যাপে অর্ডার</span>
          </button>

          <button
            type="button"
            disabled={!canPurchase}
            onClick={handleAddClick}
            aria-label={`${product.nameBn} অর্ডার ব্যাগে রাখুন`}
            className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3.5 py-2.5 text-sm font-medium text-zinc-900 bg-white border border-zinc-300 rounded-md hover:bg-zinc-100 disabled:opacity-50 transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-not-allowed"
          >
            {justAdded ? (
              <>
                <Check className="w-4 h-4 text-zinc-950 shrink-0" />
                <span>যুক্ত</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 shrink-0" />
                <span>ব্যাগ</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};

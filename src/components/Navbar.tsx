import React, { useState } from 'react';
import { Menu, ShoppingBag, X } from 'lucide-react';

interface NavbarProps {
  brandName: string;
  logoUrl?: string;
  cartCount: number;
  onOpenCart: () => void;
}

const NAV_ITEMS = [
  { label: 'হোম', href: '#home' },
  { label: 'শপ', href: '#shop' },
  { label: 'আমাদের সম্পর্কে', href: '#about' },
  { label: 'ডেলিভারি ও রিটার্ন', href: '#policy' },
  { label: 'যোগাযোগ', href: '#contact' },
];

export const Navbar: React.FC<NavbarProps> = ({
  brandName,
  logoUrl,
  cartCount,
  onOpenCart,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoIndex, setLogoIndex] = useState(0);

  // Logo candidate sources: explicit settings logoUrl, or standard root logo files
  const logoCandidates = [
    logoUrl,
    '/logo.png',
    '/logo.svg',
    '/logo.webp',
    '/logo.jpg',
  ].filter((src): src is string => Boolean(src && src.trim().length > 0));

  const currentLogoSrc = logoCandidates[logoIndex] || null;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200">
      <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-8">
        {/* Zone 1: Logo or Wordmark */}
        <a
          href="#home"
          className="flex items-center gap-2 font-display text-xl font-bold tracking-tight text-zinc-950 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950"
        >
          {currentLogoSrc ? (
            <img
              src={currentLogoSrc}
              alt={brandName}
              onError={() => setLogoIndex((prev) => prev + 1)}
              className="h-9 max-h-10 w-auto max-w-[180px] object-contain"
            />
          ) : (
            <span>{brandName}</span>
          )}
        </a>

        {/* Zone 2: 5 clean single-line text navigation links */}
        <nav
          aria-label="প্রধান নেভিগেশন"
          className="hidden md:flex items-center gap-7 text-[15px] font-medium text-zinc-600"
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="hover:text-zinc-950 underline-offset-8 hover:underline transition-colors duration-150 whitespace-nowrap shrink-0 py-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: 1 primary action (plus mobile menu trigger on small screens) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenCart}
            className="inline-flex items-center gap-2 min-h-[42px] px-4 py-2 text-sm font-semibold text-white bg-zinc-950 rounded-md hover:bg-zinc-800 transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950"
          >
            <ShoppingBag className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>অর্ডার ব্যাগ</span>
            <span className="font-mono tabular-nums text-xs opacity-90">({cartCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'মেনু বন্ধ করুন' : 'মেনু খুলুন'}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-md border border-zinc-200 text-zinc-900 hover:bg-zinc-100 transition-colors duration-150 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-zinc-200 px-4 pt-2 pb-5">
          <nav aria-label="মোবাইল নেভিগেশন" className="flex flex-col divide-y divide-zinc-100">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-3 text-base font-medium text-zinc-800 hover:text-zinc-950 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

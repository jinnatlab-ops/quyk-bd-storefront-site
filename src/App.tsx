import React, { useEffect, useMemo, useState } from 'react';
import {
  Check,
  Copy,
  MessageCircle,
  Search,
  Settings,
} from 'lucide-react';
import {
  CartItem,
  CustomerInquiry,
  OrderDraftItem,
  ProductCategory,
  SneakerProduct,
  SneakerSize,
  StoreSettings,
} from './types/store';
import { INITIAL_PRODUCTS, INITIAL_STORE_SETTINGS } from './data/catalogConfig';
import {
  ALL_SNEAKER_SIZES,
  buildWhatsAppUrl,
  formatBdtNumber,
  HERO_CAMPAIGN_IMAGE,
  normalizeBangladeshWhatsApp,
} from './utils/storeHelpers';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { SizeGuideModal } from './components/SizeGuideModal';
import { CartDrawer } from './components/CartDrawer';
import { WhatsAppOrderModal } from './components/WhatsAppOrderModal';
import { StoreManagerDrawer, StoreManagerTab } from './components/StoreManagerDrawer';

const STORAGE_KEYS = {
  SETTINGS: 'quyk_bd_store_settings_v1',
  PRODUCTS: 'quyk_bd_store_products_v1',
  CART: 'quyk_bd_store_cart_v1',
  INQUIRIES: 'quyk_bd_store_inquiries_v1',
};

const CATEGORY_TABS: ProductCategory[] = [
  ProductCategory.ALL,
  ProductCategory.LOW_TOP,
  ProductCategory.COURT,
  ProductCategory.HIGH_TOP,
  ProductCategory.RUNNER,
  ProductCategory.SLIP_ON,
  ProductCategory.TRAINER,
];

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [settings, setSettings] = useState<StoreSettings>(() =>
    loadFromStorage(STORAGE_KEYS.SETTINGS, INITIAL_STORE_SETTINGS)
  );
  const [products, setProducts] = useState<SneakerProduct[]>(() =>
    loadFromStorage(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS)
  );
  const [cart, setCart] = useState<CartItem[]>(() =>
    loadFromStorage(STORAGE_KEYS.CART, [])
  );
  const [inquiries, setInquiries] = useState<CustomerInquiry[]>(() =>
    loadFromStorage(STORAGE_KEYS.INQUIRIES, [])
  );

  // Filters & Shop Toolbar State
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>(
    ProductCategory.ALL
  );
  const [sizeFilter, setSizeFilter] = useState<SneakerSize | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickEditMode, setQuickEditMode] = useState(false);

  // Modals & Drawers State
  const [activeProductModal, setActiveProductModal] = useState<{
    product: SneakerProduct;
    size: SneakerSize;
  } | null>(null);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [waOrderItems, setWaOrderItems] = useState<OrderDraftItem[]>([]);
  const [waModalOpen, setWaModalOpen] = useState(false);

  const [storeManagerOpen, setStoreManagerOpen] = useState(false);
  const [storeManagerTab, setStoreManagerTab] = useState<StoreManagerTab>('settings');
  const [productToEditInDrawer, setProductToEditInDrawer] = useState<SneakerProduct | null>(
    null
  );

  // Contact Inquiry Form State
  const [inqName, setInqName] = useState('');
  const [inqContact, setInqContact] = useState('');
  const [inqMessage, setInqMessage] = useState('');
  const [inqSubmitted, setInqSubmitted] = useState(false);
  const [inqCopied, setInqCopied] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {
      // Ignore storage quota issues gracefully
    }
  }, [settings]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch {
      // Ignore storage quota issues gracefully
    }
  }, [products]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch {
      // Ignore storage quota issues gracefully
    }
  }, [cart]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(inquiries));
    } catch {
      // Ignore storage quota issues gracefully
    }
  }, [inquiries]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((product) => {
      if (
        selectedCategory !== ProductCategory.ALL &&
        product.category !== selectedCategory
      ) {
        return false;
      }
      if (sizeFilter !== 'ALL' && !product.availableSizes.includes(sizeFilter)) {
        return false;
      }
      if (q) {
        const hay = `${product.nameBn} ${product.subtitleBn} ${product.sku} ${product.category}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [products, selectedCategory, sizeFilter, searchQuery]);

  const totalCartItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const waInfo = normalizeBangladeshWhatsApp(settings.whatsappNumber);
  const unpricedCount = useMemo(
    () => products.filter((p) => p.priceBdt === null || p.priceBdt <= 0).length,
    [products]
  );

  const handleOpenStoreManager = (
    tab: StoreManagerTab = 'settings',
    productToEdit: SneakerProduct | null = null
  ) => {
    setStoreManagerTab(tab);
    setProductToEditInDrawer(productToEdit);
    setStoreManagerOpen(true);
  };

  const handleAddToCart = (
    product: SneakerProduct,
    size: SneakerSize,
    quantity = 1
  ) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.productId === product.id && item.size === size
      );
      if (existingIdx > -1) {
        return prev.map((item, idx) =>
          idx === existingIdx
            ? { ...item, quantity: Math.min(10, item.quantity + quantity) }
            : item
        );
      }
      return [...prev, { productId: product.id, size, quantity }];
    });
  };

  const handleUpdateCartQty = (
    productId: string,
    size: SneakerSize,
    delta: number
  ) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.productId === productId && item.size === size
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveCartItem = (productId: string, size: SneakerSize) => {
    setCart((prev) =>
      prev.filter((item) => !(item.productId === productId && item.size === size))
    );
  };

  const handleTriggerSingleWhatsAppOrder = (
    product: SneakerProduct,
    size: SneakerSize,
    quantity = 1
  ) => {
    setWaOrderItems([{ product, size, quantity }]);
    setWaModalOpen(true);
  };

  const handleTriggerCartWhatsAppOrder = (items: OrderDraftItem[]) => {
    setWaOrderItems(items);
    setWaModalOpen(true);
  };

  const handleQuickPriceChange = (productId: string, newPriceBdt: number | null) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, priceBdt: newPriceBdt } : p))
    );
  };

  const handleQuickToggleSize = (productId: string, size: SneakerSize) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const exists = p.availableSizes.includes(size);
        const nextSizes = exists
          ? p.availableSizes.filter((s) => s !== size)
          : ([...p.availableSizes, size].sort((a, b) => a - b) as SneakerSize[]);
        return { ...p, availableSizes: nextSizes };
      })
    );
  };

  const handleResetAll = () => {
    setSettings(INITIAL_STORE_SETTINGS);
    setProducts(INITIAL_PRODUCTS);
    window.localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    window.localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inqMessage.trim()) return;

    const record: CustomerInquiry = {
      id: `inq-${Date.now()}`,
      name: inqName.trim() || 'অতিথি গ্রাহক',
      contactInfo: inqContact.trim(),
      subject: 'ওয়েবসাইট জিজ্ঞাসা',
      message: inqMessage.trim(),
      createdAt: new Date().toISOString(),
    };
    setInquiries((prev) => [record, ...prev.slice(0, 19)]);
    setInqSubmitted(true);
  };

  const composedInquiryText = `আসসালামু আলাইকুম ${settings.brandName},\nনাম: ${
    inqName.trim() || 'উল্লেখ করা হয়নি'
  }${inqContact.trim() ? `\nযোগাযোগ: ${inqContact.trim()}` : ''}\nবার্তা: ${inqMessage.trim()}`;

  const insideFeeText = formatBdtNumber(settings.insideDhakaDeliveryBdt);
  const outsideFeeText = formatBdtNumber(settings.outsideDhakaDeliveryBdt);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-[#09090B]">
      {/* Strict 3-Zone Top Bar */}
      <Navbar
        brandName={settings.brandName}
        logoUrl={settings.logoUrl}
        cartCount={totalCartItems}
        onOpenCart={() => setCartDrawerOpen(true)}
      />

      <main className="flex-1">
        {/* SECTION 1: HERO */}
        <section id="home" className="relative bg-black text-white border-b border-zinc-900 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
              {/* Left Column: Headline, Description & CTAs */}
              <div className="lg:col-span-7 flex flex-col items-start text-left">
                {/* Introductory text */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs sm:text-sm font-mono text-zinc-400 mb-6">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>QUYK BD · বাংলাদেশ · স্টাইলিশ ফুটওয়্যারের ভবিষ্যৎ</span>
                </div>

                {/* Main Heading */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
                  Step Into Modern Style.
                </h1>

                {/* Bengali Description */}
                <p className="mt-5 text-base sm:text-lg text-zinc-300 leading-relaxed max-w-2xl font-normal">
                  QUYK BD-এর প্রিমিয়াম স্নিকার্স কালেকশন। সাইজ ৪০–৪৪। সারা বাংলাদেশে হোম ডেলিভারি ও হোয়াটসঅ্যাপে সহজে অর্ডার করুন।
                </p>

                {/* Buttons Row */}
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <a
                    href="#shop"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm sm:text-base font-bold text-zinc-950 bg-white rounded-md hover:bg-zinc-100 transition-colors shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    <span>স্নিকার্স কালেকশন দেখুন</span>
                    <span aria-hidden="true">→</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleOpenStoreManager('products')}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm sm:text-base font-medium text-zinc-200 bg-zinc-900 border border-zinc-800 rounded-md hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-700"
                  >
                    <Settings className="w-4 h-4 text-zinc-400" />
                    <span>পণ্য ও মূল্য এডিট</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Promotional Visual */}
              <div className="lg:col-span-5 flex items-center justify-center">
                <div className="relative w-full rounded-2xl overflow-hidden border border-zinc-800/80 bg-zinc-900/40 shadow-2xl">
                  <img
                    src={HERO_CAMPAIGN_IMAGE}
                    alt="QUYK BD Promotional Banner - Your Style, Our Priority"
                    className="w-full h-auto object-contain block select-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: SHOP COLLECTION */}
        <section id="shop" className="py-16 sm:py-20 border-b border-zinc-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Filter & Search Toolbar */}
            <div className="mb-8 space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Category Tabs */}
                <div
                  className="flex items-center gap-1.5 overflow-x-auto pb-1"
                  role="tablist"
                  aria-label="ক্যাটাগরি ফিল্টার"
                >
                  {CATEGORY_TABS.map((cat) => {
                    const active = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => setSelectedCategory(cat)}
                        className={`min-h-[38px] px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          active
                            ? 'bg-zinc-950 text-white'
                            : 'bg-white text-zinc-700 border border-zinc-200 hover:border-zinc-950'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>

                {/* Size Filter + Search */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                  <div className="flex items-center gap-1 bg-white border border-zinc-200 rounded-md p-1">
                    <span className="px-2 text-xs text-zinc-500 whitespace-nowrap">সাইজ:</span>
                    <button
                      type="button"
                      onClick={() => setSizeFilter('ALL')}
                      className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                        sizeFilter === 'ALL'
                          ? 'bg-zinc-950 text-white'
                          : 'text-zinc-700 hover:bg-zinc-100'
                      }`}
                    >
                      সব
                    </button>
                    {ALL_SNEAKER_SIZES.map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSizeFilter(sz)}
                        className={`px-2.5 py-1 text-xs font-mono tabular-nums rounded transition-colors cursor-pointer ${
                          sizeFilter === sz
                            ? 'bg-zinc-950 text-white font-semibold'
                            : 'text-zinc-700 hover:bg-zinc-100'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>

                  <div className="relative flex-1 sm:w-56">
                    <Search
                      className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      aria-hidden="true"
                    />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="মডেল বা কোড খুঁজুন..."
                      aria-label="স্নিকার্স খুঁজুন"
                      className="w-full h-[38px] pl-9 pr-3 text-xs bg-white border border-zinc-200 rounded-md text-zinc-950 focus:outline-none focus:border-zinc-950"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Product Grid (3 columns desktop, 2 tablet, 1 mobile) */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white border border-zinc-200 rounded-lg p-12 text-center">
                <p className="text-base font-semibold text-zinc-900">
                  আপনার ফিল্টার অনুযায়ী কোনো স্নিকার্স পাওয়া যায়নি
                </p>
                <p className="text-sm text-zinc-500 mt-1">
                  অন্য কোনো সাইজ অথবা ক্যাটাগরি নির্বাচন করে পুনরায় দেখুন।
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory(ProductCategory.ALL);
                    setSizeFilter('ALL');
                    setSearchQuery('');
                  }}
                  className="mt-4 min-h-[40px] px-5 py-2 text-xs font-semibold text-white bg-zinc-950 rounded-md hover:bg-zinc-800 cursor-pointer"
                >
                  ফিল্টার রিসেট করুন
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 lg:gap-8">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    quickEditMode={quickEditMode}
                    onSelectProduct={(p, size) => setActiveProductModal({ product: p, size })}
                    onWhatsAppOrder={(p, size) => handleTriggerSingleWhatsAppOrder(p, size, 1)}
                    onAddToCart={(p, size) => handleAddToCart(p, size, 1)}
                    onQuickPriceChange={handleQuickPriceChange}
                    onQuickToggleSize={handleQuickToggleSize}
                    onEditFullProduct={(p) => handleOpenStoreManager('products', p)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* SECTION 3: ABOUT US */}
        <section id="about" className="py-16 sm:py-20 bg-white border-b border-zinc-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
              <div className="lg:col-span-5">
                <div className="text-xs text-zinc-500 mb-2">আমাদের সম্পর্কে · QUYK BD</div>
                <h2 className="text-2xl sm:text-3xl font-bold text-zinc-950 leading-snug [text-wrap:balance]">
                  Our Story, Our Style.
                </h2>
                <p className="mt-4 text-[15px] text-zinc-600 leading-relaxed">
                  QUYK BD একটি আধুনিক স্নিকার্স ব্র্যান্ড, যেখানে স্টাইল, আরাম ও মানসম্মত ডিজাইনের সমন্বয় করা হয়। আমাদের লক্ষ্য হলো বাংলাদেশের তরুণ প্রজন্মের জন্য আকর্ষণীয় স্নিকার্স সহজলভ্য করা। প্রতিদিনের চলাফেরা থেকে শুরু করে বন্ধুদের সঙ্গে আড্ডা—প্রতিটি মুহূর্তে আপনার স্টাইলকে আরও সুন্দর করে তুলতে আমরা প্রতিশ্রুতিবদ্ধ।
                </p>
              </div>

              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="p-6 bg-[#FAFAFA] border border-zinc-200 rounded-lg">
                  <div className="font-mono text-xs font-semibold text-zinc-400">01.</div>
                  <h3 className="mt-2 text-base font-bold text-zinc-950">
                    চিরন্তন মনোক্লোম ডিজাইন
                  </h3>
                  <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
                    ব্ল্যাক ও হোয়াইট প্যালেটের কারণে প্রতিটি জোড়া যেকোনো পোশাকের সাথে অনায়াসে মানিয়ে যায়।
                  </p>
                </div>

                <div className="p-6 bg-[#FAFAFA] border border-zinc-200 rounded-lg">
                  <div className="font-mono text-xs font-semibold text-zinc-400">02.</div>
                  <h3 className="mt-2 text-base font-bold text-zinc-950">
                    দীর্ঘস্থায়ী স্টিচ ও সোল
                  </h3>
                  <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
                    প্রতিদিন দীর্ঘ সময় হাঁটার সুবিধার্থে কুশনড ফুটবেড ও নন-স্লিপ রাবার সোল যুক্ত করা হয়েছে।
                  </p>
                </div>

                <div className="p-6 bg-[#FAFAFA] border border-zinc-200 rounded-lg">
                  <div className="font-mono text-xs font-semibold text-zinc-400">03.</div>
                  <h3 className="mt-2 text-base font-bold text-zinc-950">
                    শিপমেন্ট পূর্ব মান যাচাই
                  </h3>
                  <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
                    কুরিয়ারে বুকিং দেওয়ার আগে প্রতিটি স্নিকার্সের ফিনিশিং ও সাইজ (40–44) ম্যানুয়ালি পরীক্ষা করা হয়।
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: DELIVERY AND RETURN POLICY */}
        <section id="policy" className="py-16 sm:py-20 bg-[#FAFAFA] border-b border-zinc-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-10">
              <div className="text-xs text-zinc-500 mb-1.5">গ্রাহক সেবা ও শর্তাবলি</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-zinc-950 [text-wrap:balance]">
                ডেলিভারি এবং রিটার্ন নীতিমালা
              </h2>
              <p className="mt-2 text-[15px] text-zinc-600 leading-relaxed">
                স্বচ্ছ ও ঝামেলাহীন কেনাকাটার অভিজ্ঞতার জন্য আমাদের ডেলিভারি নীতিমালা নিচে তুলে ধরা হলো।
              </p>
            </div>

            <div className="max-w-3xl">
              {/* Delivery Policy Card */}
              <div className="bg-white border border-zinc-200 rounded-lg p-6 sm:p-8 space-y-5">
                <div className="pb-4 border-b border-zinc-200">
                  <span className="font-mono text-xs text-zinc-500">হোম ডেলিভারি</span>
                  <h3 className="text-xl font-bold text-zinc-950 mt-1">
                    সারা বাংলাদেশে দ্রুত কুরিয়ার ডেলিভারি
                  </h3>
                </div>

                <div className="space-y-4 text-sm text-zinc-700 leading-relaxed">
                  <div className="flex items-start justify-between gap-4 pb-3 border-b border-zinc-100">
                    <div>
                      <div className="font-semibold text-zinc-950">ঢাকা মেট্রো এরিয়া</div>
                      <div className="text-xs text-zinc-500 mt-0.5">
                        আনুমানিক সময়: {settings.deliveryTimeInsideDhakaBn}
                      </div>
                    </div>
                    <div className="font-mono text-xs font-semibold text-zinc-900 tabular-nums text-right">
                      {insideFeeText ? insideFeeText : 'কুরিয়ার চার্জ প্রযোজ্য'}
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-4 pb-3 border-b border-zinc-100">
                    <div>
                      <div className="font-semibold text-zinc-950">ঢাকার বাইরে (সকল জেলা ও উপজেলা)</div>
                      <div className="text-xs text-zinc-500 mt-0.5">
                        আনুমানিক সময়: {settings.deliveryTimeOutsideDhakaBn}
                      </div>
                    </div>
                    <div className="font-mono text-xs font-semibold text-zinc-900 tabular-nums text-right">
                      {outsideFeeText ? outsideFeeText : 'কুরিয়ার চার্জ প্রযোজ্য'}
                    </div>
                  </div>

                  <p>
                    <strong className="font-semibold text-zinc-950">ক্যাশ অন ডেলিভারি:</strong>{' '}
                    অর্ডার নিশ্চিত করতে ডেলিভারি চার্জ আগে পরিশোধ করতে হবে। জুতা হাতে পাওয়ার পর বাকি মূল্য কুরিয়ার প্রতিনিধিকে পরিশোধ করুন।
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: CONTACT */}
        <section id="contact" className="py-16 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Contact Details Column */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <div className="text-xs text-zinc-500 mb-1.5">সরাসরি যোগাযোগ</div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-zinc-950">
                    আমাদের সাথে কথা বলুন
                  </h2>
                  <p className="mt-2 text-[15px] text-zinc-600 leading-relaxed">
                    সাইজ পরামর্শ, পাইকারি বা খুচরা অর্ডার এবং যেকোনো প্রশ্নের জন্য আমাদের হোয়াটসঅ্যাপে অথবা নিচের ফর্মে বার্তা পাঠান।
                  </p>
                </div>

                <div className="border border-zinc-200 rounded-lg divide-y divide-zinc-200 bg-[#FAFAFA]">
                  <div className="p-5">
                    <div className="text-xs text-zinc-500">হোয়াটসঅ্যাপ অর্ডার ও সাপোর্ট</div>
                    {waInfo.isValid ? (
                      <div className="mt-1.5 flex items-center justify-between gap-3">
                        <span className="font-mono text-base font-bold text-zinc-950 tabular-nums">
                          {waInfo.displayNumber}
                        </span>
                        <a
                          href={buildWhatsAppUrl(
                            waInfo.waNumber,
                            `আসসালামু আলাইকুম ${settings.brandName}, আমি স্নিকার্স সম্পর্কে জানতে চাই।`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-zinc-950 rounded-md hover:bg-zinc-800 whitespace-nowrap"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>মেসেজ দিন</span>
                        </a>
                      </div>
                    ) : (
                      <div className="mt-1.5 flex items-center justify-between gap-3">
                        <span className="text-sm text-zinc-600">নম্বর এখনো যুক্ত করা হয়নি</span>
                        <button
                          type="button"
                          onClick={() => handleOpenStoreManager('settings')}
                          className="text-xs font-semibold text-zinc-950 underline underline-offset-4 whitespace-nowrap cursor-pointer"
                        >
                          নম্বর যুক্ত করুন
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="text-xs text-zinc-500">অবস্থান</div>
                    <div className="mt-1 text-sm font-semibold text-zinc-950">
                      {settings.locationBn}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="text-xs text-zinc-500">কাস্টমার সাপোর্ট সময়</div>
                    <div className="mt-1 text-sm font-semibold text-zinc-950">
                      {settings.businessHoursBn}
                    </div>
                  </div>

                  {settings.contactEmail.trim() && (
                    <div className="p-5">
                      <div className="text-xs text-zinc-500">ইমেইল</div>
                      <a
                        href={`mailto:${settings.contactEmail.trim()}`}
                        className="mt-1 inline-block text-sm font-mono font-semibold text-zinc-950 hover:underline"
                      >
                        {settings.contactEmail.trim()}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Inquiry Form Column */}
              <div className="lg:col-span-7">
                <form
                  onSubmit={handleContactSubmit}
                  className="bg-[#FAFAFA] border border-zinc-200 rounded-lg p-6 sm:p-8 space-y-4"
                >
                  <h3 className="text-lg font-bold text-zinc-950">জিজ্ঞাসা বা মেসেজ পাঠান</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="contact-name"
                        className="block text-xs font-semibold text-zinc-800 mb-1.5"
                      >
                        আপনার নাম
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        value={inqName}
                        onChange={(e) => {
                          setInqName(e.target.value);
                          setInqSubmitted(false);
                        }}
                        placeholder="আপনার নাম লিখুন"
                        className="w-full px-3.5 py-2.5 text-sm bg-white border border-zinc-300 rounded-md focus:outline-none focus:border-zinc-950"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="contact-info"
                        className="block text-xs font-semibold text-zinc-800 mb-1.5"
                      >
                        মোবাইল বা ইমেইল (ঐচ্ছিক)
                      </label>
                      <input
                        id="contact-info"
                        type="text"
                        value={inqContact}
                        onChange={(e) => {
                          setInqContact(e.target.value);
                          setInqSubmitted(false);
                        }}
                        placeholder="যোগাযোগের মাধ্যম লিখুন"
                        className="w-full px-3.5 py-2.5 text-sm bg-white border border-zinc-300 rounded-md focus:outline-none focus:border-zinc-950"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="contact-message"
                      className="block text-xs font-semibold text-zinc-800 mb-1.5"
                    >
                      আপনার বার্তা *
                    </label>
                    <textarea
                      id="contact-message"
                      required
                      rows={4}
                      value={inqMessage}
                      onChange={(e) => {
                        setInqMessage(e.target.value);
                        setInqSubmitted(false);
                      }}
                      placeholder="সাইজ (40–44), স্টক বা ডেলিভারি সম্পর্কে আপনার প্রশ্ন লিখুন..."
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-zinc-300 rounded-md focus:outline-none focus:border-zinc-950"
                    />
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-2.5 text-sm font-semibold text-white bg-zinc-950 rounded-md hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      <span>বার্তা প্রস্তুত করুন</span>
                    </button>

                    {waInfo.isValid && inqMessage.trim() && (
                      <a
                        href={buildWhatsAppUrl(waInfo.waNumber, composedInquiryText)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 text-sm font-semibold text-zinc-950 bg-white border border-zinc-300 rounded-md hover:bg-zinc-100 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>হোয়াটসঅ্যাপে পাঠান</span>
                      </a>
                    )}
                  </div>

                  {inqSubmitted && (
                    <div className="p-4 bg-white border border-zinc-300 rounded-md space-y-2">
                      <div className="text-xs font-semibold text-zinc-950">
                        আপনার বার্তাটি সংরক্ষিত ও প্রস্তুত হয়েছে।
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {waInfo.isValid ? (
                          <a
                            href={buildWhatsAppUrl(waInfo.waNumber, composedInquiryText)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-zinc-950 rounded-md"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>সরাসরি হোয়াটসঅ্যাপে ওপেন করুন</span>
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(composedInquiryText);
                                setInqCopied(true);
                                window.setTimeout(() => setInqCopied(false), 1800);
                              } catch {
                                setInqCopied(false);
                              }
                            }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-zinc-900 bg-zinc-100 border border-zinc-300 rounded-md cursor-pointer"
                          >
                            {inqCopied ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span>{inqCopied ? 'কপি হয়েছে' : 'বার্তা কপি করুন'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Monochrome Footer */}
      <footer className="bg-zinc-950 text-zinc-400 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-8 border-b border-zinc-800">
            <div>
              <span className="font-display text-xl font-bold text-white tracking-tight">
                {settings.brandName}
              </span>
              <p className="text-sm text-zinc-400 mt-1.5 max-w-sm">
                বাংলাদেশের প্রিমিয়াম ব্ল্যাক অ্যান্ড হোয়াইট স্নিকার্স অনলাইন স্টোর। সাইজ EU 40–44।
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <a href="#home" className="hover:text-white transition-colors">
                হোম
              </a>
              <a href="#shop" className="hover:text-white transition-colors">
                শপ
              </a>
              <a href="#about" className="hover:text-white transition-colors">
                আমাদের সম্পর্কে
              </a>
              <a href="#policy" className="hover:text-white transition-colors">
                ডেলিভারি ও রিটার্ন
              </a>
              <a href="#contact" className="hover:text-white transition-colors">
                যোগাযোগ
              </a>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <p>© {new Date().getFullYear()} {settings.brandName} · সর্বস্বত্ব সংরক্ষিত · বাংলাদেশ</p>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => setSizeGuideOpen(true)}
                className="text-zinc-300 hover:text-white underline underline-offset-4 cursor-pointer"
              >
                সাইজ গাইড (40–44)
              </button>
              <button
                type="button"
                onClick={() => handleOpenStoreManager('publish')}
                className="text-zinc-300 hover:text-white underline underline-offset-4 cursor-pointer"
              >
                স্টোর এডিটর ও ফ্রি পাবলিশিং
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals & Slide-Over Drawers */}
      <ProductDetailModal
        product={activeProductModal?.product ?? null}
        initialSize={activeProductModal?.size ?? 42}
        onClose={() => setActiveProductModal(null)}
        onWhatsAppOrder={(product, size, qty) =>
          handleTriggerSingleWhatsAppOrder(product, size, qty)
        }
        onAddToCart={(product, size, qty) => handleAddToCart(product, size, qty)}
        onOpenSizeGuide={() => setSizeGuideOpen(true)}
        onEditProduct={(product) => handleOpenStoreManager('products', product)}
      />

      <SizeGuideModal isOpen={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />

      <CartDrawer
        isOpen={cartDrawerOpen}
        cart={cart}
        products={products}
        onClose={() => setCartDrawerOpen(false)}
        onUpdateQuantity={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={() => setCart([])}
        onProceedWhatsAppCheckout={handleTriggerCartWhatsAppOrder}
      />

      <WhatsAppOrderModal
        isOpen={waModalOpen}
        initialItems={waOrderItems}
        settings={settings}
        onClose={() => setWaModalOpen(false)}
        onOpenStoreSettings={() => handleOpenStoreManager('settings')}
      />

      <StoreManagerDrawer
        isOpen={storeManagerOpen}
        initialTab={storeManagerTab}
        editingProductInitial={productToEditInDrawer}
        settings={settings}
        products={products}
        onClose={() => {
          setStoreManagerOpen(false);
          setProductToEditInDrawer(null);
        }}
        onUpdateSettings={setSettings}
        onUpdateProducts={setProducts}
        onResetAllToDefaults={handleResetAll}
      />
    </div>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  Copy,
  Download,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  PresetImageKey,
  ProductCategory,
  SneakerProduct,
  SneakerSize,
  StoreSettings,
} from '../types/store';
import {
  ALL_SNEAKER_SIZES,
  compressImageFileToDataUrl,
  generateCatalogConfigTsCode,
  normalizeBangladeshWhatsApp,
  PRESET_IMAGES,
  resolveProductImage,
} from '../utils/storeHelpers';
import { SneakerImage } from './SneakerImage';

export type StoreManagerTab = 'settings' | 'products' | 'publish';

interface StoreManagerDrawerProps {
  isOpen: boolean;
  initialTab: StoreManagerTab;
  editingProductInitial: SneakerProduct | null;
  settings: StoreSettings;
  products: SneakerProduct[];
  onClose: () => void;
  onUpdateSettings: (nextSettings: StoreSettings) => void;
  onUpdateProducts: (nextProducts: SneakerProduct[]) => void;
  onResetAllToDefaults: () => void;
}

const EDITABLE_CATEGORIES: Exclude<ProductCategory, ProductCategory.ALL>[] = [
  ProductCategory.LOW_TOP,
  ProductCategory.COURT,
  ProductCategory.HIGH_TOP,
  ProductCategory.RUNNER,
  ProductCategory.SLIP_ON,
  ProductCategory.TRAINER,
];

function createBlankSneaker(nextIndex: number): SneakerProduct {
  const padded = String(nextIndex).padStart(2, '0');
  return {
    id: `quyk-${Date.now()}`,
    sku: `QYK-${padded}`,
    nameBn: '',
    subtitleBn: '',
    category: ProductCategory.LOW_TOP,
    priceBdt: null,
    compareAtPriceBdt: null,
    availableSizes: [40, 41, 42, 43, 44],
    inStock: true,
    presetImageKey: 'obsidian_low',
    customImageUrl: '',
    descriptionBn: '',
    upperMaterialBn: 'প্রিমিয়াম লেদার ও ব্রিদেবল লাইনিং',
    soleMaterialBn: 'কুশনড রাবার আউটসোল',
    colorwayBn: 'ব্ল্যাক / হোয়াইট',
  };
}

export const StoreManagerDrawer: React.FC<StoreManagerDrawerProps> = ({
  isOpen,
  initialTab,
  editingProductInitial,
  settings,
  products,
  onClose,
  onUpdateSettings,
  onUpdateProducts,
  onResetAllToDefaults,
}) => {
  const [activeTab, setActiveTab] = useState<StoreManagerTab>(initialTab);
  const [editingProduct, setEditingProduct] = useState<SneakerProduct | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [importStatus, setImportStatus] = useState('');
  const fileUploadRef = useRef<HTMLInputElement | null>(null);
  const jsonImportRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (editingProductInitial) {
        setActiveTab('products');
        const initialImages =
          editingProductInitial.images && editingProductInitial.images.length > 0
            ? [...editingProductInitial.images]
            : (editingProductInitial.customImageUrl
                ? [editingProductInitial.customImageUrl]
                : (editingProductInitial.presetImageKey && PRESET_IMAGES[editingProductInitial.presetImageKey]
                    ? [PRESET_IMAGES[editingProductInitial.presetImageKey].url]
                    : []));
        setEditingProduct({ ...editingProductInitial, images: initialImages });
        setIsNewProduct(false);
      } else {
        setActiveTab(initialTab);
        setEditingProduct(null);
        setIsNewProduct(false);
      }
      setFormError('');
      setDeleteConfirmId(null);
      setResetConfirm(false);
      setImportStatus('');
    }
  }, [isOpen, initialTab, editingProductInitial]);

  if (!isOpen) return null;

  const waInfo = normalizeBangladeshWhatsApp(settings.whatsappNumber);
  const generatedCode = generateCatalogConfigTsCode(settings, products);

  const handleSaveProductForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (!editingProduct.nameBn.trim()) {
      setFormError('পণ্যের বাংলা নাম লিখুন।');
      return;
    }

    const finalImages =
      editingProduct.images && editingProduct.images.length > 0
        ? editingProduct.images.map((img) => img.trim()).filter((img) => img.length > 0)
        : (editingProduct.customImageUrl ? [editingProduct.customImageUrl.trim()] : []);

    const cleanedProduct: SneakerProduct = {
      ...editingProduct,
      nameBn: editingProduct.nameBn.trim(),
      sku: editingProduct.sku.trim() || 'QYK-NEW',
      subtitleBn: editingProduct.subtitleBn.trim() || 'মনোক্লোম এডিশন স্নিকার্স',
      descriptionBn:
        editingProduct.descriptionBn.trim() ||
        'প্রিমিয়াম মনোক্লোম ডিজাইন ও আরামদায়ক কুশনড সোলসহ দৈনন্দিন ব্যবহারের উপযোগী স্নিকার্স।',
      availableSizes: [...editingProduct.availableSizes].sort((a, b) => a - b),
      images: finalImages,
      customImageUrl: finalImages[0] || editingProduct.customImageUrl || '',
    };

    if (isNewProduct) {
      onUpdateProducts([cleanedProduct, ...products]);
    } else {
      onUpdateProducts(
        products.map((p) => (p.id === cleanedProduct.id ? cleanedProduct : p))
      );
    }

    setEditingProduct(null);
    setIsNewProduct(false);
    setFormError('');
  };

  const handleMultipleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !editingProduct) return;

    setFormError('');

    const validImageTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/avif',
    ];

    const currentImages =
      editingProduct.images && editingProduct.images.length > 0
        ? [...editingProduct.images]
        : (editingProduct.customImageUrl ? [editingProduct.customImageUrl] : []);

    const remainingSlots = Math.max(0, 4 - currentImages.length);
    if (remainingSlots === 0) {
      setFormError('ইতিমধ্যে সর্বোচ্চ ৪টি ছবি যুক্ত করা হয়েছে। নতুন ছবি যোগ করতে কোনো একটি ছবি মুছুন।');
      if (fileUploadRef.current) fileUploadRef.current.value = '';
      return;
    }

    const fileList = Array.from(files);
    const filesToProcess = fileList.slice(0, remainingSlots);

    // Validate file formats
    const invalidFile = filesToProcess.find(
      (f) => !validImageTypes.includes(f.type.toLowerCase()) && !f.type.startsWith('image/')
    );
    if (invalidFile) {
      setFormError(`"${invalidFile.name}" সমর্থনযোগ্য ছবির ফাইল নয়। শুধুমাত্র JPG, PNG বা WebP ছবি আপলোড করুন।`);
      if (fileUploadRef.current) fileUploadRef.current.value = '';
      return;
    }

    // Validate size (max 12MB each)
    const oversizedFile = filesToProcess.find((f) => f.size > 12 * 1024 * 1024);
    if (oversizedFile) {
      setFormError(`"${oversizedFile.name}" ছবির সাইজ অনেক বড়। প্রতিটি ছবি সর্বোচ্চ ১২MB হতে পারবে।`);
      if (fileUploadRef.current) fileUploadRef.current.value = '';
      return;
    }

    try {
      const compressedList: string[] = [];
      for (const file of filesToProcess) {
        const dataUrl = await compressImageFileToDataUrl(file, 850);
        compressedList.push(dataUrl);
      }

      const nextImages = [...currentImages, ...compressedList].slice(0, 4);
      setEditingProduct({
        ...editingProduct,
        images: nextImages,
        customImageUrl: nextImages[0] || '',
      });

      if (fileList.length > remainingSlots) {
        setFormError(`সর্বোচ্চ ৪টি ছবি অনুমোদিত। অতিরিক্ত ছবি ছাড়া প্রথম ${remainingSlots}টি ছবি সফলভাবে যুক্ত হয়েছে।`);
      } else {
        setFormError('');
      }

      if (fileUploadRef.current) fileUploadRef.current.value = '';
    } catch {
      setFormError('ছবি আপলোড ও প্রসেস করতে সমস্যা হয়েছে। অনুগ্রহ করে ফাইলের ফরম্যাট যাচাই করে পুনরায় চেষ্টা করুন।');
      if (fileUploadRef.current) fileUploadRef.current.value = '';
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    if (!editingProduct) return;
    const currentImages =
      editingProduct.images && editingProduct.images.length > 0
        ? [...editingProduct.images]
        : (editingProduct.customImageUrl ? [editingProduct.customImageUrl] : []);
    const updated = currentImages.filter((_, idx) => idx !== indexToRemove);
    setEditingProduct({
      ...editingProduct,
      images: updated,
      customImageUrl: updated[0] || '',
    });
  };

  const handleSetPrimaryImage = (indexToPrimary: number) => {
    if (!editingProduct || indexToPrimary === 0) return;
    const currentImages =
      editingProduct.images && editingProduct.images.length > 0
        ? [...editingProduct.images]
        : (editingProduct.customImageUrl ? [editingProduct.customImageUrl] : []);
    const [target] = currentImages.splice(indexToPrimary, 1);
    const updated = [target, ...currentImages];
    setEditingProduct({
      ...editingProduct,
      images: updated,
      customImageUrl: updated[0] || '',
    });
  };

  const handleAddImageUrl = (url: string) => {
    if (!editingProduct) return;
    const trimmed = url.trim();
    if (!trimmed) return;
    const currentImages =
      editingProduct.images && editingProduct.images.length > 0
        ? [...editingProduct.images]
        : (editingProduct.customImageUrl ? [editingProduct.customImageUrl] : []);
    if (currentImages.length >= 4) {
      setFormError('সর্বোচ্চ ৪টি ছবি যুক্ত করা যাবে।');
      return;
    }
    const updated = [...currentImages, trimmed];
    setEditingProduct({
      ...editingProduct,
      images: updated,
      customImageUrl: updated[0] || '',
    });
    setFormError('');
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopiedConfig(true);
      window.setTimeout(() => setCopiedConfig(false), 2200);
    } catch {
      setCopiedConfig(false);
    }
  };

  const handleDownloadJsonBackup = () => {
    const backupObj = {
      exportedAt: new Date().toISOString(),
      settings,
      products,
    };
    const blob = new Blob([JSON.stringify(backupObj, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'quyk-bd-store-backup.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportJsonBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (parsed.settings && Array.isArray(parsed.products)) {
          onUpdateSettings(parsed.settings);
          onUpdateProducts(parsed.products);
          setImportStatus('সফলভাবে স্টোর ব্যাকআপ ইমপোর্ট করা হয়েছে।');
        } else {
          setImportStatus('ফাইলের গঠন সঠিক নয়।');
        }
      } catch {
        setImportStatus('JSON ফাইল পড়া সম্ভব হয়নি।');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60"
      role="dialog"
      aria-modal="true"
      aria-labelledby="store-manager-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white h-full flex flex-col border-l border-zinc-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
          <div>
            <h2 id="store-manager-title" className="text-lg font-bold text-zinc-950">
              QUYK BD স্টোর ম্যানেজার ও পাবলিশিং প্যানেল
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              পণ্য, BDT মূল্য, সাইজ (40–44) ও হোয়াটসঅ্যাপ নম্বর সহজেই পরিবর্তন করুন
            </p>
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

        {/* Segmented Tab Bar */}
        <div className="px-6 py-3 bg-zinc-50 border-b border-zinc-200 flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => {
              setActiveTab('settings');
              setEditingProduct(null);
            }}
            className={`px-3.5 py-2 text-xs font-semibold rounded-md whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-zinc-950 text-white'
                : 'bg-white text-zinc-700 border border-zinc-200 hover:border-zinc-950'
            }`}
          >
            ১. হোয়াটসঅ্যাপ ও স্টোর তথ্য
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-md whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === 'products'
                ? 'bg-zinc-950 text-white'
                : 'bg-white text-zinc-700 border border-zinc-200 hover:border-zinc-950'
            }`}
          >
            ২. পণ্য ও মূল্য ({products.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('publish');
              setEditingProduct(null);
            }}
            className={`px-3.5 py-2 text-xs font-semibold rounded-md whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === 'publish'
                ? 'bg-zinc-950 text-white'
                : 'bg-white text-zinc-700 border border-zinc-200 hover:border-zinc-950'
            }`}
          >
            ৩. ফ্রি পাবলিশিং কিট
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-5">
              <div className="p-4 border border-zinc-200 bg-zinc-50 rounded-md">
                <label
                  htmlFor="setting-whatsapp"
                  className="block text-sm font-bold text-zinc-950 mb-1"
                >
                  অফিসিয়াল হোয়াটসঅ্যাপ অর্ডার নম্বর
                </label>
                <p className="text-xs text-zinc-600 mb-3">
                  আপনার বাংলাদেশি মোবাইল বা হোয়াটসঅ্যাপ নম্বর লিখুন। দেশের কোড না দিলেও ১১ ডিজিটের নম্বর স্বয়ংক্রিয়ভাবে আন্তর্জাতিক ফরম্যাটে যুক্ত হবে।
                </p>
                <input
                  id="setting-whatsapp"
                  type="tel"
                  value={settings.whatsappNumber}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, whatsappNumber: e.target.value })
                  }
                  placeholder="কান্ট্রি কোডসহ আপনার হোয়াটসঅ্যাপ নম্বর লিখুন"
                  className="w-full px-3.5 py-2.5 text-sm font-mono bg-white border border-zinc-300 rounded-md text-zinc-950 focus:outline-none focus:border-zinc-950"
                />
                <div className="mt-2 text-xs">
                  {!waInfo.isConfigured ? (
                    <span className="text-zinc-500">
                      বর্তমানে কোনো নম্বর যুক্ত নেই। নম্বর লিখলে সব অর্ডার বাটন সক্রিয় হবে।
                    </span>
                  ) : waInfo.isValid ? (
                    <span className="text-zinc-900 font-medium font-mono">
                      সক্রিয় লিংক: wa.me/{waInfo.waNumber}
                    </span>
                  ) : (
                    <span className="text-red-600 font-medium">
                      অনুগ্রহ করে সঠিক সংখ্যায় হোয়াটসঅ্যাপ নম্বর লিখুন।
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 border border-zinc-200 bg-zinc-50 rounded-md space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-bold text-zinc-950">
                      ওয়েবসাইট লোগো
                    </label>
                    <p className="text-xs text-zinc-500">
                      হেডারে লোগো ইমেজ ব্যবহার করুন (যেমন: /logo.png অথবা ছবি আপলোড করুন)
                    </p>
                  </div>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-900 bg-white border border-zinc-300 rounded-md hover:bg-zinc-100 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>লোগো আপলোড</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const dataUrl = await compressImageFileToDataUrl(file);
                          onUpdateSettings({ ...settings, logoUrl: dataUrl });
                        } catch {
                          setFormError('লোগো প্রক্রিয়া করতে সমস্যা হয়েছে।');
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
                <input
                  type="text"
                  value={settings.logoUrl || ''}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, logoUrl: e.target.value })
                  }
                  placeholder="লোগোর URL বা পাথ (যেমন: /logo.png)"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-zinc-300 rounded-md text-zinc-950 focus:outline-none focus:border-zinc-950"
                />
                {settings.logoUrl && (
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-500">প্রিভিউ:</span>
                      <img
                        src={settings.logoUrl}
                        alt="Logo Preview"
                        className="h-8 max-w-[120px] object-contain border border-zinc-200 bg-white rounded px-2 py-1"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => onUpdateSettings({ ...settings, logoUrl: '' })}
                      className="text-zinc-500 hover:text-red-600 underline cursor-pointer"
                    >
                      লোগো সরান
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="setting-inside-dhaka"
                    className="block text-xs font-semibold text-zinc-800 mb-1.5"
                  >
                    ঢাকার ভেতরে ডেলিভারি চার্জ (BDT)
                  </label>
                  <input
                    id="setting-inside-dhaka"
                    type="number"
                    min={0}
                    value={settings.insideDhakaDeliveryBdt ?? ''}
                    placeholder="চার্জ লিখুন (BDT)"
                    onChange={(e) => {
                      const v = e.target.value.trim();
                      onUpdateSettings({
                        ...settings,
                        insideDhakaDeliveryBdt: v === '' ? null : Math.max(0, Number(v)),
                      });
                    }}
                    className="w-full px-3.5 py-2.5 text-sm font-mono tabular-nums bg-white border border-zinc-300 rounded-md text-zinc-950 focus:outline-none focus:border-zinc-950"
                  />
                </div>

                <div>
                  <label
                    htmlFor="setting-outside-dhaka"
                    className="block text-xs font-semibold text-zinc-800 mb-1.5"
                  >
                    ঢাকার বাইরে ডেলিভারি চার্জ (BDT)
                  </label>
                  <input
                    id="setting-outside-dhaka"
                    type="number"
                    min={0}
                    value={settings.outsideDhakaDeliveryBdt ?? ''}
                    placeholder="চার্জ লিখুন (BDT)"
                    onChange={(e) => {
                      const v = e.target.value.trim();
                      onUpdateSettings({
                        ...settings,
                        outsideDhakaDeliveryBdt: v === '' ? null : Math.max(0, Number(v)),
                      });
                    }}
                    className="w-full px-3.5 py-2.5 text-sm font-mono tabular-nums bg-white border border-zinc-300 rounded-md text-zinc-950 focus:outline-none focus:border-zinc-950"
                  />
                </div>

                <div>
                  <label
                    htmlFor="setting-email"
                    className="block text-xs font-semibold text-zinc-800 mb-1.5"
                  >
                    অফিসিয়াল ইমেইল (ঐচ্ছিক)
                  </label>
                  <input
                    id="setting-email"
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) =>
                      onUpdateSettings({ ...settings, contactEmail: e.target.value })
                    }
                    placeholder="আপনার ব্র্যান্ডের ইমেইল লিখুন"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-zinc-300 rounded-md text-zinc-950 focus:outline-none focus:border-zinc-950"
                  />
                </div>

                <div>
                  <label
                    htmlFor="setting-location"
                    className="block text-xs font-semibold text-zinc-800 mb-1.5"
                  >
                    অবস্থান / ঠিকানা
                  </label>
                  <input
                    id="setting-location"
                    type="text"
                    value={settings.locationBn}
                    onChange={(e) =>
                      onUpdateSettings({ ...settings, locationBn: e.target.value })
                    }
                    placeholder="আপনার শোরুম বা শহরের নাম"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-zinc-300 rounded-md text-zinc-950 focus:outline-none focus:border-zinc-950"
                  />
                </div>

                <div>
                  <label
                    htmlFor="setting-hours"
                    className="block text-xs font-semibold text-zinc-800 mb-1.5"
                  >
                    কাস্টমার সাপোর্ট সময়সূচি
                  </label>
                  <input
                    id="setting-hours"
                    type="text"
                    value={settings.businessHoursBn}
                    onChange={(e) =>
                      onUpdateSettings({ ...settings, businessHoursBn: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-zinc-300 rounded-md text-zinc-950 focus:outline-none focus:border-zinc-950"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS */}
          {activeTab === 'products' && !editingProduct && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs text-zinc-600">
                  নিচের তালিকা থেকে সরাসরি যেকোনো স্নিকার্সের BDT মূল্য লিখুন অথবা পূর্ণ তথ্য সম্পাদনা করুন।
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(createBlankSneaker(products.length + 1));
                    setIsNewProduct(true);
                    setFormError('');
                  }}
                  className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 text-xs font-semibold text-white bg-zinc-950 rounded-md hover:bg-zinc-800 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন স্নিকার্স যোগ</span>
                </button>
              </div>

              <div className="divide-y divide-zinc-200 border border-zinc-200 rounded-md">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-16 h-12 rounded overflow-hidden bg-[#F4F4F5] border border-zinc-200 shrink-0">
                        <SneakerImage
                          src={resolveProductImage(product)}
                          alt={product.nameBn}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-zinc-950 truncate">
                          {product.nameBn}
                        </h3>
                        <p className="text-xs text-zinc-500 font-mono flex items-center gap-2 flex-wrap">
                          <span>{product.sku}</span>
                          <span>·</span>
                          <span>সাইজ: {product.availableSizes.join(', ')}</span>
                          {product.images && product.images.length > 1 && (
                            <span className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 text-[10px] font-semibold border border-zinc-200">
                              📷 {product.images.length}টি অ্যাঙ্গেল
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="relative w-36">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-500">
                          ৳
                        </span>
                        <input
                          type="number"
                          min={0}
                          aria-label={`${product.nameBn} মূল্য (BDT)`}
                          value={product.priceBdt ?? ''}
                          placeholder="মূল্য (BDT)"
                          onChange={(e) => {
                            const val = e.target.value.trim();
                            const nextPrice =
                              val === '' ? null : Math.max(0, Number(val));
                            onUpdateProducts(
                              products.map((p) =>
                                p.id === product.id ? { ...p, priceBdt: nextPrice } : p
                              )
                            );
                          }}
                          className="w-full pl-6 pr-2.5 py-2 text-xs font-mono tabular-nums bg-zinc-50 border border-zinc-300 rounded-md text-zinc-950 focus:outline-none focus:border-zinc-950 focus:bg-white"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const initialImgs =
                            product.images && product.images.length > 0
                              ? [...product.images]
                              : (product.customImageUrl
                                  ? [product.customImageUrl]
                                  : (product.presetImageKey && PRESET_IMAGES[product.presetImageKey]
                                      ? [PRESET_IMAGES[product.presetImageKey].url]
                                      : []));
                          setEditingProduct({ ...product, images: initialImgs });
                          setIsNewProduct(false);
                          setFormError('');
                        }}
                        className="inline-flex items-center gap-1 min-h-[36px] px-3 py-1.5 text-xs font-medium text-zinc-900 bg-white border border-zinc-300 rounded-md hover:bg-zinc-100 cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>এডিট</span>
                      </button>

                      {deleteConfirmId === product.id ? (
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateProducts(products.filter((p) => p.id !== product.id));
                            setDeleteConfirmId(null);
                          }}
                          className="min-h-[36px] px-2.5 py-1.5 text-xs font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 cursor-pointer"
                        >
                          নিশ্চিত মুছুন
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(product.id)}
                          aria-label="পণ্য মুছুন"
                          className="w-9 h-9 inline-flex items-center justify-center text-zinc-500 hover:text-red-600 border border-zinc-200 rounded-md cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: ADD / EDIT SINGLE PRODUCT FORM */}
          {activeTab === 'products' && editingProduct && (
            <form onSubmit={handleSaveProductForm} className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                <h3 className="text-base font-bold text-zinc-950">
                  {isNewProduct ? 'নতুন স্নিকার্স যুক্ত করুন' : 'স্নিকার্সের তথ্য সম্পাদনা'}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="text-xs font-medium text-zinc-600 hover:text-zinc-950 underline underline-offset-4 cursor-pointer"
                >
                  তালিকায় ফিরে যান
                </button>
              </div>

              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 font-medium">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-800 mb-1">
                    স্নিকার্সের নাম (বাংলা) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.nameBn}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, nameBn: e.target.value })
                    }
                    placeholder="যেমন: QUYK মনোলিথ লো"
                    className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-md focus:outline-none focus:border-zinc-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-800 mb-1">
                    মডেল কোড / SKU
                  </label>
                  <input
                    type="text"
                    value={editingProduct.sku}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, sku: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm font-mono border border-zinc-300 rounded-md focus:outline-none focus:border-zinc-950"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-800 mb-1">
                    সংক্ষিপ্ত সাবটাইটেল
                  </label>
                  <input
                    type="text"
                    value={editingProduct.subtitleBn}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, subtitleBn: e.target.value })
                    }
                    placeholder="এক লাইনে জুতার মূল বৈশিষ্ট্য"
                    className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-md focus:outline-none focus:border-zinc-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-800 mb-1">
                    বিক্রয় মূল্য (BDT)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editingProduct.priceBdt ?? ''}
                    placeholder="টাকার পরিমাণ লিখুন (BDT)"
                    onChange={(e) => {
                      const raw = e.target.value.trim();
                      setEditingProduct({
                        ...editingProduct,
                        priceBdt: raw === '' ? null : Math.max(0, Number(raw)),
                      });
                    }}
                    className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-zinc-300 rounded-md focus:outline-none focus:border-zinc-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-800 mb-1">
                    পূর্ববর্তী মূল্য BDT (ঐচ্ছিক, কাটা দাম)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editingProduct.compareAtPriceBdt ?? ''}
                    placeholder="ঐচ্ছিক পূর্ববর্তী মূল্য"
                    onChange={(e) => {
                      const raw = e.target.value.trim();
                      setEditingProduct({
                        ...editingProduct,
                        compareAtPriceBdt: raw === '' ? null : Math.max(0, Number(raw)),
                      });
                    }}
                    className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-zinc-300 rounded-md focus:outline-none focus:border-zinc-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-800 mb-1">
                    ক্যাটাগরি
                  </label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        category: e.target.value as Exclude<
                          ProductCategory,
                          ProductCategory.ALL
                        >,
                      })
                    }
                    className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-md focus:outline-none focus:border-zinc-950"
                  >
                    {EDITABLE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-800 mb-1">
                    স্টক স্ট্যাটাস
                  </label>
                  <select
                    value={editingProduct.inStock ? 'in_stock' : 'out_of_stock'}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        inStock: e.target.value === 'in_stock',
                      })
                    }
                    className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-md focus:outline-none focus:border-zinc-950"
                  >
                    <option value="in_stock">স্টকে আছে</option>
                    <option value="out_of_stock">স্টক আউট</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <span className="block text-xs font-semibold text-zinc-800 mb-1.5">
                    উপলব্ধ সাইজসমূহ (EU 40–44)
                  </span>
                  <div className="flex items-center gap-2">
                    {ALL_SNEAKER_SIZES.map((sz) => {
                      const active = editingProduct.availableSizes.includes(sz);
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => {
                            const exists = editingProduct.availableSizes.includes(sz);
                            const nextSizes = exists
                              ? editingProduct.availableSizes.filter((s) => s !== sz)
                              : [...editingProduct.availableSizes, sz];
                            setEditingProduct({
                              ...editingProduct,
                              availableSizes: nextSizes as SneakerSize[],
                            });
                          }}
                          className={`min-w-[48px] min-h-[40px] font-mono text-xs rounded-md border cursor-pointer ${
                            active
                              ? 'bg-zinc-950 text-white border-zinc-950 font-semibold'
                              : 'bg-white text-zinc-500 border-zinc-200 line-through'
                          }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Product Images (Upload 3–4 Images) */}
                <div className="sm:col-span-2 p-5 bg-zinc-50 border border-zinc-200 rounded-lg space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-200">
                    <div>
                      <label className="block text-sm font-bold text-zinc-950">
                        Product Images (Upload 3–4 Images) *
                      </label>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        একই জুতার ৩–৪টি কোণ/অ্যাঙ্গেলের ছবি আপলোড করুন। প্রথম ছবিটি মূল কভার হিসেবে থাকবে।
                      </p>
                    </div>
                    <span className="font-mono text-xs px-2.5 py-1 rounded bg-white border border-zinc-300 text-zinc-700 self-start sm:self-auto shrink-0">
                      {(editingProduct.images || []).length} / 4 টি ছবি
                    </span>
                  </div>

                  {/* Multi-image file input & button */}
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileUploadRef.current?.click()}
                      disabled={(editingProduct.images || []).length >= 4}
                      className={`inline-flex items-center gap-2 min-h-[40px] px-4 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                        (editingProduct.images || []).length >= 4
                          ? 'bg-zinc-200 text-zinc-400 border border-zinc-200 cursor-not-allowed'
                          : 'bg-zinc-950 text-white hover:bg-zinc-800'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>
                        {(editingProduct.images || []).length >= 4
                          ? 'সর্বোচ্চ ৪টি ছবি পূর্ণ'
                          : 'ডিভাইস থেকে ৩–৪টি ছবি নির্বাচন করুন'}
                      </span>
                    </button>
                    <input
                      ref={fileUploadRef}
                      type="file"
                      multiple
                      accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                      onChange={handleMultipleImageUpload}
                      className="hidden"
                    />
                    <span className="text-[11px] text-zinc-500">
                      JPG, PNG, WebP (একসাথে একাধিক ফাইল সিলেক্ট করতে পারবেন)
                    </span>
                  </div>

                  {/* Uploaded Images Preview Gallery */}
                  {(editingProduct.images || []).length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-zinc-600">
                        <span>সংযুক্ত ছবিসমূহ:</span>
                        <span className="text-[11px] text-zinc-500">
                          (কভার পরিবর্তন করতে "কভার বানান" বাটনে ক্লিক করুন)
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {(editingProduct.images || []).map((imgUrl, idx) => {
                          const isPrimary = idx === 0;
                          return (
                            <div
                              key={idx}
                              className={`relative rounded-md overflow-hidden border-2 bg-white flex flex-col justify-between transition-all ${
                                isPrimary
                                  ? 'border-zinc-950 ring-2 ring-zinc-950/20'
                                  : 'border-zinc-200 hover:border-zinc-300'
                              }`}
                            >
                              <div className="aspect-[4/3] w-full overflow-hidden bg-[#F4F4F5] relative">
                                <img
                                  src={imgUrl}
                                  alt={`Product angle ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                {isPrimary && (
                                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-950 text-white">
                                    ★ মূল কভার
                                  </span>
                                )}
                              </div>
                              <div className="p-2 bg-white border-t border-zinc-100 flex items-center justify-between gap-1 text-[11px]">
                                <span className="font-mono text-zinc-500">
                                  #{idx + 1}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  {!isPrimary && (
                                    <button
                                      type="button"
                                      onClick={() => handleSetPrimaryImage(idx)}
                                      className="text-[11px] font-medium text-zinc-900 underline underline-offset-2 hover:text-black cursor-pointer"
                                      title="এই ছবিটিকে প্রথম / কভার ছবি করুন"
                                    >
                                      কভার
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveImage(idx)}
                                    aria-label={`ছবি ${idx + 1} মুছুন`}
                                    className="p-1 text-zinc-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                                    title="ছবি মুছুন"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 border-2 border-dashed border-zinc-300 rounded-md bg-white text-center">
                      <p className="text-xs text-zinc-500">
                        এখনো কোনো ছবি যোগ করা হয়নি। ওপরের বাটনটি চেপে জুতার ৩–৪টি অ্যাঙ্গেলের ছবি যোগ করুন।
                      </p>
                    </div>
                  )}

                  {/* Optional Fallback: Preset Library or Direct URL */}
                  <details className="text-xs text-zinc-600 pt-1">
                    <summary className="cursor-pointer font-medium hover:text-zinc-950 py-1 select-none">
                      + অথবা অতিরিক্ত ছবির URL বা স্টুডিও প্রিসেট থেকে যুক্ত করুন
                    </summary>
                    <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white border border-zinc-200 rounded-md">
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                          স্টুডিও প্রিসেট ছবি
                        </label>
                        <div className="flex gap-2">
                          <select
                            id="preset-picker-select"
                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-zinc-300 rounded-md"
                            defaultValue="obsidian_low"
                          >
                            {(Object.keys(PRESET_IMAGES) as PresetImageKey[]).map((key) => (
                              <option key={key} value={key}>
                                {PRESET_IMAGES[key].labelBn}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => {
                              const sel = document.getElementById(
                                'preset-picker-select'
                              ) as HTMLSelectElement | null;
                              const key = (sel?.value || 'obsidian_low') as PresetImageKey;
                              const url = PRESET_IMAGES[key]?.url;
                              if (url) handleAddImageUrl(url);
                            }}
                            disabled={(editingProduct.images || []).length >= 4}
                            className="px-3 py-1.5 text-xs font-semibold bg-white border border-zinc-300 rounded-md hover:bg-zinc-100 shrink-0 cursor-pointer disabled:opacity-50"
                          >
                            যোগ করুন
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                          ছবির ওয়েব লিঙ্ক (URL)
                        </label>
                        <div className="flex gap-2">
                          <input
                            id="url-input-field"
                            type="url"
                            placeholder="https://..."
                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-zinc-300 rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const input = document.getElementById(
                                'url-input-field'
                              ) as HTMLInputElement | null;
                              const val = input?.value.trim();
                              if (val) {
                                handleAddImageUrl(val);
                                if (input) input.value = '';
                              }
                            }}
                            disabled={(editingProduct.images || []).length >= 4}
                            className="px-3 py-1.5 text-xs font-semibold bg-white border border-zinc-300 rounded-md hover:bg-zinc-100 shrink-0 cursor-pointer disabled:opacity-50"
                          >
                            যোগ করুন
                          </button>
                        </div>
                      </div>
                    </div>
                  </details>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-800 mb-1">
                    বিস্তারিত বিবরণ
                  </label>
                  <textarea
                    rows={3}
                    value={editingProduct.descriptionBn}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, descriptionBn: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-md focus:outline-none focus:border-zinc-950"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="min-h-[42px] px-4 py-2 text-xs font-semibold text-zinc-800 bg-white border border-zinc-300 rounded-md hover:bg-zinc-100 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="min-h-[42px] px-5 py-2 text-xs font-semibold text-white bg-zinc-950 rounded-md hover:bg-zinc-800 cursor-pointer"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: FREE PUBLISHING KIT */}
          {activeTab === 'publish' && (
            <div className="space-y-6">
              <div className="p-4 border border-zinc-200 bg-zinc-50 rounded-md space-y-2">
                <h3 className="text-sm font-bold text-zinc-950">
                  সম্পূর্ণ বিনামূল্যে ওয়েবসাইট পাবলিশ করার নির্দেশিকা
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  এই ওয়েবসাইটটি স্ট্যাটিক ফ্রন্টএন্ড আর্কিটেকচারে তৈরি, তাই কোনো মাসিক সার্ভার বা ডাটাবেস খরচ ছাড়াই Vercel, Netlify, Cloudflare Pages কিংবা GitHub Pages-এ আজীবন ফ্রি হোস্ট করতে পারবেন।
                </p>
                <ol className="text-xs text-zinc-700 space-y-1.5 pt-1 list-decimal list-inside">
                  <li>
                    প্রথমে ১ ও ২ নম্বর ট্যাব থেকে আপনার আসল হোয়াটসঅ্যাপ নম্বর এবং প্রতিটি স্নিকার্সের BDT মূল্য নির্ধারণ করুন।
                  </li>
                  <li>
                    নিচের বাটন থেকে আপডেটকৃত কনফিগারেশন কোড কপি করে প্রজেক্টের{' '}
                    <code className="font-mono bg-zinc-200/70 px-1 py-0.5 rounded">
                      src/data/catalogConfig.ts
                    </code>{' '}
                    ফাইলে প্রতিস্থাপন করুন।
                  </li>
                  <li>
                    GitHub-এ কোডটি আপলোড করে Vercel বা Netlify-তে কানেক্ট করুন (Build Command:{' '}
                    <code className="font-mono bg-zinc-200/70 px-1 py-0.5 rounded">
                      npm run build
                    </code>
                    , Publish Directory:{' '}
                    <code className="font-mono bg-zinc-200/70 px-1 py-0.5 rounded">dist</code>)।
                  </li>
                </ol>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-zinc-800">
                    আপডেটকৃত catalogConfig.ts কোড
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-zinc-950 rounded-md hover:bg-zinc-800 cursor-pointer"
                  >
                    {copiedConfig ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>কোড কপি হয়েছে</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>কোড কপি করুন</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3.5 bg-zinc-950 text-zinc-100 text-[11px] font-mono rounded-md max-h-56 overflow-auto">
                  {generatedCode}
                </pre>
              </div>

              {/* JSON Backup & Import + Reset */}
              <div className="pt-4 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadJsonBackup}
                    className="inline-flex items-center gap-1.5 min-h-[38px] px-3.5 py-2 text-xs font-semibold text-zinc-900 bg-white border border-zinc-300 rounded-md hover:bg-zinc-100 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>JSON ব্যাকআপ ডাউনলোড</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => jsonImportRef.current?.click()}
                    className="inline-flex items-center gap-1.5 min-h-[38px] px-3.5 py-2 text-xs font-semibold text-zinc-900 bg-white border border-zinc-300 rounded-md hover:bg-zinc-100 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>JSON ইমপোর্ট</span>
                  </button>
                  <input
                    ref={jsonImportRef}
                    type="file"
                    accept="application/json"
                    onChange={handleImportJsonBackup}
                    className="hidden"
                  />
                </div>

                {resetConfirm ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onResetAllToDefaults();
                        setResetConfirm(false);
                      }}
                      className="min-h-[38px] px-3 py-1.5 text-xs font-semibold text-white bg-red-600 rounded-md cursor-pointer"
                    >
                      নিশ্চিত রিসেট
                    </button>
                    <button
                      type="button"
                      onClick={() => setResetConfirm(false)}
                      className="min-h-[38px] px-3 py-1.5 text-xs font-medium text-zinc-700 border border-zinc-300 rounded-md cursor-pointer"
                    >
                      না
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setResetConfirm(true)}
                    className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-950 underline underline-offset-4 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>ডিফল্ট ডাটাতে রিসেট</span>
                  </button>
                )}
              </div>

              {importStatus && (
                <p className="text-xs font-medium text-zinc-800">{importStatus}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

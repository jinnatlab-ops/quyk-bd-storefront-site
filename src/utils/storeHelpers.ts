import quykHeroBannerImg from '../assets/images/quyk_hero_banner.png';
import obsidianLowImg from '../assets/images/sneaker_obsidian_low_1793202282227.jpg';
import chalkCourtImg from '../assets/images/sneaker_chalk_court_1793202283243.jpg';
import shadowHighImg from '../assets/images/sneaker_shadow_high_1793202285096.jpg';
import carbonRunnerImg from '../assets/images/sneaker_carbon_runner_1793202286986.jpg';
import monoSlipImg from '../assets/images/sneaker_mono_slip_1793202286816.jpg';
import eclipseTrainerImg from '../assets/images/sneaker_eclipse_trainer_1793202288283.jpg';
import {
  DeliveryZone,
  OrderDraftItem,
  PresetImageKey,
  ProductCategory,
  SneakerProduct,
  SneakerSize,
  StoreSettings,
} from '../types/store';

export const ALL_SNEAKER_SIZES: SneakerSize[] = [40, 41, 42, 43, 44];

export const HERO_CAMPAIGN_IMAGE = quykHeroBannerImg;

export const PRESET_IMAGES: Record<PresetImageKey, { url: string; labelBn: string }> = {
  hero_monochrome: {
    url: quykHeroBannerImg,
    labelBn: 'QUYK BD অফিসিয়াল ব্যানার',
  },
  obsidian_low: {
    url: obsidianLowImg,
    labelBn: 'অবসিডিয়ান লো-টপ (ব্ল্যাক)',
  },
  chalk_court: {
    url: chalkCourtImg,
    labelBn: 'চক কোর্ট ক্ল্যাসিক (হোয়াইট)',
  },
  shadow_high: {
    url: shadowHighImg,
    labelBn: 'শ্যাডো হাই-টপ (ব্ল্যাক-হোয়াইট)',
  },
  carbon_runner: {
    url: carbonRunnerImg,
    labelBn: 'কার্বন রানার (মেশ ব্ল্যাক)',
  },
  mono_slip: {
    url: monoSlipImg,
    labelBn: 'মনো স্লিপ-অন (লেসলেস)',
  },
  eclipse_trainer: {
    url: eclipseTrainerImg,
    labelBn: 'ইক্লিপস আরবান ট্রেইনার',
  },
};

export interface SizeChartRow {
  euSize: SneakerSize;
  footLengthCm: string;
  footLengthInch: string;
  ukEquivalent: string;
}

export const EU_SIZE_CHART: SizeChartRow[] = [
  { euSize: 40, footLengthCm: '25.0 cm', footLengthInch: '9.8"', ukEquivalent: 'UK 6.5' },
  { euSize: 41, footLengthCm: '25.7 cm', footLengthInch: '10.1"', ukEquivalent: 'UK 7.5' },
  { euSize: 42, footLengthCm: '26.4 cm', footLengthInch: '10.4"', ukEquivalent: 'UK 8.0' },
  { euSize: 43, footLengthCm: '27.0 cm', footLengthInch: '10.6"', ukEquivalent: 'UK 9.0' },
  { euSize: 44, footLengthCm: '27.7 cm', footLengthInch: '10.9"', ukEquivalent: 'UK 9.5' },
];

export function resolveProductImage(product: SneakerProduct): string {
  if (product.images && product.images.length > 0) {
    const firstValid = product.images.find((img) => img && img.trim().length > 0);
    if (firstValid) return firstValid.trim();
  }
  if (product.customImageUrl && product.customImageUrl.trim().length > 0) {
    return product.customImageUrl.trim();
  }
  if (product.presetImageKey && PRESET_IMAGES[product.presetImageKey]) {
    return PRESET_IMAGES[product.presetImageKey].url;
  }
  return obsidianLowImg;
}

export function resolveProductImages(product: SneakerProduct): string[] {
  if (product.images && product.images.length > 0) {
    const valid = product.images
      .map((img) => (img ? img.trim() : ''))
      .filter((img) => img.length > 0);
    if (valid.length > 0) {
      return valid;
    }
  }
  return [resolveProductImage(product)];
}

export function formatBdtNumber(amount: number | null | undefined): string | null {
  if (amount === null || amount === undefined || Number.isNaN(amount) || amount <= 0) {
    return null;
  }
  return `৳ ${Math.round(amount).toLocaleString('en-IN')} BDT`;
}

export function normalizeBangladeshWhatsApp(rawInput: string): {
  isConfigured: boolean;
  isValid: boolean;
  waNumber: string;
  displayNumber: string;
} {
  const trimmed = (rawInput || '').trim();
  if (!trimmed) {
    return {
      isConfigured: false,
      isValid: false,
      waNumber: '',
      displayNumber: '',
    };
  }

  const digitsOnly = trimmed.replace(/[^\d]/g, '');

  // Standard 11-digit BD local mobile format: 01XXXXXXXXX -> 8801XXXXXXXXX
  if (/^01[3-9]\d{8}$/.test(digitsOnly)) {
    const waNumber = `88${digitsOnly}`;
    return {
      isConfigured: true,
      isValid: true,
      waNumber,
      displayNumber: `+${waNumber}`,
    };
  }

  // International BD or global E.164 digits (8 to 15 digits)
  if (/^\d{8,15}$/.test(digitsOnly)) {
    return {
      isConfigured: true,
      isValid: true,
      waNumber: digitsOnly,
      displayNumber: `+${digitsOnly}`,
    };
  }

  return {
    isConfigured: true,
    isValid: false,
    waNumber: digitsOnly,
    displayNumber: trimmed,
  };
}

export interface WhatsAppOrderPayload {
  items: OrderDraftItem[];
  customerName: string;
  customerPhone: string;
  deliveryZone: DeliveryZone;
  deliveryAddress: string;
  customerNote: string;
  settings: StoreSettings;
}

export function buildWhatsAppOrderText(payload: WhatsAppOrderPayload): string {
  const {
    items,
    customerName,
    customerPhone,
    deliveryZone,
    deliveryAddress,
    customerNote,
    settings,
  } = payload;

  const lines: string[] = [
    `আসসালামু আলাইকুম ${settings.brandName},`,
    'আমি নিচের স্নিকার্স অর্ডার করতে চাই:',
    '',
  ];

  let allItemsPriced = true;
  let subtotal = 0;

  items.forEach((entry, idx) => {
    const unitPriceFormatted = formatBdtNumber(entry.product.priceBdt);
    if (entry.product.priceBdt && entry.product.priceBdt > 0) {
      subtotal += entry.product.priceBdt * entry.quantity;
    } else {
      allItemsPriced = false;
    }

    lines.push(
      `${idx + 1}. ${entry.product.nameBn} (${entry.product.sku})`,
      `   • সাইজ: EU ${entry.size}`,
      `   • পরিমাণ: ${entry.quantity} জোড়া`,
      `   • মূল্য: ${unitPriceFormatted ? unitPriceFormatted : 'মূল্য নিশ্চিত করুন'}`
    );
  });

  lines.push('');

  const zoneLabel = deliveryZone === 'inside_dhaka' ? 'ঢাকার ভেতরে' : 'ঢাকার বাইরে';
  const configuredDeliveryFee =
    deliveryZone === 'inside_dhaka'
      ? settings.insideDhakaDeliveryBdt
      : settings.outsideDhakaDeliveryBdt;

  lines.push(`ডেলিভারি এরিয়া: ${zoneLabel}`);

  if (subtotal > 0) {
    lines.push(`পণ্যের মূল্য: ৳ ${Math.round(subtotal).toLocaleString('en-IN')} BDT`);
  }

  if (configuredDeliveryFee !== null && configuredDeliveryFee >= 0) {
    lines.push(`ডেলিভারি চার্জ: ৳ ${Math.round(configuredDeliveryFee).toLocaleString('en-IN')} BDT`);
    if (allItemsPriced && subtotal > 0) {
      const grandTotal = subtotal + configuredDeliveryFee;
      lines.push(`সর্বমোট প্রদেয়: ৳ ${Math.round(grandTotal).toLocaleString('en-IN')} BDT`);
    }
  } else {
    lines.push('ডেলিভারি চার্জ: কুরিয়ার রেট অনুযায়ী নিশ্চিত করুন');
  }

  lines.push('পেমেন্ট মাধ্যম: ক্যাশ অন ডেলিভারি (হাতে পেয়ে পরিশোধ)');
  lines.push('');
  lines.push('গ্রাহকের তথ্য:');
  lines.push(`• নাম: ${customerName.trim() || 'উল্লেখ করা হয়নি'}`);
  if (customerPhone.trim()) {
    lines.push(`• মোবাইল: ${customerPhone.trim()}`);
  }
  lines.push(`• ঠিকানা: ${deliveryAddress.trim() || 'উল্লেখ করা হয়নি'}`);
  if (customerNote.trim()) {
    lines.push(`• নোট: ${customerNote.trim()}`);
  }

  return lines.join('\n');
}

export function buildWhatsAppUrl(waNumber: string, message: string): string {
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
}

const CATEGORY_ENUM_KEY_MAP: Record<Exclude<ProductCategory, ProductCategory.ALL>, string> = {
  [ProductCategory.LOW_TOP]: 'ProductCategory.LOW_TOP',
  [ProductCategory.COURT]: 'ProductCategory.COURT',
  [ProductCategory.HIGH_TOP]: 'ProductCategory.HIGH_TOP',
  [ProductCategory.RUNNER]: 'ProductCategory.RUNNER',
  [ProductCategory.SLIP_ON]: 'ProductCategory.SLIP_ON',
  [ProductCategory.TRAINER]: 'ProductCategory.TRAINER',
};

export function generateCatalogConfigTsCode(
  settings: StoreSettings,
  products: SneakerProduct[]
): string {
  const esc = (str: string) => JSON.stringify(str);

  const productsBlock = products
    .map((p) => {
      const catExpr = CATEGORY_ENUM_KEY_MAP[p.category] || 'ProductCategory.LOW_TOP';
      const sizesStr = `[${[...p.availableSizes].sort((a, b) => a - b).join(', ')}]`;
      const optionalPreset = p.presetImageKey
        ? `\n    presetImageKey: ${esc(p.presetImageKey)},`
        : '';
      const optionalCustom =
        p.customImageUrl && p.customImageUrl.trim()
          ? `\n    customImageUrl: ${esc(p.customImageUrl.trim())},`
          : '';
      const optionalImages =
        p.images && p.images.length > 0
          ? `\n    images: ${JSON.stringify(p.images)},`
          : '';

      return `  {
    id: ${esc(p.id)},
    sku: ${esc(p.sku)},
    nameBn: ${esc(p.nameBn)},
    subtitleBn: ${esc(p.subtitleBn)},
    category: ${catExpr},
    priceBdt: ${p.priceBdt !== null && p.priceBdt > 0 ? Math.round(p.priceBdt) : 'null'},
    compareAtPriceBdt: ${
      p.compareAtPriceBdt !== null && p.compareAtPriceBdt > 0
        ? Math.round(p.compareAtPriceBdt)
        : 'null'
    },
    availableSizes: ${sizesStr},
    inStock: ${p.inStock},${optionalPreset}${optionalCustom}${optionalImages}
    descriptionBn: ${esc(p.descriptionBn)},
    upperMaterialBn: ${esc(p.upperMaterialBn)},
    soleMaterialBn: ${esc(p.soleMaterialBn)},
    colorwayBn: ${esc(p.colorwayBn)},
  }`;
    })
    .join(',\n');

  return `import { ProductCategory, SneakerProduct, StoreSettings } from '../types/store';

/**
 * QUYK BD — প্রধান স্টোর কনফিগারেশন ও পণ্যের তালিকা (Catalog Configuration)
 * ফ্রি পাবলিশিং-এর জন্য প্রস্তুতকৃত কনফিগারেশন ফাইল।
 */

export const INITIAL_STORE_SETTINGS: StoreSettings = {
  brandName: ${esc(settings.brandName || 'QUYK BD')},
  logoUrl: ${esc(settings.logoUrl || '')},
  whatsappNumber: ${esc(settings.whatsappNumber.trim())},
  contactEmail: ${esc(settings.contactEmail.trim())},
  locationBn: ${esc(settings.locationBn.trim() || 'বাংলাদেশ')},
  businessHoursBn: ${esc(settings.businessHoursBn.trim())},
  insideDhakaDeliveryBdt: ${
    settings.insideDhakaDeliveryBdt !== null && settings.insideDhakaDeliveryBdt >= 0
      ? Math.round(settings.insideDhakaDeliveryBdt)
      : 'null'
  },
  outsideDhakaDeliveryBdt: ${
    settings.outsideDhakaDeliveryBdt !== null && settings.outsideDhakaDeliveryBdt >= 0
      ? Math.round(settings.outsideDhakaDeliveryBdt)
      : 'null'
  },
  deliveryTimeInsideDhakaBn: ${esc(settings.deliveryTimeInsideDhakaBn)},
  deliveryTimeOutsideDhakaBn: ${esc(settings.deliveryTimeOutsideDhakaBn)},
  returnWindowDays: ${settings.returnWindowDays || 7},
};

export const INITIAL_PRODUCTS: SneakerProduct[] = [
${productsBlock}
];
`;
}

export function compressImageFileToDataUrl(file: File, maxWidth = 900): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('ছবিটি পড়া সম্ভব হয়নি।'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('অবৈধ ছবির ফরম্যাট।'));
      img.onload = () => {
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(String(reader.result));
          return;
        }
        ctx.fillStyle = '#F4F4F5';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.84));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export type SneakerSize = 40 | 41 | 42 | 43 | 44;

export enum ProductCategory {
  ALL = 'সকল স্নিকার্স',
  LOW_TOP = 'লো-টপ',
  COURT = 'কোর্ট ক্ল্যাসিক',
  HIGH_TOP = 'হাই-টপ',
  RUNNER = 'অ্যাথলেটিক রানার',
  SLIP_ON = 'স্লিপ-অন',
  TRAINER = 'আরবান ট্রেইনার',
}

export type PresetImageKey =
  | 'hero_monochrome'
  | 'obsidian_low'
  | 'chalk_court'
  | 'shadow_high'
  | 'carbon_runner'
  | 'mono_slip'
  | 'eclipse_trainer';

export interface SneakerProduct {
  id: string;
  sku: string;
  nameBn: string;
  subtitleBn: string;
  category: Exclude<ProductCategory, ProductCategory.ALL>;
  /**
   * Price in BDT. Intentionally null until set by the store owner so no prices are invented.
   */
  priceBdt: number | null;
  /**
   * Optional previous/compare-at price in BDT.
   */
  compareAtPriceBdt: number | null;
  availableSizes: SneakerSize[];
  inStock: boolean;
  presetImageKey?: PresetImageKey;
  customImageUrl?: string;
  /**
   * Multiple angle images for the shoe gallery (3–4 images).
   * First image is the primary cover image used on catalog cards.
   */
  images?: string[];
  descriptionBn: string;
  upperMaterialBn: string;
  soleMaterialBn: string;
  colorwayBn: string;
}

export interface StoreSettings {
  brandName: string;
  logoUrl?: string;
  /**
   * Store owner's WhatsApp number. Intentionally empty string by default so no phone number is invented.
   */
  whatsappNumber: string;
  contactEmail: string;
  locationBn: string;
  businessHoursBn: string;
  insideDhakaDeliveryBdt: number | null;
  outsideDhakaDeliveryBdt: number | null;
  deliveryTimeInsideDhakaBn: string;
  deliveryTimeOutsideDhakaBn: string;
  returnWindowDays: number;
}

export interface CartItem {
  productId: string;
  size: SneakerSize;
  quantity: number;
}

export interface OrderDraftItem {
  product: SneakerProduct;
  size: SneakerSize;
  quantity: number;
}

export type DeliveryZone = 'inside_dhaka' | 'outside_dhaka';

export interface CustomerInquiry {
  id: string;
  name: string;
  contactInfo: string;
  subject: string;
  message: string;
  createdAt: string;
}

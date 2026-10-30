import { ProductCategory, SneakerProduct, StoreSettings } from '../types/store';

/**
 * QUYK BD — প্রধান স্টোর কনফিগারেশন ও পণ্যের তালিকা (Catalog Configuration)
 * ফ্রি পাবলিশিং (Vercel / Netlify / Cloudflare Pages / GitHub Pages)-এর আগে
 * স্টোর ম্যানেজার থেকে আপডেটকৃত কোড কপি করে এখানে পেস্ট করুন অথবা সরাসরি নিচে এডিট করুন।
 */

export const INITIAL_STORE_SETTINGS: StoreSettings = {
  brandName: 'QUYK BD',
  logoUrl: '',
  whatsappNumber: (import.meta.env.VITE_WHATSAPP_NUMBER || '').trim(),
  contactEmail: '',
  locationBn: 'বাংলাদেশ',
  businessHoursBn: 'সকাল ১০:০০ – রাত ১০:০০ (প্রতিদিন)',
  insideDhakaDeliveryBdt: null,
  outsideDhakaDeliveryBdt: null,
  deliveryTimeInsideDhakaBn: '২৪ – ৪৮ ঘণ্টা',
  deliveryTimeOutsideDhakaBn: '২ – ৪ কার্যদিবস',
  returnWindowDays: 7,
};

export const INITIAL_PRODUCTS: SneakerProduct[] = [
  {
    id: 'quyk-01',
    sku: 'QYK-01',
    nameBn: 'QUYK অবসিডিয়ান লো',
    subtitleBn: 'ম্যাট ব্ল্যাক ফুল-গ্রেইন লেদার ও হোয়াইট সোল',
    category: ProductCategory.LOW_TOP,
    priceBdt: null,
    compareAtPriceBdt: null,
    availableSizes: [40, 41, 42, 43, 44],
    inStock: true,
    presetImageKey: 'obsidian_low',
    descriptionBn:
      'দৈনন্দিন প্রিমিয়াম স্ট্রিটওয়্যার ও স্মার্ট-ক্যাজুয়াল লুকের জন্য তৈরি মিনিমালিস্ট লো-টপ স্নিকার্স। নরম প্যাডেড কলার এবং মজবুত স্টিচড রাবার আউটসোল দীর্ঘ সময় হাঁটায় আরাম নিশ্চিত করে।',
    upperMaterialBn: 'ম্যাট ফিনিশ প্রিমিয়াম মাইক্রো-লেদার',
    soleMaterialBn: 'হাই-ডেনসিটি কুশনড রাবার সোল',
    colorwayBn: 'অবসিডিয়ান ব্ল্যাক / চক হোয়াইট',
  },
  {
    id: 'quyk-02',
    sku: 'QYK-02',
    nameBn: 'QUYK চক কোর্ট ক্ল্যাসিক',
    subtitleBn: 'ট্রিপল হোয়াইট টাম্বলড লেদার ও ব্ল্যাক হিল ট্যাব',
    category: ProductCategory.COURT,
    priceBdt: null,
    compareAtPriceBdt: null,
    availableSizes: [40, 41, 42, 43, 44],
    inStock: true,
    presetImageKey: 'chalk_court',
    descriptionBn:
      'ক্লিন মনোক্লোম হোয়াইট সিলুয়েট ও পেছনে সূক্ষ্ম ম্যাট ব্ল্যাক অ্যাকসেন্ট। যেকোনো আউটফিটের সাথে মানানসই টাইমলেস কোর্ট ডিজাইন যা সহজে পরিষ্কার রাখা যায়।',
    upperMaterialBn: 'টেক্সচার্ড টাম্বলড সিনথেটিক লেদার',
    soleMaterialBn: 'অ্যান্টি-স্লিপ ফ্ল্যাট কাপসোল',
    colorwayBn: 'চক হোয়াইট / জেট ব্ল্যাক',
  },
  {
    id: 'quyk-03',
    sku: 'QYK-03',
    nameBn: 'QUYK শ্যাডো হাই-টপ',
    subtitleBn: 'ব্ল্যাক অ্যান্ড হোয়াইট কালারব্লক অ্যাঙ্কেল সাপোর্ট',
    category: ProductCategory.HIGH_TOP,
    priceBdt: null,
    compareAtPriceBdt: null,
    availableSizes: [40, 41, 42, 43, 44],
    inStock: true,
    presetImageKey: 'shadow_high',
    descriptionBn:
      'বোল্ড মনোক্লোম কালারব্লক প্যানেলিং ও উঁচু প্যাডেড অ্যাঙ্কেল সাপোর্টসহ আইকনিক হাই-টপ স্নিকার্স। শহুরে আবহাওয়া ও স্ট্রিট ফ্যাশনের জন্য বিশেষভাবে ডিজাইনকৃত।',
    upperMaterialBn: 'লেয়ার্ড প্রিমিয়াম লেদার ও সফট ফোম টাং',
    soleMaterialBn: 'টেকসই স্টিচড রাবার কাপসোল',
    colorwayBn: 'মনো ব্ল্যাক / পিওর হোয়াইট',
  },
  {
    id: 'quyk-04',
    sku: 'QYK-04',
    nameBn: 'QUYK কার্বন রানার',
    subtitleBn: 'ব্রিদেবল নিট মেশ ও আলট্রা-লাইট ইভিএ সোল',
    category: ProductCategory.RUNNER,
    priceBdt: null,
    compareAtPriceBdt: null,
    availableSizes: [40, 41, 42, 43, 44],
    inStock: true,
    presetImageKey: 'carbon_runner',
    descriptionBn:
      'বাংলাদেশের গরম ও আর্দ্র আবহাওয়ায় বাতাস চলাচলের উপযোগী ইঞ্জিনিয়ার্ড মেশ আপার এবং হালকা ওজনের স্কাল্পটেড ইভিএ মিডসোল। সারাদিন দৌড়ঝাঁপ ও ভ্রমণের জন্য আদর্শ।',
    upperMaterialBn: 'ব্রিদেবল চারকোল নিট মেশ',
    soleMaterialBn: 'শক-অ্যাবজরবিং ইভিএ ও কার্বন রাবার গ্রিপ',
    colorwayBn: 'কার্বন চারকোল / ক্লাউড হোয়াইট',
  },
  {
    id: 'quyk-05',
    sku: 'QYK-05',
    nameBn: 'QUYK মনো স্লিপ-অন',
    subtitleBn: 'লেসলেস আর্কিটেকচারাল নুবাক ও নিওপ্রিন ফিট',
    category: ProductCategory.SLIP_ON,
    priceBdt: null,
    compareAtPriceBdt: null,
    availableSizes: [40, 41, 42, 43, 44],
    inStock: true,
    presetImageKey: 'mono_slip',
    descriptionBn:
      'ফিতা বাঁধার ঝামেলা ছাড়া দ্রুত পরিধানযোগ্য স্লিক মনোক্লোম স্লিপ-অন। নমনীয় নিওপ্রিন কলার পায়ে নিখুঁতভাবে ফিট হয় এবং পুরু সাদা সোল আধুনিক লুক দেয়।',
    upperMaterialBn: 'ম্যাট নুবাক ফিনিশ ও স্ট্রেচ নিওপ্রিন',
    soleMaterialBn: 'ভালকানাইজড হোয়াইট রাবার প্ল্যাটফর্ম',
    colorwayBn: 'ম্যাট ব্ল্যাক / অপটিক হোয়াইট',
  },
  {
    id: 'quyk-06',
    sku: 'QYK-06',
    nameBn: 'QUYK ইক্লিপস ট্রেইনার',
    subtitleBn: 'জিওমেট্রিক লেদার-সুয়েড লেয়ার্ড স্ট্রিট ট্রেইনার',
    category: ProductCategory.TRAINER,
    priceBdt: null,
    compareAtPriceBdt: null,
    availableSizes: [40, 41, 42, 43, 44],
    inStock: true,
    presetImageKey: 'eclipse_trainer',
    descriptionBn:
      'লেয়ার্ড সুয়েড, ব্রিদেবল মেশ এবং সাদা লেদার প্যানেলের সমন্বয়ে তৈরি কনটেম্পোরারি আরবান ট্রেইনার। উন্নত আর্চ সাপোর্ট ও শক্তিশালী গ্রিপসহ প্রিমিয়াম বিল্ড।',
    upperMaterialBn: 'সুয়েড ওভারলে, লেদার ও মেটালিক-গ্রে ট্রিম',
    soleMaterialBn: 'মাল্টি-লেয়ার কুশনড ট্রেইনার আউটসোল',
    colorwayBn: 'স্টেলথ ব্ল্যাক / স্টোন হোয়াইট',
  },
];

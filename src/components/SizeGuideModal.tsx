import React from 'react';
import { X } from 'lucide-react';
import { EU_SIZE_CHART } from '../utils/storeHelpers';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="size-guide-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white border border-zinc-200 rounded-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
          <h2 id="size-guide-title" className="text-lg font-bold text-zinc-950">
            QUYK BD স্নিকার্স সাইজ গাইড (EU 40–44)
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="বন্ধ করুন"
            className="w-9 h-9 inline-flex items-center justify-center rounded-md border border-zinc-200 text-zinc-700 hover:bg-zinc-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-sm text-zinc-600 leading-relaxed">
            সঠিক সাইজ নির্বাচন করতে একটি সাদা কাগজের ওপর পা রেখে গোড়ালি থেকে সবচেয়ে লম্বা আঙুল পর্যন্ত দৈর্ঘ্য (সেমি) মাপুন। আপনার পা চওড়া হলে এক সাইজ বড় নেওয়ার পরামর্শ দেওয়া হয়।
          </p>

          <div className="border border-zinc-200 rounded-md overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-950 text-white text-xs font-semibold">
                  <th className="py-3 px-4">EU সাইজ</th>
                  <th className="py-3 px-4">পায়ের দৈর্ঘ্য (সেমি)</th>
                  <th className="py-3 px-4">ইঞ্চি</th>
                  <th className="py-3 px-4">UK সমমান</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-sm font-mono tabular-nums">
                {EU_SIZE_CHART.map((row) => (
                  <tr key={row.euSize} className="hover:bg-zinc-50">
                    <td className="py-2.5 px-4 font-bold text-zinc-950">{row.euSize}</td>
                    <td className="py-2.5 px-4 text-zinc-700">{row.footLengthCm}</td>
                    <td className="py-2.5 px-4 text-zinc-700">{row.footLengthInch}</td>
                    <td className="py-2.5 px-4 text-zinc-600">{row.ukEquivalent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-1 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[42px] px-5 py-2 text-sm font-semibold text-white bg-zinc-950 rounded-md hover:bg-zinc-800 cursor-pointer"
            >
              বুঝেছি
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

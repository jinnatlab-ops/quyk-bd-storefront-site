import React, { useState } from 'react';

interface SneakerImageProps {
  src: string;
  alt: string;
  sku?: string;
  className?: string;
}

export const SneakerImage: React.FC<SneakerImageProps> = ({
  src,
  alt,
  sku,
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#F4F4F5] text-zinc-500 p-6 select-none ${className}`}
        role="img"
        aria-label={alt}
      >
        <svg
          viewBox="0 0 120 64"
          className="w-24 h-14 stroke-zinc-800 mb-2"
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 46h96c2.2 0 4-1.8 4-4v-5c0-4-3.5-7.2-8-8l-24-4.5-15-12.5c-2-1.6-4.8-1.8-7-.4L44 19c-4 2.5-9.2 1.8-12.5-1.5L24 12c-2.5-2-6.5-1-7.5 2L10 34c-1.2 3.8-.5 8 2 12z" />
          <path d="M10 40h102" />
        </svg>
        <span className="text-xs font-medium text-zinc-700 text-center line-clamp-1">{alt}</span>
        {sku && <span className="text-[11px] font-mono text-zinc-400 mt-0.5">{sku}</span>}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setHasError(true)}
      className={className}
    />
  );
};

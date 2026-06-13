"use client";

import { useState } from "react";
import { Package } from "lucide-react";

// Tries each URL in order; shows a placeholder icon when all fail.
export function ItemSprite({ urls, alt, size = 40 }: { urls: string[]; alt: string; size?: number }) {
  const [stage, setStage] = useState(0);

  if (stage >= urls.length) {
    return (
      <div
        className="flex items-center justify-center rounded-lg bg-secondary text-muted-foreground/50"
        style={{ width: size, height: size }}
      >
        <Package className="h-5 w-5" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={urls[stage]}
      alt={alt}
      width={size}
      height={size}
      className="object-contain"
      style={{ imageRendering: "pixelated" }}
      onError={() => setStage((s) => s + 1)}
    />
  );
}

'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductImagesProps {
  imageUrls: string[];
  productName: string;
}

export default function ProductImages({ imageUrls, productName }: ProductImagesProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  // Filter out any undefined or null URLs
  const validImageUrls = imageUrls.filter(Boolean);

  if (validImageUrls.length === 0) {
    return (
      <div className="aspect-square w-full rounded-lg bg-gray-100 flex items-center justify-center">
        <span className="text-gray-400">No image available</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col-reverse">
      {/* Main image */}
      <div className="aspect-square w-full relative rounded-lg overflow-hidden bg-gray-100">
        <Image
          src={validImageUrls[selectedImage]}
          alt={`${productName} - Image ${selectedImage + 1}`}
          className="object-contain object-center"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={selectedImage === 0}
        />
      </div>

      {/* Thumbnail grid */}
      {validImageUrls.length > 1 && (
        <div className="hidden mt-4 grid-cols-4 gap-4 sm:grid">
          {validImageUrls.map((url, index) => (
            <button
              key={url}
              onClick={() => setSelectedImage(index)}
              className={`relative aspect-square overflow-hidden rounded-lg bg-gray-100 ${
                selectedImage === index
                  ? 'ring-2 ring-indigo-500'
                  : 'hover:opacity-75'
              }`}
            >
              <Image
                src={url}
                alt={`${productName} - Thumbnail ${index + 1}`}
                className="object-contain object-center"
                fill
                sizes="(max-width: 768px) 25vw, 12vw"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

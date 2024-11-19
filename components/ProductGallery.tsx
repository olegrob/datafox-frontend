'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ProductGalleryProps {
  imageUrls: string[] | string | null
  productName: string
}

export default function ProductGallery({ imageUrls, productName }: ProductGalleryProps) {
  // Parse image URLs from string or array
  const parseImageUrls = (urls: string[] | string | null): string[] => {
    if (!urls) return [];
    
    try {
      if (typeof urls === 'string') {
        return JSON.parse(urls) as string[];
      }
      if (Array.isArray(urls)) {
        return urls;
      }
      return [];
    } catch (e) {
      console.error('Error parsing image URLs:', e);
      return [];
    }
  };

  const images = parseImageUrls(imageUrls);
  const [selectedImage, setSelectedImage] = useState(0);

  if (images.length === 0) {
    return (
      <div className="relative h-[400px] rounded-lg bg-gray-100">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-gray-400">No image</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div className="relative h-[400px] rounded-lg bg-gray-100 overflow-hidden">
        <Image
          src={images[selectedImage]}
          alt={`${productName} - Image ${selectedImage + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain object-center"
          priority
          quality={85}
          onError={(e) => {
            const imgElement = e.target as HTMLImageElement;
            imgElement.style.display = 'none';
            const fallback = imgElement.parentElement;
            if (fallback) {
              fallback.innerHTML = '<div class="absolute inset-0 flex items-center justify-center"><span class="text-gray-400">Failed to load image</span></div>';
            }
          }}
        />
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((url, index) => (
            <button
              key={url}
              onClick={() => setSelectedImage(index)}
              className={`relative h-20 w-20 flex-shrink-0 rounded-md overflow-hidden border-2 transition-colors ${
                selectedImage === index
                  ? 'border-blue-500'
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              <Image
                src={url}
                alt={`${productName} - Thumbnail ${index + 1}`}
                fill
                sizes="80px"
                className="object-contain object-center"
                quality={60}
                onError={(e) => {
                  const imgElement = e.target as HTMLImageElement;
                  imgElement.style.display = 'none';
                  const fallback = imgElement.parentElement;
                  if (fallback) {
                    fallback.innerHTML = '<div class="absolute inset-0 flex items-center justify-center bg-gray-100"><span class="text-xs text-gray-400">No image</span></div>';
                  }
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

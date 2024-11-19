'use client'

import { useState } from 'react'
import Image from 'next/image'
import { type Product } from '@/types'

export default function ProductImages({ product }: { product: Product }) {
  const [selectedImage, setSelectedImage] = useState(0)
  const images = Array.isArray(product.external_image_url) ? product.external_image_url : [product.external_image_url]

  return (
    <div className="flex flex-col-reverse">
      {/* Image grid */}
      <div className="mx-auto mt-6 hidden w-full max-w-2xl sm:block lg:max-w-none">
        <div className="grid grid-cols-4 gap-6" aria-orientation="horizontal" role="tablist">
          {images.map((image, i) => (
            <button
              key={i}
              id={`tabs-${i}-tab`}
              className={`relative flex aspect-square cursor-pointer items-center justify-center rounded-md bg-white text-sm font-medium uppercase ${
                selectedImage === i ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50'
              }`}
              aria-controls={`tabs-${i}-panel`}
              role="tab"
              type="button"
              onClick={() => setSelectedImage(i)}
            >
              <span className="sr-only">Image {i + 1}</span>
              <span className="absolute inset-0 overflow-hidden rounded-md">
                <Image
                  src={image}
                  alt=""
                  className="h-full w-full object-cover object-center"
                  width={200}
                  height={200}
                />
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main image */}
      <div className="aspect-h-1 aspect-w-1 w-full">
        <div
          id={`tabs-${selectedImage}-panel`}
          aria-labelledby={`tabs-${selectedImage}-tab`}
          role="tabpanel"
          tabIndex={0}
        >
          <Image
            src={images[selectedImage]}
            alt={product.name}
            className="h-full w-full object-cover object-center sm:rounded-lg"
            width={800}
            height={800}
            priority
          />
        </div>
      </div>
    </div>
  )
}

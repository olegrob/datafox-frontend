'use client'

import Image from 'next/image'
import { useState } from 'react'

interface ProductImagesProps {
  product: {
    name: string
    external_image_url: string[]
  }
}

export default function ProductImages({ product }: ProductImagesProps) {
  const [mainImageError, setMainImageError] = useState(false)
  const [thumbnailErrors, setThumbnailErrors] = useState<{ [key: string]: boolean }>({})

  return (
    <div className="flex flex-col-reverse">
      <div className="mx-auto mt-6 hidden w-full max-w-2xl sm:block lg:max-w-none">
        <div className="grid grid-cols-4 gap-6">
          {product.external_image_url?.map((image) => (
            <div
              key={image}
              className="relative flex h-24 cursor-pointer items-center justify-center rounded-md bg-white text-sm font-medium uppercase hover:bg-gray-50"
            >
              <span className="absolute inset-0 overflow-hidden rounded-md">
                <Image
                  src={thumbnailErrors[image] ? '/api/placeholder' : image}
                  alt=""
                  className="h-full w-full object-cover object-center"
                  width={200}
                  height={200}
                  onError={() => {
                    setThumbnailErrors((prev) => ({ ...prev, [image]: true }))
                  }}
                />
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="aspect-h-1 aspect-w-1 w-full">
        <Image
          src={
            mainImageError || !product.external_image_url?.[0]
              ? '/api/placeholder'
              : product.external_image_url[0]
          }
          alt={product.name}
          className="h-full w-full object-cover object-center sm:rounded-lg"
          width={600}
          height={600}
          onError={() => setMainImageError(true)}
        />
      </div>
    </div>
  )
}

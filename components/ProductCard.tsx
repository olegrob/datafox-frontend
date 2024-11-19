'use client'

import Image from 'next/image'
import Link from 'next/link'

interface Product {
  id: string
  product_id: string
  name: string
  price: number
  regular_price?: number
  stock: number
  external_image_url?: string | string[] | null
  manufacturer?: string
  warehouse?: string
  short_description?: string
  warranty_period?: string
  product_attributes?: string | { specifications_html?: string; [key: string]: any }
  ean?: string
  mpn?: string
  sku?: string
  category?: string
  subcategory?: string
}

export default function ProductCard({ product }: { product: Product }) {
  // Format price safely
  const formatPrice = (price?: number | null) => {
    if (price === undefined || price === null) return '0.00'
    return price.toFixed(2)
  }

  // Get the first valid image URL from the external_image_url field
  const getImageUrl = (urlField?: string | string[] | null) => {
    if (!urlField) return null;
    
    try {
      // If it's a JSON string, parse it
      if (typeof urlField === 'string') {
        const urls = JSON.parse(urlField) as string[];
        return urls[0] || null;
      }
      
      // If it's already an array
      if (Array.isArray(urlField)) {
        return urlField[0] || null;
      }
      
      return null;
    } catch (e) {
      console.error('Error processing image URL:', e);
      return null;
    }
  }

  // Parse product attributes
  const getAttributes = () => {
    if (!product.product_attributes) return {};
    
    // If it's already an object, return it
    if (typeof product.product_attributes === 'object') {
      return product.product_attributes;
    }
    
    // If it's a string, try to parse it
    try {
      return JSON.parse(product.product_attributes);
    } catch (e) {
      console.error('Failed to parse product attributes:', e);
      return {};
    }
  };

  const imageUrl = getImageUrl(product.external_image_url);
  const attributes = getAttributes();

  return (
    <Link 
      href={`/product/${product.product_id}`}
      className="group relative bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
    >
      {/* Image container with fixed height */}
      <div className="relative w-full h-[200px] rounded-lg bg-gray-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain object-center group-hover:opacity-75"
            priority={false}
            quality={75}
            onError={(e) => {
              const imgElement = e.target as HTMLImageElement;
              imgElement.style.display = 'none';
              const fallback = imgElement.parentElement;
              if (fallback) {
                fallback.innerHTML = '<div class="absolute inset-0 flex items-center justify-center"><span class="text-gray-400">No image</span></div>';
              }
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="mt-4 space-y-2">
        {/* Title and Manufacturer */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 line-clamp-2">
            {product.name}
          </h3>
          {product.manufacturer && (
            <div className="text-sm font-medium text-gray-600">{product.manufacturer}</div>
          )}
        </div>

        {/* Price and Stock Section */}
        <div className="flex justify-between items-end gap-2">
          <div>
            <p className="text-lg font-medium text-gray-900">
              €{formatPrice(product.regular_price || product.price)}
            </p>
            {product.regular_price && product.regular_price > product.price && (
              <p className="text-sm text-gray-500 line-through">
                €{formatPrice(product.regular_price)}
              </p>
            )}
          </div>
          
          <div className="text-right">
            <div className={`text-xs px-2 py-1 rounded-full ${
              product.stock > 0
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
            </div>
            {product.warehouse && (
              <div className="text-xs text-gray-500 mt-1">{product.warehouse}</div>
            )}
          </div>
        </div>

        {/* Product Details Grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs pt-2 border-t">
          {product.ean && (
            <div className="text-gray-600">
              <span className="font-medium">EAN:</span> {product.ean}
            </div>
          )}
          {product.mpn && (
            <div className="text-gray-600">
              <span className="font-medium">MPN:</span> {product.mpn}
            </div>
          )}
          {product.sku && (
            <div className="text-gray-600">
              <span className="font-medium">SKU:</span> {product.sku}
            </div>
          )}
          {product.warranty_period && (
            <div className="text-gray-600">
              <span className="font-medium">Warranty:</span> {product.warranty_period}
            </div>
          )}
          {attributes.vendor && (
            <div className="text-gray-600">
              <span className="font-medium">Vendor:</span> {attributes.vendor}
            </div>
          )}
          {attributes.delivery_from_country && (
            <div className="text-gray-600">
              <span className="font-medium">Ships from:</span> {attributes.delivery_from_country}
            </div>
          )}
          {product.category && (
            <div className="text-gray-600">
              <span className="font-medium">Category:</span> {product.category}
            </div>
          )}
          {product.subcategory && (
            <div className="text-gray-600">
              <span className="font-medium">Subcategory:</span> {product.subcategory}
            </div>
          )}
        </div>

        {/* Short description */}
        {product.short_description && (
          <div className="text-xs text-gray-600 line-clamp-2 pt-2 border-t">
            {product.short_description.replace(/<[^>]*>/g, '')}
          </div>
        )}
      </div>
    </Link>
  )
}

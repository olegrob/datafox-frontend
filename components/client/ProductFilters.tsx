'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

interface ProductFiltersProps {
  inStockCount: number
  outOfStockCount: number
}

type SortOption = {
  label: string
  value: string
  order: 'asc' | 'desc'
  column: string
}

const sortOptions: SortOption[] = [
  { label: 'Newest First', value: 'newest', order: 'desc', column: 'created_at' },
  { label: 'Price: High to Low', value: 'price-desc', order: 'desc', column: 'price' },
  { label: 'Price: Low to High', value: 'price-asc', order: 'asc', column: 'price' },
  { label: 'Name: A to Z', value: 'name-asc', order: 'asc', column: 'name' },
  { label: 'Name: Z to A', value: 'name-desc', order: 'desc', column: 'name' },
]

export default function ProductFilters({ inStockCount, outOfStockCount }: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      // Reset page when changing filters
      params.delete('page')
      return params.toString()
    },
    [searchParams]
  )

  const currentSort = searchParams.get('sort') || 'newest'
  const stockStatus = searchParams.get('stock') || 'all'

  return (
    <div className="flex flex-col gap-6 bg-white p-6 rounded-lg shadow-sm border">
      {/* Sort Options */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Sort By</h3>
        <div className="space-y-2">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => router.push(`/?${createQueryString('sort', option.value)}`)}
              className={`w-full text-left px-3 py-2 text-sm rounded-md ${
                currentSort === option.value
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stock Status Filter */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Availability</h3>
        <div className="space-y-2">
          <button
            onClick={() => router.push(`/?${createQueryString('stock', 'all')}`)}
            className={`w-full text-left px-3 py-2 text-sm rounded-md ${
              stockStatus === 'all'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            All Products ({inStockCount + outOfStockCount})
          </button>
          <button
            onClick={() => router.push(`/?${createQueryString('stock', 'in-stock')}`)}
            className={`w-full text-left px-3 py-2 text-sm rounded-md ${
              stockStatus === 'in-stock'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            In Stock ({inStockCount})
          </button>
          <button
            onClick={() => router.push(`/?${createQueryString('stock', 'out-of-stock')}`)}
            className={`w-full text-left px-3 py-2 text-sm rounded-md ${
              stockStatus === 'out-of-stock'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Out of Stock ({outOfStockCount})
          </button>
        </div>
      </div>
    </div>
  )
}

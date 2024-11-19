'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

interface CategoryCount {
  category_path: string
  count: number
}

interface CategoryFilterProps {
  categories: CategoryCount[]
  selectedCategory?: string
  totalProducts: number
}

export default function CategoryFilter({ categories, selectedCategory, totalProducts }: CategoryFilterProps) {
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
      // Reset page when changing category
      params.delete('page')
      return params.toString()
    },
    [searchParams]
  )

  if (!categories?.length) {
    return null // Don't render if no categories
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-sm font-medium text-gray-900 mb-3">Categories</h3>
      <div className="space-y-2">
        <button
          onClick={() => router.push(`/?${createQueryString('category', '')}`)}
          className={`w-full text-left px-3 py-2 text-sm rounded-md ${
            !selectedCategory
              ? 'bg-blue-50 text-blue-700'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          All Categories ({totalProducts.toLocaleString()})
        </button>
        {categories.map(({ category_path, count }) => (
          <button
            key={category_path}
            onClick={() => router.push(`/?${createQueryString('category', category_path)}`)}
            className={`w-full text-left px-3 py-2 text-sm rounded-md truncate ${
              category_path === selectedCategory
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            {category_path} ({count.toLocaleString()})
          </button>
        ))}
      </div>
    </div>
  )
}

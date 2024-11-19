'use client'

import { type Product } from '@/types'
import ProductCard from '@/components/ProductCard'
import Pagination from '@/components/Pagination'

interface ProductGridProps {
  products: Product[]
  totalProducts: number
  currentPage: number
  itemsPerPage: number
}

export default function ProductGrid({
  products,
  totalProducts,
  currentPage,
  itemsPerPage,
}: ProductGridProps) {
  return (
    <div className="flex-1">
      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products?.map((product) => (
          <ProductCard key={product.product_id} product={product} />
        ))}
      </div>

      {totalProducts !== null && totalProducts > itemsPerPage && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil((totalProducts || 0) / itemsPerPage)}
            itemsPerPage={itemsPerPage}
            totalItems={totalProducts}
          />
        </div>
      )}
    </div>
  )
}

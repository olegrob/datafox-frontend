import { Suspense } from 'react'
import { createClient } from '@/utils/supabase/server'
import SearchBar from '@/components/client/SearchBar'
import ProductFilters from '@/components/client/ProductFilters'
import ProductGrid from '@/components/client/ProductGrid'

export const revalidate = 3600 // revalidate the data at most every hour

const ITEMS_PER_PAGE = 24 // Show 24 products per page (4x6 grid)

// Loading components
function SearchBarFallback() {
  return <div className="h-10 w-full max-w-lg animate-pulse rounded-lg bg-gray-200" />
}

function FiltersFallback() {
  return <div className="h-[400px] w-64 animate-pulse rounded-lg bg-gray-200" />
}

function ProductGridFallback() {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-square w-full bg-gray-200 rounded-lg" />
          <div className="mt-4 space-y-2">
            <div className="h-4 w-3/4 bg-gray-200 rounded" />
            <div className="h-4 w-1/2 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default async function Home({
  searchParams,
}: {
  searchParams: { q?: string; category?: string; warehouse?: string; page?: string; sort?: string; stock?: string }
}) {
  const supabase = await createClient()
  const currentPage = parseInt(searchParams.page || '1')

  // Get stock counts
  const { count: inStockCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .gt('stock', 0)

  const { count: outOfStockCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('stock', 0)

  // Build search query
  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })

  if (searchParams.q) {
    const searchTerm = searchParams.q.trim()
    const searchCondition = `name.ilike.%${searchTerm}%,` +
      `wpsso_product_mfr_part_no.ilike.%${searchTerm}%,` +
      `wpsso_product_gtin13.ilike.%${searchTerm}%`
    
    query = query.or(searchCondition)
  }

  if (searchParams.category) {
    query = query.eq('category_path', searchParams.category)
  }

  if (searchParams.warehouse) {
    query = query.eq('warehouse', searchParams.warehouse)
  }

  if (searchParams.stock === 'in-stock') {
    query = query.gt('stock', 0)
  } else if (searchParams.stock === 'out-of-stock') {
    query = query.eq('stock', 0)
  }

  // Add sorting
  if (searchParams.sort) {
    const [field, direction] = searchParams.sort.split('-')
    if (field && direction) {
      query = query.order(field, { ascending: direction === 'asc' })
    }
  } else {
    // Default sorting
    query = query.order('name', { ascending: true })
  }

  // Add pagination
  const from = (currentPage - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE - 1
  query = query.range(from, to)

  // Execute the query
  const { data: products, count: totalProducts, error } = await query

  if (error) {
    console.error('Error fetching products:', error)
    throw error
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-center mb-8">
        <Suspense fallback={<SearchBarFallback />}>
          <SearchBar />
        </Suspense>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-64">
          <Suspense fallback={<FiltersFallback />}>
            <ProductFilters
              inStockCount={inStockCount || 0}
              outOfStockCount={outOfStockCount || 0}
            />
          </Suspense>
        </div>

        <Suspense fallback={<ProductGridFallback />}>
          <ProductGrid
            products={products || []}
            totalProducts={totalProducts || 0}
            currentPage={currentPage}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </Suspense>
      </div>
    </div>
  )
}

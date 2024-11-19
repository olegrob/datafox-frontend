import { createClient } from '@/utils/supabase/server'
import ProductCard from '@/components/ProductCard'
import SearchBar from '@/components/SearchBar'
import CategoryFilter from '@/components/CategoryFilter'
import Pagination from '@/components/Pagination'
import ProductFilters from '@/components/ProductFilters'

export const revalidate = 3600 // revalidate the data at most every hour

const ITEMS_PER_PAGE = 24 // Show 24 products per page (4x6 grid)

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

  // Get unique categories directly from products table
  const { data: categoryData } = await supabase
    .from('products')
    .select('category_path')
    .not('category_path', 'is', null)
    .not('category_path', 'eq', '')
    .or('category_path.neq.0,category_path.neq.null') // Extra check for invalid values

  // Create a Set for unique category paths
  const uniquePaths = new Set<string>()
  categoryData?.forEach(product => {
    if (product.category_path && product.category_path.trim()) {
      uniquePaths.add(product.category_path.trim())
    }
  })

  // Count products for each unique category
  const categoryMap = new Map<string, number>()
  categoryData?.forEach(product => {
    if (product.category_path && uniquePaths.has(product.category_path)) {
      categoryMap.set(product.category_path, (categoryMap.get(product.category_path) || 0) + 1)
    }
  })

  // Convert to array and sort
  const categories = Array.from(uniquePaths)
    .map(path => ({
      category_path: path,
      count: categoryMap.get(path) || 0
    }))
    .sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count // Sort by count first (descending)
      }
      return a.category_path.localeCompare(b.category_path) // Then alphabetically
    })

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
    
    // Debug logging
    console.log('Search term:', searchTerm)
    console.log('Search condition:', searchCondition)
    
    // Let's also do a direct check for the EAN
    const { data: directMatch } = await supabase
      .from('products')
      .select('name, wpsso_product_gtin13, wpsso_product_mfr_part_no')
      .eq('wpsso_product_gtin13', searchTerm)
      .limit(1)
    
    if (directMatch?.length) {
      console.log('Direct EAN match found:', directMatch[0])
    } else {
      console.log('No direct EAN match found')
    }
  }

  if (searchParams.category) {
    query = query.eq('category_path', searchParams.category)
  }

  if (searchParams.warehouse) {
    query = query.ilike('warehouse', searchParams.warehouse)
  }

  if (searchParams.stock === 'in') {
    query = query.gt('stock', 0)
  } else if (searchParams.stock === 'out') {
    query = query.eq('stock', 0)
  }

  // Apply sorting
  const sort = searchParams.sort || 'newest'
  switch (sort) {
    case 'price-desc':
      query = query.order('price', { ascending: false })
      break
    case 'price-asc':
      query = query.order('price', { ascending: true })
      break
    case 'name-asc':
      query = query.order('name', { ascending: true })
      break
    case 'name-desc':
      query = query.order('name', { ascending: false })
      break
    default: // newest first
      query = query.order('created_at', { ascending: false })
  }

  // Calculate pagination
  const start = (currentPage - 1) * ITEMS_PER_PAGE
  const end = start + ITEMS_PER_PAGE - 1

  // Get total count and products
  const { data: products, count, error } = await query.range(start, end)

  // Debug logging
  console.log('Query error:', error)
  console.log('Products count:', count)
  console.log('First product:', products?.[0])

  const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE)

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-6 space-y-4">
          <div className="flex items-center justify-center">
            <SearchBar />
          </div>
        </div>

        <div className="flex gap-x-8">
          {/* Filters */}
          <div className="w-64 flex-none space-y-6">
            <CategoryFilter
              categories={categories}
              selectedCategory={searchParams.category}
              totalProducts={categories.reduce((sum, cat) => sum + cat.count, 0)}
            />
            <ProductFilters
              inStockCount={inStockCount || 0}
              outOfStockCount={outOfStockCount || 0}
            />
          </div>

          {/* Product grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products?.map((product) => (
                <ProductCard key={product.product_id} product={product} />
              ))}
              {products?.length === 0 && (
                <div className="col-span-full py-10 text-center text-gray-500">
                  No products found
                </div>
              )}
            </div>

            {/* Pagination */}
            {count !== null && count > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={ITEMS_PER_PAGE}
                totalItems={count}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

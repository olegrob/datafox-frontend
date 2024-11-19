import { Suspense } from 'react'
import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import ProductGallery from '@/components/ProductGallery'

export const revalidate = 3600 // revalidate the data at most every hour

// Clean HTML content
const cleanHtml = (html?: string) => {
  if (!html) return ''
  return html
    .replace(/<tr[^>]*>/g, '')
    .replace(/<\/tr>/g, '\n')
    .replace(/<td[^>]*>/g, '')
    .replace(/<\/td>/g, ' | ')
    .replace(/<ul>/g, '')
    .replace(/<\/ul>/g, '')
    .replace(/<li>/g, '• ')
    .replace(/<\/li>/g, '\n')
    .replace(/<br\s*\/?>/g, '\n')  // Handle <br> tags
    .replace(/<[^>]+>/g, '')
    .replace(/\\n/g, '\n')
    .replace(/&nbsp;/g, ' ')  // Handle &nbsp;
    .replace(/&rsquo;/g, "'")  // Handle &rsquo;
    .replace(/&amp;/g, '&')   // Handle &amp;
    .trim()
}

// Parse specifications from HTML and group them by category
const parseSpecifications = (specHtml: string | undefined) => {
  if (!specHtml) return [];

  // Simple regex-based HTML table parser
  const rows = specHtml.match(/<tr>[\s\S]*?<\/tr>/g) || [];
  const specs = rows.map(row => {
    const cells = row.match(/<td>([\s\S]*?)<\/td>/g) || [];
    if (cells.length >= 2) {
      return {
        key: cleanHtml(cells[0]),
        value: cleanHtml(cells[1])
      };
    }
    return null;
  }).filter(Boolean);

  // Define category mappings for ELKO products
  const categoryMap: { [key: string]: string[] } = {
    'Memory': ['memory type', 'memory module', 'capacity', 'frequency', 'cl'],
    'Power': ['power', 'watts', 'va', 'voltage', 'input ports', 'output'],
    'Physical': ['dimensions', 'weight', 'height', 'width', 'depth', 'colour', 'material'],
    'Connectivity': ['usb', 'rs232', 'ports', 'interface'],
    'Performance': ['topology', 'frequency speed', 'nominal voltage'],
    'Shipping': ['shipping box', 'unit box', 'retail box', 'brutto', 'gross'],
    'Manufacturer': ['manufacturer', 'vendor', 'model', 'chip'],
    'Features': ['features', 'description', 'full description']
  };

  // Group specifications by category
  const groupedSpecs = Object.entries(categoryMap).map(([category, keywords]) => {
    const categorySpecs = specs.filter(spec => 
      keywords.some(keyword => 
        spec?.key.toLowerCase().includes(keyword.toLowerCase())
      )
    );
    
    return categorySpecs.length > 0 ? {
      category,
      specs: categorySpecs
    } : null;
  }).filter(Boolean);

  // Add remaining specs to "Other" category
  const categorizedKeys = new Set(
    groupedSpecs.flatMap(group => 
      group?.specs.map(spec => spec?.key.toLowerCase()) || []
    )
  );

  const otherSpecs = specs.filter(
    spec => !categorizedKeys.has(spec?.key.toLowerCase() || '')
  );

  if (otherSpecs.length > 0) {
    groupedSpecs.push({
      category: 'Other',
      specs: otherSpecs
    });
  }

  return groupedSpecs;
};

// Loading components
function ImagesFallback() {
  return <div className="aspect-square w-full animate-pulse rounded-lg bg-gray-200" />
}

function SpecsFallback() {
  return <div className="h-[400px] w-full animate-pulse rounded-lg bg-gray-200" />
}

export default async function ProductPage({
  params: { id },
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  console.log('Looking for product with ID:', id);
  
  // First try exact product_id match
  let { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('product_id', id)
    .single()

  // If not found, try with warehouse extraction
  if (!product) {
    const warehouse = id.split('_')[0];
    if (warehouse) {
      console.log('Trying with warehouse:', warehouse);
      const { data: warehouseProduct } = await supabase
        .from('products')
        .select('*')
        .eq('warehouse', warehouse)
        .eq('product_id', id)
        .single()
      
      product = warehouseProduct;
    }
  }

  // If still not found, try case-insensitive search
  if (!product) {
    console.log('Trying case-insensitive search');
    const { data: caseInsensitiveProduct } = await supabase
      .from('products')
      .select('*')
      .ilike('product_id', id)
      .single()
    
    product = caseInsensitiveProduct;
  }

  if (!product) {
    console.log('Product not found after all attempts');
    notFound()
  }

  console.log('Found product:', product);

  // Parse product attributes
  let attributes: any = {}
  try {
    if (product.product_attributes) {
      attributes = typeof product.product_attributes === 'string' 
        ? JSON.parse(product.product_attributes)
        : product.product_attributes;
    }
  } catch (e) {
    console.error('Failed to parse product attributes:', e)
  }

  // Format price safely
  const formatPrice = (price?: number | null) => {
    if (!price || isNaN(Number(price))) return '0.00';
    return Number(price).toFixed(2);
  }

  // Get the display price
  const displayPrice = product.sale_price || product.regular_price;
  const hasDiscount = product.sale_price && product.sale_price < product.regular_price;

  const groupedSpecs = parseSpecifications(attributes.specifications_html);

  // Format warranty period
  const formatWarranty = (warranty?: string) => {
    if (!warranty) return null;
    if (warranty.endsWith('L')) {
      return `${warranty.slice(0, -1)} months`;
    }
    return `${warranty} months`;
  };

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Product Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
            {product.name}
          </h1>
          <div className="space-y-1">
            {product.manufacturer && (
              <div className="text-lg text-gray-600">
                Manufacturer: {product.manufacturer}
              </div>
            )}
            {product.wpsso_product_mfr_part_no && (
              <div className="text-sm text-gray-500">
                MFR Part No: {product.wpsso_product_mfr_part_no}
              </div>
            )}
            {product.category_path && (
              <div className="text-sm text-gray-500">
                Category: {product.category_path.split('|').join(' > ')}
              </div>
            )}
          </div>
        </div>

        {/* Gallery and Essential Info */}
        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8 mb-12">
          {/* Image Gallery */}
          <Suspense fallback={<ImagesFallback />}>
            <ProductGallery 
              imageUrls={Array.isArray(product.external_image_url) ? 
                product.external_image_url : 
                [product.external_image_url]
              }
              productName={product.name}
            />
          </Suspense>

          {/* Essential Product Info */}
          <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
            {/* Price and Stock */}
            <div className="mt-4 space-y-2">
              <div className="flex items-end gap-4">
                <div>
                  <p className="text-3xl tracking-tight text-gray-900">
                    €{formatPrice(displayPrice)}
                  </p>
                  {hasDiscount && (
                    <p className="text-sm text-gray-500 line-through mt-1">
                      €{formatPrice(product.regular_price)}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {product.stock > 0 ? (
                  <span className="text-green-600">{product.stock} in stock</span>
                ) : (
                  <span className="text-red-600">Out of stock</span>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900">Product Details</h3>
              <dl className="mt-4 space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Warehouse</dt>
                  <dd className="mt-1 text-sm text-gray-900">{product.warehouse}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Product ID</dt>
                  <dd className="mt-1 text-sm text-gray-900">{product.product_id}</dd>
                </div>
                {product.warranty_period && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Warranty</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatWarranty(product.warranty_period)}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Short Description */}
            {product.short_description && (
              <div className="mt-8">
                <div className="prose prose-sm text-gray-600">
                  <div dangerouslySetInnerHTML={{ __html: product.short_description.replace(/\|/g, ' | ') }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Full Width Specifications */}
        {groupedSpecs?.length > 0 && (
          <Suspense fallback={<SpecsFallback />}>
            <div className="mt-12 border rounded-lg overflow-hidden bg-gray-50">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Specifications</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupedSpecs?.map((group, groupIndex) => (
                    <div key={groupIndex} className="bg-white rounded-lg p-4 shadow-sm">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">
                        {group?.category || 'General'}
                      </h3>
                      <dl className="space-y-3">
                        {group?.specs?.map((spec, specIndex) => spec && (
                          <div key={specIndex} className="flex flex-col">
                            <dt className="text-sm font-medium text-gray-500">{spec?.key}</dt>
                            <dd className="text-sm text-gray-900 mt-1">{spec?.value}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Suspense>
        )}

        {/* Description from Specifications */}
        {attributes?.Description && (
          <div className="mt-12 border rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Product Description</h2>
              <div className="prose prose-sm max-w-none text-gray-600">
                <div dangerouslySetInnerHTML={{ __html: attributes.Description }} />
              </div>
            </div>
          </div>
        )}

        {/* Debug: Raw Product Attributes */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-12 border rounded-lg overflow-hidden bg-gray-50">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Raw Product Attributes</h3>
              <pre className="bg-white p-4 rounded-md overflow-x-auto text-xs">
                {JSON.stringify(attributes, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

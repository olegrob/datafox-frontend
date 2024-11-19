'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import WarehouseFilter from './WarehouseFilter'
import { useSearchParams } from 'next/navigation'

interface Warehouse {
  warehouse: string
  count: number
}

export default function Header() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const supabase = createClient()
  const searchParams = useSearchParams()

  useEffect(() => {
    async function fetchWarehouses() {
      try {
        // Fetch counts for each warehouse
        const [alsoCount, actionCount, elkoCount] = await Promise.all([
          supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .ilike('warehouse', 'also'),
          supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .ilike('warehouse', 'action'),
          supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .ilike('warehouse', 'elko')
        ])

        const warehousesData = [
          { warehouse: 'ALSO', count: alsoCount.count || 0 },
          { warehouse: 'ACTION', count: actionCount.count || 0 },
          { warehouse: 'ELKO', count: elkoCount.count || 0 }
        ].filter(wh => wh.count > 0) // Only show warehouses with products
          .sort((a, b) => b.count - a.count) // Sort by count descending

        setWarehouses(warehousesData)
      } catch (error) {
        console.error('Error fetching warehouses:', error)
      }
    }

    fetchWarehouses()
  }, [])

  return (
    <header className="bg-white shadow">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/" className="text-2xl font-bold text-gray-900">
                DataFox
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <div className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
        <WarehouseFilter 
          selectedWarehouse={searchParams.get('warehouse') || undefined}
        />
      </div>
    </header>
  )
}

'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
})

interface WarehouseCounts {
  [key: string]: number
}

interface WarehouseFilterProps {
  selectedWarehouse?: string
}

export default function WarehouseFilter({ selectedWarehouse }: WarehouseFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [warehouseCounts, setWarehouseCounts] = useState<WarehouseCounts>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Using RPC function for warehouse counts
        const { data, error: queryError } = await supabase
          .rpc('get_warehouse_counts')

        if (queryError) {
          console.error('Query error:', queryError)
          setError('Failed to fetch warehouse counts')
          return
        }

        if (!data) {
          setError('No warehouse data received')
          return
        }

        const counts: WarehouseCounts = {}
        data.forEach((row: { warehouse: string; count: number }) => {
          if (row.warehouse) {
            counts[row.warehouse] = row.count
          }
        })

        console.log('Warehouse counts:', counts)
        setWarehouseCounts(counts)
      } catch (err) {
        console.error('Error fetching warehouse counts:', err)
        setError('Failed to fetch warehouse counts')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCounts()
  }, [])

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      params.delete('page')
      return params.toString()
    },
    [searchParams]
  )

  const totalProducts = Object.values(warehouseCounts).reduce((sum, count) => sum + count, 0)

  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-3 items-center justify-center">
        <div className="text-gray-500">Loading warehouses... Please wait, this may take a moment.</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-wrap gap-3 items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-3 items-center justify-center">
      <button
        onClick={() => router.push(`/?${createQueryString('warehouse', '')}`)}
        className={`px-4 py-2 text-sm font-medium rounded-full ${
          !selectedWarehouse
            ? 'bg-blue-50 text-blue-700 border border-blue-200'
            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
        }`}
      >
        All Warehouses ({totalProducts.toLocaleString()})
      </button>
      {Object.entries(warehouseCounts)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([warehouse, count]) => (
          <button
            key={warehouse}
            onClick={() => router.push(`/?${createQueryString('warehouse', warehouse)}`)}
            className={`px-4 py-2 text-sm font-medium rounded-full ${
              warehouse === selectedWarehouse
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            {warehouse} ({count.toLocaleString()})
          </button>
        ))}
    </div>
  )
}

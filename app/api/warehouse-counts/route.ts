import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Create Supabase client with server-side environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing environment variables for Supabase')
}

const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET() {
  try {
    // Get distinct warehouses using select distinct
    const { data: warehouses, error: warehouseError } = await supabase
      .from('products')
      .select('warehouse')
      .not('warehouse', 'is', null)

    if (warehouseError) {
      console.error('Error fetching warehouses:', warehouseError)
      throw warehouseError
    }

    // Get unique warehouses
    const uniqueWarehouses = Array.from(new Set(warehouses.map(w => w.warehouse))).filter(Boolean)

    // Initialize counts object with all warehouses set to 0
    const counts: Record<string, number> = {}
    uniqueWarehouses.forEach(warehouse => {
      counts[warehouse] = 0
    })

    // Get counts for each warehouse
    for (const warehouse of uniqueWarehouses) {
      const { count, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('warehouse', warehouse)

      if (countError) {
        console.error(`Error fetching count for warehouse ${warehouse}:`, countError)
        continue
      }

      counts[warehouse] = count || 0
    }

    return NextResponse.json(counts)
  } catch (error) {
    console.error('Error in warehouse counts API:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

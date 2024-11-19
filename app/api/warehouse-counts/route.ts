import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { checkEnvVars } from '@/utils/supabase/check-env-vars'

// Create Supabase client with server-side environment variables
const { supabaseUrl, supabaseKey } = checkEnvVars()
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
    console.error('Error in warehouse counts:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

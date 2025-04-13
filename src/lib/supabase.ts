import { createClient } from '@supabase/supabase-js'

// Handle both SSR and client-side environments
const supabaseUrl = process.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY

// During development or client-side, don't throw if env vars are missing
if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NODE_ENV === 'development') {
        console.warn('Missing Supabase environment variables')
    }
}

export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
)

export type Task = {
    id: string
    content: string
    created_at: string
    completed_at: string | null
    user_id: string | null
    archived: boolean | null
} 
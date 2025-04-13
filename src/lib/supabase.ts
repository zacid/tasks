import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables')
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
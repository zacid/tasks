import { createClient } from '@supabase/supabase-js'

// Define types for our environment variables
declare global {
    interface ImportMetaEnv {
        readonly VITE_SUPABASE_URL: string
        readonly VITE_SUPABASE_ANON_KEY: string
    }
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables')
}

export const supabase = createClient(
    supabaseUrl ?? '',  // Fallback to empty string if undefined
    supabaseAnonKey ?? ''  // Fallback to empty string if undefined
)

export type Task = {
    id: string
    content: string
    created_at: string
    completed_at: string | null
    user_id: string | null
    archived: boolean | null
}
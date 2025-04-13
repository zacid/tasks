import { createClient } from '@supabase/supabase-js'

// Define types for our environment variables
declare global {
    interface ImportMetaEnv {
        readonly VITE_SUPABASE_URL: string
        readonly VITE_SUPABASE_ANON_KEY: string
    }
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Task = {
    id: string
    content: string
    created_at: string
    completed_at: string | null
    user_id: string | null
    archived: boolean | null
}
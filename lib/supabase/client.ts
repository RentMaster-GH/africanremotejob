import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://onxkdycfflmtgozfemsx.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ueGtkeWNmZmxtdGdvemZlbXN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1MTY3MjEsImV4cCI6MjEwMTA5MjcyMX0.y90TlFyB3aTpLQeyIvATVkg2APebjSzEimKb7gVFI0Q'

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  cookieOptions: {
    maxAge: 60 * 60 * 24 * 365, // 1 Year Persistent Cookie (survives tab/window closing)
    sameSite: 'lax',
    path: '/',
  },
})
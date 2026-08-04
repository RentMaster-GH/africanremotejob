import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | undefined

export function createClient() {
  if (client) return client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://onxkdycfflmtgozfemsx.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ueGtkeWNmZmxtdGdvemZlbXN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1MTY3MjEsImV4cCI6MjEwMTA5MjcyMX0.y90TlFyB3aTpLQeyIvATVkg2APebjSzEimKb7gVFI0Q'

  client = createBrowserClient(url, key)

  return client
}

export const supabase = createClient()
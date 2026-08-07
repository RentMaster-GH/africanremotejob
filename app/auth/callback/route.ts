import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://onxkdycfflmtgozfemsx.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ueGtkeWNmZmxtdGdvemZlbXN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1MTY3MjEsImV4cCI6MjEwMTA5MjcyMX0.y90TlFyB3aTpLQeyIvATVkg2APebjSzEimKb7gVFI0Q',
      {
        cookies: {
          getAll() {
            return request.headers.get('cookie')?.split(';').map(cookie => {
              const [name, ...rest] = cookie.trim().split('=')
              return { name, value: rest.join('=') }
            }) ?? []
          },
          setAll() {},
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login`)
}
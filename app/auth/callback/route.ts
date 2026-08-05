// app/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client' // Or your server-side createClient function if using SSR cookies

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // Where to redirect after successful login (defaults to /dashboard)
  let next = searchParams.get('next') ?? '/dashboard'

  if (!next.startsWith('/')) {
    next = '/dashboard'
  }

  if (code) {
    // If you are using standard client or server auth handler
    const supabaseResponse = await supabase.auth.exchangeCodeForSession(code)
    
    if (!supabaseResponse.error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return to an error page if code exchange fails
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`)
}
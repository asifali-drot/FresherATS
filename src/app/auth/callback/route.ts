import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // Get redirect param or default to dashboard
  let redirectPath = searchParams.get('redirect') || '/dashboard'
  
  // We need to preserve query parameters like claim_id if they exist
  const claimId = searchParams.get('claim_id')
  if (claimId) {
    const separator = redirectPath.includes('?') ? '&' : '?'
    redirectPath = `${redirectPath}${separator}claim_id=${claimId}`
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(`${origin}${redirectPath}`)
    } else {
      console.error('Error exchanging OAuth code:', error)
    }
  }

  // If there's an error or no code, redirect back to login
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate with Google`)
}

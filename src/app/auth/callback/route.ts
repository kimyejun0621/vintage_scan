import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // 로그인 끝나면 어디로 보낼까? (기본값: 메인 페이지 /)
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient() // 여기서 await 중요!
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // 성공하면 원래 가려던 곳으로 이동
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // 실패하면 에러 페이지로 (일단 메인으로 보냄)
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
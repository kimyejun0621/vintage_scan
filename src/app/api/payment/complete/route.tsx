import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    // 1. 요청 데이터 확인
    const body = await request.json()
    console.log("💰 결제 요청 도착:", body) // 터미널에 로그 찍기

    const { userId } = body

    // 2. 키가 제대로 있는지 검사
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("🚨 치명적 에러: 환경변수(키)가 없습니다!")
      return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 })
    }

    // 3. 관리자 권한으로 Supabase 접속
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    // 4. 유저 정보 강제 업데이트
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ 
        is_paid: true,
        credits: 9999
      })
      .eq('id', userId)
      .select()

    if (error) {
      console.error("🚨 DB 업데이트 실패:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("✅ 업데이트 성공! 변경된 데이터:", data)
    return NextResponse.json({ success: true })

  } catch (err) {
    console.error("🚨 알 수 없는 서버 에러:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
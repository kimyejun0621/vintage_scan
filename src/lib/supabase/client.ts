import { createBrowserClient } from '@supabase/ssr'

/**
 * [템플릿 설명]
 * 이 파일은 브라우저(클라이언트) 환경에서 Supabase에 접속하기 위한 "열쇠"를 만드는 공장입니다.
 * * Q: 왜 createClient를 그냥 쓰지 않고 함수로 만드나요?
 * A: Next.js는 서버/클라이언트가 왔다 갔다 하는데, 
 * 싱글톤(하나의 인스턴스)으로 만들면 사용자 A의 정보가 사용자 B에게 보일 수 있는 보안 사고가 터집니다.
 * 그래서 사용할 때마다 새로운 접속(Client)을 만들어주는 것입니다.
 */

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
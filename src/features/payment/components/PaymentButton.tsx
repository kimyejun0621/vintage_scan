'use client'

import { useState } from 'react'
import { useUser } from '@/lib/hooks/useUser'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

// 타입스크립트가 window.IMP를 모르니까 알려주기
declare global {
  interface Window {
    IMP: any;
  }
}

export default function PaymentButton() {
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handlePayment = () => {
    if (!user) {
      alert('로그인이 필요합니다!')
      router.push('/login')
      return
    }

    setLoading(true)

    // 1. 포트원 초기화 (가맹점 식별코드: 테스트용 코드)
    if (!window.IMP) return;
    const { IMP } = window;
    IMP.init('imp30336100'); // ⚠️ 나중에 본인 걸로 바꿔야 함 (일단 테스트용 가짜)

    // 2. 결제창 호출
    IMP.request_pay({
      pg: 'kakaopay', // 카카오페이로 결제
      pay_method: 'card',
      merchant_uid: `mid_${new Date().getTime()}`, // 주문번호 (고유해야 함)
      name: 'Vintage Sniper Hunter Plan',
      amount: 100, // 테스트니까 100원만
      buyer_email: user.email,
      buyer_name: user.email?.split('@')[0],
    }, async (rsp: any) => {
      // 3. 결제 결과 처리
      if (rsp.success) {
        // 성공하면 우리 서버(API)에 알리기
        const res = await fetch('/api/payment/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentId: rsp.imp_uid,
            userId: user.id
          })
        })

        

        // ⭐ 여기를 수정하세요! (응답이 OK가 아니면 에러 띄우기)
        if (res.ok) {
          alert('결제가 완료되었습니다! Hunter가 되신 걸 환영합니다. 🎉')
          router.refresh()
        } else {
          // 서버에서 에러가 났을 때
          const errorData = await res.json()
          alert(`서버 에러 발생: ${errorData.error}`)
        }
      } else {
        alert(`결제 실패: ${rsp.error_msg}`)
      }
      setLoading(false)
    })
  }

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-4 rounded-xl transition flex justify-center items-center gap-2"
    >
      {loading ? <Loader2 className="animate-spin" /> : '🚀 Hunter 플랜 시작하기 (월 ₩9,900)'}
    </button>
  )
}
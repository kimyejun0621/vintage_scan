'use client'

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Check, CreditCard, Lock, Loader2 } from "lucide-react"
import { useUser } from '@/lib/hooks/useUser'

// 포트원 타입 선언
declare global {
  interface Window {
    IMP: any;
  }
}

const plans = {
  starter: { name: "Starter", monthly: 4900, yearly: 49000, credits: 10 },
  hunter: { name: "Hunter", monthly: 9900, yearly: 99000, credits: 30 },
  pro: { name: "Pro", monthly: 29900, yearly: 299000, credits: 100 },
}

export default function CheckoutPage() {
  const { user } = useUser()
  const router = useRouter()

  const [selectedPlan, setSelectedPlan] = useState<keyof typeof plans>("hunter")
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const [loading, setLoading] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState(user?.email || "")
  const [company, setCompany] = useState("")

  const currentPlan = plans[selectedPlan]
  const price = billingCycle === "monthly" ? currentPlan.monthly : currentPlan.yearly
  const savings = billingCycle === "yearly" ? (currentPlan.monthly * 12 - currentPlan.yearly) : 0
  const tax = Math.floor(price * 0.1)
  const total = price + tax

  const handlePayment = () => {
    if (!user) {
      alert('로그인이 필요합니다!')
      router.push('/login')
      return
    }

    if (!firstName || !lastName || !email) {
      alert('모든 필수 정보를 입력해주세요!')
      return
    }

    setLoading(true)

    // 포트원 초기화
    if (!window.IMP) {
      alert('결제 모듈을 불러오는데 실패했습니다.')
      setLoading(false)
      return
    }

    const { IMP } = window
    IMP.init('imp30336100') // 테스트용 가맹점 코드

    // 결제창 호출
    IMP.request_pay({
      pg: 'kakaopay',
      pay_method: 'card',
      merchant_uid: `mid_${new Date().getTime()}`,
      name: `Vintage Sniper ${currentPlan.name} Plan (${billingCycle === "yearly" ? "연간" : "월간"})`,
      amount: total,
      buyer_email: email,
      buyer_name: `${firstName} ${lastName}`,
    }, async (rsp: any) => {
      if (rsp.success) {
        // 서버에 결제 완료 통지
        const res = await fetch('/api/payment/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentId: rsp.imp_uid,
            userId: user.id,
            plan: selectedPlan,
            billingCycle,
            amount: total
          })
        })

        if (res.ok) {
          alert(`결제가 완료되었습니다! ${currentPlan.name} 플랜을 이용하실 수 있습니다. 🎉`)
          router.push('/')
          router.refresh()
        } else {
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary"></div>
            <span className="font-semibold">Vintage Sniper</span>
          </Link>
          {!user && (
            <Link href="/login">
              <Button variant="ghost">로그인</Button>
            </Link>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">플랜 선택 및 결제</h1>
            <p className="text-muted-foreground">빈티지 감정 서비스를 시작하세요</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Plan Selection & Payment Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Plan Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>플랜 선택</CardTitle>
                  <CardDescription>필요에 맞는 플랜을 선택하세요</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup value={selectedPlan} onValueChange={(v) => setSelectedPlan(v as keyof typeof plans)}>
                    <div className="space-y-3">
                      {Object.entries(plans).map(([key, plan]) => (
                        <label
                          key={key}
                          className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedPlan === key ? "border-primary bg-primary/5" : "hover:border-muted-foreground/50"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value={key} id={key} />
                            <div>
                              <div className="font-semibold">{plan.name}</div>
                              <div className="text-sm text-muted-foreground">
                                월 {plan.credits}회 감정 | ₩{billingCycle === "monthly" ? plan.monthly.toLocaleString() : plan.yearly.toLocaleString()}
                                {billingCycle === "yearly" ? "/년" : "/월"}
                              </div>
                            </div>
                          </div>
                          {selectedPlan === key && (
                            <Check className="h-5 w-5 text-primary" />
                          )}
                        </label>
                      ))}
                    </div>
                  </RadioGroup>

                  <div className="flex items-center justify-center space-x-4 pt-2">
                    <button
                      onClick={() => setBillingCycle("monthly")}
                      className={`px-4 py-2 rounded-md transition-colors ${
                        billingCycle === "monthly" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      월간 결제
                    </button>
                    <button
                      onClick={() => setBillingCycle("yearly")}
                      className={`px-4 py-2 rounded-md transition-colors relative ${
                        billingCycle === "yearly" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      연간 결제
                      <Badge className="ml-2 absolute -top-2 -right-2 text-xs">17% 할인</Badge>
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Account Information */}
              <Card>
                <CardHeader>
                  <CardTitle>결제자 정보</CardTitle>
                  <CardDescription>결제에 필요한 정보를 입력하세요</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">이름 *</Label>
                      <Input
                        id="firstName"
                        placeholder="홍"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">성 *</Label>
                      <Input
                        id="lastName"
                        placeholder="길동"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">이메일 *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="hong@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">회사명 (선택)</Label>
                    <Input
                      id="company"
                      placeholder="회사명을 입력하세요"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="mr-2 h-5 w-5" />
                    결제 정보
                  </CardTitle>
                  <CardDescription>
                    '결제하기' 버튼을 누르면 카카오페이 결제창이 열립니다
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                    <div className="flex items-start space-x-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>카카오페이를 통한 안전한 결제</span>
                    </div>
                    <div className="flex items-start space-x-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>SSL 암호화로 보호되는 결제 정보</span>
                    </div>
                    <div className="flex items-start space-x-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>즉시 서비스 이용 가능</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>주문 요약</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">플랜</span>
                      <span className="font-semibold">{currentPlan.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">결제 주기</span>
                      <span className="capitalize">{billingCycle === "monthly" ? "월간" : "연간"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">감정 횟수</span>
                      <span>월 {currentPlan.credits}회</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">소계</span>
                      <span>₩{price.toLocaleString()}</span>
                    </div>
                    {savings > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>연간 할인</span>
                        <span>-₩{savings.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">부가세 (10%)</span>
                      <span>₩{tax.toLocaleString()}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>총 결제금액</span>
                    <span>₩{total.toLocaleString()}</span>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                    <div className="flex items-start space-x-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>14일 환불 보장</span>
                    </div>
                    <div className="flex items-start space-x-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>언제든 취소 가능</span>
                    </div>
                    <div className="flex items-start space-x-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>즉시 이용 가능</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handlePayment}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        처리 중...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        결제하기
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    결제를 진행하시면 이용약관 및 개인정보처리방침에 동의하는 것으로 간주됩니다
                  </p>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

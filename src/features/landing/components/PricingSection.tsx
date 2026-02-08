'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { useUser } from '@/lib/hooks/useUser';
import Link from 'next/link';

const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "빈티지 입문자를 위한 무료 플랜",
    features: [
      "월 3회 AI 감정",
      "기본 시세 정보",
      "커뮤니티 지원",
      "기본 리포트"
    ],
    cta: "시작하기",
    popular: false
  },
  {
    name: "Hunter",
    price: "₩29,000",
    description: "전문 수집가를 위한 프리미엄 플랜",
    features: [
      "무제한 AI 감정",
      "고급 시세 분석",
      "진품 인증서 발급",
      "우선 고객 지원",
      "상세 분석 리포트",
      "시세 변동 알림",
      "전문가 상담 (월 1회)"
    ],
    cta: "Hunter 시작하기",
    popular: true
  },
  {
    name: "Enterprise",
    price: "문의",
    description: "대규모 딜러 및 기업을 위한 맞춤형 플랜",
    features: [
      "무제한 팀 멤버",
      "기업 보안 기능",
      "맞춤형 통합",
      "전담 지원",
      "SLA 보장",
      "맞춤형 교육",
      "화이트라벨 옵션"
    ],
    cta: "영업팀 문의",
    popular: false
  }
];

export function PricingSection() {
  const { user, userData } = useUser();

  return (
    <section id="pricing" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl tracking-tight mb-4">
            간단하고 투명한 가격
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            당신의 필요에 맞는 플랜을 선택하세요. 무료로 시작하고 필요에 따라 업그레이드하세요.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  가장 인기
                </Badge>
              )}
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-xl mb-2">{plan.name}</CardTitle>
                <div className="mb-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.price !== "Free" && plan.price !== "문의" && (
                    <span className="text-muted-foreground">/월</span>
                  )}
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* 로그인 상태와 결제 상태에 따른 버튼 표시 */}
                {!user ? (
                  <Link href="/login">
                    <Button
                      className="w-full"
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                ) : (
                  <>
                    {userData?.is_paid ? (
                      <div className="p-4 bg-green-50 text-green-800 rounded-lg border border-green-200 text-center">
                        <p className="font-bold">🎉 현재 플랜 이용 중</p>
                        <p className="text-xs mt-1">무제한 기능을 마음껏 활용하세요!</p>
                      </div>
                    ) : (
                      <Link href="/checkout">
                        <Button
                          className="w-full"
                          variant={plan.popular ? "default" : "outline"}
                        >
                          {plan.cta}
                        </Button>
                      </Link>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

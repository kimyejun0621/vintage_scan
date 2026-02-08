import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Camera,
  Shield,
  Zap,
  TrendingUp,
  Bell,
  FileText,
  Users
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI 진품 감정",
    description: "최신 AI 기술로 빈티지 아이템의 진품 여부를 정확하게 분석합니다. 수천 개의 데이터를 기반으로 학습된 AI가 도와드립니다.",
    badge: "핵심"
  },
  {
    icon: Camera,
    title: "사진 분석",
    description: "사진만 업로드하면 AI가 자동으로 브랜드, 연도, 상태를 분석하여 상세한 감정 결과를 제공합니다.",
    badge: "핵심"
  },
  {
    icon: TrendingUp,
    title: "실시간 시세 분석",
    description: "국내외 경매 데이터와 거래 내역을 기반으로 현재 시세와 예상 가격을 알려드립니다.",
    badge: "Pro"
  },
  {
    icon: Zap,
    title: "빠른 감정",
    description: "업로드 후 1분 이내에 AI 분석 결과를 받아보세요. 기다림 없이 즉시 결과를 확인할 수 있습니다.",
    badge: "핵심"
  },
  {
    icon: Shield,
    title: "진품 인증서",
    description: "감정 완료 후 공식 진품 인증서를 발급받으세요. 거래 시 신뢰도를 높여드립니다.",
    badge: "Pro"
  },
  {
    icon: Bell,
    title: "시세 알림",
    description: "관심 아이템의 시세 변동을 실시간으로 알려드립니다. 최적의 매매 타이밍을 놓치지 마세요.",
    badge: "Pro"
  },
  {
    icon: FileText,
    title: "상세 리포트",
    description: "감정 결과, 히스토리, 유사 거래 사례 등 모든 정보를 포함한 전문가 수준의 리포트를 제공합니다.",
    badge: "핵심"
  },
  {
    icon: Users,
    title: "전문가 커뮤니티",
    description: "다른 수집가들과 정보를 공유하고, 전문가의 조언을 받을 수 있는 커뮤니티에 참여하세요.",
    badge: "Pro"
  }
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl tracking-tight mb-4">
            빈티지 감정의 모든 것
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            AI 기술부터 전문가 커뮤니티까지, 빈티지 수집가에게 필요한
            모든 도구를 제공합니다.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <feature.icon className="h-8 w-8 text-primary" />
                  <Badge variant="secondary" className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

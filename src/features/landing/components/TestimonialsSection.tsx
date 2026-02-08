import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
  {
    content: "Vintage Sniper 덕분에 가짜 제품을 구매할 뻔한 상황을 여러 번 피했어요. AI 감정 결과가 정말 정확해서 믿고 사용하고 있습니다.",
    author: "김수집",
    role: "빈티지 의류 수집가",
    company: "서울",
    avatar: "김"
  },
  {
    content: "시세 분석 기능이 정말 유용해요. 적절한 가격에 구매하고 판매할 수 있게 되었습니다. Hunter 플랜 강추!",
    author: "박빈티지",
    role: "온라인 빈티지샵 운영",
    company: "부산",
    avatar: "박"
  },
  {
    content: "1분도 안 걸려서 감정 결과가 나와요. 빠르고 정확해서 거래할 때 자신감이 생겼습니다.",
    author: "이고물",
    role: "골동품 딜러",
    company: "인천",
    avatar: "이"
  },
  {
    content: "진품 인증서 발급 기능이 정말 좋아요. 고객들에게 신뢰를 줄 수 있어서 매출도 늘었습니다.",
    author: "최빈티지",
    role: "빈티지 매장 운영",
    company: "경기",
    avatar: "최"
  },
  {
    content: "초보 수집가인데 AI 감정 덕분에 안심하고 구매할 수 있게 됐어요. 커뮤니티에서 많은 정보도 얻고 있습니다.",
    author: "정초보",
    role: "빈티지 입문자",
    company: "대전",
    avatar: "정"
  },
  {
    content: "시세 알림 기능 덕분에 원하던 아이템을 좋은 가격에 구매했어요. 정말 유용한 서비스입니다!",
    author: "강고물",
    role: "빈티지 가구 수집가",
    company: "대구",
    avatar: "강"
  }
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl tracking-tight mb-4">
            빈티지 수집가들의 이야기
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            Vintage Sniper를 사용하는 수집가들이 직접 전하는 생생한 후기를 만나보세요.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="h-full">
              <CardContent className="p-6">
                <blockquote className="text-sm mb-4">
                  "{testimonial.content}"
                </blockquote>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" />
                    <AvatarFallback>{testimonial.avatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm">{testimonial.author}</div>
                    <div className="text-xs text-muted-foreground">
                      {testimonial.role} · {testimonial.company}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

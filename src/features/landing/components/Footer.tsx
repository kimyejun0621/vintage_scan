import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-primary"></div>
              <span className="font-semibold">Vintage Sniper</span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md">
              AI 기술로 빈티지 아이템의 진품을 감정하고, 실시간 시세를 분석하는
              플랫폼입니다. 수집가부터 초보자까지 모두를 위한 서비스.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="이메일 주소를 입력하세요"
                className="max-w-xs"
              />
              <Button>구독하기</Button>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-4">서비스</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-foreground transition-colors">기능</a></li>
              <li><a href="#pricing" className="hover:text-foreground transition-colors">가격</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">업데이트</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">로드맵</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-4">리소스</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">가이드</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">튜토리얼</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">블로그</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-4">회사</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">소개</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">채용</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">문의</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">지원</a></li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground mb-4 md:mb-0">
            © 2024 Vintage Sniper. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">개인정보처리방침</a>
            <a href="#" className="hover:text-foreground transition-colors">이용약관</a>
            <a href="#" className="hover:text-foreground transition-colors">쿠키 정책</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

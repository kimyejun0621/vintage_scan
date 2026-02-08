'use client'

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useUser } from '@/lib/hooks/useUser';
import Link from 'next/link';

export function HeroSection() {
  const { user, userData } = useUser();
  const sceneRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<Array<{left: number, top: number, delay: number, duration: number}>>([]);

  useEffect(() => {
    setMounted(true);
    // 클라이언트에서만 파티클 생성 (hydration mismatch 방지)
    setParticles(
      Array.from({ length: 20 }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 2 + Math.random() * 3,
      }))
    );
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const cards = scene.querySelectorAll('.floating-card');

    const animateCards = () => {
      cards.forEach((card, index) => {
        const element = card as HTMLElement;
        const time = Date.now() * 0.001;
        const offset = index * 0.5;

        const x = Math.sin(time + offset) * 30;
        const y = Math.cos(time + offset * 1.2) * 20;
        const rotateX = Math.sin(time + offset) * 10;
        const rotateY = Math.cos(time + offset * 0.8) * 15;

        element.style.transform = `
          translate3d(${x}px, ${y}px, 0)
          rotateX(${rotateX}deg)
          rotateY(${rotateY}deg)
        `;
      });

      requestAnimationFrame(animateCards);
    };

    animateCards();
  }, []);

  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      <div className="container mx-auto px-4 text-center">
        <Badge variant="secondary" className="mb-6">
          🎉 Vintage Sniper v2 - AI 빈티지 감정 서비스
        </Badge>
        <h1 className="mx-auto max-w-4xl text-4xl md:text-6xl lg:text-7xl tracking-tight mb-6">
          AI로 분석하는{" "}
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            빈티지 아이템
          </span>{" "}
          진품 감정
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-8">
          전문 AI가 당신의 빈티지 아이템을 분석하고, 진품 여부와 시세를 알려드립니다.
          수집가부터 초보자까지, 모두를 위한 빈티지 감정 플랫폼.
        </p>

        {/* 로그인 상태에 따른 다른 UI */}
        {!user ? (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href="/login">
              <Button size="lg" className="w-full sm:w-auto">
                로그인 하러 가기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <Play className="mr-2 h-4 w-4" />
              서비스 소개 보기
            </Button>
          </div>
        ) : (
          <div className="mb-12">
            <div className="space-y-2 mb-6">
              <p className="text-lg">환영합니다, <b>{user.email}</b>님!</p>
              <p className="text-sm text-muted-foreground">
                보유 크레딧: <span className="font-bold text-foreground">{userData?.credits || 0}</span>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="w-full sm:w-auto">
                감정 시작하기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                내 감정 내역
              </Button>
            </div>
          </div>
        )}

        {/* 3D Graphics Scene */}
        <div className="relative mx-auto max-w-5xl h-96 lg:h-[500px]">
          <div
            ref={sceneRef}
            className="relative w-full h-full perspective-1000"
            style={{ perspective: '1000px' }}
          >
            {/* Central Hub */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-br from-primary to-primary/70 rounded-3xl shadow-2xl flex items-center justify-center z-10">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center">
                <div className="w-8 h-8 bg-primary rounded-lg"></div>
              </div>
            </div>

            {/* Floating Design System Components */}

            {/* Button Component Card */}
            <div className="floating-card absolute top-16 left-20 w-40 h-24 bg-card border rounded-2xl shadow-lg p-4 transform-gpu">
              <div className="text-xs text-muted-foreground mb-2">Button</div>
              <div className="space-y-2">
                <div className="h-3 bg-primary rounded w-16"></div>
                <div className="h-3 bg-muted rounded w-20"></div>
              </div>
            </div>

            {/* Color Tokens Card */}
            <div className="floating-card absolute top-32 right-16 w-36 h-28 bg-card border rounded-2xl shadow-lg p-4 transform-gpu">
              <div className="text-xs text-muted-foreground mb-2">Colors</div>
              <div className="grid grid-cols-4 gap-1">
                <div className="w-4 h-4 bg-primary rounded"></div>
                <div className="w-4 h-4 bg-secondary rounded"></div>
                <div className="w-4 h-4 bg-accent rounded"></div>
                <div className="w-4 h-4 bg-muted rounded"></div>
                <div className="w-4 h-4 bg-destructive rounded"></div>
                <div className="w-4 h-4 bg-chart-1 rounded"></div>
                <div className="w-4 h-4 bg-chart-2 rounded"></div>
                <div className="w-4 h-4 bg-chart-3 rounded"></div>
              </div>
            </div>

            {/* Typography Card */}
            <div className="floating-card absolute bottom-20 left-12 w-44 h-32 bg-card border rounded-2xl shadow-lg p-4 transform-gpu">
              <div className="text-xs text-muted-foreground mb-2">Typography</div>
              <div className="space-y-2">
                <div className="h-4 bg-foreground/90 rounded w-32"></div>
                <div className="h-3 bg-foreground/70 rounded w-28"></div>
                <div className="h-2 bg-foreground/50 rounded w-24"></div>
              </div>
            </div>

            {/* Component Library Card */}
            <div className="floating-card absolute bottom-24 right-20 w-38 h-36 bg-card border rounded-2xl shadow-lg p-4 transform-gpu">
              <div className="text-xs text-muted-foreground mb-2">Components</div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-primary rounded"></div>
                  <div className="h-2 bg-muted rounded flex-1"></div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-secondary rounded"></div>
                  <div className="h-2 bg-muted rounded flex-1"></div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-accent rounded"></div>
                  <div className="h-2 bg-muted rounded flex-1"></div>
                </div>
              </div>
            </div>

            {/* Spacing Tokens */}
            <div className="floating-card absolute top-20 right-32 w-32 h-20 bg-card border rounded-2xl shadow-lg p-4 transform-gpu">
              <div className="text-xs text-muted-foreground mb-2">Spacing</div>
              <div className="space-y-1">
                <div className="h-1 bg-primary rounded w-4"></div>
                <div className="h-1 bg-primary rounded w-8"></div>
                <div className="h-1 bg-primary rounded w-12"></div>
                <div className="h-1 bg-primary rounded w-16"></div>
              </div>
            </div>

            {/* Icon Library */}
            <div className="floating-card absolute bottom-32 left-32 w-36 h-24 bg-card border rounded-2xl shadow-lg p-4 transform-gpu">
              <div className="text-xs text-muted-foreground mb-2">Icons</div>
              <div className="grid grid-cols-4 gap-2">
                <div className="w-4 h-4 bg-foreground/20 rounded"></div>
                <div className="w-4 h-4 bg-foreground/30 rounded"></div>
                <div className="w-4 h-4 bg-foreground/40 rounded"></div>
                <div className="w-4 h-4 bg-foreground/50 rounded"></div>
              </div>
            </div>

            {/* Documentation Card */}
            <div className="floating-card absolute top-40 left-40 w-40 h-28 bg-card border rounded-2xl shadow-lg p-4 transform-gpu">
              <div className="text-xs text-muted-foreground mb-2">Docs</div>
              <div className="space-y-1">
                <div className="h-2 bg-muted rounded w-full"></div>
                <div className="h-2 bg-muted rounded w-3/4"></div>
                <div className="h-2 bg-muted rounded w-5/6"></div>
                <div className="h-2 bg-muted rounded w-2/3"></div>
              </div>
            </div>

            {/* Version Control */}
            <div className="floating-card absolute top-12 right-48 w-34 h-26 bg-card border rounded-2xl shadow-lg p-4 transform-gpu">
              <div className="text-xs text-muted-foreground mb-2">Versions</div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="text-xs">v2.1.0</div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="text-xs">v2.0.5</div>
                </div>
              </div>
            </div>

            {/* Connecting Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.1" />
                  <stop offset="50%" stopColor="currentColor" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              <line x1="50%" y1="50%" x2="20%" y2="20%" stroke="url(#lineGradient)" strokeWidth="2" className="animate-pulse" />
              <line x1="50%" y1="50%" x2="80%" y2="30%" stroke="url(#lineGradient)" strokeWidth="2" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
              <line x1="50%" y1="50%" x2="25%" y2="75%" stroke="url(#lineGradient)" strokeWidth="2" className="animate-pulse" style={{ animationDelay: '1s' }} />
              <line x1="50%" y1="50%" x2="75%" y2="80%" stroke="url(#lineGradient)" strokeWidth="2" className="animate-pulse" style={{ animationDelay: '1.5s' }} />
            </svg>

            {/* Background Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {particles.map((particle, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-primary/20 rounded-full animate-pulse"
                  style={{
                    left: `${particle.left}%`,
                    top: `${particle.top}%`,
                    animationDelay: `${particle.delay}s`,
                    animationDuration: `${particle.duration}s`
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

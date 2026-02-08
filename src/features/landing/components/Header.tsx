'use client'

import { Button } from "@/components/ui/button";
import { Menu, LogOut } from "lucide-react";
import { useUser } from '@/lib/hooks/useUser';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function Header() {
  const { user } = useUser();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary"></div>
            <span className="font-semibold">Vintage Sniper</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              기능
            </a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              가격
            </a>
            <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">
              후기
            </a>
            <a href="#docs" className="text-muted-foreground hover:text-foreground transition-colors">
              가이드
            </a>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          {!user ? (
            <>
              <Link href="/login">
                <Button variant="ghost" className="hidden md:inline-flex">
                  로그인
                </Button>
              </Link>
              <Button>시작하기</Button>
            </>
          ) : (
            <>
              <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
                <span>{user.email}</span>
              </div>
              <Button>대시보드</Button>
              <Button variant="outline" size="icon" onClick={handleLogout} title="로그아웃">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}

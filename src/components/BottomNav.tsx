'use client'

import { Home, History, User } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav className="bg-black border-t border-zinc-700 px-8 py-6">
      <div className="max-w-md mx-auto flex justify-between items-center">
        <NavItem
          icon={<Home size={24} />}
          label="Home"
          active={pathname === '/app'}
          onClick={() => router.push('/app')}
        />
        <NavItem
          icon={<History size={24} />}
          label="History"
          onClick={() => router.push('/pricing')}
        />
        <NavItem
          icon={<User size={24} />}
          label="Profile"
          onClick={() => router.push('/pricing')}
        />
      </div>
    </nav>
  );
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

function NavItem({ icon, label, active = false, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-colors ${
        active ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
      }`}
    >
      {icon}
      <span className="text-xs uppercase tracking-wider font-medium">{label}</span>
    </button>
  );
}

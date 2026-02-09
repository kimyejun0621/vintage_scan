'use client'

import { useRouter } from 'next/navigation';
import { BrandCard } from '@/components/BrandCard';
import { BottomNav } from '@/components/BottomNav';

export default function Home() {
  const router = useRouter();

  return (
    <div className="h-screen flex flex-col bg-black text-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-zinc-800">
        <h1 className="text-2xl font-black tracking-wider">VINTAGE SNIPER</h1>
      </div>

      {/* Brand Cards Container */}
      <div className="flex-1 flex flex-col">
        <BrandCard
          brand="SUPREME"
          textStyle="supreme"
          background="supreme"
          onClick={() => router.push('/scan/supreme')}
        />
        <BrandCard
          brand="LEVI'S"
          textStyle="levis"
          background="levis"
          onClick={() => router.push('/scan/levis')}
        />
        <BrandCard
          brand="STUSSY"
          textStyle="stussy"
          background="stussy"
          onClick={() => router.push('/scan/stussy')}
        />
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

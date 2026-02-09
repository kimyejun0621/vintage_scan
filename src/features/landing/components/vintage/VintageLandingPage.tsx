'use client'

import { VintageHeroSection } from './VintageHeroSection';
import { VintageBrandMarquee } from './VintageBrandMarquee';
import { VintageFeatureDemo } from './VintageFeatureDemo';
import { VintagePricingTeaser } from './VintagePricingTeaser';
import { VintageLandingFooter } from './VintageLandingFooter';
import { useRouter } from 'next/navigation';

export default function VintageLandingPage() {
  const router = useRouter();

  const handleStartVerification = () => {
    router.push('/app');
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden digital-noise">
      <VintageHeroSection onCTAClick={handleStartVerification} />
      <VintageBrandMarquee />
      <VintageFeatureDemo />
      <VintagePricingTeaser />
      <VintageLandingFooter />
    </div>
  );
}

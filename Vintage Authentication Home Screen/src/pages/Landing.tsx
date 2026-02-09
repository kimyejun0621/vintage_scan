import { useNavigate } from 'react-router';
import { HeroSection } from '../components/landing/HeroSection';
import { BrandMarquee } from '../components/landing/BrandMarquee';
import { FeatureDemo } from '../components/landing/FeatureDemo';
import { PricingTeaser } from '../components/landing/PricingTeaser';
import { LandingFooter } from '../components/landing/LandingFooter';

export default function Landing() {
  const navigate = useNavigate();

  const handleStartVerification = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden digital-noise">
      <HeroSection onCTAClick={handleStartVerification} />
      <BrandMarquee />
      <FeatureDemo />
      <PricingTeaser />
      <LandingFooter />
    </div>
  );
}

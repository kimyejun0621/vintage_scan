import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { StarterCard } from '../components/pricing/StarterCard';
import { HunterCard } from '../components/pricing/HunterCard';

export default function Pricing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white px-6 py-12">
      {/* Header */}
      <div className="max-w-lg mx-auto mb-12">
        <button
          onClick={() => navigate('/app')}
          className="text-white/60 hover:text-white transition-colors mb-8 flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          <span className="text-sm uppercase tracking-wider">Back</span>
        </button>

        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4">
            THE BLACK CARD
          </h1>
          <p className="text-lg text-white/60">
            Choose your access level
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-lg mx-auto space-y-6">
        <StarterCard />
        <HunterCard />
      </div>

      {/* Footer */}
      <div className="max-w-lg mx-auto mt-12 pt-8 border-t border-white/10">
        <div className="flex justify-center gap-6 text-sm text-white/40">
          <button className="hover:text-white/60 transition-colors">
            Restore Purchase
          </button>
          <span>|</span>
          <button className="hover:text-white/60 transition-colors">
            Terms of Service
          </button>
        </div>
      </div>
    </div>
  );
}

import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, CheckCircle2, TrendingUp, MapPin, Calendar } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Timeline } from '../components/Timeline';
import { ComparisonView } from '../components/ComparisonView';
import { PriceArbitrage } from '../components/PriceArbitrage';

export default function Results() {
  const navigate = useNavigate();
  const { brand } = useParams<{ brand: string }>();

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-black/95 backdrop-blur-sm border-b border-white/10 z-10">
        <div className="px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1">
            <div className="font-mono text-xs text-white/50 uppercase tracking-wider">
              Analysis Report #{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}
            </div>
            <div className="font-mono text-sm text-white/70">
              {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
          <CheckCircle2 size={20} className="text-green-400" />
        </div>
      </div>

      {/* Verdict Stamp */}
      <div className="px-6 py-12 text-center relative">
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <div className="text-[200px] font-black transform -rotate-12">✓</div>
        </div>
        <div className="relative">
          <div className="inline-block border-8 border-white px-16 py-8 transform -rotate-2 hover:rotate-0 transition-transform duration-300">
            <div className="text-7xl md:text-8xl font-black tracking-wider">
              AUTHENTIC
            </div>
          </div>
          <div className="mt-6 font-mono text-sm text-green-400 uppercase tracking-widest">
            Verification Complete
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-dashed border-white/20 my-8" />

      {/* The Time Machine */}
      <div className="px-6 mb-12">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={16} className="text-white/50" />
            <h2 className="font-mono text-xs uppercase tracking-widest text-white/50">
              Production Timeline
            </h2>
          </div>
        </div>
        <Timeline />
      </div>

      {/* Divider */}
      <div className="border-t border-dashed border-white/20 my-8" />

      {/* Comparison View */}
      <div className="px-6 mb-12">
        <div className="mb-6">
          <h2 className="font-mono text-xs uppercase tracking-widest text-white/50 mb-2">
            Forensic Comparison
          </h2>
        </div>
        <ComparisonView
          userPhotoUrl="https://images.unsplash.com/photo-1763686745848-612259e8897d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZXZpcyUyMGRlbmltJTIwamVhbnMlMjBsYWJlbCUyMGNsb3NlJTIwdXB8ZW58MXx8fHwxNzcwNTc5NTc1fDA&ixlib=rb-4.1.0&q=80&w=1080"
          archivePhotoUrl="https://images.unsplash.com/photo-1619471327033-3fb3b2b0d966?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwbGV2aXMlMjBqZWFucyUyMGxhYmVsJTIwY2xvc2UlMjB1cHxlbnwxfHx8fDE3NzA1Nzk2OTF8MA&ixlib=rb-4.1.0&q=80&w=1080"
        />
      </div>

      {/* Divider */}
      <div className="border-t border-dashed border-white/20 my-8" />

      {/* Price Arbitrage */}
      <div className="px-6 mb-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-white/50" />
            <h2 className="font-mono text-xs uppercase tracking-widest text-white/50">
              Market Analysis
            </h2>
          </div>
        </div>
        <PriceArbitrage />
      </div>

      {/* Bottom Metadata */}
      <div className="px-6 mt-12 pt-8 border-t border-white/10">
        <div className="font-mono text-xs text-white/30 space-y-1">
          <div>CONFIDENCE LEVEL: 98.7%</div>
          <div>MARKERS VERIFIED: 12/12</div>
          <div>DATABASE VERSION: 2026.02</div>
          <div>POWERED BY VINTAGEAUTH™</div>
        </div>
      </div>
    </div>
  );
}

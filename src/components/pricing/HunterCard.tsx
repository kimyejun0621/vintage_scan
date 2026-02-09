'use client'

import { Zap, TrendingUp } from 'lucide-react';
import { PriceGraph } from './PriceGraph';

interface HunterCardProps {
  onPurchase: () => void;
  isLoading?: boolean;
}

export function HunterCard({ onPurchase, isLoading = false }: HunterCardProps) {

  return (
    <>
      <div className="relative bg-black border-2 border-white p-8 overflow-hidden glow-card">
        {/* Glass Morphism Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
        <div className="absolute inset-0 backdrop-blur-xl bg-black/80" />

        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full">
            <defs>
              <pattern id="premium-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#premium-grid)" />
          </svg>
        </div>

        <div className="relative">
          {/* Best Value Badge */}
          <div className="absolute -top-4 -right-4 bg-white text-black px-4 py-2 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg">
            <Zap size={12} fill="currentColor" />
            Best Value
          </div>

          {/* Plan Name */}
          <div className="flex items-center justify-between mb-6 mt-4">
            <h2 className="text-3xl font-black uppercase tracking-wider">HUNTER</h2>
          </div>

          {/* Features */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white rounded-full" />
              <span className="text-white font-medium">
                <span className="font-black">UNLIMITED</span> Scans
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white rounded-full" />
              <span className="text-white font-medium">
                Year ID <span className="text-white/60">(e.g., 1993)</span> Unlocked
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white rounded-full" />
              <span className="text-white font-medium">
                Global Price Arbitrage Unlocked
              </span>
            </div>
          </div>

          {/* Visual Hook - Clear Graph */}
          <div className="mb-8 relative">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={16} className="text-green-400" />
              <div className="text-xs uppercase tracking-wider text-white/70">
                Real-Time Market Data
              </div>
            </div>

            {/* Clear Graph Container */}
            <div className="relative bg-zinc-950 border border-white/20 p-6 h-48">
              <PriceGraph locked={false} />

              {/* Price Labels */}
              <div className="absolute top-4 right-4 space-y-1 text-right">
                <div className="text-xs text-white/50">Current</div>
                <div className="text-2xl font-black text-white">$200</div>
              </div>

              <div className="absolute bottom-4 left-4 space-y-1">
                <div className="text-xs text-white/50">Entry</div>
                <div className="text-xl font-black text-white/70">$150</div>
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="mb-6">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black">₩19,900</span>
              <span className="text-white/50">/mo</span>
            </div>
            <div className="text-xs text-white/40 mt-1">
              Billed monthly • Cancel anytime
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={onPurchase}
            disabled={isLoading}
            className="w-full py-5 bg-white text-black font-black text-lg uppercase tracking-wider hover:bg-white/90 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-black" />
                Processing...
              </>
            ) : (
              'Become a Hunter'
            )}
          </button>

          {/* Guarantee */}
          <div className="mt-4 text-center text-xs text-white/40">
            14-day money-back guarantee
          </div>
        </div>
      </div>
    </>
  );
}

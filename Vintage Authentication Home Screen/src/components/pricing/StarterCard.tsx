import { Lock } from 'lucide-react';
import { PriceGraph } from './PriceGraph';

export function StarterCard() {
  return (
    <div className="bg-zinc-800 p-8 border border-zinc-700 relative overflow-hidden">
      {/* Matte Texture Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 opacity-50" />
      
      <div className="relative">
        {/* Plan Name & Badge */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black uppercase tracking-wider">STARTER</h2>
          <div className="bg-zinc-700 px-3 py-1 text-xs font-bold uppercase tracking-wider">
            FREE
          </div>
        </div>

        {/* Features */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 bg-white/60 rounded-full" />
            <span className="text-white/80">3 Daily Scans</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 bg-white/60 rounded-full" />
            <span className="text-white/80">
              Authenticity Check: <span className="font-mono">O / X</span> Only
            </span>
          </div>
        </div>

        {/* Visual Hook - Locked Graph */}
        <div className="mb-6 relative">
          <div className="text-xs uppercase tracking-wider text-white/40 mb-3">
            Market Price Analysis
          </div>
          
          {/* Blurred Graph Container */}
          <div className="relative bg-zinc-900/50 border border-zinc-700 p-6 h-48 overflow-hidden">
            {/* Graph - Heavily Blurred */}
            <div className="absolute inset-0 blur-[12px] opacity-30">
              <PriceGraph locked={true} />
            </div>
            
            {/* Lock Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/60 backdrop-blur-sm">
              <div className="text-center">
                <Lock size={48} className="text-white/40 mx-auto mb-3" />
                <div className="text-sm font-bold uppercase tracking-wider text-white/50">
                  LOCKED
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <button
          disabled
          className="w-full py-4 border-2 border-white/20 text-white/40 font-bold uppercase tracking-wider cursor-not-allowed"
        >
          Current Plan
        </button>
      </div>
    </div>
  );
}

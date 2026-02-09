'use client'

import { Target, Zap } from 'lucide-react';
import { useState } from 'react';

interface SniperCardProps {
  onPurchase: () => void;
  isLoading?: boolean;
}

export function SniperCard({ onPurchase, isLoading = false }: SniperCardProps) {
  return (
    <div className="relative bg-gradient-to-br from-zinc-900 to-black p-8 border-2 border-zinc-700 hover:border-zinc-500 transition-all duration-300 overflow-hidden group">
      {/* Animated Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Crosshair Pattern */}
      <div className="absolute top-4 right-4 text-zinc-700 group-hover:text-zinc-500 transition-colors">
        <Target size={32} />
      </div>

      <div className="relative">
        {/* Plan Name & Badge */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black uppercase tracking-wider">SNIPER</h2>
          <div className="bg-blue-500/20 border border-blue-500/50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-400">
            ONE-TIME
          </div>
        </div>

        {/* Features */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span className="text-white font-medium">
              <span className="font-black text-blue-400">+10</span> Scan Credits
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-white/60 rounded-full" />
            <span className="text-white/80">Full Authentication Report</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-white/60 rounded-full" />
            <span className="text-white/80">Never Expires</span>
          </div>
        </div>

        {/* Value Proposition */}
        <div className="mb-6 bg-zinc-800/50 border border-zinc-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-white/50 mb-1">Cost per scan</div>
              <div className="text-xl font-black text-white">₩400</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-white/50 mb-1">You save</div>
              <div className="text-sm font-bold text-green-400">₩2,000</div>
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black">₩4,000</span>
            <span className="text-white/50 line-through text-lg">₩6,000</span>
          </div>
          <div className="text-xs text-white/40 mt-1">
            One-time payment • 10 credits
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={onPurchase}
          disabled={isLoading}
          className="w-full py-5 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-black text-lg uppercase tracking-wider hover:from-blue-600 hover:to-purple-600 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white" />
              Processing...
            </>
          ) : (
            <>
              <Zap size={20} fill="currentColor" />
              Quick Boost
            </>
          )}
        </button>

        {/* Guarantee */}
        <div className="mt-4 text-center text-xs text-white/40">
          Perfect for occasional verifications
        </div>
      </div>
    </div>
  );
}

import { TrendingUp, DollarSign } from 'lucide-react';

export function PriceArbitrage() {
  const krwPrice = 80000;
  const usdPrice = 120;
  const usdToKrw = 1334; // Approximate exchange rate
  const globalPriceKrw = usdPrice * usdToKrw;
  const arbitragePercent = ((globalPriceKrw - krwPrice) / krwPrice * 100).toFixed(0);

  return (
    <div className="bg-zinc-900 border border-white/10">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4 bg-zinc-800/50">
        <div className="font-mono text-xs uppercase tracking-widest text-white/50">
          Market Valuation Report
        </div>
      </div>

      {/* Price Data */}
      <div className="p-6 space-y-6">
        {/* Local Market */}
        <div className="flex items-start justify-between">
          <div>
            <div className="font-mono text-xs text-white/40 mb-1">KR MARKET</div>
            <div className="font-mono text-3xl text-white">₩{krwPrice.toLocaleString()}</div>
            <div className="font-mono text-xs text-white/30 mt-1">Seoul, Gangnam District</div>
          </div>
          <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded">
            <div className="font-mono text-xs text-blue-400">LOCAL</div>
          </div>
        </div>

        {/* Arrow Separator */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10" />
          <TrendingUp size={16} className="text-green-400" />
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Global Market */}
        <div className="flex items-start justify-between">
          <div>
            <div className="font-mono text-xs text-white/40 mb-1">GLOBAL MARKET (EBAY)</div>
            <div className="font-mono text-3xl text-white">
              ${usdPrice} <span className="text-xl text-white/50">(₩{globalPriceKrw.toLocaleString()})</span>
            </div>
            <div className="font-mono text-xs text-white/30 mt-1">Average of 24 listings</div>
          </div>
          <div className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded">
            <div className="font-mono text-xs text-purple-400">GLOBAL</div>
          </div>
        </div>
      </div>

      {/* Arbitrage Opportunity */}
      <div className="border-t border-white/10 bg-green-400/5 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DollarSign size={20} className="text-green-400" />
            <div>
              <div className="font-mono text-sm text-white">Arbitrage Opportunity</div>
              <div className="font-mono text-xs text-white/50">Cross-border profit margin</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-3xl font-bold text-green-400">+{arbitragePercent}%</div>
            <div className="font-mono text-xs text-green-400/70">₩{(globalPriceKrw - krwPrice).toLocaleString()} gain</div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="border-t border-white/10 px-6 py-3 bg-black/20">
        <div className="font-mono text-[10px] text-white/30">
          * Prices updated 2 hours ago. Shipping and fees not included. For reference only.
        </div>
      </div>
    </div>
  );
}

import { TrendingUp, DollarSign, ExternalLink, Clock } from 'lucide-react';
import { MarketPriceData } from '@/lib/services/pricing/types';

interface PriceArbitrageProps {
  krwPrice: number;
  usdPrice: number;
  marketData?: MarketPriceData;
}

export function PriceArbitrage({ krwPrice, usdPrice, marketData }: PriceArbitrageProps) {
  const usdToKrw = marketData?.exchangeRate?.USD_KRW || 1334;
  const globalPriceKrw = usdPrice * usdToKrw;

  // Use market data if available, otherwise fallback to props
  const aiPrice = krwPrice;
  const ebaySource = marketData?.sources.find(s => s.source === 'ebay');
  const grailedSource = marketData?.sources.find(s => s.source === 'grailed');
  const aggregatedPrice = marketData?.aggregated.estimatedPrice || globalPriceKrw;
  const confidence = marketData?.aggregated.confidence || 70;

  const arbitragePercent = ((aggregatedPrice - aiPrice) / aiPrice * 100).toFixed(0);

  // Format time ago
  const getTimeAgo = (date?: Date) => {
    if (!date) return null;
    const hours = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60));
    if (hours < 1) return '방금 전';
    if (hours < 24) return `${hours}시간 전`;
    const days = Math.floor(hours / 24);
    return `${days}일 전`;
  };

  return (
    <div className="bg-zinc-900 border border-white/10">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4 bg-zinc-800/50">
        <div className="font-mono text-xs uppercase tracking-widest text-white/50">
          Market Valuation Report
        </div>
      </div>

      {/* Price Data */}
      <div className="p-6 space-y-4">
        {/* AI Estimate */}
        <div className="p-4 bg-zinc-800/50 border border-white/10 rounded-lg">
          <div className="flex items-start justify-between mb-2">
            <div className="font-mono text-xs text-white/40">AI 추정가</div>
            <div className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 rounded">
              <div className="font-mono text-[10px] text-blue-400">신뢰도: 70%</div>
            </div>
          </div>
          <div className="font-mono text-2xl text-white">₩{aiPrice.toLocaleString()}</div>
        </div>

        {/* eBay Data */}
        {ebaySource && (
          <div className="p-4 bg-zinc-800/50 border border-white/10 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <div className="font-mono text-xs text-white/40">EBAY 시세 ({ebaySource.listingCount}개 판매 완료)</div>
              <div className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/30 rounded">
                <div className="font-mono text-[10px] text-purple-400">신뢰도: {ebaySource.confidence}%</div>
              </div>
            </div>
            <div className="font-mono text-2xl text-white mb-1">₩{ebaySource.priceKRW.toLocaleString()}</div>
            <div className="font-mono text-xs text-white/30">
              범위: ₩{Math.round((ebaySource.minPrice || 0) * usdToKrw).toLocaleString()} -
              ₩{Math.round((ebaySource.maxPrice || 0) * usdToKrw).toLocaleString()}
            </div>
            {ebaySource.sampleListings && ebaySource.sampleListings.length > 0 && (
              <a
                href={ebaySource.sampleListings[0].url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-xs text-purple-400 hover:text-purple-300"
              >
                <span>샘플 리스팅 보기</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        )}

        {/* Grailed Data */}
        {grailedSource && (
          <div className="p-4 bg-zinc-800/50 border border-white/10 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <div className="font-mono text-xs text-white/40">GRAILED 시세 ({grailedSource.listingCount}개 판매 중)</div>
              <div className="px-2 py-0.5 bg-green-500/10 border border-green-500/30 rounded">
                <div className="font-mono text-[10px] text-green-400">신뢰도: {grailedSource.confidence}%</div>
              </div>
            </div>
            <div className="font-mono text-2xl text-white mb-1">₩{grailedSource.priceKRW.toLocaleString()}</div>
            {grailedSource.sampleListings && grailedSource.sampleListings.length > 0 && (
              <a
                href={grailedSource.sampleListings[0].url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-xs text-green-400 hover:text-green-300"
              >
                <span>샘플 리스팅 보기</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10" />
          <TrendingUp size={16} className="text-green-400" />
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Aggregated Price */}
        <div className="p-4 bg-blue-500/5 border-2 border-blue-500/30 rounded-lg">
          <div className="flex items-start justify-between mb-2">
            <div className="font-mono text-xs text-blue-300">통합 예상 시세 ★</div>
            <div className="px-2 py-0.5 bg-blue-500/20 border border-blue-500/40 rounded">
              <div className="font-mono text-[10px] text-blue-300">신뢰도: {confidence}%</div>
            </div>
          </div>
          <div className="font-mono text-3xl font-bold text-white">₩{aggregatedPrice.toLocaleString()}</div>
          {marketData?.aggregated.priceRange && (
            <div className="font-mono text-xs text-white/40 mt-1">
              예상 범위: ₩{marketData.aggregated.priceRange.min.toLocaleString()} -
              ₩{marketData.aggregated.priceRange.max.toLocaleString()}
            </div>
          )}
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
            <div className="font-mono text-xs text-green-400/70">₩{(aggregatedPrice - aiPrice).toLocaleString()} gain</div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="border-t border-white/10 px-6 py-3 bg-black/20">
        <div className="flex items-center justify-between">
          <div className="font-mono text-[10px] text-white/30">
            * Shipping and fees not included. For reference only.
          </div>
          {marketData?.cachedAt && (
            <div className="flex items-center gap-1 font-mono text-[10px] text-white/30">
              <Clock size={10} />
              <span>업데이트: {getTimeAgo(marketData.cachedAt)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

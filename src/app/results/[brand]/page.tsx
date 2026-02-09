'use client'

import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2, TrendingUp, Calendar, AlertTriangle, XCircle } from 'lucide-react';
import { Timeline } from '@/components/results/Timeline';
import { ComparisonView } from '@/components/results/ComparisonView';
import { PriceArbitrage } from '@/components/results/PriceArbitrage';
import PriceLoading from '@/components/results/PriceLoading';
import { PriceFeedback } from '@/components/results/PriceFeedback';
import { useEffect, useState } from 'react';
import { AnalysisResponse } from '@/types/analysis';
import { MarketPriceData } from '@/lib/services/pricing/types';

export default function Results() {
  const router = useRouter();
  const params = useParams();
  const brand = params.brand as string;
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [marketData, setMarketData] = useState<MarketPriceData | null>(null);
  const [loadingMarketData, setLoadingMarketData] = useState(false);
  const [marketDataError, setMarketDataError] = useState<string | null>(null);

  // Load analysis result from localStorage
  useEffect(() => {
    const storedResult = localStorage.getItem('analysisResult');
    const storedImage = localStorage.getItem('capturedImage');

    if (!storedResult) {
      // No analysis data, redirect to home
      router.push('/app');
      return;
    }

    try {
      const result = JSON.parse(storedResult) as AnalysisResponse;
      setAnalysisData(result);
      setCapturedImage(storedImage);
    } catch (err) {
      console.error('Failed to parse analysis result:', err);
      router.push('/app');
    }
  }, [router]);

  // Fetch market prices asynchronously
  useEffect(() => {
    if (!analysisData) return;

    const fetchMarketPrices = async () => {
      setLoadingMarketData(true);
      setMarketDataError(null);

      try {
        const response = await fetch('/api/pricing/market', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            product_name: analysisData.product_name,
            brand: brand,
            era: analysisData.era,
            ai_estimate: analysisData.market_price.krw
          })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch market prices');
        }

        const data: MarketPriceData = await response.json();
        setMarketData(data);
      } catch (error) {
        console.error('Error fetching market prices:', error);
        setMarketDataError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setLoadingMarketData(false);
      }
    };

    fetchMarketPrices();
  }, [analysisData, brand]);

  // Show loading while data is being loaded
  if (!analysisData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white/50 mx-auto mb-4" />
          <div className="font-mono text-sm text-white/50">Loading results...</div>
        </div>
      </div>
    );
  }

  // Get status styling based on analysis result
  const getStatusStyle = () => {
    switch (analysisData.status) {
      case 'VINTAGE':
        return {
          color: 'text-green-400',
          bgColor: 'bg-green-400',
          borderColor: 'border-green-400',
          icon: CheckCircle2,
          label: 'VINTAGE AUTHENTIC'
        };
      case 'MODERN':
        return {
          color: 'text-blue-400',
          bgColor: 'bg-blue-400',
          borderColor: 'border-blue-400',
          icon: CheckCircle2,
          label: 'MODERN AUTHENTIC'
        };
      case 'FAKE':
        return {
          color: 'text-red-400',
          bgColor: 'bg-red-400',
          borderColor: 'border-red-400',
          icon: XCircle,
          label: 'COUNTERFEIT'
        };
      default:
        return {
          color: 'text-white',
          bgColor: 'bg-white',
          borderColor: 'border-white',
          icon: AlertTriangle,
          label: 'UNKNOWN'
        };
    }
  };

  const statusStyle = getStatusStyle();
  const StatusIcon = statusStyle.icon;

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-black/95 backdrop-blur-sm border-b border-white/10 z-10">
        <div className="px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push('/app')}
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
          <StatusIcon size={20} className={statusStyle.color} />
        </div>
      </div>

      {/* Verdict Stamp */}
      <div className="px-6 py-12 text-center relative">
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <div className="text-[200px] font-black transform -rotate-12">
            {analysisData.status === 'FAKE' ? '✗' : '✓'}
          </div>
        </div>
        <div className="relative">
          <div className={`inline-block border-8 ${statusStyle.borderColor} px-16 py-8 transform -rotate-2 hover:rotate-0 transition-transform duration-300`}>
            <div className={`text-7xl md:text-8xl font-black tracking-wider ${statusStyle.color}`}>
              {statusStyle.label}
            </div>
          </div>
          <div className={`mt-6 font-mono text-sm ${statusStyle.color} uppercase tracking-widest`}>
            Verification Complete
          </div>
        </div>
      </div>

      {/* AI Analysis Reason */}
      <div className="px-6 mb-8">
        <div className="bg-zinc-900 border border-white/10 p-6">
          <div className="font-mono text-xs text-white/50 uppercase tracking-wider mb-3">
            AI Analysis
          </div>
          <p className="text-white/90 leading-relaxed mb-4">
            {analysisData.reason}
          </p>
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="font-mono text-xs text-white/40">
              Confidence Level
            </div>
            <div className={`font-mono text-lg font-bold ${statusStyle.color}`}>
              {analysisData.confidence}%
            </div>
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
        <Timeline
          productName={analysisData.product_name}
          era={analysisData.era}
        />
      </div>

      {/* Divider */}
      <div className="border-t border-dashed border-white/20 my-8" />

      {/* Comparison View */}
      {capturedImage && (
        <>
          <div className="px-6 mb-12">
            <div className="mb-6">
              <h2 className="font-mono text-xs uppercase tracking-widest text-white/50 mb-2">
                Forensic Comparison
              </h2>
            </div>
            <ComparisonView
              userPhotoUrl={capturedImage}
              archivePhotoUrl={capturedImage}
            />
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-white/20 my-8" />
        </>
      )}

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

        {loadingMarketData ? (
          <PriceLoading />
        ) : (
          <PriceArbitrage
            krwPrice={analysisData.market_price.krw}
            usdPrice={analysisData.market_price.usd}
            marketData={marketData || undefined}
          />
        )}

        {marketDataError && (
          <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="font-mono text-xs text-yellow-400">
              시장 가격 조회 실패: {marketDataError}. AI 추정가를 사용합니다.
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-dashed border-white/20 my-8" />

      {/* Price Feedback */}
      <div className="px-6 mb-8">
        <PriceFeedback
          brand={brand}
          productName={analysisData.product_name}
          aiEstimatedKRW={analysisData.market_price.krw}
        />
      </div>

      {/* Bottom Metadata */}
      <div className="px-6 mt-12 pt-8 border-t border-white/10">
        <div className="font-mono text-xs text-white/30 space-y-1">
          <div>CONFIDENCE LEVEL: {analysisData.confidence}%</div>
          <div>PRODUCT: {analysisData.product_name}</div>
          <div>ERA: {analysisData.era}</div>
          <div>AUTHENTIC: {analysisData.is_authentic ? 'YES' : 'NO'}</div>
          <div>POWERED BY GEMINI AI™</div>
        </div>
      </div>
    </div>
  );
}

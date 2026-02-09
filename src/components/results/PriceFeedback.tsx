/**
 * Price feedback component
 * Allows users to provide feedback on price accuracy
 */

'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, DollarSign, Check } from 'lucide-react';

interface PriceFeedbackProps {
  brand: string;
  productName: string;
  aiEstimatedKRW: number;
}

export function PriceFeedback({ brand, productName, aiEstimatedKRW }: PriceFeedbackProps) {
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [showActualPrice, setShowActualPrice] = useState(false);
  const [actualPrice, setActualPrice] = useState('');
  const [marketplace, setMarketplace] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleQuickFeedback = async (type: 'accurate' | 'too_high' | 'too_low') => {
    setSubmitting(true);

    try {
      const response = await fetch('/api/feedback/price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand,
          product_name: productName,
          ai_estimated_krw: aiEstimatedKRW,
          feedback_type: type
        })
      });

      if (response.ok) {
        setFeedbackSubmitted(true);
        setTimeout(() => setFeedbackSubmitted(false), 3000);
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleActualPriceSubmit = async () => {
    const price = parseInt(actualPrice.replace(/,/g, ''));
    if (isNaN(price) || price <= 0) {
      alert('올바른 가격을 입력해주세요');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/feedback/price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand,
          product_name: productName,
          ai_estimated_krw: aiEstimatedKRW,
          actual_sold_krw: price,
          feedback_type: 'sold',
          marketplace: marketplace || 'unknown'
        })
      });

      if (response.ok) {
        setFeedbackSubmitted(true);
        setShowActualPrice(false);
        setActualPrice('');
        setMarketplace('');
        setTimeout(() => setFeedbackSubmitted(false), 3000);
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (feedbackSubmitted) {
    return (
      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
        <div className="flex items-center gap-2 text-green-400">
          <Check size={20} />
          <span className="font-mono text-sm">피드백 감사합니다! 더 나은 가격 추정에 활용하겠습니다.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-white/10 rounded-lg p-6">
      <div className="font-mono text-xs text-white/50 uppercase tracking-wider mb-4">
        가격 추정이 정확했나요?
      </div>

      {!showActualPrice ? (
        <div className="space-y-3">
          {/* Quick feedback buttons */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleQuickFeedback('accurate')}
              disabled={submitting}
              className="flex flex-col items-center gap-2 p-4 bg-green-500/10 border border-green-500/30 rounded-lg hover:bg-green-500/20 transition-colors disabled:opacity-50"
            >
              <ThumbsUp size={20} className="text-green-400" />
              <span className="font-mono text-xs text-green-400">정확해요</span>
            </button>

            <button
              onClick={() => handleQuickFeedback('too_high')}
              disabled={submitting}
              className="flex flex-col items-center gap-2 p-4 bg-red-500/10 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
            >
              <ThumbsDown size={20} className="text-red-400" />
              <span className="font-mono text-xs text-red-400">너무 높아요</span>
            </button>

            <button
              onClick={() => handleQuickFeedback('too_low')}
              disabled={submitting}
              className="flex flex-col items-center gap-2 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg hover:bg-blue-500/20 transition-colors disabled:opacity-50"
            >
              <ThumbsDown size={20} className="text-blue-400 rotate-180" />
              <span className="font-mono text-xs text-blue-400">너무 낮아요</span>
            </button>
          </div>

          {/* Actual price input button */}
          <button
            onClick={() => setShowActualPrice(true)}
            className="w-full flex items-center justify-center gap-2 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg hover:bg-purple-500/20 transition-colors"
          >
            <DollarSign size={16} className="text-purple-400" />
            <span className="font-mono text-sm text-purple-400">
              실제 판매가 입력하기
            </span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Actual price form */}
          <div>
            <label className="font-mono text-xs text-white/40 mb-2 block">
              실제 판매가 (₩)
            </label>
            <input
              type="text"
              value={actualPrice}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                setActualPrice(value ? parseInt(value).toLocaleString() : '');
              }}
              placeholder="예: 150,000"
              className="w-full px-4 py-2 bg-black border border-white/20 rounded font-mono text-white focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="font-mono text-xs text-white/40 mb-2 block">
              판매처 (선택)
            </label>
            <select
              value={marketplace}
              onChange={(e) => setMarketplace(e.target.value)}
              className="w-full px-4 py-2 bg-black border border-white/20 rounded font-mono text-white focus:border-purple-500 focus:outline-none"
            >
              <option value="">선택하세요</option>
              <option value="ebay">eBay</option>
              <option value="grailed">Grailed</option>
              <option value="당근마켓">당근마켓</option>
              <option value="번개장터">번개장터</option>
              <option value="중고나라">중고나라</option>
              <option value="오프라인">오프라인 매장</option>
              <option value="기타">기타</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleActualPriceSubmit}
              disabled={submitting || !actualPrice}
              className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded font-mono text-sm text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? '제출 중...' : '제출'}
            </button>
            <button
              onClick={() => {
                setShowActualPrice(false);
                setActualPrice('');
                setMarketplace('');
              }}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded font-mono text-sm text-white transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="font-mono text-[10px] text-white/30">
          여러분의 피드백으로 AI가 더 똑똑해집니다 🧠
        </p>
      </div>
    </div>
  );
}

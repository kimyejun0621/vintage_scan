'use client'

import { X, CreditCard, Smartphone, Lock, Check } from 'lucide-react';
import { useState } from 'react';

interface VintagePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VintagePaymentModal({ isOpen, onClose }: VintagePaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'kakaopay' | 'naverpay'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      alert('결제가 완료되었습니다! 🎉');
      onClose();
    }, 2000);
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-fadeIn">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-zinc-950 border-2 border-white/20 max-w-lg w-full max-h-[90vh] overflow-y-auto payment-modal">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors z-10"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="border-b border-white/10 p-8 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <Lock size={20} className="text-green-400" />
            <span className="text-xs uppercase tracking-widest text-white/50">
              Secure Payment
            </span>
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tight">
            Hunter Membership
          </h2>
          <p className="text-white/60 mt-2">
            Unlock unlimited scans and premium features
          </p>
        </div>

        {/* Order Summary */}
        <div className="p-8 border-b border-white/10 bg-white/5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white/70">Hunter Plan (월간)</span>
            <span className="text-2xl font-black">₩19,900</span>
          </div>
          <div className="space-y-2 text-sm text-white/50">
            <div className="flex items-center gap-2">
              <Check size={14} className="text-green-400" />
              <span>무제한 스캔</span>
            </div>
            <div className="flex items-center gap-2">
              <Check size={14} className="text-green-400" />
              <span>연도 식별 (예: 1993)</span>
            </div>
            <div className="flex items-center gap-2">
              <Check size={14} className="text-green-400" />
              <span>글로벌 가격 차익 데이터</span>
            </div>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="p-8 border-b border-white/10">
          <div className="text-sm uppercase tracking-widest text-white/50 mb-4">
            결제 수단
          </div>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setPaymentMethod('card')}
              className={`p-4 border-2 transition-all ${
                paymentMethod === 'card'
                  ? 'border-white bg-white/10'
                  : 'border-white/20 hover:border-white/40'
              }`}
            >
              <CreditCard size={24} className="mx-auto mb-2" />
              <div className="text-xs font-bold">카드</div>
            </button>
            <button
              onClick={() => setPaymentMethod('kakaopay')}
              className={`p-4 border-2 transition-all ${
                paymentMethod === 'kakaopay'
                  ? 'border-yellow-400 bg-yellow-400/10'
                  : 'border-white/20 hover:border-white/40'
              }`}
            >
              <div className="text-2xl mb-1">💬</div>
              <div className="text-xs font-bold">카카오페이</div>
            </button>
            <button
              onClick={() => setPaymentMethod('naverpay')}
              className={`p-4 border-2 transition-all ${
                paymentMethod === 'naverpay'
                  ? 'border-green-400 bg-green-400/10'
                  : 'border-white/20 hover:border-white/40'
              }`}
            >
              <div className="text-2xl mb-1">N</div>
              <div className="text-xs font-bold">네이버페이</div>
            </button>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="p-8">
          {paymentMethod === 'card' && (
            <div className="space-y-6">
              {/* Card Number */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-white/50 mb-3">
                  카드 번호
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => {
                    const formatted = formatCardNumber(e.target.value.replace(/\s/g, ''));
                    if (formatted.replace(/\s/g, '').length <= 16) {
                      setCardNumber(formatted);
                    }
                  }}
                  placeholder="1234 5678 9012 3456"
                  className="w-full bg-black/50 border-2 border-white/20 px-4 py-4 text-lg font-mono focus:border-white focus:outline-none transition-colors"
                  required
                />
              </div>

              {/* Expiry & CVC */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/50 mb-3">
                    유효기간
                  </label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => {
                      const formatted = formatExpiry(e.target.value);
                      if (formatted.replace(/\D/g, '').length <= 4) {
                        setExpiry(formatted);
                      }
                    }}
                    placeholder="MM/YY"
                    className="w-full bg-black/50 border-2 border-white/20 px-4 py-4 text-lg font-mono focus:border-white focus:outline-none transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/50 mb-3">
                    CVC
                  </label>
                  <input
                    type="text"
                    value={cvc}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 3) {
                        setCvc(value);
                      }
                    }}
                    placeholder="123"
                    className="w-full bg-black/50 border-2 border-white/20 px-4 py-4 text-lg font-mono focus:border-white focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'kakaopay' && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-white/70 mb-4">카카오페이 앱으로 이동합니다</p>
              <p className="text-sm text-white/50">
                결제 버튼을 누르면 카카오페이 결제창이 열립니다
              </p>
            </div>
          )}

          {paymentMethod === 'naverpay' && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4 font-black">N</div>
              <p className="text-white/70 mb-4">네이버페이로 간편결제</p>
              <p className="text-sm text-white/50">
                결제 버튼을 누르면 네이버페이 결제창이 열립니다
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full mt-8 py-5 bg-white text-black font-black text-lg uppercase tracking-wider hover:bg-white/90 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                처리 중...
              </span>
            ) : (
              `₩19,900 결제하기`
            )}
          </button>

          {/* Security Notice */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-white/40">
            <Lock size={12} />
            <span>SSL 보안 결제 • 14일 환불 보장</span>
          </div>
        </form>
      </div>
    </div>
  );
}

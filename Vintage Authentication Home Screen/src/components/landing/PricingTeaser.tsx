import { Check, Zap } from 'lucide-react';
import { useState } from 'react';
import { PaymentModal } from '../pricing/PaymentModal';

export function PricingTeaser() {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const plans = [
    {
      name: 'Starter',
      price: 'Free',
      period: '',
      features: [
        '10 scans per month',
        'Basic authentication',
        'Community support',
      ],
      highlighted: false,
    },
    {
      name: 'Sniper',
      price: '$9',
      period: '/month',
      features: [
        '100 scans per month',
        'Advanced AI analysis',
        'Price arbitrage data',
        'Priority support',
      ],
      highlighted: false,
    },
    {
      name: 'Hunter',
      price: '$29',
      period: '/month',
      features: [
        'Unlimited scans',
        'Full forensic reports',
        'Real-time market data',
        'API access',
        'White-label options',
      ],
      highlighted: true,
    },
  ];

  return (
    <>
      <section className="py-32 px-6 relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black" />
        
        <div className="relative max-w-7xl mx-auto">
          {/* Section Title */}
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-black mb-6">
              THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-green-500">GREED</span>
            </h2>
            <p className="text-xl text-white/60 font-mono">
              Choose your weapon. Start hunting profits.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-zinc-900 border-2 p-8 transition-all duration-300 hover:scale-105 ${
                  plan.highlighted
                    ? 'border-white glow-border'
                    : 'border-white/10 hover:border-white/30'
                }`}
              >
                {/* Best Value Badge */}
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="bg-white text-black px-6 py-2 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                      <Zap size={14} fill="currentColor" />
                      Most Popular
                    </div>
                  </div>
                )}

                {/* Plan Name */}
                <div className="mb-6">
                  <h3 className="text-2xl font-black uppercase tracking-wider mb-2">
                    {plan.name}
                  </h3>
                  <div className="h-1 w-16 bg-white" />
                </div>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black">{plan.price}</span>
                    {plan.period && (
                      <span className="text-xl text-white/50 font-mono">{plan.period}</span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-white/70 font-mono text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => {
                    if (plan.highlighted) {
                      setIsPaymentModalOpen(true);
                    }
                  }}
                  className={`w-full py-4 font-bold uppercase tracking-wider transition-all duration-300 ${
                    plan.highlighted
                      ? 'bg-white text-black hover:bg-white/90'
                      : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                  }`}
                >
                  {plan.highlighted ? 'Start Hunting' : 'Get Started'}
                </button>
              </div>
            ))}
          </div>

          {/* Bottom Note */}
          <div className="text-center mt-16">
            <p className="font-mono text-sm text-white/40">
              All plans include 14-day money-back guarantee • No credit card required for Starter
            </p>
          </div>
        </div>
      </section>

      {/* Payment Modal */}
      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
      />
    </>
  );
}
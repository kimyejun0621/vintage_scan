'use client'

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { StarterCard } from '@/components/pricing/StarterCard';
import { SniperCard } from '@/components/pricing/SniperCard';
import { HunterCard } from '@/components/pricing/HunterCard';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export default function Pricing() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<'credits' | 'hunter' | null>(null);
  const supabase = createClient();

  // Check if user is authenticated
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  /**
   * Handle Credits Purchase
   * Redirects to Lemon Squeezy checkout with user ID
   */
  const handleCreditsPurchase = () => {
    if (!user) {
      alert('Please sign in to purchase credits');
      router.push('/login');
      return;
    }

    setIsLoading('credits');

    // Get checkout URL from environment
    const baseUrl = process.env.NEXT_PUBLIC_LEMON_LINK_CREDITS;

    if (!baseUrl) {
      console.error('Missing NEXT_PUBLIC_LEMON_LINK_CREDITS environment variable');
      alert('Payment configuration error. Please contact support.');
      setIsLoading(null);
      return;
    }

    // Append user ID to checkout URL
    // This is CRUCIAL for webhook to identify who made the purchase
    const checkoutUrl = `${baseUrl}?checkout[custom][user_id]=${user.id}`;

    // Redirect to Lemon Squeezy checkout
    window.location.href = checkoutUrl;
  };

  /**
   * Handle Hunter Subscription Purchase
   * Redirects to Lemon Squeezy checkout with user ID
   */
  const handleHunterPurchase = () => {
    if (!user) {
      alert('Please sign in to subscribe');
      router.push('/login');
      return;
    }

    setIsLoading('hunter');

    // Get checkout URL from environment
    const baseUrl = process.env.NEXT_PUBLIC_LEMON_LINK_HUNTER;

    if (!baseUrl) {
      console.error('Missing NEXT_PUBLIC_LEMON_LINK_HUNTER environment variable');
      alert('Payment configuration error. Please contact support.');
      setIsLoading(null);
      return;
    }

    // Append user ID to checkout URL
    const checkoutUrl = `${baseUrl}?checkout[custom][user_id]=${user.id}`;

    // Redirect to Lemon Squeezy checkout
    window.location.href = checkoutUrl;
  };

  return (
    <div className="min-h-screen bg-black text-white px-6 py-12">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-12">
        <button
          onClick={() => router.push('/app')}
          className="text-white/60 hover:text-white transition-colors mb-8 flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          <span className="text-sm uppercase tracking-wider">Back</span>
        </button>

        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4">
            THE BLACK CARD
          </h1>
          <p className="text-lg text-white/60">
            Choose your access level
          </p>

          {/* User Status */}
          {user ? (
            <div className="mt-4 inline-block bg-green-500/10 border border-green-500/30 px-4 py-2 rounded">
              <span className="text-sm text-green-400 font-mono">
                ✓ Signed in as {user.email}
              </span>
            </div>
          ) : (
            <div className="mt-4 inline-block bg-yellow-500/10 border border-yellow-500/30 px-4 py-2 rounded">
              <span className="text-sm text-yellow-400 font-mono">
                ⚠ Sign in required to purchase
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
        {/* Starter - Free */}
        <StarterCard />

        {/* Sniper - 10 Credits */}
        <SniperCard
          onPurchase={handleCreditsPurchase}
          isLoading={isLoading === 'credits'}
        />

        {/* Hunter - Subscription */}
        <HunterCard
          onPurchase={handleHunterPurchase}
          isLoading={isLoading === 'hunter'}
        />
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto mt-12 pt-8 border-t border-white/10">
        <div className="flex justify-center gap-6 text-sm text-white/40">
          <button className="hover:text-white/60 transition-colors">
            Restore Purchase
          </button>
          <span>|</span>
          <button className="hover:text-white/60 transition-colors">
            Terms of Service
          </button>
        </div>

        {/* Payment Provider Info */}
        <div className="text-center mt-6 text-xs text-white/30">
          <p>Secure payment powered by Lemon Squeezy 🍋</p>
          <p className="mt-1">All transactions are encrypted and secure</p>
        </div>
      </div>
    </div>
  );
}

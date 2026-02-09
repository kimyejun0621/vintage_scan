'use client'

import { ArrowRight } from 'lucide-react';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';

interface VintageHeroSectionProps {
  onCTAClick: () => void;
}

export function VintageHeroSection({ onCTAClick }: VintageHeroSectionProps) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[120px] animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse-slow-delayed" />

      {/* Top Tagline */}
      <div className="mb-8 text-center">
        <div className="inline-block border border-white/20 px-6 py-2 backdrop-blur-sm">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-white/60">
            Trust No One. Verify Everything.
          </span>
        </div>
      </div>

      {/* Main Headline */}
      <div className="relative z-10 max-w-7xl mx-auto text-center mb-12">
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tight leading-none mb-6 kinetic-text">
          FAKE KILLS
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-red-500 to-white animate-gradient">
            VIBE.
          </span>
        </h1>

        <p className="text-lg md:text-2xl text-white/70 max-w-3xl mx-auto leading-relaxed">
          The world&apos;s first AI authenticator for{' '}
          <span className="text-red-500 font-bold">Supreme</span>,{' '}
          <span className="text-blue-400 font-bold">Levi&apos;s</span>, and{' '}
          <span className="font-bold">Stussy</span>.
        </p>
      </div>

      {/* 3D Phone Mockup with Scanning Effect */}
      <div className="relative z-10 mb-12 floating">
        <div className="relative">
          {/* Phone Container with Glow */}
          <div className="relative w-64 h-[500px] mx-auto">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-red-500/20 to-transparent blur-3xl" />

            {/* Phone Frame */}
            <div className="relative bg-zinc-900 border-4 border-white/10 rounded-[3rem] overflow-hidden shadow-2xl">
              <div className="w-full h-full p-4">
                {/* Screen Content */}
                <div className="w-full h-full bg-black rounded-3xl overflow-hidden relative">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1754909243915-0a2f6bda829b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXByZW1lJTIwYm94JTIwbG9nbyUyMHJlZCUyMGF1dGhlbnRpY3xlbnwxfHx8fDE3NzA1ODAwNTd8MA&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Supreme tag scan"
                    className="w-full h-full object-cover opacity-60"
                  />

                  {/* Scanning Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-48 h-48 border-4 border-red-500 rounded-lg relative scanning-frame">
                        <div className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-white" />
                        <div className="absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 border-white" />
                        <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 border-white" />
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-white" />

                        {/* Scan Line */}
                        <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-scan-vertical" />
                      </div>
                      <div className="mt-4 font-mono text-xs text-green-400 animate-pulse">
                        ANALYZING...
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={onCTAClick}
        className="group relative px-12 py-5 bg-white text-black font-bold text-lg uppercase tracking-wider hover:bg-white/90 transition-all duration-300 hover:scale-105 active:scale-95"
      >
        <span className="flex items-center gap-3">
          Start Verification
          <span className="blinking-cursor">|</span>
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </span>
      </button>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-white/50 rounded-full" />
        </div>
      </div>
    </section>
  );
}

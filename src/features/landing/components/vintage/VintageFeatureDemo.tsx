'use client'

import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { ArrowRight, X, CheckCircle2 } from 'lucide-react';

export function VintageFeatureDemo() {
  return (
    <section className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-7xl font-black mb-6">
            THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-blue-500">HOOK</span>
          </h2>
          <p className="text-xl text-white/60 font-mono">
            From trash to treasure in 3 seconds.
          </p>
        </div>

        {/* Split Screen Demo */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Before */}
          <div className="relative group">
            <div className="aspect-square bg-zinc-900 border-2 border-red-500/30 overflow-hidden relative">
              {/* Blurred, uncertain image */}
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1619471327033-3fb3b2b0d966?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwbGV2aXMlMjBqZWFucyUyMGxhYmVsJTIwY2xvc2UlMjB1cHxlbnwxfHx8fDE3NzA1Nzk2OTF8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Before scan"
                className="w-full h-full object-cover blur-md opacity-40 grayscale"
              />

              {/* Uncertainty overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <div className="text-center">
                  <X size={80} className="text-red-500 mx-auto mb-4 animate-pulse" />
                  <div className="text-3xl font-bold text-white mb-2">UNCERTAINTY</div>
                  <div className="font-mono text-sm text-white/50">Is it real? Is it fake?</div>
                </div>
              </div>
            </div>

            {/* Label */}
            <div className="mt-4 text-center">
              <div className="inline-block bg-red-500/10 border border-red-500/30 px-6 py-3">
                <span className="font-mono text-lg uppercase tracking-wider text-red-400">Before</span>
              </div>
            </div>
          </div>

          {/* After */}
          <div className="relative group">
            <div className="aspect-square bg-zinc-900 border-2 border-green-500/30 overflow-hidden relative">
              {/* Clear, scanned image with UI */}
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1619471327033-3fb3b2b0d966?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwbGV2aXMlMjBqZWFucyUyMGxhYmVsJTIwY2xvc2UlMjB1cHxlbnwxfHx8fDE3NzA1Nzk2OTF8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="After scan"
                className="w-full h-full object-cover opacity-50"
              />

              {/* Scan result overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <div className="text-center w-full px-8">
                  <CheckCircle2 size={80} className="text-green-400 mx-auto mb-4 animate-pulse" />

                  {/* Result Card */}
                  <div className="bg-zinc-900/90 border border-green-400/50 p-6 backdrop-blur-sm">
                    <div className="text-4xl font-black text-green-400 mb-4">AUTHENTIC</div>
                    <div className="space-y-2 font-mono text-sm">
                      <div className="flex justify-between text-white/70">
                        <span>YEAR:</span>
                        <span className="text-white font-bold">1993</span>
                      </div>
                      <div className="flex justify-between text-white/70">
                        <span>ORIGIN:</span>
                        <span className="text-white font-bold">Valencia</span>
                      </div>
                      <div className="flex justify-between text-white/70 border-t border-white/10 pt-2 mt-2">
                        <span>VALUE:</span>
                        <span className="text-green-400 font-bold text-xl">$250</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Label */}
            <div className="mt-4 text-center">
              <div className="inline-block bg-green-500/10 border border-green-500/30 px-6 py-3">
                <span className="font-mono text-lg uppercase tracking-wider text-green-400">After</span>
              </div>
            </div>
          </div>
        </div>

        {/* Arrow Indicator (Desktop Only) */}
        <div className="hidden md:flex justify-center my-12">
          <ArrowRight size={48} className="text-white/30 animate-pulse" />
        </div>
      </div>
    </section>
  );
}

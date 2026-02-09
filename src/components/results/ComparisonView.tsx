import { ImageWithFallback } from '../ui/ImageWithFallback';
import { ArrowRight } from 'lucide-react';

interface ComparisonViewProps {
  userPhotoUrl: string;
  archivePhotoUrl: string;
}

export function ComparisonView({ userPhotoUrl, archivePhotoUrl }: ComparisonViewProps) {
  return (
    <div className="bg-zinc-900 border border-white/10 p-6">
      <div className="grid grid-cols-2 gap-6">
        {/* User Photo */}
        <div>
          <div className="aspect-square bg-black border border-white/20 overflow-hidden relative group">
            <ImageWithFallback
              src={userPhotoUrl}
              alt="Your photo"
              className="w-full h-full object-cover"
            />
            {/* Scan Grid Overlay */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-full h-full">
                <defs>
                  <pattern id="comparison-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(34, 197, 94, 0.3)" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#comparison-grid)" />
              </svg>
            </div>
          </div>
          <div className="mt-3 font-mono text-xs text-center">
            <div className="text-white/70">YOUR PHOTO</div>
            <div className="text-white/40 mt-1">Captured: 2026-02-08</div>
          </div>
        </div>

        {/* Archive Photo */}
        <div>
          <div className="aspect-square bg-black border border-white/20 overflow-hidden relative group">
            <ImageWithFallback
              src={archivePhotoUrl}
              alt="Official archive"
              className="w-full h-full object-cover"
            />
            {/* Scan Grid Overlay */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-full h-full">
                <rect width="100%" height="100%" fill="url(#comparison-grid)" />
              </svg>
            </div>
            {/* Archive Stamp */}
            <div className="absolute top-2 right-2 bg-blue-500/90 px-2 py-1 text-[10px] font-mono font-bold text-white">
              ARCHIVE
            </div>
          </div>
          <div className="mt-3 font-mono text-xs text-center">
            <div className="text-white/70">ANALYZED IMAGE</div>
            <div className="text-white/40 mt-1">AI Recognition</div>
          </div>
        </div>
      </div>

      {/* Matching Indicator */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="flex items-center justify-center gap-3">
          <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
          <div className="font-mono text-sm text-green-400">
            MATCHING FONT WEIGHT DETECTED
          </div>
          <ArrowRight size={16} className="text-green-400" />
        </div>

        {/* Additional Match Points */}
        <div className="mt-4 grid grid-cols-3 gap-4 font-mono text-xs">
          <div className="text-center">
            <div className="text-green-400 font-bold">✓</div>
            <div className="text-white/50 mt-1">Stitching Pattern</div>
          </div>
          <div className="text-center">
            <div className="text-green-400 font-bold">✓</div>
            <div className="text-white/50 mt-1">Red Tab Position</div>
          </div>
          <div className="text-center">
            <div className="text-green-400 font-bold">✓</div>
            <div className="text-white/50 mt-1">Typography</div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { ScanningLine } from './ScanningLine';

interface SupremeOverlayProps {
  active: boolean;
}

export function SupremeOverlay({ active }: SupremeOverlayProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Horizontal Rectangular Bracket - Neon White */}
      <div className="relative w-96 h-48">
        {/* Main Frame - Neon White */}
        <div className="absolute inset-0 border-4 border-white shadow-2xl shadow-white/50">
          {/* Corner Brackets - Angular/Sharp Design */}
          <div className="absolute -top-1 -left-1 w-16 h-16">
            <div className="absolute top-0 left-0 w-16 h-1 bg-white" />
            <div className="absolute top-0 left-0 w-1 h-16 bg-white" />
            <div className="absolute top-0 left-14 w-2 h-6 bg-white transform -skew-x-12" />
            <div className="absolute top-14 left-0 w-6 h-2 bg-white transform -skew-y-12" />
          </div>

          <div className="absolute -top-1 -right-1 w-16 h-16">
            <div className="absolute top-0 right-0 w-16 h-1 bg-white" />
            <div className="absolute top-0 right-0 w-1 h-16 bg-white" />
            <div className="absolute top-0 right-14 w-2 h-6 bg-white transform skew-x-12" />
            <div className="absolute top-14 right-0 w-6 h-2 bg-white transform skew-y-12" />
          </div>

          <div className="absolute -bottom-1 -left-1 w-16 h-16">
            <div className="absolute bottom-0 left-0 w-16 h-1 bg-white" />
            <div className="absolute bottom-0 left-0 w-1 h-16 bg-white" />
            <div className="absolute bottom-0 left-14 w-2 h-6 bg-white transform skew-x-12" />
            <div className="absolute bottom-14 left-0 w-6 h-2 bg-white transform skew-y-12" />
          </div>

          <div className="absolute -bottom-1 -right-1 w-16 h-16">
            <div className="absolute bottom-0 right-0 w-16 h-1 bg-white" />
            <div className="absolute bottom-0 right-0 w-1 h-16 bg-white" />
            <div className="absolute bottom-0 right-14 w-2 h-6 bg-white transform -skew-x-12" />
            <div className="absolute bottom-14 right-0 w-6 h-2 bg-white transform -skew-y-12" />
          </div>

          {/* Ghost Image - Supreme Box Logo */}
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <svg width="320" height="100" viewBox="0 0 320 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Box Logo Rectangle */}
              <rect x="40" y="25" width="240" height="50" fill="#ef4444" fillOpacity="0.2" stroke="white" strokeWidth="2" />

              {/* SUPREME Text */}
              <text x="160" y="58" fontSize="24" fill="white" textAnchor="middle" fontWeight="900" letterSpacing="8">
                SUPREME
              </text>

              {/* Embroidery Detail Lines (Stitching grain) */}
              <g opacity="0.4">
                <line x1="50" y1="30" x2="50" y2="70" stroke="white" strokeWidth="0.5" />
                <line x1="60" y1="30" x2="60" y2="70" stroke="white" strokeWidth="0.5" />
                <line x1="70" y1="30" x2="70" y2="70" stroke="white" strokeWidth="0.5" />
                <line x1="250" y1="30" x2="250" y2="70" stroke="white" strokeWidth="0.5" />
                <line x1="260" y1="30" x2="260" y2="70" stroke="white" strokeWidth="0.5" />
                <line x1="270" y1="30" x2="270" y2="70" stroke="white" strokeWidth="0.5" />
              </g>

              {/* Focus Area - Embroidery Emphasis */}
              <circle cx="80" cy="50" r="15" stroke="white" strokeWidth="1" fill="none" className="animate-pulse" />
              <text x="80" y="90" fontSize="6" fill="white" textAnchor="middle" opacity="0.6">STITCHING</text>
            </svg>
          </div>

          {/* Scanning Line Animation */}
          <ScanningLine active={active} />

          {/* Tech Lines - Measurement Indicators */}
          <div className="absolute top-0 left-1/4 w-px h-full bg-white/20" />
          <div className="absolute top-0 right-1/4 w-px h-full bg-white/20" />
          <div className="absolute top-1/2 left-0 w-full h-px bg-white/20" />
        </div>

        {/* Target Instruction - Below Frame */}
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-80 text-center">
          <div className="bg-white/10 border border-white/50 px-4 py-2 backdrop-blur-sm">
            <div className="text-white font-mono text-xs uppercase tracking-wider font-bold">
              TARGET: EMBROIDERY
            </div>
            <div className="text-white/60 font-mono text-[10px] mt-1">
              Capture the grain of the stitching
            </div>
          </div>
        </div>

        {/* Range Finder Lines */}
        <div className="absolute top-1/2 -left-12 transform -translate-y-1/2">
          <div className="flex items-center gap-1">
            <div className="w-8 h-px bg-white" />
            <div className="w-2 h-px bg-white/50" />
            <div className="w-1 h-px bg-white/30" />
          </div>
        </div>
        <div className="absolute top-1/2 -right-12 transform -translate-y-1/2">
          <div className="flex items-center gap-1">
            <div className="w-1 h-px bg-white/30" />
            <div className="w-2 h-px bg-white/50" />
            <div className="w-8 h-px bg-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

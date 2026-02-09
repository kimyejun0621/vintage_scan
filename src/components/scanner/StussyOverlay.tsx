import { ScanningLine } from './ScanningLine';

interface StussyOverlayProps {
  active: boolean;
}

export function StussyOverlay({ active }: StussyOverlayProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Square Frame with Corner Markers */}
      <div className="relative w-72 h-72">
        {/* Main Frame - Subtle White */}
        <div className="absolute inset-0 border-2 border-white/60 shadow-2xl shadow-white/30">
          {/* Corner Markers - L-Shaped Brackets */}
          <div className="absolute -top-2 -left-2">
            <div className="w-16 h-0.5 bg-white" />
            <div className="w-0.5 h-16 bg-white" />
          </div>
          <div className="absolute -top-2 -right-2">
            <div className="w-16 h-0.5 bg-white ml-auto" />
            <div className="w-0.5 h-16 bg-white ml-auto" />
          </div>
          <div className="absolute -bottom-2 -left-2">
            <div className="w-0.5 h-16 bg-white" />
            <div className="w-16 h-0.5 bg-white" />
          </div>
          <div className="absolute -bottom-2 -right-2">
            <div className="w-0.5 h-16 bg-white ml-auto" />
            <div className="w-16 h-0.5 bg-white ml-auto" />
          </div>

          {/* Additional Corner Detail - Dots */}
          <div className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-white animate-pulse" />
          <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-white animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-white animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full bg-white animate-pulse" style={{ animationDelay: '1.5s' }} />

          {/* Ghost Image - Stussy Neck Tag */}
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Tag Background */}
              <rect x="50" y="40" width="100" height="120" fill="white" fillOpacity="0.1" stroke="white" strokeWidth="2" />

              {/* Tag Fold at Top */}
              <path d="M 50 40 L 100 30 L 150 40" stroke="white" strokeWidth="1.5" opacity="0.5" />

              {/* STUSSY Logo (Stylized) */}
              <text x="100" y="85" fontSize="20" fill="white" textAnchor="middle" fontWeight="bold" fontStyle="italic">
                Stüssy
              </text>

              {/* Font Detail Emphasis - Crosshair on typography */}
              <circle cx="85" cy="80" r="8" stroke="white" strokeWidth="1" fill="none" />
              <line x1="85" y1="72" x2="85" y2="88" stroke="white" strokeWidth="0.5" />
              <line x1="77" y1="80" x2="93" y2="80" stroke="white" strokeWidth="0.5" />

              {/* Additional Tag Text Lines */}
              <line x1="60" y1="100" x2="140" y2="100" stroke="white" strokeWidth="0.5" opacity="0.3" />
              <line x1="60" y1="110" x2="140" y2="110" stroke="white" strokeWidth="0.5" opacity="0.3" />
              <line x1="60" y1="120" x2="140" y2="120" stroke="white" strokeWidth="0.5" opacity="0.3" />

              {/* Size Label */}
              <text x="100" y="145" fontSize="12" fill="white" textAnchor="middle" opacity="0.4">
                SIZE: L
              </text>
            </svg>
          </div>

          {/* Scanning Line Animation */}
          <ScanningLine active={active} />

          {/* Grid Overlay - Square Pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none">
            <defs>
              <pattern id="stussy-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <rect width="30" height="30" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#stussy-grid)" />
          </svg>

          {/* Center Crosshair */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="relative w-8 h-8">
              <div className="absolute top-0 left-1/2 w-px h-full bg-white/40" />
              <div className="absolute left-0 top-1/2 w-full h-px bg-white/40" />
              <div className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/60" />
            </div>
          </div>
        </div>

        {/* Target Instruction - Below Frame */}
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-72 text-center">
          <div className="bg-white/10 border border-white/50 px-4 py-2 backdrop-blur-sm">
            <div className="text-white font-mono text-xs uppercase tracking-wider font-bold">
              TARGET: NECK TAG
            </div>
            <div className="text-white/60 font-mono text-[10px] mt-1">
              Capture the font details
            </div>
          </div>
        </div>

        {/* Distance Indicators */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8">
          <div className="text-white/40 font-mono text-[10px] tracking-wider">
            DISTANCE: 15-20cm
          </div>
        </div>

        {/* Alignment Guides */}
        <div className="absolute top-1/2 -left-16 transform -translate-y-1/2 text-white/30 font-mono text-[8px]">
          <div className="flex items-center gap-2">
            <div className="w-10 h-px bg-white/30" />
            <span>CENTER</span>
          </div>
        </div>
        <div className="absolute top-1/2 -right-16 transform -translate-y-1/2 text-white/30 font-mono text-[8px]">
          <div className="flex items-center gap-2">
            <span>LEVEL</span>
            <div className="w-10 h-px bg-white/30" />
          </div>
        </div>
      </div>
    </div>
  );
}

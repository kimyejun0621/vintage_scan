import { ScanningLine } from './ScanningLine';

interface LevisOverlayProps {
  active: boolean;
}

export function LevisOverlay({ active }: LevisOverlayProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Vertical Rectangular Outline - Neon Red */}
      <div className="relative w-48 h-80">
        {/* Main Frame - Neon Red */}
        <div className="absolute inset-0 border-4 border-red-500 shadow-2xl shadow-red-500/50">
          {/* Corner Brackets - Red */}
          <div className="absolute -top-1 -left-1 w-12 h-12 border-t-8 border-l-8 border-red-400" />
          <div className="absolute -top-1 -right-1 w-12 h-12 border-t-8 border-r-8 border-red-400" />
          <div className="absolute -bottom-1 -left-1 w-12 h-12 border-b-8 border-l-8 border-red-400" />
          <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b-8 border-r-8 border-red-400" />

          {/* Ghost Image - Faint sketch of Red Tab on Jeans Pocket */}
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <svg width="140" height="260" viewBox="0 0 140 260" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Back Pocket Outline */}
              <rect x="20" y="20" width="100" height="140" stroke="white" strokeWidth="2" strokeDasharray="4 4" />

              {/* Pocket Stitching */}
              <path d="M 30 30 Q 70 40 110 30" stroke="white" strokeWidth="1" opacity="0.5" />
              <path d="M 30 150 Q 70 140 110 150" stroke="white" strokeWidth="1" opacity="0.5" />

              {/* Red Tab - The Target */}
              <rect x="105" y="50" width="25" height="60" fill="#ef4444" fillOpacity="0.3" stroke="#ef4444" strokeWidth="2" />

              {/* LEVI'S Text on Tab */}
              <text x="117" y="75" fontSize="8" fill="white" textAnchor="middle" fontWeight="bold">L</text>
              <text x="117" y="83" fontSize="8" fill="white" textAnchor="middle" fontWeight="bold">E</text>
              <text x="117" y="91" fontSize="8" fill="white" textAnchor="middle" fontWeight="bold">V</text>
              <text x="117" y="99" fontSize="8" fill="white" textAnchor="middle" fontWeight="bold">I</text>

              {/* Emphasis on 'E' */}
              <circle cx="117" cy="83" r="12" stroke="#ef4444" strokeWidth="1.5" fill="none" className="animate-pulse" />
            </svg>
          </div>

          {/* Scanning Line Animation */}
          <ScanningLine active={active} />

          {/* Grid Overlay - Subtle */}
          <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none">
            <defs>
              <pattern id="levi-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ef4444" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#levi-grid)" />
          </svg>
        </div>

        {/* Target Instruction - Below Frame */}
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-64 text-center">
          <div className="bg-red-500/10 border border-red-500/50 px-4 py-2 backdrop-blur-sm">
            <div className="text-red-400 font-mono text-xs uppercase tracking-wider font-bold">
              TARGET: RED TAB
            </div>
            <div className="text-white/60 font-mono text-[10px] mt-1">
              Ensure the &apos;E&apos; is visible
            </div>
          </div>
        </div>

        {/* Crosshair Indicators */}
        <div className="absolute top-1/2 -left-8 w-6 h-0.5 bg-red-400" />
        <div className="absolute top-1/2 -right-8 w-6 h-0.5 bg-red-400" />
        <div className="absolute left-1/2 -top-8 w-0.5 h-6 bg-red-400" />
        <div className="absolute left-1/2 -bottom-8 w-0.5 h-6 bg-red-400" />
      </div>
    </div>
  );
}

import { useNavigate, useParams } from 'react-router';
import { X, Focus } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { ScanningLine } from '../components/ScanningLine';
import { ShutterButton } from '../components/ShutterButton';
import { useEffect, useState } from 'react';

export default function Scanner() {
  const navigate = useNavigate();
  const { brand } = useParams<{ brand: string }>();
  const [scanPhase, setScanPhase] = useState<'searching' | 'located' | 'processing'>('searching');

  const getScanInstructions = () => {
    switch (brand) {
      case 'levis':
        return scanPhase === 'searching' ? 'LOCATE 501XX TEXT' : 'SCAN RED TAB';
      case 'supreme':
        return 'LOCATE BOX LOGO';
      case 'stussy':
        return 'SCAN SIGNATURE';
      default:
        return 'ALIGN LABEL';
    }
  };

  const getStatusText = () => {
    switch (scanPhase) {
      case 'searching':
        return 'Searching for Batch Code...';
      case 'located':
        return 'Label Located - Hold Steady';
      case 'processing':
        return 'Analyzing Authentication Markers';
      default:
        return 'Initializing Scanner...';
    }
  };

  useEffect(() => {
    // Simulate scanning phases
    const timer1 = setTimeout(() => setScanPhase('located'), 2000);
    const timer2 = setTimeout(() => setScanPhase('processing'), 4000);
    const timer3 = setTimeout(() => {
      // Navigate to results after processing
      navigate(`/results/${brand}`);
    }, 6000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [brand, navigate]);

  return (
    <div className="h-screen relative bg-black overflow-hidden">
      {/* Camera Background */}
      <div className="absolute inset-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1763686745848-612259e8897d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZXZpcyUyMGRlbmltJTIwamVhbnMlMjBsYWJlbCUyMGNsb3NlJTIwdXB8ZW58MXx8fHwxNzcwNTc5NTc1fDA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Camera viewfinder"
          className="w-full h-full object-cover blur-sm opacity-40"
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60" />
        
        {/* Vignette Effect */}
        <div className="absolute inset-0 bg-radial-vignette" />
      </div>

      {/* HUD Content */}
      <div className="relative h-full flex flex-col">
        {/* Top Bar - Status */}
        <div className="px-6 py-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="text-white/90 hover:text-white transition-colors"
            >
              <X size={28} strokeWidth={2} />
            </button>
            
            <div className="flex items-center gap-2">
              <Focus size={16} className="text-green-400 animate-pulse" />
              <span className="text-green-400 text-sm uppercase tracking-wider font-mono">
                {getStatusText()}
              </span>
            </div>
          </div>
        </div>

        {/* Center - Scanning Frame */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="relative w-full max-w-md aspect-[4/3]">
            {/* Main Frame */}
            <div className="absolute inset-0 border-4 border-white shadow-2xl">
              {/* Corner Brackets */}
              <div className="absolute -top-1 -left-1 w-12 h-12 border-t-8 border-l-8 border-white" />
              <div className="absolute -top-1 -right-1 w-12 h-12 border-t-8 border-r-8 border-white" />
              <div className="absolute -bottom-1 -left-1 w-12 h-12 border-b-8 border-l-8 border-white" />
              <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b-8 border-r-8 border-white" />
              
              {/* Scanning Line Animation */}
              <ScanningLine active={scanPhase === 'searching' || scanPhase === 'located'} />
              
              {/* Guide Text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-white/60 text-2xl md:text-3xl font-bold tracking-[0.3em] font-mono">
                    {getScanInstructions()}
                  </div>
                  <div className="mt-4 text-white/40 text-sm uppercase tracking-wider">
                    {brand?.toUpperCase()} AUTHENTICATION
                  </div>
                </div>
              </div>

              {/* Grid Overlay */}
              <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            {/* Info Labels */}
            <div className="absolute -left-2 top-1/4 -translate-x-full pr-4">
              <div className="text-white/60 text-xs font-mono whitespace-nowrap">
                <div>FOCAL: 35mm</div>
                <div className="mt-1">ISO: 400</div>
              </div>
            </div>
            
            <div className="absolute -right-2 top-1/4 translate-x-full pl-4">
              <div className="text-white/60 text-xs font-mono whitespace-nowrap">
                <div>EXP: 1/125</div>
                <div className="mt-1">WB: AUTO</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom - Controls */}
        <div className="px-6 pb-12">
          <div className="flex items-center justify-center gap-12">
            <button className="text-white/60 hover:text-white transition-colors">
              <div className="text-xs uppercase tracking-wider font-mono">Gallery</div>
            </button>
            
            <ShutterButton 
              onClick={() => console.log('Capture')}
              processing={scanPhase === 'processing'}
            />
            
            <button className="text-white/60 hover:text-white transition-colors">
              <div className="text-xs uppercase tracking-wider font-mono">Flash</div>
            </button>
          </div>
        </div>
      </div>

      {/* Technical Overlay Effects */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-400/50 to-transparent animate-scan-horizontal" />
    </div>
  );
}
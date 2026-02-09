'use client'

import { useRouter, useParams } from 'next/navigation';
import { X, Focus, Camera as CameraIcon, Image } from 'lucide-react';
import { ShutterButton } from '@/components/scanner/ShutterButton';
import { LevisOverlay } from '@/components/scanner/LevisOverlay';
import { SupremeOverlay } from '@/components/scanner/SupremeOverlay';
import { StussyOverlay } from '@/components/scanner/StussyOverlay';
import { useEffect, useState, useRef } from 'react';
import { analyzeImage } from '@/lib/analyze';

export default function Scanner() {
  const router = useRouter();
  const params = useParams();
  const brand = params.brand as string;
  const [scanPhase, setScanPhase] = useState<'ready' | 'searching' | 'located' | 'processing' | 'analyzing'>('ready');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [useFileUpload, setUseFileUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gallery 버튼 클릭 핸들러
  const handleGalleryClick = () => {
    console.log('[Gallery] Button clicked');
    console.log('[Gallery] scanPhase:', scanPhase);
    console.log('[Gallery] fileInputRef.current:', fileInputRef.current);

    if (fileInputRef.current) {
      console.log('[Gallery] Triggering file input click');
      fileInputRef.current.click();
    } else {
      console.error('[Gallery] fileInputRef.current is null');
    }
  };

  const renderBrandOverlay = () => {
    const active = scanPhase === 'searching' || scanPhase === 'located';

    switch (brand) {
      case 'levis':
        return <LevisOverlay active={active} />;
      case 'supreme':
        return <SupremeOverlay active={active} />;
      case 'stussy':
        return <StussyOverlay active={active} />;
      default:
        return <LevisOverlay active={active} />;
    }
  };

  const getStatusText = () => {
    switch (scanPhase) {
      case 'ready':
        return 'Ready to Scan';
      case 'searching':
        return 'Searching for Batch Code...';
      case 'located':
        return 'Label Located - Hold Steady';
      case 'processing':
        return 'Processing Image...';
      case 'analyzing':
        return 'Analyzing with AI...';
      default:
        return 'Initializing Scanner...';
    }
  };

  // 카메라 시작
  useEffect(() => {
    if (useFileUpload) return;

    let mounted = true;

    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // 후면 카메라 선호
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        });

        if (mounted && videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setStream(mediaStream);
          setError(null);
        }
      } catch (err) {
        console.error('Camera access error:', err);
        if (mounted) {
          setError('카메라 접근 실패. 파일 업로드를 사용하세요.');
          setUseFileUpload(true);
        }
      }
    };

    startCamera();

    return () => {
      mounted = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [useFileUpload]);

  // 사진 촬영
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // 캔버스 크기를 비디오 크기에 맞춤
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // 비디오 프레임을 캔버스에 그림
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Base64로 변환
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(imageData);

    // 스캔 시뮬레이션 시작
    startScanSimulation(imageData);
  };

  // 파일 업로드
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const imageData = reader.result as string;
      setCapturedImage(imageData);
      startScanSimulation(imageData);
    };
    reader.readAsDataURL(file);
  };

  // 스캔 시뮬레이션 및 AI 분석
  const startScanSimulation = async (imageData: string) => {
    setScanPhase('searching');

    // 1초 후 located
    await new Promise(resolve => setTimeout(resolve, 1000));
    setScanPhase('located');

    // 1초 후 processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    setScanPhase('processing');

    // AI 분석 시작
    await new Promise(resolve => setTimeout(resolve, 500));
    setScanPhase('analyzing');

    try {
      // AI 분석 API 호출
      const result = await analyzeImage({
        imageUrl: imageData,
        brand: brand as 'levis' | 'supreme' | 'stussy'
      });

      console.log('Analysis result:', result);

      // 결과를 localStorage에 저장 (Results 페이지에서 사용)
      localStorage.setItem('analysisResult', JSON.stringify(result));
      localStorage.setItem('capturedImage', imageData);

      // 결과 페이지로 이동
      router.push(`/results/${brand}`);
    } catch (err) {
      console.error('Analysis failed:', err);
      setError('분석 실패. 다시 시도해주세요.');
      setScanPhase('ready');
      setCapturedImage(null);
    }
  };

  return (
    <div className="h-screen relative bg-black overflow-hidden">
      {/* Camera Background or Captured Image */}
      <div className="absolute inset-0">
        {!capturedImage ? (
          <>
            {/* Live Video Feed */}
            {!useFileUpload ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover blur-sm opacity-60"
              />
            ) : (
              <div
                className="w-full h-full bg-zinc-900 flex items-center justify-center cursor-pointer hover:bg-zinc-800 transition-colors group"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="text-center">
                  <div className="mb-6 relative">
                    <CameraIcon size={64} className="text-white/30 mx-auto" />
                    <div className="absolute -bottom-2 -right-2">
                      <Image size={32} className="text-blue-400 group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                  <p className="text-white/70 text-lg mb-2">카메라를 사용할 수 없습니다</p>
                  <p className="text-white/50 text-sm mb-6">갤러리에서 이미지를 선택해주세요</p>
                  <div className="inline-flex items-center gap-2 px-8 py-4 bg-blue-500/20 border-2 border-blue-500/50 text-blue-400 font-bold uppercase tracking-wider group-hover:bg-blue-500/30 group-hover:border-blue-400 transition-all">
                    <Image size={20} />
                    <span>갤러리에서 선택</span>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <img
            src={capturedImage}
            alt="Captured"
            className="w-full h-full object-cover blur-sm opacity-60"
          />
        )}

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60" />

        {/* Vignette Effect */}
        <div className="absolute inset-0 bg-radial-vignette" />
      </div>

      {/* Hidden Canvas for Capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        id="gallery-file-input"
        accept="image/*"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      {/* HUD Content */}
      <div className="relative h-full flex flex-col">
        {/* Top Bar - Status */}
        <div className="px-6 py-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                if (stream) {
                  stream.getTracks().forEach(track => track.stop());
                }
                router.push('/app');
              }}
              className="text-white/90 hover:text-white transition-colors"
              disabled={scanPhase === 'analyzing'}
            >
              <X size={28} strokeWidth={2} />
            </button>

            <div className="flex items-center gap-2">
              <Focus
                size={16}
                className={`${
                  scanPhase === 'ready' ? 'text-white/50' : 'text-green-400 animate-pulse'
                }`}
              />
              <span
                className={`text-sm uppercase tracking-wider font-mono ${
                  scanPhase === 'ready' ? 'text-white/50' : 'text-green-400'
                }`}
              >
                {getStatusText()}
              </span>
            </div>
          </div>
        </div>

        {/* Center - Brand-Specific Scanning Overlay */}
        <div className="flex-1 flex items-center justify-center px-6">
          {!capturedImage && renderBrandOverlay()}
        </div>

        {/* Error Message */}
        {error && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-6 py-3 rounded">
            {error}
          </div>
        )}

        {/* Bottom - Controls */}
        <div className="px-6 pb-12 relative z-50">
          <div className="flex items-center justify-center gap-8">
            {/* Gallery Button - Enhanced */}
            <div
              onClick={() => {
                console.log('[Gallery] Clicked, scanPhase:', scanPhase);
                if (scanPhase === 'ready' && fileInputRef.current) {
                  console.log('[Gallery] Opening file picker');
                  fileInputRef.current.click();
                } else {
                  console.log('[Gallery] Button disabled or ref not ready');
                }
              }}
              className={`flex flex-col items-center gap-2 transition-all duration-300 group ${
                scanPhase === 'ready'
                  ? 'text-white/70 hover:text-white cursor-pointer'
                  : 'text-white/30 opacity-30 cursor-not-allowed'
              }`}
            >
              <div className="w-14 h-14 rounded-full border-2 border-white/30 group-hover:border-white flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                <Image size={24} />
              </div>
              <div className="text-xs uppercase tracking-wider font-mono">Gallery</div>
            </div>

            {/* Shutter Button */}
            <ShutterButton
              onClick={!useFileUpload ? capturePhoto : () => fileInputRef.current?.click()}
              processing={scanPhase !== 'ready'}
            />

            {/* Flash Button (disabled) */}
            <button className="flex flex-col items-center gap-2 text-white/30 opacity-30 cursor-not-allowed">
              <div className="w-14 h-14 rounded-full border-2 border-white/20 flex items-center justify-center">
                <div className="text-2xl">⚡</div>
              </div>
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

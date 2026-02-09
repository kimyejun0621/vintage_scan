/**
 * Multi-angle image capture for better accuracy
 * Request 3 key angles: Front, Back, Tag/Label
 */

'use client';

import { useState } from 'react';
import { Camera, Check, X } from 'lucide-react';

interface CapturedImage {
  angle: 'front' | 'back' | 'tag';
  dataUrl: string;
  label: string;
}

interface MultiAngleCaptureProps {
  onComplete: (images: CapturedImage[]) => void;
  onCancel: () => void;
}

export function MultiAngleCapture({ onComplete, onCancel }: MultiAngleCaptureProps) {
  const [captures, setCaptures] = useState<CapturedImage[]>([]);
  const [currentAngle, setCurrentAngle] = useState<'front' | 'back' | 'tag'>('front');

  const angles = [
    { id: 'front' as const, label: '제품 전면', description: '제품 전체가 보이도록' },
    { id: 'back' as const, label: '제품 후면', description: '뒷면 디테일 확인' },
    { id: 'tag' as const, label: '택/라벨', description: '케어라벨, 택 클로즈업' }
  ];

  const handleCapture = (dataUrl: string) => {
    const currentAngleInfo = angles.find(a => a.id === currentAngle)!;

    setCaptures([...captures, {
      angle: currentAngle,
      dataUrl,
      label: currentAngleInfo.label
    }]);

    // Move to next angle
    const currentIndex = angles.findIndex(a => a.id === currentAngle);
    if (currentIndex < angles.length - 1) {
      setCurrentAngle(angles[currentIndex + 1].id);
    } else {
      // All angles captured
      onComplete([...captures, {
        angle: currentAngle,
        dataUrl,
        label: currentAngleInfo.label
      }]);
    }
  };

  const currentAngleInfo = angles.find(a => a.id === currentAngle)!;
  const progress = ((captures.length) / angles.length) * 100;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-sm text-white/70">
            {captures.length + 1} / {angles.length}
          </span>
          <span className="font-mono text-sm text-white/70">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Captured Images */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {angles.map((angle, index) => {
          const captured = captures.find(c => c.angle === angle.id);
          const isCurrent = angle.id === currentAngle && !captured;

          return (
            <div
              key={angle.id}
              className={`
                relative aspect-square rounded-lg border-2 overflow-hidden
                ${captured ? 'border-green-500' : isCurrent ? 'border-blue-500' : 'border-white/20'}
              `}
            >
              {captured ? (
                <>
                  <img
                    src={captured.dataUrl}
                    alt={angle.label}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                    <Check size={12} className="text-white" />
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-white/5">
                  <Camera size={20} className={isCurrent ? 'text-blue-500' : 'text-white/30'} />
                  <span className="font-mono text-xs text-white/50 mt-1">{index + 1}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Current Angle Instructions */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 mb-6">
        <div className="flex items-start gap-4">
          <Camera size={32} className="text-blue-400 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-mono text-lg text-blue-300 mb-2">
              📸 {currentAngleInfo.label}
            </h3>
            <p className="text-white/70 mb-4">
              {currentAngleInfo.description}
            </p>

            {/* Tips */}
            <div className="space-y-2 text-sm text-white/60">
              {currentAngle === 'front' && (
                <>
                  <div>✓ 제품 전체가 프레임 안에</div>
                  <div>✓ 밝은 조명, 그림자 없이</div>
                  <div>✓ 평평한 곳에 펼쳐서</div>
                </>
              )}
              {currentAngle === 'back' && (
                <>
                  <div>✓ 후면 로고/디자인 명확하게</div>
                  <div>✓ 스티칭 디테일 보이도록</div>
                </>
              )}
              {currentAngle === 'tag' && (
                <>
                  <div>✓ 케어라벨 글자가 선명하게</div>
                  <div>✓ 브랜드 택 클로즈업</div>
                  <div>✓ 생산 정보 읽을 수 있도록</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Camera Component */}
      <div className="mb-6">
        {/* 여기에 실제 카메라 컴포넌트 통합 */}
        <div className="aspect-[4/3] bg-white/5 rounded-lg flex items-center justify-center border-2 border-dashed border-white/20">
          <div className="text-center">
            <Camera size={48} className="text-white/30 mx-auto mb-2" />
            <p className="font-mono text-sm text-white/50">카메라 피드</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-mono text-sm transition-colors"
        >
          취소
        </button>
        <button
          onClick={() => {
            // Demo: auto-capture with dummy data
            handleCapture('data:image/png;base64,dummy');
          }}
          className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-mono text-sm transition-colors"
        >
          촬영
        </button>
      </div>

      {/* Skip option */}
      <button
        onClick={() => onComplete(captures)}
        className="w-full mt-3 py-2 text-sm font-mono text-white/50 hover:text-white/70 transition-colors"
      >
        {captures.length > 0 ? `${captures.length}장으로 분석하기` : '건너뛰기'}
      </button>
    </div>
  );
}

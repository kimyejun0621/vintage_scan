import { Camera } from 'lucide-react';

interface ShutterButtonProps {
  onClick: () => void;
  processing?: boolean;
}

export function ShutterButton({ onClick, processing = false }: ShutterButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={processing}
      className="relative group disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {/* Outer Ring */}
      <div className="w-20 h-20 rounded-full border-4 border-white bg-transparent transition-all duration-200 group-hover:scale-110 group-active:scale-95 flex items-center justify-center">
        {/* Inner Circle */}
        <div className={`w-14 h-14 rounded-full bg-black border-2 border-white transition-all duration-200 group-hover:bg-zinc-900 flex items-center justify-center ${
          processing ? 'animate-pulse' : ''
        }`}>
          <Camera size={24} className="text-white" strokeWidth={2} />
        </div>
      </div>

      {/* Mechanical Details */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-1 h-2 bg-white" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-1 h-2 bg-white" />
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 h-1 w-2 bg-white" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 h-1 w-2 bg-white" />
    </button>
  );
}

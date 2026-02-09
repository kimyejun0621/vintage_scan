import { ArrowRight } from 'lucide-react';

interface BrandCardProps {
  brand: string;
  textStyle: 'supreme' | 'levis' | 'stussy';
  background: 'supreme' | 'levis' | 'stussy';
  onClick: () => void;
}

export function BrandCard({ brand, textStyle, background, onClick }: BrandCardProps) {
  const getTextClasses = () => {
    switch (textStyle) {
      case 'supreme':
        return 'font-[900] tracking-[0.2em] text-white';
      case 'levis':
        return 'font-serif tracking-wider text-[#e8e4d9]';
      case 'stussy':
        return 'font-bold italic tracking-wide text-zinc-800';
      default:
        return '';
    }
  };

  const getBackgroundClasses = () => {
    switch (background) {
      case 'supreme':
        return 'bg-black supreme-bg';
      case 'levis':
        return 'bg-zinc-800 levis-bg';
      case 'stussy':
        return 'bg-zinc-300 stussy-bg';
      default:
        return '';
    }
  };

  const getArrowColor = () => {
    switch (background) {
      case 'supreme':
        return 'text-white';
      case 'levis':
        return 'text-[#e8e4d9]';
      case 'stussy':
        return 'text-zinc-800';
      default:
        return 'text-white';
    }
  };

  return (
    <button
      onClick={onClick}
      className={`flex-1 relative overflow-hidden transition-all duration-300 hover:flex-[1.1] group ${getBackgroundClasses()}`}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <h1 className={`text-5xl md:text-7xl lg:text-8xl ${getTextClasses()} transition-transform duration-300 group-hover:scale-105`}>
          {brand}
        </h1>
      </div>

      {/* Arrow Icon */}
      <div className={`absolute bottom-8 right-8 ${getArrowColor()} transition-transform duration-300 group-hover:translate-x-2`}>
        <ArrowRight size={32} strokeWidth={2.5} />
      </div>
    </button>
  );
}

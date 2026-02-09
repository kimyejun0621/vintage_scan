import { useNavigate } from 'react-router';
import { BrandCard } from '../components/BrandCard';
import { BottomNav } from '../components/BottomNav';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col bg-black">
      {/* Header */}
      <div className="px-6 py-4 border-b border-zinc-800">
        <h1 className="text-2xl font-black tracking-wider">VINTAGE SNIPER</h1>
      </div>

      {/* Brand Cards Container */}
      <div className="flex-1 flex flex-col">
        <BrandCard
          brand="SUPREME"
          textStyle="supreme"
          background="supreme"
          onClick={() => navigate('/scan/supreme')}
        />
        <BrandCard
          brand="LEVI'S"
          textStyle="levis"
          background="levis"
          onClick={() => navigate('/scan/levis')}
        />
        <BrandCard
          brand="STUSSY"
          textStyle="stussy"
          background="stussy"
          onClick={() => navigate('/scan/stussy')}
        />
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
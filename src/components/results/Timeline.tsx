import { MapPin } from 'lucide-react';

interface TimelineProps {
  productName: string;
  era: string;
}

export function Timeline({ productName, era }: TimelineProps) {
  // Extract year from era string (e.g., "90s Vintage" -> 1993, "2023 Modern" -> 2023)
  const extractYear = (eraStr: string): number => {
    // Try to find 4-digit year
    const yearMatch = eraStr.match(/(\d{4})/);
    if (yearMatch) return parseInt(yearMatch[1]);

    // Try to extract decade (e.g., "90s" -> 1995, "80s" -> 1985)
    const decadeMatch = eraStr.match(/(\d{2})s/);
    if (decadeMatch) {
      const decade = parseInt(decadeMatch[1]);
      return decade < 30 ? 2000 + decade + 5 : 1900 + decade + 5;
    }

    return 1995; // Default fallback
  };

  const productionYear = extractYear(era);

  // Generate timeline years around the production year
  const startYear = Math.floor((productionYear - 10) / 5) * 5;
  const years = Array.from({ length: 7 }, (_, i) => {
    const year = startYear + i * 5;
    return {
      year,
      active: Math.abs(year - productionYear) <= 2,
      label: Math.abs(year - productionYear) <= 2 ? 'Production Era' : undefined
    };
  });

  return (
    <div className="bg-zinc-900 border border-white/10 p-6">
      {/* Timeline Line */}
      <div className="relative">
        {/* Horizontal Line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/20" />

        {/* Active Segment Highlight */}
        <div className="absolute top-1/2 left-[42%] right-[42%] h-1 bg-green-400" />

        {/* Year Markers */}
        <div className="relative flex justify-between items-center">
          {years.map((item) => (
            <div
              key={item.year}
              className={`flex flex-col items-center ${
                item.active ? 'z-10' : ''
              }`}
            >
              {/* Dot */}
              <div
                className={`w-4 h-4 rounded-full border-2 transition-all ${
                  item.active
                    ? 'bg-green-400 border-green-400 scale-150 shadow-lg shadow-green-400/50'
                    : 'bg-zinc-900 border-white/30'
                }`}
              />

              {/* Year Label */}
              <div
                className={`mt-3 font-mono text-xs ${
                  item.active ? 'text-white font-bold' : 'text-white/40'
                }`}
              >
                {item.year}
              </div>

              {/* Active Year Info */}
              {item.active && item.label && (
                <div className="mt-4 text-center">
                  <div className="inline-block bg-green-400/10 border border-green-400/30 px-4 py-2 rounded">
                    <div className="font-mono text-xs text-green-400 uppercase tracking-wider">
                      {item.label}
                    </div>
                    <div className="font-mono text-xs text-white/70 mt-1 flex items-center gap-1 justify-center">
                      <MapPin size={10} />
                      {productName}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-8 pt-6 border-t border-white/10">
        <div className="grid grid-cols-2 gap-4 font-mono text-xs">
          <div>
            <div className="text-white/40 mb-1">ERA</div>
            <div className="text-white">{era}</div>
          </div>
          <div>
            <div className="text-white/40 mb-1">PRODUCT</div>
            <div className="text-white">{productName}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { MapPin } from 'lucide-react';

export function Timeline() {
  const years = [
    { year: 1985, active: false },
    { year: 1988, active: false },
    { year: 1991, active: false },
    { year: 1993, active: true, label: 'Production Era' },
    { year: 1996, active: false },
    { year: 1999, active: false },
    { year: 2002, active: false },
  ];

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
              {item.active && (
                <div className="mt-4 text-center">
                  <div className="inline-block bg-green-400/10 border border-green-400/30 px-4 py-2 rounded">
                    <div className="font-mono text-xs text-green-400 uppercase tracking-wider">
                      {item.label}
                    </div>
                    <div className="font-mono text-xs text-white/70 mt-1 flex items-center gap-1 justify-center">
                      <MapPin size={10} />
                      Valencia Factory
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
        <div className="grid grid-cols-3 gap-4 font-mono text-xs">
          <div>
            <div className="text-white/40 mb-1">ERA</div>
            <div className="text-white">Early 90s</div>
          </div>
          <div>
            <div className="text-white/40 mb-1">BATCH</div>
            <div className="text-white">501XX-0193</div>
          </div>
          <div>
            <div className="text-white/40 mb-1">ORIGIN</div>
            <div className="text-white">Spain</div>
          </div>
        </div>
      </div>
    </div>
  );
}

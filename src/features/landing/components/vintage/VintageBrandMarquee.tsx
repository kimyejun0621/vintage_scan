'use client'

export function VintageBrandMarquee() {
  const brands = [
    { name: "LEVI'S 501XX", texture: 'denim' },
    { name: "STUSSY TRIBE", texture: 'concrete' },
    { name: "SUPREME NYC", texture: 'glossy' },
  ];

  // Duplicate for seamless loop
  const displayBrands = [...brands, ...brands, ...brands, ...brands];

  return (
    <section className="py-12 border-y border-white/10 overflow-hidden bg-zinc-950">
      <div className="marquee-container">
        <div className="marquee-content">
          {displayBrands.map((brand, index) => (
            <div
              key={index}
              className={`inline-flex items-center justify-center px-16 py-8 mx-4 border-2 border-white/20 ${
                brand.texture === 'denim'
                  ? 'denim-texture'
                  : brand.texture === 'concrete'
                  ? 'concrete-texture'
                  : 'glossy-texture'
              }`}
            >
              <span className="text-3xl md:text-4xl font-black tracking-wider whitespace-nowrap">
                {brand.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Subtitle */}
      <div className="text-center mt-8">
        <p className="font-mono text-sm text-white/40 uppercase tracking-widest">
          The Big Three — Verified in Seconds
        </p>
      </div>
    </section>
  );
}

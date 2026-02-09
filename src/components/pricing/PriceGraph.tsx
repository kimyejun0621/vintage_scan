interface PriceGraphProps {
  locked: boolean;
}

export function PriceGraph({ locked }: PriceGraphProps) {
  // Sample data points for the graph
  const dataPoints = [
    { x: 0, y: 30 },
    { x: 20, y: 45 },
    { x: 40, y: 40 },
    { x: 60, y: 55 },
    { x: 80, y: 65 },
    { x: 100, y: 75 },
  ];

  // Convert data points to SVG path
  const createPath = () => {
    const height = 100;
    const points = dataPoints.map((point) => ({
      x: point.x,
      y: height - point.y,
    }));

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prevPoint = points[i - 1];
      const currentPoint = points[i];
      const cpx = (prevPoint.x + currentPoint.x) / 2;
      path += ` Q ${cpx} ${prevPoint.y}, ${currentPoint.x} ${currentPoint.y}`;
    }
    return path;
  };

  return (
    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      {/* Grid Lines */}
      {!locked && (
        <g className="opacity-20">
          <line x1="0" y1="25" x2="100" y2="25" stroke="white" strokeWidth="0.5" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="white" strokeWidth="0.5" />
          <line x1="0" y1="75" x2="100" y2="75" stroke="white" strokeWidth="0.5" />
        </g>
      )}

      {/* Area Fill */}
      <defs>
        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop
            offset="0%"
            stopColor={locked ? '#71717a' : '#22c55e'}
            stopOpacity="0.3"
          />
          <stop
            offset="100%"
            stopColor={locked ? '#71717a' : '#22c55e'}
            stopOpacity="0"
          />
        </linearGradient>
      </defs>

      <path
        d={`${createPath()} L 100 100 L 0 100 Z`}
        fill="url(#areaGradient)"
      />

      {/* Main Line */}
      <path
        d={createPath()}
        fill="none"
        stroke={locked ? '#71717a' : '#22c55e'}
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Data Points */}
      {!locked &&
        dataPoints.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={100 - point.y}
            r="2"
            fill="white"
            className="animate-pulse"
            style={{ animationDelay: `${index * 0.1}s` }}
          />
        ))}
    </svg>
  );
}

interface ScanningLineProps {
  active: boolean;
}

export function ScanningLine({ active }: ScanningLineProps) {
  if (!active) return null;

  return (
    <>
      {/* Main Scanning Line */}
      <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-scan-vertical shadow-lg shadow-green-400/50" />

      {/* Secondary Subtle Line */}
      <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent animate-scan-vertical-delayed" />
    </>
  );
}

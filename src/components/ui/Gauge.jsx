export default function Gauge({
  value = 85, max = 100, size = 240, stroke = 14,
  start = -110, end = 110,      // degrees
  trackColor = 'rgba(255,255,255,.15)',
  valueColor = '#22c55e'        // emerald-ish
}) {
  const radius = (size / 2) - (stroke / 2) - 2;
  const cx = size / 2;
  const cy = size / 2;

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const pct = clamp(value / max, 0, 1);

  // degrees → radians
  const rad = (d) => (Math.PI / 180) * d;

  // describe arc
  const arcPath = (fromDeg, toDeg, r) => {
    const sx = cx + r * Math.cos(rad(fromDeg));
    const sy = cy + r * Math.sin(rad(fromDeg));
    const ex = cx + r * Math.cos(rad(toDeg));
    const ey = cy + r * Math.sin(rad(toDeg));
    const largeArc = Math.abs(toDeg - fromDeg) > 180 ? 1 : 0;
    const sweep = 1;
    return `M ${sx} ${sy} A ${r} ${r} 0 ${largeArc} ${sweep} ${ex} ${ey}`;
  };

  const track = arcPath(start, end, radius);
  const valueDeg = start + (end - start) * pct;
  const valueArc = arcPath(start, valueDeg, radius);

  return (
    <div className="gauge-wrap">
      <svg width={size} height={size * 0.58} viewBox={`0 0 ${size} ${size * 0.58}`}>
        {/* Track */}
        <path d={track} stroke={trackColor} strokeWidth={stroke} fill="none" strokeLinecap="round" />
        {/* Value */}
        <path d={valueArc} stroke={valueColor} strokeWidth={stroke} fill="none" strokeLinecap="round" />
      </svg>

      {/* Center label */}
      <div className="gauge-label">
        <div className="inline-score">
          <span className="gauge-num">{Math.round(value)}</span>
          <span className="gauge-denom">&nbsp;/&nbsp;{max}</span>
        </div>
      </div>
    </div>
  );
}

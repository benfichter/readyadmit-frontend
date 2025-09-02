export default function Gauge({ value = 0 }) {
const v = Math.max(0, Math.min(100, Number(value)))
const angle = (v / 100) * 180
const color = v >= 90 ? '#16a34a' : v >= 75 ? '#22c55e' : v >= 50 ? '#f59e0b' : '#dc2626'
return (
<div className="bg-white rounded-2xl border p-4">
<div className="text-sm text-gray-600 mb-2">Raw Essay Score</div>
<div className="relative w-full" style={{height:120}}>
<svg viewBox="0 0 200 120" className="w-full h-full">
<path d="M10 110 A 90 90 0 0 1 190 110" fill="none" stroke="#e5e7eb" strokeWidth="16"/>
<path d={`M10 110 A 90 90 0 ${angle>90?1:0} 1 ${10 + 180*(v/100)} 110`} fill="none" stroke={color} strokeWidth="16" strokeLinecap="round"/>
<text x="100" y="100" textAnchor="middle" fontSize="28" fill="#111827">{v}</text>
<text x="100" y="115" textAnchor="middle" fontSize="10" fill="#6b7280">/ 100</text>
</svg>
</div>
</div>
)
}
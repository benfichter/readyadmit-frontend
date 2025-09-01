export default function NiceSelect({ value, onChange, options = [] }) {
return (
<select
value={value}
onChange={(e) => onChange?.(e.target.value)}
className="border rounded-lg px-3 py-2 text-sm bg-white"
>
{options.map((o) => (
<option key={o.value} value={o.value}>{o.label}</option>
))}
</select>
);
}
import { NavLink, useLocation } from 'react-router-dom'


const item = ({ isActive }) => `flex items-center justify-between px-3 py-2 rounded-xl text-sm ${isActive ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100 text-gray-700'}`


export default function SideNav(){
const loc = useLocation()
const active = {
'/': 'Overview', '/essays': 'Essays', '/extracurriculars': 'Extracurriculars', '/applications': 'Applications'
}[loc.pathname]


const nav = [
{ to: '/', label: 'Overview' },
{ to: '/essays', label: 'Essays' },
{ to: '/extracurriculars', label: 'Extracurriculars' },
{ to: '/applications', label: 'Applications' },
{ to: '/upgrade', label: 'Upgrade', divider: true },
]


return (
<aside className="w-60 shrink-0">
<div className="bg-white rounded-2xl border p-2 sticky top-16">
{nav.map(n => (
<NavLink key={n.to} to={n.to} end className={item}>
<span>{n.label}</span>
{active === n.label && <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-600 text-white">Active</span>}
</NavLink>
))}
</div>
</aside>
)
}
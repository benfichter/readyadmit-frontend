import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'


export default function Header(){
const { user, setUser } = useAuth()
function signOut(){ localStorage.removeItem('token'); setUser(null) }
return (
<header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
<div className="max-w-7xl mx-auto h-14 px-4 flex items-center justify-between">
<div className="flex items-center gap-3">
<div className="w-3 h-3 rounded bg-blue-600"/>
<NavLink to="/" className="font-semibold">ReadyAdmit</NavLink>
<input className="ml-4 w-72 border rounded-xl px-3 py-1.5 text-sm bg-gray-50" placeholder="Search..."/>
</div>
<div className="flex items-center gap-3 text-sm">
<NavLink to="/" className="px-3 py-1.5 rounded-xl border">Overview</NavLink>
{user && <button onClick={signOut} className="px-3 py-1.5 rounded-xl border">Sign Out</button>}
{!user && <Link to="/signin" className="px-3 py-1.5 rounded-xl bg-blue-600 text-white">Sign In</Link>}
</div>
</div>
</header>
)
}
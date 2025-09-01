import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


const link = ({ isActive }) =>
`px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-200'}`;


export default function AppLayout() {
const nav = useNavigate();
const { user, setUser } = useAuth();


function signOut() {
localStorage.removeItem('token');
setUser(null);
nav('/signin');
}


return (
<div className="min-h-screen">
<header className="sticky top-0 z-10 bg-white border-b">
<div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
<div className="flex items-center gap-4">
<span className="text-xl font-semibold">ReadyAdmit</span>
<nav className="flex gap-2">
<NavLink to="/" end className={link}>Dashboard</NavLink>
<NavLink to="/applications" className={link}>Applications</NavLink>
<NavLink to="/essays" className={link}>Essays</NavLink>
</nav>
</div>
<div className="flex items-center gap-3">
<span className="text-sm text-gray-600">{user?.name || user?.email}</span>
<button onClick={signOut} className="px-3 py-1.5 rounded-md bg-gray-900 text-white text-sm">Sign out</button>
</div>
</div>
</header>


<main className="max-w-6xl mx-auto px-4 py-6">
<Outlet />
</main>
</div>
);
}
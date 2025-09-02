import Header from './Header'
import SideNav from './SideNav'
import { Outlet } from 'react-router-dom'


export default function AppLayout(){
return (
<div className="min-h-screen bg-gray-50">
<Header />
<div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
<SideNav />
<main className="flex-1 space-y-6"><Outlet/></main>
</div>
</div>
)
}
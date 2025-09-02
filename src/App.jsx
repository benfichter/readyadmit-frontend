import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import AppLayout from './components/AppLayout'
import SignIn from './pages/SignIn'
import Dashboard from './pages/Dashboard'
import EssaysPage from './pages/EssaysPage'
import Extracurriculars from './pages/Extracurriculars'
import ApplicationsPage from './pages/ApplicationsPage'


function Private({ children }){
const { user, loading } = useAuth()
if (loading) return <div className="p-6 text-sm text-gray-500">Loading…</div>
return user ? children : <Navigate to="/signin" replace />
}


export default function App(){
return (
<AuthProvider>
<Routes>
<Route path="/signin" element={<SignIn/>} />
<Route path="/" element={<Private><AppLayout/></Private>}>
<Route index element={<Dashboard/>} />
<Route path="essays" element={<EssaysPage/>} />
<Route path="extracurriculars" element={<Extracurriculars/>} />
<Route path="applications" element={<ApplicationsPage/>} />
</Route>
<Route path="*" element={<Navigate to="/" replace/>} />
</Routes>
</AuthProvider>
)
}
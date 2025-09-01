import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/AppLayout';
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import ApplicationsPage from './pages/ApplicationsPage';
import ApplicationWorkspace from './pages/ApplicationWorkspace';
import EssaysPage from './pages/EssaysPage';


function PrivateRoute({ children }) {
const { user } = useAuth();
return user ? children : <Navigate to="/signin" replace />;
}


export default function App() {
return (
<AuthProvider>
<Routes>
<Route path="/signin" element={<SignIn />} />


<Route
path="/"
element={
<PrivateRoute>
<AppLayout />
</PrivateRoute>
}
>
<Route index element={<Dashboard />} />
<Route path="applications" element={<ApplicationsPage />} />
<Route path="applications/:appId" element={<ApplicationWorkspace />} />
<Route path="essays" element={<EssaysPage />} />
</Route>


<Route path="*" element={<Navigate to="/" replace />} />
</Routes>
</AuthProvider>
);
}
import { createContext, useContext, useEffect, useState } from 'react'
import { auth } from '../lib/api'


const Ctx = createContext(null)
export const useAuth = () => useContext(Ctx)


export function AuthProvider({ children }){
const [user, setUser] = useState(null)
const [loading, setLoading] = useState(true)


useEffect(() => {
const t = localStorage.getItem('token')
if (!t) { setLoading(false); return }
auth.me().then(setUser).finally(() => setLoading(false))
}, [])


return <Ctx.Provider value={{ user, setUser, loading }}>{children}</Ctx.Provider>
}
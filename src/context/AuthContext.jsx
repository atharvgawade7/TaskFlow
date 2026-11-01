
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Restore an existing login session
        supabase.auth.getSession().then(({ data, error }) => {
            if (error) console.error('Session error:', error)

            setUser(data?.session?.user ?? null)
            setLoading(false)
        })

        // Listen for login, logout and session changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    const signUp = async (email, password) => {
        return await supabase.auth.signUp({ email, password })
    }

    const signIn = async (email, password) => {
        return await supabase.auth.signInWithPassword({ email, password })
    }

    const signOut = async () => {
        return await supabase.auth.signOut()
    }

    return (
        <AuthContext.Provider
            value={{ user, loading, signUp, signIn, signOut }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}

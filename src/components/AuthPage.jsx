
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import './AuthPage.css'

export default function AuthPage() {
    const { signIn, signUp } = useAuth()

    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setMessage('')
        setLoading(true)

        try {
            const { error } = isLogin
                ? await signIn(email.trim(), password)
                : await signUp(email.trim(), password)

            if (error) throw error

            if (!isLogin) {
                setMessage('Account created! You can now sign in.')
                setIsLogin(true)
                setPassword('')
            }
        } catch (err) {
            setError(err.message || 'Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-glow auth-glow-one" />
            <div className="auth-glow auth-glow-two" />

            <div className="auth-card">
                <div className="auth-brand">
                    <div className="auth-logo">T</div>
                    <div>
                        <h1>TaskFlow</h1>
                        <span>PLAN. TRACK. GROW.</span>
                    </div>
                </div>

                <div className="auth-heading">
                    <h2>{isLogin ? 'Welcome back' : 'Create your account'}</h2>
                    <p>
                        {isLogin
                            ? 'Sign in to continue your journey.'
                            : 'Start building a more organized day.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <label htmlFor="auth-email">Email address</label>
                    <input
                        id="auth-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        required
                    />

                    <label htmlFor="auth-password">Password</label>
                    <input
                        id="auth-password"
                        type="password"
                        placeholder="At least 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete={isLogin ? 'current-password' : 'new-password'}
                        minLength={6}
                        required
                    />

                    {error && <p className="auth-error">{error}</p>}
                    {message && <p className="auth-success">{message}</p>}

                    <button type="submit" disabled={loading}>
                        {loading
                            ? 'Please wait...'
                            : isLogin
                                ? 'Sign in'
                                : 'Create account'}
                    </button>
                </form>

                <div className="auth-switch">
                    {isLogin ? "Don't have an account?" : 'Already have an account?'}
                    <button
                        type="button"
                        onClick={() => {
                            setIsLogin(!isLogin)
                            setError('')
                            setMessage('')
                        }}
                    >
                        {isLogin ? 'Sign up' : 'Sign in'}
                    </button>
                </div>

                <p className="auth-footer">
                    Your routines. Your progress. Your space.
                </p>
            </div>
        </div>
    )
}

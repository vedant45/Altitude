'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../../lib/firebase'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      const snap = await getDoc(doc(db, 'users', cred.user.uid))
      const role = snap.data()?.role
      if (role === 'admin') router.push('/admin')
      else router.push('/dashboard')
    } catch (e) {
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080a0f', fontFamily: 'Georgia, serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 400, padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ color: '#c9a84c', fontSize: '1.5rem', marginBottom: 8 }}>The Altitude</div>
          <div style={{ fontSize: '0.55rem', letterSpacing: '0.3em', textTransform: 'uppercase' as const, color: '#8a6f32' }}>Staff Access</div>
        </div>
        <div style={{ background: '#111827', border: '1px solid rgba(201,168,76,0.15)', padding: 32 }}>
          <label style={{ display: 'block', fontSize: '0.6rem', letterSpacing: '0.25em', textTransform: 'uppercase' as const, color: '#8a6f32', marginBottom: 8 }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@thealtitude.com"
            style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,168,76,0.2)', color: '#f5f0e8', padding: '12px 16px', outline: 'none', fontFamily: 'Georgia, serif', fontSize: '0.85rem', marginBottom: 20, boxSizing: 'border-box' as const }}
          />
          <label style={{ display: 'block', fontSize: '0.6rem', letterSpacing: '0.25em', textTransform: 'uppercase' as const, color: '#8a6f32', marginBottom: 8 }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="••••••••"
            style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,168,76,0.2)', color: '#f5f0e8', padding: '12px 16px', outline: 'none', fontFamily: 'Georgia, serif', fontSize: '0.85rem', marginBottom: 24, boxSizing: 'border-box' as const }}
          />
          {error && <div style={{ fontSize: '0.65rem', color: '#c0392b', marginBottom: 16 }}>{error}</div>}
          <button
            onClick={handleLogin}
            style={{ width: '100%', background: 'linear-gradient(135deg, #8a6f32, #c9a84c)', color: '#080a0f', border: 'none', padding: '14px', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase' as const, cursor: 'pointer' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  )
}
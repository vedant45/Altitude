'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Welcome() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [time, setTime] = useState('')

  useEffect(() => {
    setMounted(true)
    const tick = () => setTime(new Date().toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' }))
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [])

  if (!mounted) return null

  return (
    <main style={{ minHeight: '100vh', background: '#080a0f', fontFamily: 'Georgia, serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .order-btn:hover { background: rgba(201,168,76,0.14) !important; transform: translateY(-3px) !important; box-shadow: 0 12px 40px rgba(201,168,76,0.12) !important; }
        .order-btn { transition: all 0.3s ease !important; }
        .staff-link:hover { color: rgba(201,168,76,0.5) !important; }
      `}</style>

      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 45% at 50% 0%, rgba(201,168,76,0.07) 0%, transparent 70%)' }} />

      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 560, padding: '0 24px', width: '100%' }}>

        <div style={{ animation: 'fadeUp 0.6s ease both' }}>
          <div style={{ width: 68, height: 68, border: '1px solid rgba(201,168,76,0.35)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', background: 'rgba(201,168,76,0.05)', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: -7, border: '1px solid rgba(201,168,76,0.1)', borderRadius: '50%' }} />
            <span style={{ fontSize: '1.6rem', color: '#c9a84c' }}>✦</span>
          </div>
        </div>

        <div style={{ fontSize: '0.5rem', letterSpacing: '0.55em', textTransform: 'uppercase' as const, color: '#8a6f32', marginBottom: 14, animation: 'fadeUp 0.6s ease 0.1s both' }}>
          Prestige Dining · Est. 2024
        </div>

        <div style={{ animation: 'fadeUp 0.6s ease 0.2s both' }}>
          <h1 style={{ fontSize: '3.8rem', fontWeight: 300, color: '#e4c97e', letterSpacing: '0.07em', lineHeight: 1, margin: '0 0 6px' }}>
            Altitude
          </h1>
          <div style={{ fontSize: '0.55rem', letterSpacing: '0.45em', textTransform: 'uppercase' as const, color: 'rgba(201,168,76,0.35)' }}>
            Est. 2024
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '28px 0', animation: 'fadeUp 0.6s ease 0.3s both' }}>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.3))' }} />
          <span style={{ color: 'rgba(201,168,76,0.4)', fontSize: '0.5rem' }}>✦</span>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(201,168,76,0.3), transparent)' }} />
        </div>

        <p style={{ fontSize: '0.75rem', color: '#b8ad9a', letterSpacing: '0.1em', lineHeight: 2, marginBottom: 40, animation: 'fadeUp 0.6s ease 0.35s both' }}>
          Welcome aboard. Order at your leisure.<br />
          Priority Pass members enjoy exclusive dining benefits.
        </p>

        <div style={{ animation: 'fadeUp 0.6s ease 0.45s both' }}>
          <button
            className="order-btn"
            onClick={() => router.push('/order')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, width: '100%', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.3)', color: '#e4c97e', padding: '26px 32px', fontSize: '0.72rem', letterSpacing: '0.4em', textTransform: 'uppercase' as const, cursor: 'pointer', marginBottom: 14, boxSizing: 'border-box' as const }}
          >
            <span style={{ opacity: 0.5 }}>✦</span>
            Place Your Order
            <span style={{ opacity: 0.5 }}>✦</span>
          </button>
          <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.18)', letterSpacing: '0.2em', textTransform: 'uppercase' as const }}>
            Priority Pass members · Up to $30 off
          </div>
        </div>

        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.1), transparent)', margin: '32px 0', animation: 'fadeUp 0.6s ease 0.55s both' }} />

        <div style={{ animation: 'fadeUp 0.6s ease 0.65s both' }}>
          <span
            className="staff-link"
            onClick={() => router.push('/login')}
            style={{ fontSize: '0.5rem', letterSpacing: '0.3em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.15)', cursor: 'pointer', transition: 'color 0.2s' }}
          >
            Staff Access
          </span>
        </div>
      </div>

      <div style={{ position: 'fixed', bottom: 24, right: 28, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#27ae60', animation: 'pulse 2s infinite' }}></div>
        <span style={{ fontSize: '0.5rem', letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.2)' }}>Powered by Accomplish AI</span>
      </div>

      <div style={{ position: 'fixed', bottom: 24, left: 28, fontSize: '0.5rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.15)' }}>
        {time} · Terminal 3
      </div>
    </main>
  )
}
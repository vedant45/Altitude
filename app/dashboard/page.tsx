'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../../lib/firebase'
import { subscribeToOrders } from '../../lib/orders'
import type { Order } from '../../lib/orders'

export default function Dashboard() {
  const router = useRouter()
  const [time, setTime] = useState('')
  const [orders, setOrders] = useState<Order[]>([])
  const [authChecked, setAuthChecked] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      if (!u) { router.push('/login'); return }
      const snap = await getDoc(doc(db, 'users', u.uid))
      const role = snap.data()?.role
      if (role === 'admin') { router.push('/admin'); return }
      setUserEmail(u.email || '')
      setAuthChecked(true)
    })
  }, [])

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' }))
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const unsubscribe = subscribeToOrders(setOrders)
    return () => unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await signOut(auth)
    router.push('/login')
  }

  if (!authChecked) return null

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)
  const ppOrders = orders.filter(o => o.discount > 0).length
  const totalSaved = orders.reduce((sum, o) => sum + o.discount, 0)

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0a0f1e', fontFamily: 'Georgia, serif', overflow: 'hidden' }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>

      {/* Sidebar */}
      <nav style={{ width: 220, background: '#080a0f', borderRight: '1px solid rgba(201,168,76,0.1)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '28px 24px', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
          <div style={{ color: '#c9a84c', fontSize: '1.3rem', fontWeight: 300, letterSpacing: '0.1em' }}>Altitude</div>
          <div style={{ color: '#8a6f32', fontSize: '0.5rem', letterSpacing: '0.3em', textTransform: 'uppercase' as const, marginTop: 2 }}>Staff Dashboard</div>
        </div>
        <div style={{ padding: '20px 0', flex: 1 }}>
          {[
            { label: 'Dashboard', icon: '⬡', active: true, path: '/dashboard' },
            { label: 'Reports', icon: '◈', active: false, path: '#' },
            { label: 'Pass Registry', icon: '◉', active: false, path: '#' },
          ].map(item => (
            <div key={item.label} onClick={() => router.push(item.path)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 24px', fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: item.active ? '#c9a84c' : '#b8ad9a', borderLeft: item.active ? '2px solid #c9a84c' : '2px solid transparent', background: item.active ? 'rgba(201,168,76,0.07)' : 'transparent', cursor: 'pointer' }}>
              <span>{item.icon}</span>{item.label}
            </div>
          ))}
        </div>

        <div style={{ margin: '0 16px 16px', background: 'rgba(39,174,96,0.06)', border: '1px solid rgba(39,174,96,0.15)', padding: '12px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#27ae60', animation: 'pulse 2s infinite' }}></div>
            <span style={{ fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#27ae60' }}>Firebase Live</span>
          </div>
          <div style={{ fontSize: '0.58rem', color: '#b8ad9a' }}>Orders syncing in real time</div>
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(201,168,76,0.1)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #8a6f32, #c9a84c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#080a0f', flexShrink: 0 }}>
            {userEmail.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.65rem', color: '#f5f0e8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userEmail}</div>
            <div style={{ fontSize: '0.5rem', letterSpacing: '0.15em', color: '#8a6f32', textTransform: 'uppercase' as const }}>Staff</div>
          </div>
        </div>

        <button onClick={handleSignOut} style={{ margin: '0 16px 16px', background: 'transparent', border: '1px solid rgba(201,168,76,0.15)', color: '#8a6f32', padding: '10px', fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase' as const, cursor: 'pointer' }}>
          Sign Out
        </button>
      </nav>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: 64, borderBottom: '1px solid rgba(201,168,76,0.1)', background: 'rgba(8,10,15,0.5)', flexShrink: 0 }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 300, color: '#f5f0e8' }}>Operations Dashboard</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <button onClick={() => router.push('/')} style={{ background: 'transparent', border: '1px solid rgba(201,168,76,0.2)', color: '#c9a84c', padding: '8px 16px', fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase' as const, cursor: 'pointer' }}>
              ← Customer View
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.55rem', letterSpacing: '0.25em', textTransform: 'uppercase' as const, color: '#27ae60' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#27ae60', animation: 'pulse 2s infinite' }}></div>Live
            </div>
            <div style={{ fontSize: '0.7rem', color: '#b8ad9a' }}>{time}</div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' as const, padding: 32 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
            {[
              { label: 'Orders Today', value: orders.length.toString(), change: 'From Firebase · Live', icon: '✦' },
              { label: 'Priority Pass', value: ppOrders.toString(), change: `${orders.length - ppOrders} standard rate`, icon: '◈' },
              { label: 'Revenue', value: `$${totalRevenue.toFixed(2)}`, change: 'After discounts', icon: '$' },
              { label: 'PP Savings Given', value: `$${totalSaved.toFixed(2)}`, change: 'Total discounts applied', icon: '⚡' },
            ].map(stat => (
              <div key={stat.label} style={{ background: '#111827', border: '1px solid rgba(201,168,76,0.12)', padding: 24, position: 'relative' }}>
                <div style={{ position: 'absolute', right: 20, top: 20, fontSize: '1.2rem', opacity: 0.12 }}>{stat.icon}</div>
                <div style={{ fontSize: '0.55rem', letterSpacing: '0.3em', textTransform: 'uppercase' as const, color: '#8a6f32', marginBottom: 12 }}>{stat.label}</div>
                <div style={{ fontSize: '2rem', fontWeight: 300, color: '#f5f0e8', lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: '0.6rem', color: '#27ae60', marginTop: 8 }}>{stat.change}</div>
              </div>
            ))}
          </div>

          <div style={{ background: '#111827', border: '1px solid rgba(201,168,76,0.12)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
              <div style={{ fontSize: '0.6rem', letterSpacing: '0.3em', textTransform: 'uppercase' as const, color: '#c9a84c' }}>Live Orders · Firebase</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.55rem', color: '#27ae60' }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#27ae60', animation: 'pulse 2s infinite' }}></div>Syncing
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 80px 90px 80px 80px', padding: '10px 24px', fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#8a6f32', borderBottom: '1px solid rgba(201,168,76,0.15)', gap: 12 }}>
              <span>Passenger / Token</span><span>Items</span><span>Subtotal</span><span>Discount</span><span>Total</span><span>Type</span>
            </div>

            {orders.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center' as const }}>
                <div style={{ fontSize: '2rem', opacity: 0.2, marginBottom: 12 }}>◎</div>
                <div style={{ fontSize: '0.7rem', color: '#8a6f32', letterSpacing: '0.1em' }}>No orders yet · Waiting for customers</div>
              </div>
            ) : (
              orders.map((o, i) => (
                <div key={o.id} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 80px 90px 80px 80px', padding: '13px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.72rem', gap: 12, alignItems: 'center' }}>
                  <div>
                    <div style={{ color: '#f5f0e8' }}>{o.passenger}</div>
                    <div style={{ fontSize: '0.58rem', color: '#8a6f32', marginTop: 2 }}>#{String(4820 + i + 1)}</div>
                  </div>
                  <span style={{ color: '#b8ad9a', fontSize: '0.65rem' }}>{o.items.map(item => item.name).join(', ')}</span>
                  <span style={{ color: '#b8ad9a' }}>${o.subtotal.toFixed(2)}</span>
                  <span style={{ color: o.discount > 0 ? '#27ae60' : '#8a6f32' }}>{o.discount > 0 ? `-$${o.discount.toFixed(2)}` : '—'}</span>
                  <span style={{ color: '#f5f0e8', fontWeight: 600 }}>${o.total.toFixed(2)}</span>
                  <span style={{ fontSize: '0.55rem', letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: o.dineType === 'dine-in' ? '#c9a84c' : '#b8ad9a', border: `1px solid ${o.dineType === 'dine-in' ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.1)'}`, padding: '3px 8px' }}>
                    {o.dineType === 'dine-in' ? '🪑 Dine In' : '🛍 Take'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
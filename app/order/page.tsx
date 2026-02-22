'use client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { saveOrder } from '../../lib/orders'

const MENU = [
  { id: 1, name: 'Flat White', price: 6.50, category: 'Coffee', emoji: '☕' },
  { id: 2, name: 'Cappuccino', price: 6.00, category: 'Coffee', emoji: '☕' },
  { id: 3, name: 'Latte', price: 6.50, category: 'Coffee', emoji: '☕' },
  { id: 4, name: 'Espresso', price: 4.50, category: 'Coffee', emoji: '☕' },
  { id: 5, name: 'Green Tea', price: 5.00, category: 'Tea', emoji: '🍵' },
  { id: 6, name: 'Croissant', price: 5.00, category: 'Food', emoji: '🥐' },
  { id: 7, name: 'Eggs Benedict', price: 18.00, category: 'Food', emoji: '🍳' },
  { id: 8, name: 'Avocado Toast', price: 14.00, category: 'Food', emoji: '🥑' },
  { id: 9, name: 'Fruit Bowl', price: 12.00, category: 'Food', emoji: '🍓' },
  { id: 10, name: 'Ham & Cheese Croissant', price: 8.50, category: 'Food', emoji: '🥐' },
]

type Step = 'priority' | 'scan' | 'menu' | 'dinetype' | 'done'

export default function Order() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('priority')
  const [animating, setAnimating] = useState(false)
  const [hasPriorityPass, setHasPriorityPass] = useState(false)
  const [passId, setPassId] = useState('')
  const [passVerified, setPassVerified] = useState(false)
  const [selectedItems, setSelectedItems] = useState<typeof MENU>([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [dineType, setDineType] = useState<'dine-in' | 'takeaway' | ''>('')
  const [customerName, setCustomerName] = useState('')
  const [token] = useState(() => Math.floor(1000 + Math.random() * 9000).toString())
  const [saving, setSaving] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const goTo = (s: Step) => {
    setAnimating(true)
    setTimeout(() => { setStep(s); setAnimating(false) }, 280)
  }

  const toggleItem = (item: typeof MENU[0]) => {
    setSelectedItems(prev =>
      prev.find(i => i.id === item.id)
        ? prev.filter(i => i.id !== item.id)
        : [...prev, item]
    )
  }

  const subtotal = selectedItems.reduce((sum, i) => sum + i.price, 0)
  const discount = passVerified ? Math.min(30, subtotal) : 0
  const total = Math.max(0, subtotal - discount)
  const categories = ['All', ...Array.from(new Set(MENU.map(i => i.category)))]
  const filteredMenu = activeCategory === 'All' ? MENU : MENU.filter(i => i.category === activeCategory)

  const handleConfirm = async () => {
    setSaving(true)
    try {
      await saveOrder({
        passenger: dineType === 'takeaway' ? customerName : `Token #${token}`,
        passId: passVerified ? passId : 'N/A',
        items: selectedItems.map(i => ({ name: i.name, price: i.price })),
        subtotal,
        discount,
        total,
        status: 'Confirmed',
        dineType,
        token: dineType === 'dine-in' ? token : null,
        customerName: dineType === 'takeaway' ? customerName : null,
      })
    } catch (e) {
      console.error('Firebase error:', e)
    }
    setSaving(false)
    goTo('done')
  }

  if (!mounted) return null

  return (
    <div style={{ minHeight: '100vh', background: '#080a0f', fontFamily: 'Georgia, serif', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeOut { from{opacity:1;transform:translateY(0)} to{opacity:0;transform:translateY(-16px)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes scaleIn { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
        .step-wrap { animation: fadeUp 0.35s ease both; }
        .step-wrap.out { animation: fadeOut 0.28s ease both; }
        .menu-card:hover { background: rgba(201,168,76,0.1) !important; transform: translateY(-2px) !important; }
        .menu-card { transition: all 0.2s ease !important; }
        .choice-btn:hover { border-color: rgba(201,168,76,0.6) !important; background: rgba(201,168,76,0.08) !important; transform: translateY(-3px) !important; }
        .choice-btn { transition: all 0.25s ease !important; }
      `}</style>

      {/* Topbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', height: 56, borderBottom: '1px solid rgba(201,168,76,0.1)', background: 'rgba(8,10,15,0.8)' }}>
        <div onClick={() => router.push('/')} style={{ cursor: 'pointer', color: '#c9a84c', fontSize: '1.1rem', letterSpacing: '0.1em' }}>
          The Lounge
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#27ae60' }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#27ae60', animation: 'pulse 2s infinite' }}></div>
          Open Now
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', alignItems: step === 'menu' ? 'flex-start' : 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div className={`step-wrap ${animating ? 'out' : ''}`} style={{ width: '100%', maxWidth: step === 'menu' ? 800 : 520 }}>

          {/* STEP: Priority Pass */}
          {step === 'priority' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.55rem', letterSpacing: '0.4em', textTransform: 'uppercase' as const, color: '#8a6f32', marginBottom: 16 }}>Step 1 of 3</div>
              <h2 style={{ fontSize: '2rem', fontWeight: 300, color: '#f5f0e8', marginBottom: 8 }}>Do you have a</h2>
              <h2 style={{ fontSize: '2rem', fontWeight: 300, color: '#c9a84c', marginBottom: 32 }}>Priority Pass?</h2>
              <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,rgba(201,168,76,0.3),transparent)', marginBottom: 40 }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <button className="choice-btn" onClick={() => { setHasPriorityPass(true); goTo('scan') }} style={{ padding: '32px 24px', background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.25)', color: '#f5f0e8', cursor: 'pointer', textAlign: 'center' as const }}>
                  <div style={{ fontSize: '2rem', marginBottom: 12 }}>✦</div>
                  <div style={{ fontSize: '0.8rem', letterSpacing: '0.1em', color: '#c9a84c', marginBottom: 8 }}>Yes, I do</div>
                  <div style={{ fontSize: '0.6rem', color: '#8a6f32' }}>Enjoy up to $30 off</div>
                </button>
                <button className="choice-btn" onClick={() => { setHasPriorityPass(false); goTo('menu') }} style={{ padding: '32px 24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', color: '#f5f0e8', cursor: 'pointer', textAlign: 'center' as const }}>
                  <div style={{ fontSize: '2rem', marginBottom: 12, opacity: 0.4 }}>◎</div>
                  <div style={{ fontSize: '0.8rem', letterSpacing: '0.1em', color: '#b8ad9a', marginBottom: 8 }}>No, continue</div>
                  <div style={{ fontSize: '0.6rem', color: '#8a6f32' }}>Standard pricing</div>
                </button>
              </div>
            </div>
          )}

          {/* STEP: Scan Pass */}
          {step === 'scan' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <div style={{ fontSize: '0.55rem', letterSpacing: '0.4em', textTransform: 'uppercase' as const, color: '#8a6f32', marginBottom: 12 }}>Step 2 of 3</div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 300, color: '#f5f0e8', marginBottom: 8 }}>Verify Priority Pass</h2>
                <p style={{ fontSize: '0.65rem', color: '#b8ad9a', letterSpacing: '0.1em' }}>Scan or enter your pass ID</p>
              </div>

              <div style={{ background: '#111827', border: '1px solid rgba(201,168,76,0.15)', padding: 32 }}>
                <div
                  onClick={() => { setPassId('PP-84921034'); setPassVerified(true) }}
                  style={{ border: '1px dashed rgba(201,168,76,0.25)', background: 'rgba(201,168,76,0.02)', padding: '40px', textAlign: 'center' as const, cursor: 'pointer', marginBottom: 24 }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: 12, opacity: 0.4 }}>▣</div>
                  <div style={{ fontSize: '0.6rem', letterSpacing: '0.3em', textTransform: 'uppercase' as const, color: '#8a6f32' }}>Tap to Simulate Scan</div>
                </div>

                <label style={{ display: 'block', fontSize: '0.6rem', letterSpacing: '0.25em', textTransform: 'uppercase' as const, color: '#8a6f32', marginBottom: 8 }}>Or enter Pass ID</label>
                <input
                  value={passId}
                  onChange={e => { setPassId(e.target.value); setPassVerified(e.target.value.length > 4) }}
                  placeholder="PP-XXXXXXXX"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,168,76,0.2)', borderBottomColor: 'rgba(201,168,76,0.5)', color: '#f5f0e8', padding: '12px 16px', outline: 'none', fontFamily: 'Georgia, serif', fontSize: '0.85rem', marginBottom: 20, boxSizing: 'border-box' as const }}
                />

                {passVerified && (
                  <div style={{ background: 'rgba(26,107,74,0.15)', border: '1px solid rgba(39,174,96,0.3)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, animation: 'scaleIn 0.3s ease' }}>
                    <span style={{ fontSize: '1.2rem', color: '#27ae60' }}>✓</span>
                    <div>
                      <div style={{ fontSize: '0.55rem', letterSpacing: '0.25em', textTransform: 'uppercase' as const, color: '#27ae60', marginBottom: 2 }}>Pass Verified · $30 Discount Applied</div>
                      <div style={{ fontSize: '0.85rem', color: '#f5f0e8' }}>Priority Pass · Prestige Tier</div>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => goTo('priority')} style={{ flex: 1, background: 'transparent', border: '1px solid rgba(201,168,76,0.2)', color: '#b8ad9a', padding: '13px', fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase' as const, cursor: 'pointer' }}>← Back</button>
                  <button onClick={() => goTo('menu')} style={{ flex: 2, background: 'linear-gradient(135deg, #8a6f32, #c9a84c)', color: '#080a0f', border: 'none', padding: '13px', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase' as const, cursor: 'pointer' }}>Continue →</button>
                </div>
              </div>
            </div>
          )}

          {/* STEP: Menu */}
          {step === 'menu' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 20, alignItems: 'start' }}>
              <div style={{ background: '#111827', border: '1px solid rgba(201,168,76,0.15)', padding: 28 }}>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: '0.55rem', letterSpacing: '0.4em', textTransform: 'uppercase' as const, color: '#8a6f32', marginBottom: 8 }}>Step 3 of 3</div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 300, color: '#f5f0e8' }}>Select Your Order</h2>
                  {passVerified && <div style={{ fontSize: '0.62rem', color: '#27ae60', marginTop: 4 }}>✓ Priority Pass discount will be applied</div>}
                </div>

                <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' as const }}>
                  {categories.map(cat => (
                    <button key={cat} onClick={() => setActiveCategory(cat)} style={{ padding: '6px 14px', background: activeCategory === cat ? 'linear-gradient(135deg,#8a6f32,#c9a84c)' : 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)', color: activeCategory === cat ? '#080a0f' : '#b8ad9a', fontSize: '0.58rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const, cursor: 'pointer', transition: 'all 0.2s' }}>
                      {cat}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                  {filteredMenu.map(item => {
                    const selected = !!selectedItems.find(i => i.id === item.id)
                    return (
                      <div key={item.id} className="menu-card" onClick={() => toggleItem(item)} style={{ padding: '14px 16px', background: selected ? 'rgba(201,168,76,0.1)' : 'rgba(255,255,255,0.02)', border: `1px solid ${selected ? 'rgba(201,168,76,0.45)' : 'rgba(201,168,76,0.08)'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: '1.3rem' }}>{item.emoji}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.72rem', color: '#f5f0e8' }}>{item.name}</div>
                          <div style={{ fontSize: '0.62rem', color: '#c9a84c', marginTop: 2 }}>${item.price.toFixed(2)}</div>
                        </div>
                        {selected && <span style={{ color: '#27ae60', fontSize: '0.75rem' }}>✓</span>}
                      </div>
                    )
                  })}
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                  <button onClick={() => goTo(hasPriorityPass ? 'scan' : 'priority')} style={{ flex: 1, background: 'transparent', border: '1px solid rgba(201,168,76,0.2)', color: '#b8ad9a', padding: '13px', fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase' as const, cursor: 'pointer' }}>← Back</button>
                  <button onClick={() => selectedItems.length > 0 && goTo('dinetype')} style={{ flex: 2, background: selectedItems.length > 0 ? 'linear-gradient(135deg,#8a6f32,#c9a84c)' : 'rgba(255,255,255,0.05)', color: selectedItems.length > 0 ? '#080a0f' : '#8a6f32', border: 'none', padding: '13px', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase' as const, cursor: selectedItems.length > 0 ? 'pointer' : 'not-allowed' }}>
                    Continue →
                  </button>
                </div>
              </div>

              {/* Order Summary */}
              <div style={{ background: '#111827', border: '1px solid rgba(201,168,76,0.12)', padding: 20, position: 'sticky', top: 20 }}>
                <div style={{ fontSize: '0.55rem', letterSpacing: '0.3em', textTransform: 'uppercase' as const, color: '#c9a84c', marginBottom: 16 }}>Your Order</div>
                {selectedItems.length === 0 ? (
                  <div style={{ fontSize: '0.68rem', color: '#8a6f32', textAlign: 'center' as const, padding: '20px 0', opacity: 0.6 }}>Nothing selected yet</div>
                ) : (
                  <>
                    {selectedItems.map(item => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.7rem' }}>
                        <span style={{ color: '#f5f0e8' }}>{item.name}</span>
                        <span style={{ color: '#c9a84c' }}>${item.price.toFixed(2)}</span>
                      </div>
                    ))}
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(201,168,76,0.15)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#b8ad9a', marginBottom: 6 }}>
                        <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
                      </div>
                      {passVerified && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#27ae60', marginBottom: 6 }}>
                          <span>PP Discount</span><span>-${discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#f5f0e8', fontWeight: 600, marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(201,168,76,0.2)' }}>
                        <span>Total</span><span>${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* STEP: Dine Type */}
          {step === 'dinetype' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <div style={{ fontSize: '0.55rem', letterSpacing: '0.4em', textTransform: 'uppercase' as const, color: '#8a6f32', marginBottom: 12 }}>Almost done</div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 300, color: '#f5f0e8' }}>How will you dine?</h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <button className="choice-btn" onClick={() => setDineType('dine-in')} style={{ padding: '32px 24px', background: dineType === 'dine-in' ? 'rgba(201,168,76,0.1)' : 'rgba(255,255,255,0.02)', border: `1px solid ${dineType === 'dine-in' ? 'rgba(201,168,76,0.5)' : 'rgba(255,255,255,0.08)'}`, color: '#f5f0e8', cursor: 'pointer', textAlign: 'center' as const }}>
                  <div style={{ fontSize: '2rem', marginBottom: 12 }}>🪑</div>
                  <div style={{ fontSize: '0.8rem', letterSpacing: '0.1em', color: '#c9a84c', marginBottom: 8 }}>Dine In</div>
                  <div style={{ fontSize: '0.6rem', color: '#8a6f32' }}>We'll give you a token number</div>
                </button>
                <button className="choice-btn" onClick={() => setDineType('takeaway')} style={{ padding: '32px 24px', background: dineType === 'takeaway' ? 'rgba(201,168,76,0.1)' : 'rgba(255,255,255,0.02)', border: `1px solid ${dineType === 'takeaway' ? 'rgba(201,168,76,0.5)' : 'rgba(255,255,255,0.08)'}`, color: '#f5f0e8', cursor: 'pointer', textAlign: 'center' as const }}>
                  <div style={{ fontSize: '2rem', marginBottom: 12 }}>🛍️</div>
                  <div style={{ fontSize: '0.8rem', letterSpacing: '0.1em', color: '#c9a84c', marginBottom: 8 }}>Takeaway</div>
                  <div style={{ fontSize: '0.6rem', color: '#8a6f32' }}>We'll call your name</div>
                </button>
              </div>

              {dineType === 'takeaway' && (
                <div style={{ background: '#111827', border: '1px solid rgba(201,168,76,0.15)', padding: 24, marginBottom: 20, animation: 'scaleIn 0.3s ease' }}>
                  <label style={{ display: 'block', fontSize: '0.6rem', letterSpacing: '0.25em', textTransform: 'uppercase' as const, color: '#8a6f32', marginBottom: 8 }}>Your Name</label>
                  <input
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="Enter your name"
                    style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,168,76,0.2)', borderBottomColor: 'rgba(201,168,76,0.5)', color: '#f5f0e8', padding: '12px 16px', outline: 'none', fontFamily: 'Georgia, serif', fontSize: '0.85rem', boxSizing: 'border-box' as const }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => goTo('menu')} style={{ flex: 1, background: 'transparent', border: '1px solid rgba(201,168,76,0.2)', color: '#b8ad9a', padding: '13px', fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase' as const, cursor: 'pointer' }}>← Back</button>
                <button
                  onClick={() => { if (dineType && (dineType === 'dine-in' || customerName)) handleConfirm() }}
                  style={{ flex: 2, background: dineType ? 'linear-gradient(135deg,#8a6f32,#c9a84c)' : 'rgba(255,255,255,0.05)', color: dineType ? '#080a0f' : '#8a6f32', border: 'none', padding: '13px', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase' as const, cursor: dineType ? 'pointer' : 'not-allowed' }}
                >
                  {saving ? 'Confirming...' : '✓ Confirm Order'}
                </button>
              </div>
            </div>
          )}

          {/* STEP: Done */}
          {step === 'done' && (
            <div style={{ textAlign: 'center', animation: 'fadeUp 0.5s ease' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(39,174,96,0.15)', border: '1px solid rgba(39,174,96,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '2rem' }}>✓</div>

              <h2 style={{ fontSize: '2rem', fontWeight: 300, color: '#27ae60', marginBottom: 8 }}>Order Confirmed!</h2>
              <p style={{ fontSize: '0.65rem', color: '#b8ad9a', letterSpacing: '0.1em', marginBottom: 40 }}>
                {dineType === 'dine-in' ? 'Please find a seat. We will call your token.' : `We will call your name when ready, ${customerName}.`}
              </p>

              {dineType === 'dine-in' ? (
                <div style={{ background: '#111827', border: '1px solid rgba(201,168,76,0.3)', padding: '40px 48px', display: 'inline-block', marginBottom: 40 }}>
                  <div style={{ fontSize: '0.55rem', letterSpacing: '0.4em', textTransform: 'uppercase' as const, color: '#8a6f32', marginBottom: 12 }}>Your Token</div>
                  <div style={{ fontSize: '4rem', fontWeight: 300, color: '#c9a84c', letterSpacing: '0.1em', lineHeight: 1 }}>#{token}</div>
                  <div style={{ fontSize: '0.6rem', color: '#8a6f32', marginTop: 12 }}>Please keep this number</div>
                </div>
              ) : (
                <div style={{ background: '#111827', border: '1px solid rgba(201,168,76,0.3)', padding: '32px 48px', display: 'inline-block', marginBottom: 40 }}>
                  <div style={{ fontSize: '0.55rem', letterSpacing: '0.4em', textTransform: 'uppercase' as const, color: '#8a6f32', marginBottom: 12 }}>Order for</div>
                  <div style={{ fontSize: '2rem', fontWeight: 300, color: '#c9a84c' }}>{customerName}</div>
                </div>
              )}

              <div style={{ background: '#080a0f', border: '1px solid rgba(255,255,255,0.06)', padding: 24, maxWidth: 320, margin: '0 auto 32px', textAlign: 'left' as const }}>
                <div style={{ textAlign: 'center' as const, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid rgba(201,168,76,0.15)' }}>
                  <div style={{ color: '#c9a84c', letterSpacing: '0.1em' }}>The Lounge</div>
                  <div style={{ fontSize: '0.5rem', color: '#8a6f32', letterSpacing: '0.25em', textTransform: 'uppercase' as const, marginTop: 4 }}>Receipt</div>
                </div>
                {selectedItems.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#b8ad9a', marginBottom: 6 }}>
                    <span>{item.name}</span><span>${item.price.toFixed(2)}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid rgba(201,168,76,0.15)', marginTop: 10, paddingTop: 10 }}>
                  {passVerified && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#27ae60', marginBottom: 6 }}>
                      <span>Priority Pass Discount</span><span>-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#f5f0e8', fontWeight: 600 }}>
                    <span>Total</span><span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button onClick={() => router.push('/')} style={{ background: 'linear-gradient(135deg,#8a6f32,#c9a84c)', color: '#080a0f', border: 'none', padding: '14px 40px', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase' as const, cursor: 'pointer' }}>
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
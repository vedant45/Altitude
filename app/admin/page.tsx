'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { onAuthStateChanged, signOut, createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc, collection, getDocs, setDoc, deleteDoc, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore'
import { auth, db } from '../../lib/firebase'

type StaffMember = { uid: string; email: string; name: string; role: string }
type MenuItem = { id: string; name: string; price: number; category: string; emoji: string }
type Order = { id: string; passenger: string; items: { name: string; price: number }[]; subtotal: number; discount: number; total: number; dineType: string }

export default function Admin() {
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'staff'>('orders')
  const [orders, setOrders] = useState<Order[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [newItem, setNewItem] = useState({ name: '', price: '', category: 'Coffee', emoji: '☕' })
  const [staffList, setStaffList] = useState<StaffMember[]>([])
  const [newStaff, setNewStaff] = useState({ name: '', email: '', password: '' })
  const [staffMsg, setStaffMsg] = useState('')
  const [menuMsg, setMenuMsg] = useState('')

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      if (!u) { router.push('/login'); return }
      const snap = await getDoc(doc(db, 'users', u.uid))
      if (snap.data()?.role !== 'admin') { router.push('/dashboard'); return }
      setUserEmail(u.email || '')
      setAuthChecked(true)
    })
  }, [])

  useEffect(() => {
    if (!authChecked) return
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, snap => setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Order[]))
    const menuUnsub = onSnapshot(collection(db, 'menu'), snap => setMenuItems(snap.docs.map(d => ({ id: d.id, ...d.data() })) as MenuItem[]))
    loadStaff()
    return () => { unsub(); menuUnsub() }
  }, [authChecked])

  const loadStaff = async () => {
    const snap = await getDocs(collection(db, 'users'))
    setStaffList(snap.docs.map(d => ({ uid: d.id, ...d.data() })) as StaffMember[])
  }

  const addMenuItem = async () => {
    if (!newItem.name || !newItem.price) return
    await addDoc(collection(db, 'menu'), { name: newItem.name, price: parseFloat(newItem.price), category: newItem.category, emoji: newItem.emoji })
    setNewItem({ name: '', price: '', category: 'Coffee', emoji: '☕' })
    setMenuMsg('✓ Item added!')
    setTimeout(() => setMenuMsg(''), 3000)
  }

  const deleteMenuItem = async (id: string) => {
    await deleteDoc(doc(db, 'menu', id))
  }

  const addStaffMember = async () => {
    if (!newStaff.email || !newStaff.password || !newStaff.name) return
    setStaffMsg('Creating...')
    try {
      const cred = await createUserWithEmailAndPassword(auth, newStaff.email, newStaff.password)
      await setDoc(doc(db, 'users', cred.user.uid), { email: newStaff.email, name: newStaff.name, role: 'staff' })
      setNewStaff({ name: '', email: '', password: '' })
      setStaffMsg('✓ Staff member added!')
      loadStaff()
    } catch (e: any) {
      setStaffMsg('Error: ' + e.message)
    }
    setTimeout(() => setStaffMsg(''), 4000)
  }

  const removeStaffMember = async (uid: string) => {
    await deleteDoc(doc(db, 'users', uid))
    loadStaff()
  }

  const handleSignOut = async () => {
    await signOut(auth)
    router.push('/login')
  }

  if (!authChecked) return null

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)
  const emojis = ['☕', '🍵', '🥐', '🍳', '🥑', '🍓', '🥗', '🍰', '🧃', '🍷']

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0a0f1e', fontFamily: 'Georgia, serif', overflow: 'hidden' }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>

      {/* Sidebar */}
      <nav style={{ width: 220, background: '#080a0f', borderRight: '1px solid rgba(201,168,76,0.1)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '28px 24px', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
          <div style={{ color: '#c9a84c', fontSize: '1.3rem', fontWeight: 300, letterSpacing: '0.1em' }}>Altitude</div>
          <div style={{ color: '#8a6f32', fontSize: '0.5rem', letterSpacing: '0.3em', textTransform: 'uppercase' as const, marginTop: 2 }}>Admin Panel</div>
        </div>

        <div style={{ padding: '20px 0', flex: 1 }}>
          {[
            { label: 'Orders', icon: '✦', tab: 'orders' },
            { label: 'Menu', icon: '◈', tab: 'menu' },
            { label: 'Staff', icon: '◉', tab: 'staff' },
          ].map(item => (
            <div key={item.tab} onClick={() => setActiveTab(item.tab as any)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 24px', fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: activeTab === item.tab ? '#c9a84c' : '#b8ad9a', borderLeft: activeTab === item.tab ? '2px solid #c9a84c' : '2px solid transparent', background: activeTab === item.tab ? 'rgba(201,168,76,0.07)' : 'transparent', cursor: 'pointer' }}>
              <span>{item.icon}</span>{item.label}
            </div>
          ))}
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(201,168,76,0.1)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #8a6f32, #c9a84c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#080a0f', flexShrink: 0 }}>
            {userEmail.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.65rem', color: '#f5f0e8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userEmail}</div>
            <div style={{ fontSize: '0.5rem', letterSpacing: '0.15em', color: '#c9a84c', textTransform: 'uppercase' as const }}>Administrator</div>
          </div>
        </div>

        <button onClick={handleSignOut} style={{ margin: '0 16px 16px', background: 'transparent', border: '1px solid rgba(201,168,76,0.15)', color: '#8a6f32', padding: '10px', fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase' as const, cursor: 'pointer' }}>
          Sign Out
        </button>
      </nav>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: 64, borderBottom: '1px solid rgba(201,168,76,0.1)', background: 'rgba(8,10,15,0.5)', flexShrink: 0 }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 300, color: '#f5f0e8' }}>
            {activeTab === 'orders' ? 'All Orders' : activeTab === 'menu' ? 'Menu Management' : 'Staff Management'}
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => router.push('/dashboard')} style={{ background: 'transparent', border: '1px solid rgba(201,168,76,0.2)', color: '#c9a84c', padding: '8px 16px', fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase' as const, cursor: 'pointer' }}>Staff View</button>
            <button onClick={() => router.push('/')} style={{ background: 'transparent', border: '1px solid rgba(201,168,76,0.2)', color: '#c9a84c', padding: '8px 16px', fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase' as const, cursor: 'pointer' }}>Customer View</button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' as const, padding: 32 }}>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
            {[
              { label: 'Total Orders', value: orders.length.toString(), icon: '✦' },
              { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: '$' },
              { label: 'Menu Items', value: menuItems.length.toString(), icon: '◈' },
            ].map(stat => (
              <div key={stat.label} style={{ background: '#111827', border: '1px solid rgba(201,168,76,0.12)', padding: 24, position: 'relative' }}>
                <div style={{ position: 'absolute', right: 20, top: 20, fontSize: '1.2rem', opacity: 0.12 }}>{stat.icon}</div>
                <div style={{ fontSize: '0.55rem', letterSpacing: '0.3em', textTransform: 'uppercase' as const, color: '#8a6f32', marginBottom: 12 }}>{stat.label}</div>
                <div style={{ fontSize: '2rem', fontWeight: 300, color: '#f5f0e8', lineHeight: 1 }}>{stat.value}</div>
              </div>
            ))}
          </div>

          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div style={{ background: '#111827', border: '1px solid rgba(201,168,76,0.12)' }}>
              <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(201,168,76,0.1)', fontSize: '0.6rem', letterSpacing: '0.3em', textTransform: 'uppercase' as const, color: '#c9a84c' }}>All Orders · Live</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px 90px 80px 80px', padding: '10px 24px', fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#8a6f32', borderBottom: '1px solid rgba(201,168,76,0.15)', gap: 12 }}>
                <span>Passenger</span><span>Items</span><span>Subtotal</span><span>Discount</span><span>Total</span><span>Type</span>
              </div>
              {orders.length === 0 ? (
                <div style={{ padding: '48px 24px', textAlign: 'center' as const, color: '#8a6f32', fontSize: '0.7rem' }}>No orders yet</div>
              ) : orders.map(o => (
                <div key={o.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px 90px 80px 80px', padding: '13px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.72rem', gap: 12, alignItems: 'center' }}>
                  <span style={{ color: '#f5f0e8' }}>{o.passenger}</span>
                  <span style={{ color: '#b8ad9a', fontSize: '0.65rem' }}>{o.items.map(i => i.name).join(', ')}</span>
                  <span style={{ color: '#b8ad9a' }}>${o.subtotal.toFixed(2)}</span>
                  <span style={{ color: o.discount > 0 ? '#27ae60' : '#8a6f32' }}>{o.discount > 0 ? `-$${o.discount.toFixed(2)}` : '—'}</span>
                  <span style={{ color: '#f5f0e8', fontWeight: 600 }}>${o.total.toFixed(2)}</span>
                  <span style={{ fontSize: '0.55rem', textTransform: 'uppercase' as const, color: o.dineType === 'dine-in' ? '#c9a84c' : '#b8ad9a', border: `1px solid ${o.dineType === 'dine-in' ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.1)'}`, padding: '3px 8px' }}>
                    {o.dineType === 'dine-in' ? '🪑 Dine' : '🛍 Take'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* MENU TAB */}
          {activeTab === 'menu' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
              <div style={{ background: '#111827', border: '1px solid rgba(201,168,76,0.12)' }}>
                <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(201,168,76,0.1)', fontSize: '0.6rem', letterSpacing: '0.3em', textTransform: 'uppercase' as const, color: '#c9a84c' }}>
                  Current Menu · {menuItems.length} items
                </div>
                {menuItems.length === 0 ? (
                  <div style={{ padding: '48px 24px', textAlign: 'center' as const, color: '#8a6f32', fontSize: '0.7rem' }}>No menu items yet · Add one →</div>
                ) : menuItems.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: '1.3rem' }}>{item.emoji}</span>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#f5f0e8' }}>{item.name}</div>
                        <div style={{ fontSize: '0.58rem', color: '#8a6f32', textTransform: 'uppercase' as const, letterSpacing: '0.1em' }}>{item.category}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <span style={{ color: '#c9a84c' }}>${item.price.toFixed(2)}</span>
                      <button onClick={() => deleteMenuItem(item.id)} style={{ background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.3)', color: '#c0392b', padding: '5px 12px', fontSize: '0.55rem', cursor: 'pointer' }}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ background: '#111827', border: '1px solid rgba(201,168,76,0.12)', padding: 24, alignSelf: 'start' }}>
                <div style={{ fontSize: '0.6rem', letterSpacing: '0.3em', textTransform: 'uppercase' as const, color: '#c9a84c', marginBottom: 20 }}>Add Menu Item</div>
                <label style={{ display: 'block', fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#8a6f32', marginBottom: 6 }}>Item Name</label>
                <input value={newItem.name} onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Matcha Latte"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,168,76,0.2)', color: '#f5f0e8', padding: '10px 14px', outline: 'none', fontFamily: 'Georgia, serif', fontSize: '0.8rem', marginBottom: 16, boxSizing: 'border-box' as const }} />
                <label style={{ display: 'block', fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#8a6f32', marginBottom: 6 }}>Price ($)</label>
                <input value={newItem.price} onChange={e => setNewItem(p => ({ ...p, price: e.target.value }))} placeholder="0.00" type="number"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,168,76,0.2)', color: '#f5f0e8', padding: '10px 14px', outline: 'none', fontFamily: 'Georgia, serif', fontSize: '0.8rem', marginBottom: 16, boxSizing: 'border-box' as const }} />
                <label style={{ display: 'block', fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#8a6f32', marginBottom: 6 }}>Category</label>
                <select value={newItem.category} onChange={e => setNewItem(p => ({ ...p, category: e.target.value }))}
                  style={{ width: '100%', background: '#1a2235', border: '1px solid rgba(201,168,76,0.2)', color: '#f5f0e8', padding: '10px 14px', outline: 'none', fontFamily: 'Georgia, serif', fontSize: '0.8rem', marginBottom: 16, boxSizing: 'border-box' as const }}>
                  {['Coffee', 'Tea', 'Food'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <label style={{ display: 'block', fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#8a6f32', marginBottom: 8 }}>Emoji</label>
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8, marginBottom: 20 }}>
                  {emojis.map(e => (
                    <span key={e} onClick={() => setNewItem(p => ({ ...p, emoji: e }))}
                      style={{ fontSize: '1.3rem', cursor: 'pointer', padding: '4px 8px', background: newItem.emoji === e ? 'rgba(201,168,76,0.2)' : 'transparent', border: newItem.emoji === e ? '1px solid rgba(201,168,76,0.4)' : '1px solid transparent' }}>
                      {e}
                    </span>
                  ))}
                </div>
                {menuMsg && <div style={{ fontSize: '0.65rem', color: '#27ae60', marginBottom: 12 }}>{menuMsg}</div>}
                <button onClick={addMenuItem} style={{ width: '100%', background: 'linear-gradient(135deg, #8a6f32, #c9a84c)', color: '#080a0f', border: 'none', padding: '13px', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase' as const, cursor: 'pointer' }}>
                  + Add Item
                </button>
              </div>
            </div>
          )}

          {/* STAFF TAB */}
          {activeTab === 'staff' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
              <div style={{ background: '#111827', border: '1px solid rgba(201,168,76,0.12)' }}>
                <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(201,168,76,0.1)', fontSize: '0.6rem', letterSpacing: '0.3em', textTransform: 'uppercase' as const, color: '#c9a84c' }}>
                  Staff Members · {staffList.length}
                </div>
                {staffList.map(s => (
                  <div key={s.uid} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: s.role === 'admin' ? 'linear-gradient(135deg, #8a6f32, #c9a84c)' : 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: s.role === 'admin' ? '#080a0f' : '#c9a84c' }}>
                        {s.email?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#f5f0e8' }}>{s.name || s.email}</div>
                        <div style={{ fontSize: '0.58rem', color: '#8a6f32' }}>{s.email}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: '0.55rem', textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: s.role === 'admin' ? '#c9a84c' : '#27ae60', border: `1px solid ${s.role === 'admin' ? 'rgba(201,168,76,0.3)' : 'rgba(39,174,96,0.3)'}`, padding: '3px 10px' }}>
                        {s.role}
                      </span>
                      {s.role !== 'admin' && (
                        <button onClick={() => removeStaffMember(s.uid)} style={{ background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.3)', color: '#c0392b', padding: '5px 12px', fontSize: '0.55rem', cursor: 'pointer' }}>
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ background: '#111827', border: '1px solid rgba(201,168,76,0.12)', padding: 24, alignSelf: 'start' }}>
                <div style={{ fontSize: '0.6rem', letterSpacing: '0.3em', textTransform: 'uppercase' as const, color: '#c9a84c', marginBottom: 20 }}>Add Staff Member</div>
                {[
                  { label: 'Full Name', key: 'name', placeholder: 'John Smith', type: 'text' },
                  { label: 'Email', key: 'email', placeholder: 'john@altitude.com', type: 'email' },
                  { label: 'Password', key: 'password', placeholder: '••••••••', type: 'password' },
                ].map(field => (
                  <div key={field.key} style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#8a6f32', marginBottom: 6 }}>{field.label}</label>
                    <input
                      type={field.type}
                      value={newStaff[field.key as keyof typeof newStaff]}
                      onChange={e => setNewStaff(p => ({ ...p, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,168,76,0.2)', color: '#f5f0e8', padding: '10px 14px', outline: 'none', fontFamily: 'Georgia, serif', fontSize: '0.8rem', boxSizing: 'border-box' as const }}
                    />
                  </div>
                ))}
                {staffMsg && <div style={{ fontSize: '0.65rem', color: staffMsg.startsWith('Error') ? '#c0392b' : '#27ae60', marginBottom: 12 }}>{staffMsg}</div>}
                <button onClick={addStaffMember} style={{ width: '100%', background: 'linear-gradient(135deg, #8a6f32, #c9a84c)', color: '#080a0f', border: 'none', padding: '13px', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase' as const, cursor: 'pointer' }}>
                  + Add Staff
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
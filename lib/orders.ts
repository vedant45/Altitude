import { db } from './firebase'
import { collection, addDoc, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore'

export type Order = {
  id?: string
  passenger: string
  passId: string
  items: { name: string; price: number }[]
  subtotal: number
  discount: number
  total: number
  status: string
  dineType: string
  token?: string | null
  customerName?: string | null
  createdAt?: Timestamp
}

export async function saveOrder(order: Omit<Order, 'id' | 'createdAt'>) {
  return await addDoc(collection(db, 'orders'), {
    ...order,
    createdAt: Timestamp.now()
  })
}

export function subscribeToOrders(callback: (orders: Order[]) => void) {
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, snap => {
    callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[])
  })
}
import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyA0fBZGTpAY48nY_Uh_IL8C73cimMpavOk",
  authDomain: "dineout-75043.firebaseapp.com",
  projectId: "dineout-75043",
  storageBucket: "dineout-75043.firebasestorage.app",
  messagingSenderId: "221243143754",
  appId: "1:221243143754:web:61a8b7ee803cbc049c18b3"
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
export const db = getFirestore(app)
export const auth = getAuth(app)
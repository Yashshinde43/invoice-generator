import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
  runTransaction,
  getCountFromServer,
  type Firestore,
} from 'firebase/firestore'
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
}

function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) return getApp()
  return initializeApp(firebaseConfig)
}

// Singleton exports
export const firebaseApp = getFirebaseApp()
export const firestore: Firestore = getFirestore(firebaseApp)
export const auth = getAuth(firebaseApp)
export const storage = getStorage(firebaseApp)

// Firestore collection references
export const collections = {
  profiles: collection(firestore, 'profiles'),
  businesses: collection(firestore, 'businesses'),
  categories: collection(firestore, 'categories'),
  suppliers: collection(firestore, 'suppliers'),
  products: collection(firestore, 'products'),
  customers: collection(firestore, 'customers'),
  purchases: collection(firestore, 'purchases'),
  purchaseItems: collection(firestore, 'purchase_items'),
  invoices: collection(firestore, 'invoices'),
  invoiceItems: collection(firestore, 'invoice_items'),
  stockHistory: collection(firestore, 'stock_history'),
  payments: collection(firestore, 'payments'),
  expenses: collection(firestore, 'expenses'),
}

// Firestore SDK helpers (used by action files)
export const firebaseSDK = {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
}

// Auth SDK helpers
export const authSDK = {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
}

// Storage SDK helpers
export const storageSDK = {
  storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
}

// Transaction helper
export async function runSafeTransaction<T>(
  callback: (transaction: any) => Promise<T>
): Promise<T> {
  return runTransaction(firestore, callback)
}

// Count documents in a collection
export async function countDocs(collectionPath: any): Promise<number> {
  const snapshot = await getCountFromServer(collectionPath)
  return snapshot.data().count
}

// Get current user UID from session cookie (for use in server actions)
export async function getUser() {
  try {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const uid = cookieStore.get('firebase-uid')?.value

    if (!uid) {
      return { user: null, error: 'No authenticated user found' }
    }

    return {
      user: { id: uid, uid, email: '', full_name: '' },
      error: null,
    }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

export function getFirebaseConfiguredStatus() {
  return !!(firebaseConfig.apiKey && firebaseConfig.projectId)
}

export type FirestoreUser = {
  id: string
  email?: string
  full_name?: string
  role?: string
}

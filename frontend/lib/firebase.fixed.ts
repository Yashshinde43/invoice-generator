// Firebase Configuration - FIXED FOR DEVELOPMENT
// This version handles missing or invalid Firebase configurations gracefully
// Add your Firebase config to .env.local to use real Firebase

import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, increment, runTransaction, FieldValue, getCount } from 'firebase/firestore'
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User, Auth } from 'firebase/auth'
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { cookies } from 'next/headers'

// Firebase configuration - user should update with their own config
// All values default to empty strings to prevent errors
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ''
}

// Flag to indicate Firebase is properly configured
let isFirebaseConfigured = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.storageBucket
)

// Initialize Firebase (only on server-side)
function getFirebaseApp() {
  try {
    // Don't initialize if Firebase config is empty
    if (!isFirebaseConfigured) {
      console.error('Firebase not configured - .env.local missing Firebase credentials')
      return null
    }

    // Check if app already initialized in same Node.js instance
    const existingApps = getApps()
    if (existingApps.length > 0) {
      return existingApps[0]
    }
    return initializeApp(firebaseConfig)
  } catch (error: any) {
    console.error('Firebase initialization error:', error)
    if (error.message?.includes('invalid-api-key')) {
      console.error('Invalid Firebase API key - check .env.local')
      throw new Error('Firebase configuration invalid - check .env.local variables')
    }
    throw new Error('Failed to initialize Firebase')
  }
}

// Initialize Firestore (only on server-side)
function getFirebaseFirestore() {
  if (!isFirebaseConfigured) {
    console.warn('Firestore not initialized - Firebase not configured')
    return null
  }
  return getFirestore(getFirebaseApp())
}

// Initialize Firebase Storage (only on server-side)
function getFirebaseStorage() {
  if (!isFirebaseConfigured) {
    console.warn('Firebase Storage not initialized - Firebase not configured')
    return null
  }
  return getStorage(getFirebaseApp())
}

// Initialize Firebase Auth (only on server-side)
function getFirebaseAuth() {
  if (!isFirebaseConfigured) {
    console.warn('Firebase Auth not initialized - Firebase not configured')
    return null
  }
  return getAuth(getFirebaseApp())
}

// Exports - these are now null if Firebase not configured
export const firestore = getFirebaseFirestore()
export const storage = getFirebaseStorage()
export const auth = getFirebaseAuth()
export const firebaseApp = getFirebaseApp()

// Export collections only if Firebase is configured
export const collections = isFirebaseConfigured ? {
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
} : {}

// Export transaction helper (only if Firebase configured)
export async function runSafeTransaction<T>(callback: (transaction: any) => Promise<T>): Promise<T> {
  if (!isFirebaseConfigured) {
    console.warn('Cannot run transaction - Firebase not configured')
    throw new Error('Firebase not configured')
  }
  try {
    return await runTransaction(getFirebaseFirestore(), callback)
  } catch (error) {
    console.error('Transaction failed:', error)
    throw error
  }
}

// Export FieldValue helpers (only if Firebase configured)
export const firestoreFieldValue = isFirebaseConfigured ? {
  increment: increment,
  serverTimestamp: FieldValue.serverTimestamp,
  arrayUnion: FieldValue.arrayUnion,
  arrayRemove: FieldValue.arrayRemove,
} : {}

// Export helpers (only if Firebase configured)
export const getCollectionPath = (collectionName: string) => {
  if (!isFirebaseConfigured) throw new Error('Firebase not configured')
  return collection(firestore, collectionName)
}

export const getDocPath = (collectionName: string, id: string) => {
  if (!isFirebaseConfigured) throw new Error('Firebase not configured')
  return doc(firestore, collectionName, id)
}

// Auth SDK exports
export const authSDK = isFirebaseConfigured ? {
  onAuthStateChanged,
  User,
  Auth
} : {}

// Firebase SDK exports
export const firebaseSDK = isFirebaseConfigured ? {
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
  increment
} : {}

// Helper function to count documents (only if Firebase configured)
export async function countDocs(collectionPath: any) {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase not configured - cannot count documents')
  }
  try {
    const snapshot = await getCount(collectionPath)
    return snapshot.data().count
  } catch (error) {
    console.error('Count error:', error)
    throw error
  }
}

// Check if Firebase is configured
export function getFirebaseConfiguredStatus() {
  return isFirebaseConfigured
}

// Export types
export type FirestoreUser = {
  id: string
  email?: string
  full_name?: string
  role?: string
}

// Cleanup unused exports
export { initializeApp, getApps, getApp, getFirestore, collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit }

// Helper to get current user (only if Firebase configured)
export async function getUser() {
  if (!isFirebaseConfigured) {
    return {
      user: null,
      error: 'Firebase not configured in .env.local'
    }
  }

  try {
    const { auth } = await import('./firebase/auth')
    const user = auth.currentUser

    if (user) {
      return {
        user: {
          id: user.uid,
          email: user.email,
          full_name: user.displayName || '',
          uid: user.uid
        },
        error: null
      }
    }

    return { user: null, error: 'No authenticated user found' }
  } catch (error: any) {
    console.error('Get user error:', error)
    return { user: null, error: error.message }
  }
}
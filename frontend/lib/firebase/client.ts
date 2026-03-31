import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  Auth,
  setSessionCookie,
  deleteSessionCookie
} from 'firebase/auth'
import { 
  initializeApp, 
  getApps, 
  getApp, 
  getAppId,
  getFirestore,
  getStorage 
} from 'firebase/app'
import { 
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
  FieldValue 
} from 'firebase/firestore'
import { 
  getStorage as getFirebaseStorage, 
  ref as storageRef, 
  uploadBytes, 
  getDownloadURL,
  deleteObject 
} from 'firebase/storage'

// Firebase configuration - user should update with their own config  
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ''
}

// Initialize Firebase
function getFirebaseApp() {
  try {
    const existingApps = getApps()
    if (existingApps.length > 0) {
      return existingApps[0]
    }
    return initializeApp(firebaseConfig)
  } catch (error) {
    console.error('Firebase initialization error:', error)
    throw new Error('Failed to initialize Firebase')
  }
}

// Initialize Auth
function getFirebaseAuth() {
  return getAuth(getFirebaseApp())
}

// Initialize Firestore
function getFirebaseFirestore() {
  return getFirestore(getFirebaseApp())
}

// Initialize Firebase Storage
function getFirebaseStorage() {
  return getFirebaseStorage(getFirebaseApp())
}

// Export singleton instances
export const auth = getFirebaseAuth()
export const firestore = getFirebaseFirestore()
export const storage = getFirebaseStorage()
export const firebaseApp = getFirebaseApp()

// Export collections for all operations
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

// Exports for use in lib files
export const firebaseUtils = {
  increment: increment,
  serverTimestamp: FieldValue.serverTimestamp,
  arrayUnion: FieldValue.arrayUnion,
  arrayRemove: FieldValue.arrayRemove,
}

// Export functions for use in action files
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
}

// Auth functions
export const authSDK = {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setSessionCookie,
  deleteSessionCookie,
  User,
}

// Storage functions
export const storageSDK = {
  storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
}

// Export types
export type FirestoreUser = {
  id: string
  email?: string
  full_name?: string
  role?: string
}
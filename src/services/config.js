import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";
import { createClient } from "@supabase/supabase-js";

const env = import.meta.env || {};

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyDx_N4uA4Va8mS6cpBqkSDld_HH3qqIFxQ",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "lostfusion-b795e.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "lostfusion-b795e",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "lostfusion-b795e.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "378810950057",
  appId: env.VITE_FIREBASE_APP_ID || "1:378810950057:web:174ec8f1ee096de3aae4b8"
};

export const supabaseUrl = env.VITE_SUPABASE_URL || "https://padcweydrcsrzaazroan.supabase.co";
export const supabaseKey =
  env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhZGN3ZXlkcmNzcnphYXpyb2FuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MzA4NzgsImV4cCI6MjA3MzAwNjg3OH0.8T6tSA5noZerWgDd4020EG9sCD5HJjWZbRRLeQSwDoM";

export const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const googleProvider = new GoogleAuthProvider();
export const supabase = createClient(supabaseUrl, supabaseKey);

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs
};

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfigRaw from '../../firebase-applet-config.json';

// Configuration supporting both direct file config and Vercel/production environment variables
const firebaseConfig = {
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID as string) || firebaseConfigRaw.projectId,
  appId: (import.meta.env.VITE_FIREBASE_APP_ID as string) || firebaseConfigRaw.appId,
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY as string) || firebaseConfigRaw.apiKey,
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string) || firebaseConfigRaw.authDomain,
  firestoreDatabaseId: (import.meta.env.VITE_FIREBASE_DATABASE_ID as string) || firebaseConfigRaw.firestoreDatabaseId,
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string) || firebaseConfigRaw.storageBucket,
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || firebaseConfigRaw.messagingSenderId,
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firestore with custom firestoreDatabaseId (CRITICAL)
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Firebase Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Connection Test
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore is connecting in offline-first mode or waiting for initial online sync.');
    }
  }
}

testFirestoreConnection();

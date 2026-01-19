import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';


const firebaseConfig = {
  apiKey: "AIzaSyCTKSduZcqmkN2osU6aH5ZaH4rfYO5KQNA",
  authDomain: "closure-2026.firebaseapp.com",
  projectId: "closure-2026",
  storageBucket: "closure-2026.firebasestorage.app",
  messagingSenderId: "340167651716",
  appId: "1:340167651716:web:18779909d3e70fe0126dd1",
  measurementId: "G-GZ9NMNXSS6"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
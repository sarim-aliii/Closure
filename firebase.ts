import { initializeApp } from "firebase/app";

// firebase.ts
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage'; // Import compat storage

import type { FirebaseApp } from 'firebase/compat/app';
import type { Auth } from 'firebase/compat/auth';
import type { Firestore } from 'firebase/compat/firestore';
import type { FirebaseStorage } from 'firebase/compat/storage';


// TODO: Replace with your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA1mtMo7fHRlea6Og4xy8Cl6daTjq7gSEg",
  authDomain: "closure-514c6.firebaseapp.com",
  projectId: "closure-514c6",
  storageBucket: "closure-514c6.firebasestorage.app",
  messagingSenderId: "214960870905",
  appId: "1:214960870905:web:a951b4dad1a93869729928"
};

// Initialize Firebase
let app: FirebaseApp;
if (firebase.apps.length === 0) {
  app = firebase.initializeApp(firebaseConfig);
} else {
  app = firebase.app();
}

// Initialize Firebase services
const auth: Auth = firebase.auth();
const db: Firestore = firebase.firestore();
const storage: FirebaseStorage = firebase.storage(); // Use compat storage

export { auth, db, storage, app };

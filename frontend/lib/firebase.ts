import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA3EKcUniCYTYjms63MUMeL1T0sDMPdTN8",
  authDomain: "mediflow-ai-eb3a7.firebaseapp.com",
  projectId: "mediflow-ai-eb3a7",
  storageBucket: "mediflow-ai-eb3a7.firebasestorage.app",
  messagingSenderId: "99888095318",
  appId: "1:99888095318:web:76381506ec79a149569bf7",
  measurementId: "G-XHSZGWQMB2"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider };

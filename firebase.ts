import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyAo7fCpCVKiAa280RiNXGxn_rmkHeCOn04",
  authDomain: "foodeeflow-9f085.firebaseapp.com",
  projectId: "foodeeflow-9f085",
  storageBucket: "foodeeflow-9f085.firebasestorage.app",
  messagingSenderId: "1055802017641",
  appId: "1:1055802017641:web:c0cd9d324c4ff35f785ff8"
};


const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)


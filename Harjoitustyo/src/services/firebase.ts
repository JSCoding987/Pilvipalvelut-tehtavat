import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  arrayUnion, 
  arrayRemove, 
  updateDoc, 
  getDoc 
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);


export const loginEmail = (email: string, pass: string) => 
  signInWithEmailAndPassword(auth, email, pass);


export const logout = () => signOut(auth);


export const toggleFavorite = async (userId: string, lineId: string, isAdding: boolean) => {
  const userRef = doc(db, "users", userId);
  
  try {
    const docSnap = await getDoc(userRef);
    
    if (docSnap.exists()) {
     
      await updateDoc(userRef, {
        favorites: isAdding ? arrayUnion(lineId) : arrayRemove(lineId)
      });
    } else {
     
      await setDoc(userRef, {
        favorites: [lineId]
      });
    }
  } catch (err) {
    console.error("Virhe tallennettaessa suosikkeja:", err);
    throw err;
  }
};

export { onAuthStateChanged };
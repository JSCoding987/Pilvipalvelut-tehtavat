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
  apiKey: "AIzaSyDoHxt0OkouwPdW3D2fr_9zvSYlbv6lFPU",
  authDomain: "hsl-ilmoittaja.firebaseapp.com",
  projectId: "hsl-ilmoittaja",
  storageBucket: "hsl-ilmoittaja.firebasestorage.app",
  messagingSenderId: "784470359267",
  appId: "1:784470359267:web:83a40d1e479c49b08459d6"
};

// Alustetaan Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

/**
 * Kirjautumistoiminto
 */
export const loginEmail = (email: string, pass: string) => 
  signInWithEmailAndPassword(auth, email, pass);

/**
 * Uloskirjautuminen
 */
export const logout = () => signOut(auth);

/**
 * Suosikkien hallinta Firestoreen.
 * Lisää tai poistaa linjan nimen käyttäjän dokumentista.
 */
export const toggleFavorite = async (userId: string, lineId: string, isAdding: boolean) => {
  const userRef = doc(db, "users", userId);
  
  try {
    const docSnap = await getDoc(userRef);
    
    if (docSnap.exists()) {
      // Päivitetään olemassa olevaa listaa
      await updateDoc(userRef, {
        favorites: isAdding ? arrayUnion(lineId) : arrayRemove(lineId)
      });
    } else {
      // Luodaan uusi dokumentti, jos sitä ei vielä ole
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
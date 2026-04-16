import { useState, useEffect } from 'react'
import './App.css'

// Firebase-tuonnit
import { onAuthStateChanged, User } from "firebase/auth";
import LoginForm from "./LoginForm";
import { auth, logout } from "./authService";

function App() {
  const [codename, setCodename] = useState('');
  // Firebase-käyttäjän tila
  const [user, setUser] = useState<User | null>(null);

  // Koodinimen generointi
  const generateCodename = () => {
    const adjectives = ["Sneaky", "Electric", "Silent", "Hyper", "Cosmic"];
    const animals = ["Fox", "Panda", "Lizard", "Dragon", "Hawk"];
    const number = Math.floor(Math.random() * 3000);

    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const animal = animals[Math.floor(Math.random() * animals.length)];

    return `${adj}${animal}${number}`;
  };

  // Seurataan kirjautumistilaa
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });

    return () => unsubscribe();
  }, []);

  // Hallitaan koodinimeä
  useEffect(() => {
    const cachedName = localStorage.getItem("codename");

    if (cachedName) {
      setCodename(cachedName);
    } else {
      const newName = generateCodename();
      setCodename(newName);
      localStorage.setItem("codename", newName);
    }
  }, []);

  return (
    <div className="container">
      <h1>Koodinimi-sovellus</h1>

      {user ? (
        /* Näytetään tämä, kun käyttäjä on kirjautunut sisään */
        <div className="logged-in-view">
          <div className="auth-status">
            <p>👋 Tervetuloa, <strong>{user.email}</strong></p>
            <button onClick={logout} className="logout-button">Kirjaudu ulos</button>
          </div>

          <div className="display-card">
            <p>Koodinimesi on:</p>
            <h2 className="codename">{codename}</h2>
          </div>

          <p className="info-text">
            Koodinimesi on tallennettu selaimen muistiin (Local Storage). 
            Se säilyy samana, vaikka lataisit sivun uudelleen.
          </p>
        </div>
      ) : (
        /* Näytetään kirjautumislomake, jos käyttäjää ei ole */
        <div className="login-view">
          <p>Kirjaudu sisään nähdäksesi koodinimesi.</p>
          <LoginForm />
        </div>
      )}
    </div>
  )
}

export default App;
import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [codename, setCodename] = useState('');


  const generateCodename = () => {
    const adjectives = ["Sneaky", "Electric", "Silent", "Hyper", "Cosmic"];
    const animals = ["Fox", "Panda", "Lizard", "Dragon", "Hawk"];
    const number = Math.floor(Math.random() * 3000);

    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const animal = animals[Math.floor(Math.random() * animals.length)];

    return `${adj}${animal}${number}`;
  };

  
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

  
  const handleNewName = () => {
    const newName = generateCodename();
    setCodename(newName);
    localStorage.setItem("codename", newName);
  };

  return (
    <div className="container">
      <h1>Koodinimi-sovellus</h1>
      
      <div className="display-card">
        <p>Tervetuloa takaisin! Sinun koodinimesi on:</p>
        <h2 className="codename">{codename}</h2>
      </div>

      <button onClick={handleNewName} className="btn-primary">
        Haluatko uuden nimen?
      </button>

      <p className="footer-info">
        Nimesi tallentuu poistumisen jälkeen
      </p>
    </div>
  )
}

export default App
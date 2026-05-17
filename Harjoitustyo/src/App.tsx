import { useEffect, useState } from 'react';
import { fetchHslAlerts } from './services/hslApi';
import { 
  auth, 
  db, 
  loginEmail, 
  logout, 
  onAuthStateChanged, 
  toggleFavorite 
} from './services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { 
  AlertTriangle, 
  Bus, 
  Info, 
  Loader2, 
  Search, 
  LogOut, 
  Moon, 
  Sun, 
  Star, 
  FileText
} from 'lucide-react';
import './App.css';

interface HslAlert {
  alertHeaderText: string;
  alertDescriptionText: string;
  alertSeverityLevel: string;
  route?: { shortName: string; mode: string; };
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [alerts, setAlerts] = useState<HslAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setLoading(true);
        fetchHslAlerts()
          .then(setAlerts)
          .catch(() => showToast("Häiriötietojen haku epäonnistui"))
          .finally(() => setLoading(false));
        
        const userRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          setFavorites(docSnap.data().favorites || []);
        }
      } else {
        setLoading(false);
        setFavorites([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      await loginEmail(email, password);
      showToast("Tervetuloa takaisin!");
    } catch (err: any) {
      setAuthError("Kirjautuminen epäonnistui. Tarkista tunnukset.");
    }
  };

  const handleFavoriteToggle = async (lineId: string) => {
    if (!user) return;
    const isFav = favorites.includes(lineId);
    const newFavs = isFav ? favorites.filter(id => id !== lineId) : [...favorites, lineId];
    
    setFavorites(newFavs);
    if (newFavs.length === 0) setShowOnlyFavorites(false);

    await toggleFavorite(user.uid, lineId, !isFav);
    showToast(isFav ? `Poistettu: ${lineId}` : `Lisätty: ${lineId}`);
  };

  const filteredAlerts = alerts
    .filter(a => {
      const name = a.route?.shortName || '';
      if (showOnlyFavorites && !favorites.includes(name)) return false;
      return name.toLowerCase().includes(searchQuery.toLowerCase()) || 
             a.alertHeaderText.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .filter((a, i, self) => i === self.findIndex(t => t.alertDescriptionText === a.alertDescriptionText));

  const totalAlertsCount = alerts.length;
  const favoritesInAlertsCount = alerts.filter(a => a.route?.shortName && favorites.includes(a.route.shortName)).length;

  if (!user) {
    return (
      <div className="login-overlay">
        <div className="login-card animate-in">
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <Bus size={48} color="#007ac9" />
            <h1 style={{ color: '#007ac9', marginTop: '10px' }}>Häiriövahti</h1>
          </div>
          <form onSubmit={handleAuth} className="login-form">
            <input type="email" placeholder="Sähköposti" className="login-input" value={email} onChange={e => setEmail(e.target.value)} required />
            <input type="password" placeholder="Salasana" className="login-input" value={password} onChange={e => setPassword(e.target.value)} required />
            {authError && <div className="auth-error-box">{authError}</div>}
            <button type="submit" className="primary-button">Kirjaudu</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {toast && <div className="toast">{toast}</div>}
      
      <header className="app-header">
        <div className="header-left">
          <Bus size={32} color="#007ac9" />
          <h2 style={{ color: 'var(--text-color)' }}>Häiriövahti</h2>
        </div>
        <div className="header-right">
          <a href="./raportti.html" className="icon-button" title="Projektidokumentaatio">
            <FileText size={20} />
          </a>
          <button onClick={() => setDarkMode(!darkMode)} className="icon-button" title="Vaihda teemaa">
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={logout} className="icon-button logout" title="Kirjaudu ulos">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <div className="search-container">
        <Search className="search-icon" size={20} />
        <input 
          type="text" 
          placeholder="Etsi linjaa..." 
          className="search-input" 
          value={searchQuery} 
          onChange={e => setSearchQuery(e.target.value)} 
        />
      </div>

      <div className="stats-row" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        padding: '0 5px 10px 5px',
        fontSize: '0.9rem',
        opacity: 0.8,
        fontWeight: '500'
      }}>
        <span>Häiriöitä yhteensä: {totalAlertsCount}</span>
        <span>Omien linjojen Häiriöt: {favoritesInAlertsCount}</span>
      </div>

      <button 
        disabled={favorites.length === 0}
        onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
        className="primary-button"
        style={{ width: '100%', marginBottom: '20px', backgroundColor: showOnlyFavorites ? '#ffc107' : '#007ac9' }}
      >
        {showOnlyFavorites ? '★ Omat Linjat' : '☆ Suodata Linjat'}
      </button>

      {loading ? (
        <div className="center-loading">
          <Loader2 className="animate-spin" size={40} color="#007ac9" />
          <p style={{ marginTop: '10px', opacity: 0.7 }}>Haetaan häiriötietoja...</p>
        </div>
      ) : (
        <main className="alert-list animate-in">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert, index) => (
              <div key={index} className={`alert-card ${alert.alertSeverityLevel === 'SEVERE' ? 'severe' : 'info'}`}>
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge">{alert.route?.shortName || 'INFO'}</span>
                  
                  {/* Info ja Tähti rinnakkain oikealla reunalla */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {alert.route?.shortName && (
                      <Star 
                        size={22} 
                        onClick={() => handleFavoriteToggle(alert.route!.shortName)}
                        style={{ 
                          cursor: 'pointer', 
                          fill: favorites.includes(alert.route.shortName) ? '#ffc107' : 'none', 
                          color: favorites.includes(alert.route.shortName) ? '#ffc107' : '#ccc' 
                        }} 
                      />
                    )}
                    {alert.alertSeverityLevel === 'SEVERE' ? <AlertTriangle color="#e53e3e" size={20} /> : <Info color="#007ac9" size={20} />}
                  </div>
                </div>
             <h3>{alert.alertHeaderText}</h3>
            <p>{alert.alertDescriptionText}</p>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>
              <Bus size={48} style={{ marginBottom: '10px' }} />
              <p>Ei häiriöitä valitulla suodatuksella.</p>
            </div>
          )}
        </main>
      )}
    </div>
  );
}

export default App;
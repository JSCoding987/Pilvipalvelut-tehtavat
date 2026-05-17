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
  FileText, 
  ChevronLeft 
} from 'lucide-react';
import './App.css';

interface HslAlert {
  alertHeaderText: string;
  alertDescriptionText: string;
  alertSeverityLevel: string;
  route?: { shortName: string; mode: string; };
}

function App() {
  // --- TILA-MUUTTUJAT ---
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [view, setView] = useState<'main' | 'docs'>('main');
  const [alerts, setAlerts] = useState<HslAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // --- APUFUNKTIOT ---
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

  // --- KIRJAUTUMISEN KÄSITTELY ---
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    
    try {
      await loginEmail(email, password);
      showToast("Tervetuloa takaisin!");
    } catch (err: any) {
      switch (err.code) {
        case 'auth/invalid-credential':
          setAuthError("Väärä sähköpostiosoite tai salasana.");
          break;
        case 'auth/too-many-requests':
          setAuthError("Liian monta yritystä. Yritä hetken kuluttua uudelleen.");
          break;
        default:
          setAuthError("Kirjautuminen epäonnistui.");
      }
    }
  };

  const handleFavoriteToggle = async (lineId: string) => {
    if (!user) return;
    const isFav = favorites.includes(lineId);
    const newFavs = isFav ? favorites.filter(id => id !== lineId) : [...favorites, lineId];
    
    setFavorites(newFavs);

    // KORJAUS: Jos suosikit loppuvat, kytketään suodatus automaattisesti pois päältä
    if (newFavs.length === 0) {
      setShowOnlyFavorites(false);
    }

    await toggleFavorite(user.uid, lineId, !isFav);
    showToast(isFav ? `Poistettu: ${lineId}` : `Lisätty: ${lineId}`);
  };

  // --- SUODATUSLOGIIKKA ---
  const filteredAlerts = alerts
    .filter(a => {
      const name = a.route?.shortName || '';
      if (showOnlyFavorites && !favorites.includes(name)) return false;
      return name.toLowerCase().includes(searchQuery.toLowerCase()) || 
             a.alertHeaderText.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .filter((a, i, self) => i === self.findIndex(t => t.alertDescriptionText === a.alertDescriptionText));

  const favAlertsCount = alerts.filter(a => a.route?.shortName && favorites.includes(a.route.shortName)).length;

  // --- KIRJAUTUMISNÄKYMÄ ---
  if (!user) {
    return (
      <div className="login-overlay">
        <div className="login-card animate-in">
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <Bus size={48} color="#007ac9" />
            <h1 style={{ color: '#007ac9', marginTop: '10px' }}>Häiriövahti</h1>
            <p>Kirjaudu sisään hallinnoidaksesi suosikkejasi</p>
          </div>
          <form onSubmit={handleAuth} className="login-form">
            <input 
              type="email" 
              placeholder="Sähköposti" 
              className="login-input" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
            <input 
              type="password" 
              placeholder="Salasana" 
              className="login-input" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
            {authError && (
              <div className="auth-error-box">
                <AlertTriangle size={14} style={{ marginRight: '5px' }} />
                {authError}
              </div>
            )}
            <button type="submit" className="primary-button">Kirjaudu</button>
          </form>
        </div>
      </div>
    );
  }

  // --- PÄÄNÄKYMÄ ---
  return (
    <div className="app-container">
      {toast && <div className="toast">{toast}</div>}
      
      <header className="app-header">
        <div className="header-left">
          <Bus size={32} color="#007ac9" />
          <h2 
            onClick={() => setView('main')} 
            style={{ cursor: 'pointer', color: 'var(--text-color)' }}
          >
            Häiriövahti
          </h2>
        </div>
        <div className="header-right">
          <button onClick={() => setView(view === 'main' ? 'docs' : 'main')} className="icon-button" title="Dokumentaatio">
            {view === 'main' ? <FileText size={20} /> : <ChevronLeft size={20} />}
          </button>
          <button onClick={() => setDarkMode(!darkMode)} className="icon-button">
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={logout} className="icon-button logout"><LogOut size={20} /></button>
        </div>
      </header>

      {view === 'docs' ? (
        <div className="docs-content animate-in">
          <h2 className="docs-title">Projektidokumentaatio & Testaus</h2>
          <section>
            <h3>1. Projektin kuvaus</h3>
            <p>React-pohjainen sovellus HSL-häiriöiden seurantaan reaaliajassa.</p>
          </section>
          <section className="test-report-section">
            <h3>2. TESTAUSRAPORTTI</h3>
            <table className="test-table">
              <thead>
                <tr><th>Testitapaus</th><th>Status</th></tr>
              </thead>
              <tbody>
                <tr><td>Kirjautumisvirheet</td><td className="status-ok">✅ HYVÄKSYTTY</td></tr>
                <tr><td>Suosikkien tallennus</td><td className="status-ok">✅ HYVÄKSYTTY</td></tr>
                <tr><td>Dark Mode</td><td className="status-ok">✅ HYVÄKSYTTY</td></tr>
                <tr><td>Tyhjän suosikkilistan hallinta</td><td className="status-ok">✅ HYVÄKSYTTY</td></tr>
              </tbody>
            </table>
          </section>
          <button onClick={() => setView('main')} className="primary-button" style={{ marginTop: '20px' }}>Palaa sovellukseen</button>
        </div>
      ) : (
        <>
          <div className="stats-bar">
            <div><strong>{alerts.length}</strong> Häiriötä</div>
            <div><strong>{favorites.length}</strong> Seurattua</div>
            <div><strong>{favAlertsCount}</strong> Omaa häiriötä</div>
          </div>

          <div className="search-container">
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              placeholder="Etsi linjaa tai häiriötä..." 
              className="search-input" 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <button 
              disabled={favorites.length === 0}
              onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
              className="primary-button"
              style={{ 
                width: '100%', 
                backgroundColor: favorites.length === 0 ? '#ccc' : (showOnlyFavorites ? '#ffc107' : '#007ac9'),
                color: favorites.length === 0 ? '#666' : (showOnlyFavorites ? '#000' : '#fff'),
                cursor: favorites.length === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              {showOnlyFavorites ? '★ Näytetään vain suosikit' : '☆ Suodata omat suosikit'}
            </button>
          </div>

          {loading ? (
            <div className="center-loading"><Loader2 className="animate-spin" size={40} /></div>
          ) : (
            <main className="alert-list animate-in">
              {filteredAlerts.map((alert, index) => (
                <div key={index} className={`alert-card ${alert.alertSeverityLevel === 'SEVERE' ? 'severe' : 'info'}`}>
                  <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span className="badge">{alert.route?.shortName || 'INFO'}</span>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      
                      {alert.route?.shortName ? (
                        <Star 
                          size={24} 
                          onClick={() => handleFavoriteToggle(alert.route!.shortName)}
                          style={{ 
                            cursor: 'pointer', 
                            fill: favorites.includes(alert.route.shortName) ? '#ffc107' : 'none',
                            color: favorites.includes(alert.route.shortName) ? '#ffc107' : '#ccc' 
                          }} 
                        />
                      ) : (
                        <div style={{ width: '24px' }}></div>
                      )}

                      {alert.alertSeverityLevel === 'SEVERE' ? (
                        <AlertTriangle color="#e53e3e" size={20} />
                      ) : (
                        <Info color="#007ac9" size={20} />
                      )}
                    </div>
                  </div>
                  <h3>{alert.alertHeaderText}</h3>
                  <p>{alert.alertDescriptionText}</p>
                </div>
              ))}
            </main>
          )}
        </>
      )}
    </div>
  );
}

export default App;
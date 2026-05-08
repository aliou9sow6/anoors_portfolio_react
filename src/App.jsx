import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Link } from 'react-router-dom';
import Dossier from './components/Dossier';
import Accueil from './components/Accueil';
import Contact from './components/Contact';

function App() {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <div className="header-inner">
            <Link to="/" className="logo">
              <img
                src="/assets/profile.png"
                alt="Logo Portfolio"
                className="logo-image"
              />
              <span className="logo-dot" />
              <span className="logo-text">aliouSow</span>
            </Link>

            {/* navigation */}
            <div className="header-nav">
              <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Accueil
              </NavLink>
              <NavLink to="/projets" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Projets
              </NavLink>
              <NavLink to="/contact" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Contact
              </NavLink>
            </div>
          </div>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<Accueil />} />
            <Route path="/projets" element={<Dossier />} />
            <Route path="/projets/:id" element={<Dossier />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<Accueil />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <span>© 2024 Portfolio · Propulsé par React &amp; json-server</span>
        </footer>
      </div>
    </Router>
  );
}

export default App;

import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import DesignMaster from './components/DesignMaster';
import CompanyMaster from './components/CompanyMaster';
import CourierMaster from './components/CourierMaster';
import ReturnMaster from './components/ReturnMaster';
import ReturnDetailedEntry from './components/ReturnDetailedEntry';
import ShareReportMaster from './components/ShareReportMaster';
import Login from './components/Login';
import Billing from './components/Billing';
import BillingQueryComponent from './components/BillingQueryComponent';
import PortalMaster from './components/PortalMaster';

import PortalIdManager from './components/PortalIdManager';



function App() {
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  if (!user) return <Login setUser={setUser} />;

  return (
    <Router>
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.title}>📦 Balika Creations</h1>
          <p style={styles.userInfo}>Logged in as <strong>{user.username}</strong></p>
          <button
            style={styles.toggleButton}
            onClick={() => setShowMenu(!showMenu)}
          >
            ☰ Menu
          </button>
        </header>

        {showMenu && (
          <nav style={styles.nav}>
		            <Link style={styles.navLink} to="/design" onClick={() => setShowMenu(false)}>Design Master</Link>
            <Link style={styles.navLink} to="/company" onClick={() => setShowMenu(false)}>Company Master</Link>
		<Link style={styles.navLink} to="/portal" onClick={() => setShowMenu(false)}>Portal Master</Link> 
		<Link style={styles.navLink} to="/portalidmanager" onClick={() => setShowMenu(false)}>Portal Login Id </Link> 

            <Link style={styles.navLink} to="/courier" onClick={() => setShowMenu(false)}>Courier Master</Link>
		<Link style={styles.navLink} to="/Billing" onClick={() => setShowMenu(false)}>Billing</Link>
			<Link style={styles.navLink} to="/BillingQueryComponent" onClick={() => setShowMenu(false)}>Billing Dashboard</Link>
            <Link style={styles.navLink} to="/return" onClick={() => setShowMenu(false)}>Return Master</Link>
            <Link style={styles.navLink} to="/return-detailed-entry" onClick={() => setShowMenu(false)}>Return Detailed Entry</Link>
            <Link style={styles.navLink} to="/share-report" onClick={() => setShowMenu(false)}>Share Report</Link>
          </nav>
        )}

        <main style={styles.main}>
          <Routes>
		
            <Route path="/" element={<ReturnMaster user={user} />} />
            <Route path="/design" element={<DesignMaster />} />
            <Route path="/company" element={<CompanyMaster />} />
 		<Route path="/portal" element={<PortalMaster />} />
		<Route path="/portalidmanager" element={<PortalIdManager />} />
            <Route path="/courier" element={<CourierMaster />} />
		<Route path="/billing" element={<Billing />} />
		<Route path="/billingquerycomponent" element={<BillingQueryComponent />} />

            <Route path="/return" element={<ReturnMaster user={user} />} />
            <Route path="/return-detailed-entry" element={<ReturnDetailedEntry user={user} />} />
            <Route path="/share-report" element={<ShareReportMaster user={user} />} />
            <Route path="*" element={<ReturnMaster user={user} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

const styles = {
  container: {
    fontFamily: 'Segoe UI, sans-serif',
    padding: '10px',
    maxWidth: '100%',
    backgroundColor: '#f9f9f9',
    minHeight: '100vh',
  },
  header: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '15px 20px',
    borderRadius: '5px',
    position: 'relative',
  },
  title: {
    margin: 0,
    fontSize: '1.6rem',
  },
  userInfo: {
    margin: '5px 0 0 0',
    fontSize: '0.9rem',
  },
  toggleButton: {
    position: 'absolute',
    top: '15px',
    right: '20px',
    fontSize: '1.2rem',
    background: 'transparent',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
  },
  nav: {
    backgroundColor: '#e9ecef',
    padding: '10px 15px',
    marginTop: '10px',
    borderRadius: '5px',
    display: 'flex',
    flexDirection: 'column',
  },
  navLink: {
    marginBottom: '8px',
    textDecoration: 'none',
    color: '#007bff',
    fontWeight: '500',
  },
  main: {
    marginTop: '20px',
    padding: '10px',
    backgroundColor: 'white',
    borderRadius: '5px',
    minHeight: '60vh',
    boxShadow: '0 0 5px rgba(0,0,0,0.1)',
  },
};

export default App;

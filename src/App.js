import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  Navigate,
  useLocation,
} from 'react-router-dom';

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
import SalesTrend from './components/Sales Trend';
import BillModify from './components/BillModify';
import PurchaseDashboard from './components/purchase/PurchaseDashboard';
import PurchaseEntry from './components/purchase/PurchaseEntry';

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (mode === 'ecommerce') navigate('/salestrend');
    if (mode === 'purchase') navigate('/purchase-dashboard');
  }, [mode]);

  if (!user) return <Login setUser={setUser} />;

  if (!mode) {
    return (
      <div style={styles.modeSelector}>
        <h2>Select Mode</h2>
        <button style={styles.modeButton} onClick={() => setMode('ecommerce')}>
          🛒 Ecommerce
        </button>
        <button style={styles.modeButton} onClick={() => setMode('purchase')}>
          📦 Purchase
        </button>
      </div>
    );
  }

  const ecommerceLinks = [
    { to: '/salestrend', label: 'Sales Trend' },
    { to: '/design', label: 'Design Master' },
    { to: '/company', label: 'Company Master' },
    { to: '/portal', label: 'Portal Master' },
    { to: '/portalidmanager', label: 'Portal Login ID' },
    { to: '/courier', label: 'Courier Master' },
    { to: '/billing', label: 'Billing' },
    { to: '/billingquerycomponent', label: 'Billing Dashboard' },
    { to: '/billmodify', label: 'Bill Edit/Delete' },
    { to: '/return', label: 'Return Master' },
    { to: '/return-detailed-entry', label: 'Return Detailed Entry' },
    { to: '/share-report', label: 'Share Report' },
  ];

  const purchaseLinks = [
    { to: '/purchase-dashboard', label: 'Purchase Dashboard' },
    { to: '/purchase-entry', label: 'Purchase Entry' },
  ];

  const navLinks = mode === 'ecommerce' ? ecommerceLinks : purchaseLinks;

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={styles.brand}>
          <h2 style={styles.title}>📦 Balika Creations</h2>
          <span style={styles.username}>Logged in as <strong>{user.username}</strong></span>
        </div>
        {isMobile && (
          <button
            style={styles.toggleButton}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            ☰
          </button>
        )}
        {(menuOpen || !isMobile) && (
          <nav style={styles.nav}>
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  ...styles.navItem,
                  ...(location.pathname === link.to ? styles.activeNavItem : {}),
                }}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <button style={styles.changeModeBtn} onClick={() => setMode('')}>
              🔁 Change Mode
            </button>
          </nav>
        )}
      </header>

      <main style={styles.main}>
        <Routes>
          {mode === 'ecommerce' && (
            <>
              <Route path="/" element={<Navigate to="/salestrend" />} />
              <Route path="/salestrend" element={<SalesTrend user={user} />} />
              <Route path="/design" element={<DesignMaster />} />
              <Route path="/company" element={<CompanyMaster />} />
              <Route path="/portal" element={<PortalMaster />} />
              <Route path="/portalidmanager" element={<PortalIdManager />} />
              <Route path="/courier" element={<CourierMaster />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/billingquerycomponent" element={<BillingQueryComponent />} />
              <Route path="/billmodify" element={<BillModify />} />
              <Route path="/return" element={<ReturnMaster user={user} />} />
              <Route path="/return-detailed-entry" element={<ReturnDetailedEntry user={user} />} />
              <Route path="/share-report" element={<ShareReportMaster user={user} />} />
            </>
          )}
          {mode === 'purchase' && (
            <>
              <Route path="/" element={<Navigate to="/purchase-dashboard" />} />
              <Route path="/purchase-dashboard" element={<PurchaseDashboard />} />
              <Route path="/purchase-entry" element={<PurchaseEntry />} />
            </>
          )}
        </Routes>
      </main>
    </div>
  );
}

const styles = {
  app: {
    fontFamily: 'Arial, sans-serif',
    background: '#f0f2f5',
    minHeight: '100vh',
  },
  header: {
    background: '#1d3557',
    padding: '10px 20px',
    color: '#fff',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    margin: 0,
    fontSize: '1.7rem',
    color: '#ffe66d',
  },
  username: {
    fontSize: '0.9rem',
    color: '#ccc',
  },
  toggleButton: {
    fontSize: '1.8rem',
    background: 'none',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    display: 'block',
  },
  nav: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: '10px',
  },
  navItem: {
    margin: '5px',
    padding: '10px 16px',
    background: '#a8dadc',
    color: '#000',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: 'bold',
    transition: '0.3s',
  },
  activeNavItem: {
    background: '#f4a261',
    fontWeight: 'bold',
  },
  changeModeBtn: {
    margin: '5px',
    padding: '10px 16px',
    background: '#e63946',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  main: {
    padding: '20px',
  },
  modeSelector: {
    textAlign: 'center',
    marginTop: '100px',

 
  },
  modeButton: {
    padding: '20px 40px',
    margin: '20px',
    fontSize: '22px',
    background: '#457b9d',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    width: '250px',
    boxShadow: '2px 2px 12px rgba(0,0,0,0.2)',
    transition: 'transform 0.2s ease',
  },
};

export default AppWrapper;

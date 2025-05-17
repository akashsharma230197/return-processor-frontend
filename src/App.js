import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import DesignMaster from './components/DesignMaster';
import CompanyMaster from './components/CompanyMaster';
import CourierMaster from './components/CourierMaster';
import ReturnMaster from './components/ReturnMaster';
import ReturnDetailedEntry from './components/ReturnDetailedEntry';
import ShareReportMaster from './components/ShareReportMaster'; // ✅ Import Share Report
import Login from './components/Login';

function App() {
  const [user, setUser] = useState(null);

  if (!user) return <Login setUser={setUser} />;

  return (
    <Router>
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>Return Processor App (Logged in as {user.username})</h1>

        <nav style={{ marginBottom: '20px' }}>
          <Link to="/design" style={{ marginRight: '15px' }}>Design Master</Link>
          <Link to="/company" style={{ marginRight: '15px' }}>Company Master</Link>
          <Link to="/courier" style={{ marginRight: '15px' }}>Courier Master</Link>
          <Link to="/return" style={{ marginRight: '15px' }}>Return Master</Link>
          <Link to="/return-detailed-entry" style={{ marginRight: '15px' }}>Return Detailed Entry</Link>
          <Link to="/share-report">Share Report</Link> {/* ✅ New nav link */}
        </nav>

        <Routes>
          <Route path="/design" element={<DesignMaster />} />
          <Route path="/company" element={<CompanyMaster />} />
          <Route path="/courier" element={<CourierMaster />} />
          <Route path="/return" element={<ReturnMaster user={user} />} />
          <Route path="/return-detailed-entry" element={<ReturnDetailedEntry user={user} />} />
          <Route path="/share-report" element={<ShareReportMaster user={user} />} /> {/* ✅ New route */}
          <Route path="*" element={<div>Select a master from the menu above.</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = 'https://return-processor-backend.onrender.com';

function PortalMaster() {
  const [portal, setPortal] = useState('');
  const [portals, setPortals] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPortals();
  }, []);

  const fetchPortals = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/api/data/portal`);
      const sorted = res.data.map(p => p.portal).sort((a, b) => a.localeCompare(b));
      setPortals(sorted);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching portals:', err);
      setMessage('❌ Failed to load portals');
      setLoading(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!portal.trim()) {
      setMessage('⚠️ Portal name cannot be empty.');
      return;
    }

    try {
      await axios.post(`${BACKEND_URL}/api/data/portal`, { portal: portal.trim() });
      setMessage('✅ Portal added successfully');
      setPortal('');
      fetchPortals();
    } catch (err) {
      console.error('Error adding portal:', err);
      setMessage('❌ Failed to add portal');
    }
  };

  const handleDelete = async (name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/data/portal/${encodeURIComponent(name)}`);
      setMessage(`🗑️ Deleted "${name}"`);
      fetchPortals();
    } catch (err) {
      console.error('Error deleting portal:', err);
      setMessage('❌ Failed to delete portal');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>🌐 Portal Master</h2>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          value={portal}
          onChange={e => setPortal(e.target.value)}
          placeholder="Enter Portal Name"
          style={styles.input}
        />
        <button type="submit" style={styles.button}>➕ Add</button>
      </form>

      {message && <p style={styles.message}>{message}</p>}

      <div style={styles.listContainer}>
        <h3 style={styles.subheading}>📋 List of Portals</h3>
        {loading ? (
          <p>Loading portals...</p>
        ) : (
          portals.length === 0 ? (
            <p style={{ color: 'gray' }}>No portals added yet.</p>
          ) : (
            <ul style={styles.list}>
              {portals.map((p, idx) => (
                <li key={idx} style={styles.listItem}>
                  <span>{p}</span>
                  <button
                    onClick={() => handleDelete(p)}
                    style={styles.deleteButton}
                    title="Delete portal"
                  >
                    ❌
                  </button>
                </li>
              ))}
            </ul>
          )
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '600px',
    margin: 'auto',
    padding: '20px',
    fontFamily: 'Segoe UI, sans-serif',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0,0,0,0.08)',
  },
  heading: {
    textAlign: 'center',
    fontSize: '1.8rem',
    marginBottom: '20px',
    color: '#333',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '20px',
  },
  input: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  button: {
    padding: '10px',
    backgroundColor: '#007bff',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '16px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  message: {
    textAlign: 'center',
    fontSize: '15px',
    color: '#555',
    marginTop: '10px',
  },
  listContainer: {
    marginTop: '20px',
  },
  subheading: {
    fontSize: '1.2rem',
    marginBottom: '10px',
  },
  list: {
    listStyleType: 'none',
    padding: 0,
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    borderBottom: '1px solid #eee',
    fontSize: '15px',
  },
  deleteButton: {
    background: 'transparent',
    color: 'red',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
  },
};

export default PortalMaster;

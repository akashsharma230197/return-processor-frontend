import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BASE_URL = 'https://return-processor-backend.onrender.com/api/data';

const DesignMaster = () => {
  const [designs, setDesigns] = useState([]);
  const [newDesign, setNewDesign] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  const fetchDesigns = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/Design`);
      setDesigns(response.data);
    } catch (error) {
      console.error('Error fetching designs:', error);
    }
  };

  const handleAddDesign = async () => {
    if (!newDesign.trim()) return alert("Design can't be empty");
    try {
      await axios.post(`${BASE_URL}/Design`, { design: newDesign.trim() });
      setNewDesign('');
      fetchDesigns();
    } catch (error) {
      console.error('Error adding design:', error.response?.data || error.message);
      alert('Failed to add design');
    }
  };

  const handleDeleteDesign = async (designValue) => {
    try {
      await axios.delete(`${BASE_URL}/Design/${encodeURIComponent(designValue)}`);
      fetchDesigns();
    } catch (error) {
      console.error('Error deleting design:', error);
    }
  };

  useEffect(() => {
    fetchDesigns();
  }, []);

  const styles = {
    wrapper: {
      fontFamily: 'Segoe UI, sans-serif',
      backgroundColor: darkMode ? '#121212' : '#f5f5f5',
      color: darkMode ? '#fff' : '#333',
      minHeight: '100vh',
      padding: '40px 20px',
      transition: 'all 0.3s ease',
    },
    container: {
      maxWidth: '500px',
      margin: '0 auto',
      backgroundColor: darkMode ? '#1e1e1e' : '#fff',
      padding: '20px',
      borderRadius: '10px',
      boxShadow: darkMode
        ? '0 0 10px rgba(255,255,255,0.1)'
        : '0 0 10px rgba(0,0,0,0.1)',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
    },
    toggleButton: {
      padding: '6px 12px',
      borderRadius: '6px',
      border: 'none',
      backgroundColor: darkMode ? '#444' : '#ddd',
      color: darkMode ? '#fff' : '#000',
      cursor: 'pointer',
    },
    inputGroup: {
      display: 'flex',
      marginBottom: '20px',
    },
    input: {
      flex: 1,
      padding: '10px',
      border: `1px solid ${darkMode ? '#555' : '#ccc'}`,
      borderRadius: '6px 0 0 6px',
      backgroundColor: darkMode ? '#2a2a2a' : '#fff',
      color: darkMode ? '#fff' : '#000',
    },
    addButton: {
      padding: '10px 16px',
      backgroundColor: '#28a745',
      color: '#fff',
      border: 'none',
      borderRadius: '0 6px 6px 0',
      cursor: 'pointer',
    },
    list: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
    },
    listItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 0',
      borderBottom: `1px solid ${darkMode ? '#333' : '#eee'}`,
    },
    deleteButton: {
      padding: '6px 12px',
      backgroundColor: '#dc3545',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
    },
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>Design Master</h2>
          <button style={styles.toggleButton} onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>

        <div style={styles.inputGroup}>
          <input
            type="text"
            placeholder="Enter new design"
            value={newDesign}
            onChange={(e) => setNewDesign(e.target.value)}
            style={styles.input}
          />
          <button style={styles.addButton} onClick={handleAddDesign}>
            Add
          </button>
        </div>

        <ul style={styles.list}>
          {designs.map((item, index) => (
            <li key={index} style={styles.listItem}>
              <span>{item.design}</span>
              <button
                style={styles.deleteButton}
                onClick={() => handleDeleteDesign(item.design)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DesignMaster;

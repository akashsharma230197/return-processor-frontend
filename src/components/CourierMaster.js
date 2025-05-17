import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = 'https://return-processor-backend.onrender.com/api/data';

const CourierMaster = () => {
  const [couriers, setCouriers] = useState([]);
  const [newCourier, setNewCourier] = useState('');

  useEffect(() => {
    fetchCouriers();
  }, []);

  const fetchCouriers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/courier`);
	const sorted = res.data.sort((a, b) => a.courier.localeCompare(b.courier));

      setCouriers(sorted);
    } catch (err) {
      console.error('Error fetching couriers:', err);
    }
  };

  const addCourier = async () => {
    if (!newCourier.trim()) return;
    try {
      await axios.post(`${BASE_URL}/courier`, { courier: newCourier.trim() });
      setNewCourier('');
      fetchCouriers();
    } catch (err) {
      console.error('Error adding courier:', err);
    }
  };

  const deleteCourier = async (name) => {
    try {
      await axios.delete(`${BASE_URL}/courier/${name}`);
      fetchCouriers();
    } catch (err) {
      console.error('Error deleting courier:', err);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>🚚 Courier Master</h2>

      <div style={styles.inputGroup}>
        <input
          type="text"
          value={newCourier}
          onChange={(e) => setNewCourier(e.target.value)}
          placeholder="Enter courier name"
          style={styles.input}
        />
        <button onClick={addCourier} style={styles.addButton}>➕ Add</button>
      </div>

      <ul style={styles.list}>
        {couriers.map((item, index) => (
          <li key={index} style={styles.listItem}>
            <span>{item.courier}</span>
            <button
              onClick={() => deleteCourier(item.courier)}
              style={styles.deleteButton}
            >
              ❌
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '500px',
    margin: 'auto',
    padding: '20px',
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    boxShadow: '0 0 12px rgba(0, 0, 0, 0.1)',
    fontFamily: 'Segoe UI, sans-serif',
  },
  heading: {
    textAlign: 'center',
    marginBottom: '20px',
    color: '#333',
  },
  inputGroup: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  input: {
    flex: 1,
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ccc',
  },
  addButton: {
    padding: '10px 15px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  list: {
    listStyle: 'none',
    padding: 0,
  },
  listItem: {
    padding: '10px 15px',
    backgroundColor: '#f1f3f5',
    marginBottom: '10px',
    borderRadius: '6px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    border: 'none',
    color: '#fff',
    padding: '5px 10px',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default CourierMaster;

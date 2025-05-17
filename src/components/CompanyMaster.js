import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = 'https://return-processor-backend.onrender.com/api/data';

const CompanyMaster = () => {
  const [companies, setCompanies] = useState([]);
  const [newCompany, setNewCompany] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/company`);
      setCompanies(res.data);
    } catch (err) {
      console.error('Error fetching companies:', err);
    }
  };

  const addCompany = async () => {
    if (!newCompany) return;
    try {
      await axios.post(`${BASE_URL}/Company`, { company: newCompany });
      setNewCompany('');
      fetchCompanies();
    } catch (err) {
      console.error('Error adding company:', err);
    }
  };

  const deleteCompany = async (name) => {
    try {
      await axios.delete(`${BASE_URL}/company/${name}`);
      fetchCompanies();
    } catch (err) {
      console.error('Error deleting company:', err);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>🏢 Company Master</h2>

      <div style={styles.inputGroup}>
        <input
          type="text"
          value={newCompany}
          onChange={(e) => setNewCompany(e.target.value)}
          placeholder="Enter company name"
          style={styles.input}
        />
        <button onClick={addCompany} style={styles.addButton}>➕ Add</button>
      </div>

      <ul style={styles.list}>
        {companies.map((item, index) => (
          <li key={index} style={styles.listItem}>
            <span>{item.company}</span>
            <button
              onClick={() => deleteCompany(item.company)}
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
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 0 8px rgba(0, 0, 0, 0.1)',
    fontFamily: 'Segoe UI, sans-serif',
  },
  heading: {
    textAlign: 'center',
    marginBottom: '20px',
    color: '#333',
  },
  inputGroup: {
    display: 'flex',
    marginBottom: '20px',
    gap: '10px',
  },
  input: {
    flex: 1,
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  addButton: {
    padding: '10px 15px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  list: {
    listStyleType: 'none',
    padding: 0,
  },
  listItem: {
    padding: '10px 15px',
    backgroundColor: '#f8f9fa',
    marginBottom: '10px',
    borderRadius: '5px',
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

export default CompanyMaster;

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BASE_URL = 'https://return-processor-backend.onrender.com/api/data';

const DesignMaster = () => {
  const [designs, setDesigns] = useState([]);
  const [newDesign, setNewDesign] = useState('');

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
      await axios.post(`${BASE_URL}/Design`, {
        Design: newDesign.trim(),
      });
      setNewDesign('');
      fetchDesigns();
    } catch (error) {
      console.error('Error adding design:', error);
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

  return (
    <div style={styles.container}>
      <h2>Design Master</h2>

      <div style={styles.inputGroup}>
        <input
          type="text"
          placeholder="Enter new design"
          value={newDesign}
          onChange={(e) => setNewDesign(e.target.value)}
          style={styles.input}
        />
        <button onClick={handleAddDesign} style={styles.addButton}>
          Add
        </button>
      </div>

      <ul style={styles.list}>
        {designs.map((item, index) => (
          <li key={index} style={styles.listItem}>
            {item.Design}
            <button
              onClick={() => handleDeleteDesign(item.Design)}
              style={styles.deleteButton}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const styles = {
  container: {
    padding: 20,
    maxWidth: 400,
    margin: 'auto',
    fontFamily: 'Arial, sans-serif',
  },
  inputGroup: {
    display: 'flex',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    padding: 8,
    marginRight: 10,
  },
  addButton: {
    padding: '8px 12px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
  },
  list: {
    listStyle: 'none',
    padding: 0,
  },
  listItem: {
    padding: 8,
    borderBottom: '1px solid #ccc',
    display: 'flex',
    justifyContent: 'space-between',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '4px 8px',
  },
};

export default DesignMaster;

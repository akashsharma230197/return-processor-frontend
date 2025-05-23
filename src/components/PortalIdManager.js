import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = 'https://return-processor-backend.onrender.com/api/data';

const PortalIdManager = () => {
  const [companies, setCompanies] = useState([]);
  const [portals, setPortals] = useState([]);
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ company: '', portal: '', login_id: '' });
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    fetchCompanies();
    fetchPortals();
    fetchEntries();
  }, []);

  const fetchCompanies = async () => {
    const res = await axios.get(`${BASE_URL}/company`);
    const sorted = res.data.map(c => c.company).sort((a, b) => a.localeCompare(b));
    setCompanies(sorted);
  };

  const fetchPortals = async () => {
    const res = await axios.get(`${BASE_URL}/portal`);
    const sorted = res.data.map(p => p.portal).sort((a, b) => a.localeCompare(b));
    setPortals(sorted);
  };

  const fetchEntries = async () => {
    const res = await axios.get(`${BASE_URL}/portal_id`);
    setEntries(res.data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.company || !form.portal || !form.login_id) return alert('All fields required');

    try {
      if (editIndex !== null) {
        const id = entries[editIndex].id;
        await axios.put(`${BASE_URL}/portal_id/${id}`, form);
      } else {
        await axios.post(`${BASE_URL}/portal_id`, form);
      }
      setForm({ company: '', portal: '', login_id: '' });
      setEditIndex(null);
      fetchEntries();
    } catch (err) {
      alert('Error saving entry');
      console.error(err);
    }
  };

  const handleEdit = (index) => {
    setEditIndex(index);
    setForm(entries[index]);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      await axios.delete(`${BASE_URL}/portal_id/${id}`);
      fetchEntries();
    } catch (err) {
      alert('Error deleting');
      console.error(err);
    }
  };

  return (
    <div style={styles.container}>
      <h2>🔐 Portal Login Manager</h2>

      <div style={styles.form}>
        <select name="company" value={form.company} onChange={handleChange} style={styles.input}>
          <option value="">-- Select Company --</option>
          {companies.map((c, i) => <option key={i} value={c}>{c}</option>)}
        </select>

        <select name="portal" value={form.portal} onChange={handleChange} style={styles.input}>
          <option value="">-- Select Portal --</option>
          {portals.map((p, i) => <option key={i} value={p}>{p}</option>)}
        </select>

        <input
          type="text"
          name="login_id"
          placeholder="Enter Login ID"
          value={form.login_id}
          onChange={handleChange}
          style={styles.input}
        />

        <button onClick={handleSubmit} style={styles.submitButton}>
          {editIndex !== null ? '✏️ Update' : '➕ Add'}
        </button>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th>Company</th>
            <th>Portal</th>
            <th>Login ID</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => (
            <tr key={entry.id}>
              <td>{entry.company}</td>
              <td>{entry.portal}</td>
              <td>{entry.login_id}</td>
              <td>
                <button onClick={() => handleEdit(i)} style={styles.editButton}>✏️</button>
                <button onClick={() => handleDelete(entry.id)} style={styles.deleteButton}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: 'auto',
    padding: '20px',
    fontFamily: 'Segoe UI, sans-serif'
  },
  form: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px'
  },
  input: {
    flex: 1,
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ccc'
  },
  submitButton: {
    padding: '8px 15px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  editButton: {
    marginRight: '8px',
    padding: '5px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#ffc107',
    color: '#000',
    cursor: 'pointer'
  },
  deleteButton: {
    padding: '5px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#dc3545',
    color: '#fff',
    cursor: 'pointer'
  }
};

export default PortalIdManager;

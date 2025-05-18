import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ReturnDetailedEntry.css'; // Make sure to create and import this

const BACKEND_URL = 'https://return-processor-backend.onrender.com';

function ReturnDetailedEntry() {
  const [formData, setFormData] = useState({
    user_id: '',
    company: '',
    courier: '',
    date: '',
    design: '',
    quantity: '1',
  });

  const [entries, setEntries] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [couriers, setCouriers] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const user_id = localStorage.getItem('user_id') || '';
    const today = new Date().toISOString().split('T')[0];

    setFormData(prev => ({
      ...prev,
      user_id,
      date: today
    }));

    fetchEntries();
    fetchCompanies();
    fetchCouriers();
  }, []);

  const fetchEntries = async () => {
  try {
    const res = await axios.get(`${BACKEND_URL}/api/data/return-detailed-entry`);
    
    // Sort by `id` descending and take top 40 entries
    const sortedTopEntries = res.data
      .sort((a, b) => b.id - a.id) // descending order
      .slice(0, 40);               // limit to 40

    setEntries(sortedTopEntries);
  } catch (err) {
    console.error('Error fetching entries:', err);
  }
};


 const fetchCompanies = async () => {
  try {
    const res = await axios.get(`${BACKEND_URL}/api/data/company`);
    const sortedCompanies = res.data
      .map(item => item.company)
      .sort((a, b) => a.localeCompare(b)); // Sort alphabetically
    setCompanies(sortedCompanies);
  } catch (err) {
    console.error('Error fetching companies:', err);
  }
};


  const fetchCouriers = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/data/courier`);
	const sortedcouriers = res.data
      .map(item => item.courier)
      .sort((a, b) => a.localeCompare(b)); // Sort alphabetically
    setCouriers(sortedcouriers);


    } catch (err) {
      console.error('Error fetching couriers:', err);
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post(`${BACKEND_URL}/api/data/return-detailed-entry`, {
        ...formData,
        quantity: Number(formData.quantity),
      });
      setMessage(`✔️ Entry saved! ID: ${res.data.id}`);
      setFormData(prev => ({ ...prev, design: '', quantity: '1' }));
      fetchEntries();
    } catch (err) {
      setMessage('❌ Error saving entry');
      console.error(err);
    }
  };

  return (
    <div className="container">
      <h2>Return Detailed Entry</h2>

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label>User ID:</label>
          <input type="text" name="user_id" value={formData.user_id} disabled />
        </div>

        <div className="form-group">
          <label>Company:</label>
          <select name="company" value={formData.company} onChange={handleChange} required>
            <option value="">--Select Company--</option>
            {companies.map((comp, idx) => (
              <option key={idx} value={comp}>{comp}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Courier:</label>
          <select name="courier" value={formData.courier} onChange={handleChange} required>
            <option value="">--Select Courier--</option>
            {couriers.map((cour, idx) => (
              <option key={idx} value={cour}>{cour}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Date:</label>
          <input type="date" name="date" value={formData.date} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Design:</label>
          <input
            name="design"
            value={formData.design}
            onChange={handleChange}
            placeholder="Design"
            required
            autoComplete="off"
          />
        </div>

        <div className="form-group">
          <label>Quantity:</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            placeholder="Quantity"
            required
            min="0"
          />
        </div>

        <button type="submit" className="submit-btn">Add Entry</button>
      </form>

      {message && <p className="message">{message}</p>}

      <h3>Entries</h3>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>User ID</th>
              <th>Company</th>
              <th>Courier</th>
              <th>Date</th>
              <th>Design</th>
              <th>Qty</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(entry => (
              <tr key={entry.id}>
                <td>{entry.id}</td>
                <td>{entry.user_id}</td>
                <td>{entry.company}</td>
                <td>{entry.courier}</td>
                <td>{entry.date.split('T')[0]}</td>
                <td>{entry.design}</td>
                <td>{entry.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ReturnDetailedEntry;

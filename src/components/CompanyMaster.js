import React, { useState, useEffect } from 'react';
import axios from 'axios';

// ✅ Use your live backend URL
const BASE_URL = 'https://return-processor-backend.onrender.com/api/data';

const CompanyMaster = () => {
  const [companies, setCompanies] = useState([]);
  const [newCompany, setNewCompany] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/Company`);
      setCompanies(res.data);
    } catch (err) {
      console.error('Error fetching companies:', err);
    }
  };

  const addCompany = async () => {
    if (!newCompany) return;
    try {
      await axios.post(`${BASE_URL}/Company`, { Company: newCompany });
      setNewCompany('');
      fetchCompanies();
    } catch (err) {
      console.error('Error adding company:', err);
    }
  };

  const deleteCompany = async (name) => {
    try {
      await axios.delete(`${BASE_URL}/Company/${name}`);
      fetchCompanies();
    } catch (err) {
      console.error('Error deleting company:', err);
    }
  };

  return (
    <div>
      <h2>Company Master</h2>
      <input
        type="text"
        value={newCompany}
        onChange={(e) => setNewCompany(e.target.value)}
        placeholder="Enter company name"
      />
      <button onClick={addCompany}>Add</button>
      <ul>
        {companies.map((item, index) => (
          <li key={index}>
            {item.Company}
            <button onClick={() => deleteCompany(item.Company)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CompanyMaster;

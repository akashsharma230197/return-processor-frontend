import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';

const BACKEND_URL = 'https://return-processor-backend.onrender.com';

const ExcelUploadWithContext = () => {
  const [formData, setFormData] = useState({
    user_id: '',
    date: '',
    company: '',
    portal: '',
  });

  const [companies, setCompanies] = useState([]);
  const [portals, setPortals] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [submittedData, setSubmittedData] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const user_id = localStorage.getItem('user_id') || '';
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, user_id, date: today }));

    fetchCompanies();
    fetchPortals();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/data/company`);
      const sortedCompanies = res.data.map(c => c.company).sort((a, b) => a.localeCompare(b));
      setCompanies(sortedCompanies);
    } catch (err) {
      console.error('Error fetching companies:', err);
    }
  };

  const fetchPortals = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/data/portal`);
      const sortedPortals = res.data.map(p => p.portal).sort((a, b) => a.localeCompare(b));
      setPortals(sortedPortals);
    } catch (err) {
      console.error('Error fetching portals:', err);
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !formData.company || !formData.portal) {
      alert("Please select Company and Portal before uploading.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const workbook = XLSX.read(event.target.result, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet);

      const enrichedData = json.map(row => ({
        design: row.Design || '',
        quantity: Number(row.Quantity) || 0,
        company: formData.company,
        portal: formData.portal,
        date: formData.date,
        user_id: formData.user_id
      }));

      setExcelData(enrichedData);
    };
    reader.readAsBinaryString(file);
  };

  const handleSubmitToBilling = async () => {
    if (excelData.length === 0) {
      alert("No data to submit");
      return;
    }

    try {
      await axios.post(`${BACKEND_URL}/api/data/billing`, excelData);
      setMessage('✅ Data submitted successfully!');
      setSubmittedData(excelData);
      setExcelData([]);
    } catch (err) {
      console.error('Error submitting data:', err);
      setMessage('❌ Error submitting data.');
    }
  };

  const resetForm = () => {
    const today = new Date().toISOString().split('T')[0];
    const user_id = localStorage.getItem('user_id') || '';

    setFormData({
      user_id,
      date: today,
      company: '',
      portal: '',
    });

    setExcelData([]);
    setSubmittedData([]);
    setMessage('');
  };

  const calculateTotalQuantity = () => {
    return excelData.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <div style={styles.container}>
      <h2>📥 Billing Dashboard</h2>

      {!submittedData.length ? (
        <>
          <div style={styles.inputGroup}>
            <label>Company</label>
            <select name="company" value={formData.company} onChange={handleChange} style={styles.input}>
              <option value="">-- Select Company --</option>
              {companies.map((comp, idx) => (
                <option key={idx} value={comp}>{comp}</option>
              ))}
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label>Portal</label>
            <select name="portal" value={formData.portal} onChange={handleChange} style={styles.input}>
              <option value="">-- Select Portal --</option>
              {portals.map((port, idx) => (
                <option key={idx} value={port}>{port}</option>
              ))}
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label>Upload Excel File</label>
            <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} style={styles.input} />
          </div>

          {excelData.length > 0 && (
            <>
              <div style={styles.tableWrapper}>
                <h3>📊 Preview Data</h3>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>Design</th>
                      <th>Quantity</th>
                      <th>Company</th>
                      <th>Portal</th>
                      <th>Date</th>
                      <th>User ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {excelData.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.design}</td>
                        <td>{item.quantity}</td>
                        <td>{item.company}</td>
                        <td>{item.portal}</td>
                        <td>{item.date}</td>
                        <td>{item.user_id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={styles.totalQuantityWrapper}>
                <strong>Total Quantity: {calculateTotalQuantity()}</strong>
              </div>

              <button onClick={handleSubmitToBilling} style={styles.submitButton}>
                📤 Submit to Billing
              </button>
            </>
          )}
          {message && <p>{message}</p>}
        </>
      ) : (
        <>
          <h3>✅ Submitted Data</h3>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Design</th>
                  <th>Quantity</th>
                  <th>Company</th>
                  <th>Portal</th>
                  <th>Date</th>
                  <th>User ID</th>
                </tr>
              </thead>
              <tbody>
                {submittedData.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.design}</td>
                    <td>{item.quantity}</td>
                    <td>{item.company}</td>
                    <td>{item.portal}</td>
                    <td>{item.date}</td>
                    <td>{item.user_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button onClick={resetForm} style={styles.resetButton}>
            🔁 Upload New File
          </button>
        </>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: 'auto',
    padding: '20px',
    fontFamily: 'Segoe UI, sans-serif',
    backgroundColor: '#fdfdfd',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
  },
  inputGroup: {
    marginBottom: '15px',
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    padding: '8px',
    fontSize: '15px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  tableWrapper: {
    marginTop: '25px',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },
  totalQuantityWrapper: {
    marginTop: '15px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
  },
  submitButton: {
    marginTop: '15px',
    padding: '10px 15px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer'
  },
  resetButton: {
    marginTop: '15px',
    padding: '10px 15px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer'
  }
};

export default ExcelUploadWithContext;

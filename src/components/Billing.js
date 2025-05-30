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
  const [readyCompanies, setReadyCompanies] = useState([]);
 const [billedCompanies, setBilledCompanies] = useState([]);

  const [portals, setPortals] = useState([]);
  const [readyPortals, setReadyPortals] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [submittedData, setSubmittedData] = useState([]);
  const [message, setMessage] = useState('');
  const [loginId, setLoginId] = useState('');
  const [billingStatus, setBillingStatus] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const user_id = localStorage.getItem('user_id') || '';
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, user_id, date: today }));

    fetchCompanies();
    fetchPortals();
  }, []);

  useEffect(() => {
    if (formData.company && formData.date) {
      fetchCompanyBillingStatus();
      fetchReadyPortals();
    }
  }, [formData.company, formData.date]);

  const fetchCompanies = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/data/company`);
      const companyNames = res.data.map(c => c.company).sort();
      setCompanies(companyNames);

      const today = new Date().toISOString().split('T')[0];
      const readyRes = await axios.get(`${BACKEND_URL}/api/data/readycompanies?date=${today}`);
      setReadyCompanies(readyRes.data.readyCompanies || []);

const billedRes = await axios.get(`${BACKEND_URL}/api/data/billedcompanies?date=${today}`);
      setBilledCompanies(billedRes.data.billedCompanies || []);


    } catch (err) {
      console.error('Error fetching companies:', err);
    }
  };

  const fetchPortals = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/data/portal`);
      const sorted = res.data.map(p => p.portal).sort();
      setPortals(sorted);
    } catch (err) {
      console.error('Error fetching portals:', err);
    }
  };

  const fetchReadyPortals = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/data/readyportals`, {
        params: {
          company: formData.company,
          date: formData.date
        }
      });
      setReadyPortals(res.data.readyPortals || []);
    } catch (err) {
      console.error('Error fetching ready portals:', err);
      setReadyPortals([]);
    }
  };

  const fetchLoginId = async (company, portal) => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/data/login_id`, {
        params: { company, portal }
      });
      setLoginId(res.data.login_id || 'Not found');
    } catch (err) {
      console.error('Error fetching login_id:', err);
      setLoginId('Error fetching login ID');
    }
  };

  const fetchCompanyBillingStatus = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/data/companybillstatus`, {
        params: { company: formData.company, date: formData.date },
      });
      setBillingStatus(res.data.status || '');
    } catch (err) {
      console.error('Error fetching billing status:', err);
      setBillingStatus('');
    }
  };

  const markCompanyBillingStatus = async (status) => {
    if (!formData.company || !formData.date) {
      alert("Please select a company and date.");
      return;
    }

    try {
      await axios.post(`${BACKEND_URL}/api/data/companybillstatus`, {
        company: formData.company,
        date: formData.date,
        status,
      });
      setBillingStatus(status);
      setStatusMessage(`✅ Status updated to '${status}'`);
      fetchCompanies();
    } catch (err) {
      console.error('Error updating billing status:', err);
      setStatusMessage('❌ Failed to update status');
    }
  };

  const markPortalBillingStatus = async (status) => {
    if (!formData.company || !formData.portal || !formData.date) {
      alert("Please select a company, portal and date.");
      return;
    }

    try {
      await axios.post(`${BACKEND_URL}/api/data/portalbillstatus`, {
        company: formData.company,
        portal: formData.portal,
        date: formData.date,
        status,
      });
      setStatusMessage(`✅ Portal status updated to '${status}'`);
      fetchReadyPortals();
    } catch (err) {
      console.error('Error updating portal status:', err);
      setStatusMessage('❌ Failed to update portal status');
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    const updatedForm = { ...formData, [name]: value };
    setFormData(updatedForm);
    setStatusMessage('');

    if (updatedForm.company && updatedForm.portal) {
      fetchLoginId(updatedForm.company, updatedForm.portal);
    }
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
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);

      const enriched = json.map(row => ({
        design: row.Design || '',
        quantity: Number(row.Quantity) || 0,
        company: formData.company,
        portal: formData.portal,
        date: formData.date,
        user_id: formData.user_id
      }));

      setExcelData(enriched);
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
    setFormData({ user_id, date: today, company: '', portal: '' });
    setExcelData([]);
    setSubmittedData([]);
    setMessage('');
    setLoginId('');
    setBillingStatus('');
    setStatusMessage('');
  };

  const calculateTotalQuantity = () => {
    return excelData.reduce((total, item) => total + item.quantity, 0);
  };

  const renderBillingStatus = () => {
    if (!formData.company || !formData.date) return null;
    if (billingStatus === 'ready') return <p>📗 Status: <strong>Ready ✅</strong></p>;
    if (billingStatus === 'not_ready') return <p>📕 Status: <strong>Not Ready ❌</strong></p>;
    return <p>📘 Status: <strong>Unknown ⏳</strong></p>;
  };

  return (
    <div style={styles.container}>
      <h2>📥 Billing Dashboard</h2>

      {!submittedData.length ? (
        <>
          <div style={styles.inputGroup}>
           <label>Company</label>
<select
  name="company"
  value={formData.company}
  onChange={handleChange}
  style={styles.input}
>
  <option value="">-- Select Company --</option>
  {companies.map((comp, idx) => {
    const isReady = readyCompanies.includes(comp);
    const isBilled = billedCompanies.includes(comp);

    let color = 'black';
    let icon = '';

    if (isReady) {
      color = 'green';
      icon = '🟢 ';
    } else if (isBilled) {
      color = 'blue';
      icon = '🔵 ';
    }

    return (
      <option key={idx} value={comp} style={{ color }}>
        {icon}{comp}
      </option>
    );
  })}
</select>

          </div>

          <div style={styles.inputGroup}>
            <label>Portal</label>
            <select name="portal" value={formData.portal} onChange={handleChange} style={styles.input}>
              <option value="">-- Select Portal --</option>
              {portals.map((port, idx) => (
                <option
                  key={idx}
                  value={port}
                  style={{ color: readyPortals.includes(port) ? 'green' : 'black' }}
                >
                  {readyPortals.includes(port) ? '🟢 ' : ''}{port}
                </option>
              ))}
            </select>
          </div>

          {formData.company && formData.portal && (
            <div style={{ marginBottom: '15px' }}>
              <button
                onClick={() => markPortalBillingStatus('ready')}
                style={{ ...styles.statusButton, backgroundColor: '#20c997' }}
              >
                ✅ Mark Portal Ready
              </button>
              <button
                onClick={() => markPortalBillingStatus('not_ready')}
                style={{ ...styles.statusButton, backgroundColor: '#dc3545', marginLeft: '10px' }}
              >
                ❌ Mark Portal Not Ready
              </button>
            </div>
          )}

          {loginId && (
            <div style={styles.inputGroup}>
              <label>Login ID</label>
              <input type="text" value={loginId} readOnly style={{ ...styles.input, backgroundColor: '#f0f0f0' }} />
            </div>
          )}

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

          {renderBillingStatus()}

          {formData.company && formData.date && (
            <div style={{ marginBottom: '15px' }}>
              <button
                onClick={() => markCompanyBillingStatus('ready')}
                style={{ ...styles.statusButton, backgroundColor: '#28a745' }}
              >
                ✅ Mark Company as Ready
              </button>
              <button
                onClick={() => markCompanyBillingStatus('not_ready')}
                style={{ ...styles.statusButton, backgroundColor: '#dc3545', marginLeft: '10px' }}
              >
                ❌ Mark Company Not Ready
              </button>
              {statusMessage && <p style={{ marginTop: '10px' }}>{statusMessage}</p>}
            </div>
          )}

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
  },
  statusButton: {
    padding: '8px 12px',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '14px',
    cursor: 'pointer',
  }
};

export default ExcelUploadWithContext;

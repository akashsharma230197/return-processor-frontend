import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const BASE_URL = 'https://return-processor-backend.onrender.com/api/data';

const ShareReportMaster = () => {
  const [selectedTable, setSelectedTable] = useState('');
  const [reportData, setReportData] = useState([]);
  const [filters, setFilters] = useState({ company: '', courier: '', date: '' });
  const [companies, setCompanies] = useState([]);
  const [couriers, setCouriers] = useState([]);

  useEffect(() => {
    fetchCompanies();
    fetchCouriers();
  }, []);

  useEffect(() => {
    if (selectedTable) fetchAllData();
  }, [selectedTable]);

  const fetchCompanies = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/Company`);
      setCompanies(res.data.map(item => item.Company));
    } catch (err) {
      console.error('Error fetching companies', err);
    }
  };

  const fetchCouriers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/Courier`);
      setCouriers(res.data.map(item => item.Courier));
    } catch (err) {
      console.error('Error fetching couriers', err);
    }
  };

  const fetchAllData = async () => {
    try {
      const url =
        selectedTable === 'ReturnMaster'
          ? `${BASE_URL}/return-master`
          : `${BASE_URL}/return-detailed-entry`;
      const res = await axios.get(url);
      setReportData(res.data);
    } catch (err) {
      console.error('Error fetching data', err);
    }
  };

  const applyFilters = () => {
    const { company, courier, date } = filters;
    const filtered = reportData.filter(item =>
      (!company || item.company === company) &&
      (!courier || item.courier === courier) &&
      (!date || item.date === date)
    );
    setReportData(filtered);
  };

  const groupData = () => {
    const grouped = {};

    reportData.forEach(item => {
      const key = `${item.company} | ${item.courier} | ${item.date}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });

    return grouped;
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const title = selectedTable === 'ReturnMaster' ? 'Return Received' : 'Goods Return Report';
    doc.text(title, 14, 10);

    const grouped = groupData();
    let startY = 20;

    Object.entries(grouped).forEach(([groupKey, items]) => {
      doc.text(groupKey, 14, startY);
      startY += 5;

      const columns =
        selectedTable === 'ReturnMaster'
          ? ['User ID', 'No. Return']
          : ['User ID', 'Design', 'Quantity'];

      const rows = items.map(item =>
        selectedTable === 'ReturnMaster'
          ? [item.user_id, item.no_return]
          : [item.user_id, item.design, item.quantity]
      );

      autoTable(doc, {
        head: [columns],
        body: rows,
        startY: startY
      });

      startY = doc.lastAutoTable.finalY + 10;
    });

    doc.save(`${title.replace(/\s/g, '_')}.pdf`);
  };

  const shareOnWhatsApp = () => {
    const grouped = groupData();
    const messageParts = [];

    Object.entries(grouped).forEach(([groupKey, items]) => {
      messageParts.push(`\n${groupKey}:`);
      items.forEach(item => {
        const line =
          selectedTable === 'ReturnMaster'
            ? `  • User: ${item.user_id}, No. Return: ${item.no_return}`
            : `  • User: ${item.user_id}, Design: ${item.design}, Qty: ${item.quantity}`;
        messageParts.push(line);
      });
    });

    const message = messageParts.join('\n') || 'No data to share';
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div>
      <h2>Share Report</h2>

      <div>
        <label>Select Table: </label>
        <select value={selectedTable} onChange={e => setSelectedTable(e.target.value)}>
          <option value="">--Select--</option>
          <option value="ReturnMaster">ReturnMaster</option>
          <option value="ReturnDetailedEntry">ReturnDetailedEntry</option>
        </select>
      </div>

      {selectedTable && (
        <>
          <div>
            <label>Company: </label>
            <select value={filters.company} onChange={e => setFilters({ ...filters, company: e.target.value })}>
              <option value="">--All--</option>
              {companies.map((comp, idx) => (
                <option key={idx} value={comp}>{comp}</option>
              ))}
            </select>

            <label>Courier: </label>
            <select value={filters.courier} onChange={e => setFilters({ ...filters, courier: e.target.value })}>
              <option value="">--All--</option>
              {couriers.map((cour, idx) => (
                <option key={idx} value={cour}>{cour}</option>
              ))}
            </select>

            <label>Date: </label>
            <input
              type="date"
              value={filters.date}
              onChange={e => setFilters({ ...filters, date: e.target.value })}
            />

            <button onClick={applyFilters}>Apply Filters</button>
          </div>

          <div style={{ marginTop: '10px' }}>
            <button onClick={downloadPDF}>Download PDF</button>
            <button onClick={shareOnWhatsApp}>Share on WhatsApp</button>
          </div>

          <table border="1" cellPadding="5" style={{ marginTop: '20px' }}>
            <thead>
              <tr>
                {selectedTable === 'ReturnMaster' ? (
                  <>
                    <th>ID</th><th>User ID</th><th>Company</th><th>Courier</th><th>Date</th><th>No. Return</th>
                  </>
                ) : (
                  <>
                    <th>ID</th><th>User ID</th><th>Company</th><th>Courier</th><th>Date</th><th>Design</th><th>Quantity</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {reportData.map((item, index) => (
                <tr key={index}>
                  <td>{item.id}</td>
                  <td>{item.user_id}</td>
                  <td>{item.company}</td>
                  <td>{item.courier}</td>
                  <td>{item.date}</td>
                  {selectedTable === 'ReturnMaster' ? (
                    <td>{item.no_return}</td>
                  ) : (
                    <>
                      <td>{item.design}</td>
                      <td>{item.quantity}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default ShareReportMaster;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const BASE_URL = 'https://return-processor-backend.onrender.com/api/data';

const ShareReportMaster = () => {
  const today = new Date();
  const defaultDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format

  const [selectedTable, setSelectedTable] = useState('');
  const [reportData, setReportData] = useState([]);
  const [filters, setFilters] = useState({ company: '', courier: '', date: defaultDate });
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
      const res = await axios.get(`${BASE_URL}/company`);
      setCompanies(res.data.map(item => item.company));
    } catch (err) {
      console.error('Error fetching companies', err);
    }
  };

  const fetchCouriers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/courier`);
      setCouriers(res.data.map(item => item.courier));
    } catch (err) {
      console.error('Error fetching couriers', err);
    }
  };

  const fetchAllData = async () => {
    try {
      const url = selectedTable === 'ReturnMaster'
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
    const filtered = reportData.filter(item => {
      const itemDate = item.date?.split('T')[0];
      return (
        (!company || item.company === company) &&
        (!courier || item.courier === courier) &&
        (!date || itemDate === date)
      );
    });
    setReportData(filtered);
  };

  const getGroupedSummary = () => {
    const summary = {};
    reportData.forEach(item => {
      const formattedDate = item.date?.split('T')[0] || '';
      const key = selectedTable === 'ReturnDetailedEntry'
        ? `${item.company}|${item.courier}|${formattedDate}|${item.design}`
        : `${item.company}|${item.courier}|${formattedDate}`;

      if (!summary[key]) {
        summary[key] = {
          company: item.company,
          courier: item.courier,
          date: formattedDate,
          design: item.design || '',
          total: 0
        };
      }

      summary[key].total += selectedTable === 'ReturnDetailedEntry'
        ? Number(item.quantity)
        : Number(item.no_return);
    });

    return Object.values(summary);
  };

  






const downloadPDF = () => {
  const doc = new jsPDF();
  const title = selectedTable === 'ReturnMaster' ? 'Return Received' : 'Goods Return Report';
  let currentY = 10;

  doc.text(title, 14, currentY);
  currentY += 10;

  const grouped = getGroupedSummary();

  // Helper to group data
  const groupBy = (data, keys) => {
    const map = {};
    data.forEach(item => {
      const key = keys.map(k => item[k] || '').join('|');
      if (!map[key]) {
        map[key] = {
          ...keys.reduce((acc, k) => ({ ...acc, [k]: item[k] }), {}),
          total: 0
        };
      }
      map[key].total += item.total;
    });
    return Object.values(map);
  };

  // --- 1. Group by Company ---
  const summary1 = groupBy(grouped, ['company']);
  doc.text('1. Summary by Company', 14, currentY);
  currentY += 6;

  autoTable(doc, {
    startY: currentY,
    head: [['Company', 'Total']],
    body: summary1.map(item => [item.company, item.total]),
    didDrawPage: (data) => {
      currentY = data.cursor.y + 10;
    }
  });

  // --- 2. Group by Company + Courier ---
  const summary2 = groupBy(grouped, ['company', 'courier']);
  doc.text('2. Summary by Company + Courier', 14, currentY);
  currentY += 6;

  autoTable(doc, {
    startY: currentY,
    head: [['Company', 'Courier', 'Total']],
    body: summary2.map(item => [item.company, item.courier, item.total]),
    didDrawPage: (data) => {
      currentY = data.cursor.y + 10;
    }
  });

  // --- 3. Group by Company + Design ---
  const summary3 = groupBy(grouped, ['company', 'design']);
  doc.text('3. Summary by Company + Design', 14, currentY);
  currentY += 6;

  autoTable(doc, {
    startY: currentY,
    head: [['Company', 'Design', 'Total']],
    body: summary3.map(item => [item.company, item.design, item.total]),
    didDrawPage: (data) => {
      currentY = data.cursor.y + 10;
    }
  });

  doc.save(`${title.replace(/\s/g, '_')}.pdf`);
};



























 const shareOnWhatsApp = () => {
    const grouped = getGroupedSummary();
    const title = selectedTable === 'ReturnMaster' ? 'Return Received' : 'Goods Return Report';
    const messageParts = [title];

    grouped.forEach(item => {
      const line = selectedTable === 'ReturnMaster'
        ? `• ${item.company} | ${item.courier} | ${item.date} → Total: ${item.total}`
        : `• ${item.company} | ${item.courier} | ${item.date} | ${item.design} → Qty: ${item.total}`;
      messageParts.push(line);
    });

    const message = messageParts.join('\n') || 'No data to share';
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const groupedSummary = getGroupedSummary();

  return (
    <div className="container">
      <h2>Share Report</h2>

      <div className="form-group">
        <label>Select Table</label>
        <select value={selectedTable} onChange={e => setSelectedTable(e.target.value)}>
          <option value="">--Select--</option>
          <option value="ReturnMaster">ReturnMaster</option>
          <option value="ReturnDetailedEntry">ReturnDetailedEntry</option>
        </select>
      </div>

      {selectedTable && (
        <>
          <div className="filter-group">
            <div className="form-group">
              <label>Company</label>
              <select value={filters.company} onChange={e => setFilters({ ...filters, company: e.target.value })}>
                <option value="">--All--</option>
                {companies.map((comp, idx) => (
                  <option key={idx} value={comp}>{comp}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Courier</label>
              <select value={filters.courier} onChange={e => setFilters({ ...filters, courier: e.target.value })}>
                <option value="">--All--</option>
                {couriers.map((cour, idx) => (
                  <option key={idx} value={cour}>{cour}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={filters.date}
                onChange={e => setFilters({ ...filters, date: e.target.value })}
              />
            </div>

            <div className="form-group">
              <button onClick={applyFilters}>Apply Filters</button>
            </div>
          </div>

          <div className="button-group">
            <button onClick={downloadPDF}>Download PDF</button>
            <button onClick={shareOnWhatsApp}>Share on WhatsApp</button>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  {selectedTable === 'ReturnMaster' ? (
                    <>
                      <th>Company</th><th>Courier</th><th>Date</th><th>Total Returns</th>
                    </>
                  ) : (
                    <>
                      <th>Company</th><th>Courier</th><th>Date</th><th>Design</th><th>Total Qty</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {groupedSummary.map((item, index) => (
                  <tr key={index}>
                    <td>{item.company}</td>
                    <td>{item.courier}</td>
                    <td>{item.date}</td>
                    {selectedTable === 'ReturnMaster' ? (
                      <td>{item.total}</td>
                    ) : (
                      <>
                        <td>{item.design}</td>
                        <td>{item.total}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <style>{`
        .container {
          padding: 1rem;
          max-width: 1000px;
          margin: auto;
        }
        .form-group {
          margin: 10px 0;
          display: flex;
          flex-direction: column;
        }
        label {
          margin-bottom: 4px;
          font-weight: bold;
        }
        select, input[type="date"] {
          padding: 6px;
          font-size: 16px;
        }
        button {
          padding: 8px 12px;
          margin-top: 10px;
          margin-right: 10px;
          font-size: 14px;
          cursor: pointer;
        }
        .filter-group {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
        }
        .button-group {
          margin-top: 10px;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .table-container {
          overflow-x: auto;
          margin-top: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }
        th, td {
          border: 1px solid #ccc;
          padding: 8px;
          text-align: center;
        }
        @media (max-width: 768px) {
          .filter-group {
            flex-direction: column;
          }
          table {
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default ShareReportMaster;

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ShareReportMaster = () => {
  const [selectedTable, setSelectedTable] = useState('ReturnMaster');
  const [companyFilter, setCompanyFilter] = useState('');
  const [courierFilter, setCourierFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [reportData, setReportData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [couriers, setCouriers] = useState([]);

  useEffect(() => {
    fetchTableData(selectedTable);
    fetchDropdowns();
  }, [selectedTable]);

  const fetchTableData = async (table) => {
    try {
      const endpoint =
        table === 'ReturnMaster'
          ? '/api/data/return-master'
          : '/api/data/return-detailed-entry';

      const res = await axios.get(`http://localhost:3001${endpoint}`);
      setReportData(res.data);
      setFilteredData(res.data); // set default
    } catch (err) {
      console.error('Error fetching report data:', err);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const [companyRes, courierRes] = await Promise.all([
        axios.get('http://localhost:3001/api/data/Company'),
        axios.get('http://localhost:3001/api/data/Courier'),
      ]);

      setCompanies(companyRes.data.map(item => item.Company));
      setCouriers(courierRes.data.map(item => item.Courier));
    } catch (err) {
      console.error('Error fetching dropdowns', err);
    }
  };

  const applyFilters = () => {
    const filtered = reportData.filter(item => {
      return (
        (companyFilter === '' || item.company === companyFilter) &&
        (courierFilter === '' || item.courier === courierFilter) &&
        (dateFilter === '' || item.date === dateFilter)
      );
    });

    setFilteredData(filtered);
  };

  return (
    <div>
      <h2>Share Report Master</h2>

      <div>
        <label>Table: </label>
        <select value={selectedTable} onChange={e => setSelectedTable(e.target.value)}>
          <option value="ReturnMaster">Return Received</option>
          <option value="ReturnDetailedEntry">Goods Return Report</option>
        </select>
      </div>

      <div>
        <label>Company: </label>
        <select value={companyFilter} onChange={e => setCompanyFilter(e.target.value)}>
          <option value="">-- All --</option>
          {companies.map((comp, idx) => (
            <option key={idx} value={comp}>{comp}</option>
          ))}
        </select>

        <label>Courier: </label>
        <select value={courierFilter} onChange={e => setCourierFilter(e.target.value)}>
          <option value="">-- All --</option>
          {couriers.map((cour, idx) => (
            <option key={idx} value={cour}>{cour}</option>
          ))}
        </select>

        <label>Date: </label>
        <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} />

        <button onClick={applyFilters}>Apply Filters</button>
      </div>

      <h3>Filtered Report</h3>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>Company</th>
            <th>Courier</th>
            <th>Date</th>
            {selectedTable === 'ReturnMaster' ? (
              <th>No. Returns</th>
            ) : (
              <>
                <th>Design</th>
                <th>Quantity</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row, index) => (
            <tr key={index}>
              <td>{row.company}</td>
              <td>{row.courier}</td>
              <td>{row.date}</td>
              {selectedTable === 'ReturnMaster' ? (
                <td>{row.no_return}</td>
              ) : (
                <>
                  <td>{row.design}</td>
                  <td>{row.quantity}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ShareReportMaster;

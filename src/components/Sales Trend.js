import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  Legend, CartesianGrid, LabelList, ResponsiveContainer
} from 'recharts';

const BASE_URL = 'https://return-processor-backend.onrender.com/api/data';

const formatDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

const getColor = (index) => {
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#00c49f', '#ff6f91'];
  return colors[index % colors.length];
};

const getLast7Days = () => {
  const dates = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(formatDate(d));
  }
  return dates;
};

const SalesTrends = () => {
  const [billingData, setBillingData] = useState([]);
  const [designs, setDesigns] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [filter, setFilter] = useState({ design: '', company: '' });

  useEffect(() => {
    const today = new Date();
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - 6);
    const from = pastDate.toISOString().slice(0, 10);
    const to = today.toISOString().slice(0, 10);

    axios.get(`${BASE_URL}/billing_dashboard?from=${from}&to=${to}`)
      .then(res => {
        // Format the date to match our grouping format
        const formatted = res.data.map(entry => ({
          ...entry,
          date: formatDate(new Date(entry.date))
        }));

        setBillingData(formatted);
        setDesigns([...new Set(formatted.map(item => item.design))]);
        setCompanies([...new Set(formatted.map(item => item.company))]);
      });
  }, []);

  const getFilteredData = () => {
    const filtered = billingData.filter(entry =>
      (!filter.design || entry.design === filter.design) &&
      (!filter.company || entry.company === filter.company)
    );

    const grouped = filtered.reduce((acc, item) => {
      acc[item.date] = (acc[item.date] || 0) + item.quantity;
      return acc;
    }, {});

    // Ensure all 7 dates are present
    const last7Days = getLast7Days();
    return last7Days.map(date => ({
      date,
      quantity: grouped[date] || 0
    }));
  };

  const data = getFilteredData();

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>📊 Weekly Sales Trends</h2>

      <div style={styles.filters}>
        <select
          value={filter.design}
          onChange={e => setFilter({ ...filter, design: e.target.value })}
          style={styles.select}
        >
          <option value="">All Designs</option>
          {designs.map((d, i) => <option key={i} value={d}>{d}</option>)}
        </select>

        <select
          value={filter.company}
          onChange={e => setFilter({ ...filter, company: e.target.value })}
          style={styles.select}
        >
          <option value="">All Companies</option>
          {companies.map((c, i) => <option key={i} value={c}>{c}</option>)}
        </select>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="quantity"
            stroke={getColor(0)}
            strokeWidth={3}
            name={filter.design ? `Design ${filter.design}` : 'Total Quantity'}
            dot={{ r: 5 }}
          >
            <LabelList dataKey="quantity" position="top" />
          </Line>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    fontFamily: 'Segoe UI, sans-serif',
    maxWidth: '1000px',
    margin: '0 auto'
  },
  header: {
    marginBottom: '20px',
    color: '#333',
    fontSize: '24px',
    textAlign: 'center'
  },
  filters: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '20px'
  },
  select: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '14px'
  }
};

export default SalesTrends;

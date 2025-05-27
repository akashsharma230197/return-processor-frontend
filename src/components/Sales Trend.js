import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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

const SalesTrends = () => {
  const [billingData, setBillingData] = useState([]);
  const [designs, setDesigns] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [filter, setFilter] = useState({ design: '', company: '' });
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toISOString().slice(0, 10);
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    axios.get(`${BASE_URL}/billing_dashboard?from=${fromDate}&to=${toDate}`)
      .then(res => {
        const formatted = res.data.map(entry => ({
          ...entry,
          date: formatDate(new Date(entry.date))
        }));

        setBillingData(formatted);
        setDesigns([...new Set(formatted.map(item => item.design))]);
        setCompanies([...new Set(formatted.map(item => item.company))]);
      });
  }, [fromDate, toDate]);

  const getFilteredData = () => {
    const filtered = billingData.filter(entry =>
      (!filter.design || entry.design === filter.design) &&
      (!filter.company || entry.company === filter.company)
    );

    const grouped = filtered.reduce((acc, item) => {
      acc[item.date] = (acc[item.date] || 0) + item.quantity;
      return acc;
    }, {});

    const start = new Date(fromDate);
    const end = new Date(toDate);
    const dates = [];

    while (start <= end) {
      dates.push(formatDate(start));
      start.setDate(start.getDate() + 1);
    }

    return dates.map(date => ({
      date,
      quantity: grouped[date] || 0
    }));
  };

const exportPDF = () => {
  const doc = new jsPDF();
  let currentY = 10;

  doc.text('Sales Summary', 14, currentY);
  currentY += 8;

  // Show date range
  const fromFormatted = fromDate.replace(/-/g, '/');
  const toFormatted = toDate.replace(/-/g, '/');
  doc.setFontSize(10);
  doc.text(`Date Range: ${fromFormatted} - ${toFormatted}`, 14, currentY);
  currentY += 10;

  const summaryByDesign = {};
  const summaryByDesignCompany = {};

  billingData.forEach(({ design, company, quantity }) => {
    if (filter.design && design !== filter.design) return;
    if (filter.company && company !== filter.company) return;

    summaryByDesign[design] = (summaryByDesign[design] || 0) + quantity;

    const key = `${design}|${company}`;
    summaryByDesignCompany[key] = (summaryByDesignCompany[key] || 0) + quantity;
  });

  // Sort designs descending by total quantity
  const sortedDesigns = Object.entries(summaryByDesign)
    .sort((a, b) => b[1] - a[1]);

  // Build rows for Design + Company with subtotals
  const designCompanyRows = [];

  for (const [design, designTotal] of sortedDesigns) {
    // Get companies for this design, sorted desc by quantity
    const companyRows = Object.entries(summaryByDesignCompany)
      .filter(([key]) => key.startsWith(design + '|'))
      .map(([key, qty]) => {
        const company = key.split('|')[1];
        return { company, qty };
      })
      .sort((a, b) => b.qty - a.qty);

    // Add rows per company
    companyRows.forEach(({ company, qty }) => {
      designCompanyRows.push([design, company, qty]);
    });

    // Add subtotal row for this design
    designCompanyRows.push([
      `${design} Subtotal`,
      '',
      designTotal
    ]);
  }

  // 1. Summary by Design
  doc.setFontSize(12);
  doc.text('1. Summary by Design', 14, currentY);
  currentY += 6;
  autoTable(doc, {
    startY: currentY,
    head: [['Design', 'Total Quantity']],
    body: sortedDesigns.map(([design, qty]) => [design, qty]),
    didDrawPage: (data) => {
      currentY = data.cursor.y + 10;
    }
  });

  // 2. Summary by Design + Company breakdown with subtotals
  doc.text('2. Summary by Design + Company Breakdown', 14, currentY);
  currentY += 6;
  autoTable(doc, {
    startY: currentY,
    head: [['Design', 'Company', 'Quantity']],
    body: designCompanyRows,
    styles: {
      fontStyle: 'normal'
    },
    didParseCell: function (data) {
      if (data.row.index >= 0) {
        const cellText = data.row.cells[0].text;
        const textStr = Array.isArray(cellText) ? cellText.join('') : cellText;
        if (textStr.endsWith('Subtotal')) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [230, 230, 230]; // light gray background
        }
      }
    },
    didDrawPage: (data) => {
      currentY = data.cursor.y + 10;
    }
  });

  const fileName = `sales_report_${fromDate.replace(/-/g, '')}-${toDate.replace(/-/g, '')}.pdf`;
  doc.save(fileName);
};


  const data = getFilteredData();
  const maxVal = Math.max(...data.map(d => d.quantity), 0);
  const yAxisMax = Math.ceil(maxVal * 1.5) || 10;

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>📈 Weekly Sales Trends</h2>

      <div style={styles.filters}>
        <input
          type="date"
          value={fromDate}
          onChange={e => setFromDate(e.target.value)}
          style={styles.select}
        />
        <input
          type="date"
          value={toDate}
          onChange={e => setToDate(e.target.value)}
          style={styles.select}
        />
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

        <button onClick={exportPDF} style={styles.exportButton}>
          Export PDF
        </button>
      </div>

      <ResponsiveContainer width="100%" height={420}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, yAxisMax]} tick={{ fontSize: 12 }} />
          <Tooltip contentStyle={{ fontSize: 13 }} />
          <Legend verticalAlign="top" height={36} />
          <Line
            type="monotone"
            dataKey="quantity"
            stroke="#6366f1"
            strokeWidth={3}
            dot={{ r: 4 }}
            name={filter.design ? `Design ${filter.design}` : 'Total Quantity'}
          >
            <LabelList
              dataKey="quantity"
              position="top"
              style={{ fontSize: 10, fill: '#555' }}
            />
          </Line>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    fontFamily: "'Segoe UI', sans-serif",
    maxWidth: '1000px',
    margin: '0 auto',
    background: '#fafafa',
    borderRadius: '12px',
    boxShadow: '0 0 10px rgba(0,0,0,0.06)'
  },
  header: {
    marginBottom: '20px',
    color: '#222',
    fontSize: '26px',
    textAlign: 'center'
  },
  filters: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '20px'
  },
  select: {
    padding: '8px 14px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '14px',
    minWidth: '150px'
  },
  exportButton: {
    padding: '8px 16px',
    fontSize: '14px',
    borderRadius: '6px',
    background: '#4f46e5',
    color: '#fff',
    border: 'none',
    cursor: 'pointer'
  }
};

export default SalesTrends;

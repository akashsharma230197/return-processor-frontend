import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const BACKEND_URL = "https://return-processor-backend.onrender.com/api/data";

const BillingQueryComponent = () => {
  const [billingData, setBillingData] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [portals, setPortals] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedPortal, setSelectedPortal] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [loading, setLoading] = useState(false);

  // Fetch portals (static list)
  useEffect(() => {
    const fetchPortals = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/portal`);
        const names = res.data.map((item) => item.portal);
        setPortals(names);
      } catch (err) {
        console.error("Error fetching portals:", err);
      }
    };
    fetchPortals();
  }, []);

  // Fetch companies with data for selected date
  useEffect(() => {
    const fetchCompaniesForDate = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/billing?date=${selectedDate}`);
        if (Array.isArray(res.data.companies)) {
          setCompanies(res.data.companies);
        } else {
          setCompanies([]);
        }
      } catch (err) {
        console.error("Error fetching companies for date:", err);
        setCompanies([]);
      }
    };

    fetchCompaniesForDate();
  }, [selectedDate]);

  // Fetch billing data for selected filters
  useEffect(() => {
    const fetchBilling = async () => {
      setLoading(true);
      try {
        let url = `${BACKEND_URL}/billing?date=${selectedDate}`;
        if (selectedCompany) {
          url += `&company=${encodeURIComponent(selectedCompany)}`;
        }
        if (selectedPortal) {
          url += `&portal=${encodeURIComponent(selectedPortal)}`;
        }

        const res = await axios.get(url);
        const data = Array.isArray(res.data) ? res.data : res.data.items || [];
        setBillingData(data);
      } catch (err) {
        console.error("Error fetching billing data:", err);
        setBillingData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBilling();
  }, [selectedDate, selectedCompany, selectedPortal]);

  // Group billing data by company and portal with summed quantity per design
  const getGroupedSummary = () => {
    // Result shape: { company: { portal: { design: quantitySum } } }
    const summary = {};
    billingData.forEach(({ company, portal, design, quantity }) => {
      if (!summary[company]) summary[company] = {};
      if (!summary[company][portal]) summary[company][portal] = {};
      if (!summary[company][portal][design]) summary[company][portal][design] = 0;
      summary[company][portal][design] += quantity;
    });
    return summary;
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    let currentY = 10;

    doc.text(`Billing Summary for ${selectedDate}`, 14, currentY);
    currentY += 10;

    const grouped = getGroupedSummary();

    // For each company
    Object.entries(grouped).forEach(([company, portals]) => {
      doc.text(`Company: ${company}`, 14, currentY);
      currentY += 8;

      // For each portal in company
      Object.entries(portals).forEach(([portal, designs]) => {
        doc.text(`Portal: ${portal}`, 18, currentY);
        currentY += 6;

        // Prepare data for autoTable
        const tableBody = Object.entries(designs).map(([design, qty]) => [design, qty]);
        const totalQty = tableBody.reduce((acc, row) => acc + row[1], 0);

        autoTable(doc, {
          startY: currentY,
          head: [["Design", "Quantity"]],
          body: tableBody,
          margin: { left: 22 },
          styles: { fontSize: 10 },
          didDrawPage: (data) => {
            currentY = data.cursor.y + 10;
          },
        });

        // Add total row below table
        doc.text(`Total Quantity: ${totalQty}`, 22, currentY);
        currentY += 10;
      });

      currentY += 10; // extra space between companies
    });

   
const companyName = selectedCompany || "AllCompanies";
doc.save(`${companyName}_${selectedDate}.pdf`);

  };

  return (
    <div className="container">
      <h2>Billing Data</h2>

      <div className="filters">
        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setSelectedCompany(""); // Reset company when date changes
            }}
          />
        </div>

        <div className="form-group">
          <label>Company</label>
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
          >
            <option value="">-- All Companies --</option>
            {companies.map((comp, idx) => (
              <option key={idx} value={comp}>
                {comp}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Portal</label>
          <select
            value={selectedPortal}
            onChange={(e) => setSelectedPortal(e.target.value)}
          >
            <option value="">-- All Portals --</option>
            {portals.map((portal, idx) => (
              <option key={idx} value={portal}>
                {portal}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button onClick={exportPDF} style={{ marginTop: "1rem" }}>
        Export PDF Summary
      </button>

      {loading ? (
        <p>Loading billing data...</p>
      ) : billingData.length === 0 ? (
        <p>No billing records found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Company</th>
              <th>Design</th>
              <th>Quantity</th>
              <th>Portal</th>
              <th>Date</th>
              <th>User</th>
            </tr>
          </thead>
          <tbody>
            {billingData.map((item, index) => (
              <tr key={index}>
                <td>{item.company}</td>
                <td>{item.design}</td>
                <td>{item.quantity}</td>
                <td>{item.portal}</td>
                <td>{item.date?.split("T")[0]}</td>
                <td>{item.user_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <style>{`
        .container {
          padding: 1rem;
        }
        .filters {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }
        .form-group {
          display: flex;
          flex-direction: column;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 1rem;
        }
        th, td {
          border: 1px solid #ccc;
          padding: 0.5rem;
          text-align: center;
        }
        button {
          padding: 0.5rem 1rem;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default BillingQueryComponent;

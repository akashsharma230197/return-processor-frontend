import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const BACKEND_URL = "https://return-processor-backend.onrender.com/api/data";

const BillModify = () => {
  const [billingData, setBillingData] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [portals, setPortals] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedPortal, setSelectedPortal] = useState("");
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [isAuthorized, setIsAuthorized] = useState(null); // null = loading

  // ✅ Check username from DOM content (like "Logged in as akash")
  useEffect(() => {
    const text = document.body.innerText || "";
    const match = text.match(/Logged in as (\w+)/i);
    const username = match?.[1]?.toLowerCase();
    if (username === "shubham" || username === "akash") {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
    }
  }, []);

  const fetchPortals = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/portal`);
      setPortals(res.data.map((p) => p.portal));
    } catch (err) {
      console.error("Error fetching portals:", err);
    }
  };

  const fetchCompaniesForDate = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/billing?date=${selectedDate}`);
      setCompanies(res.data.companies || []);
    } catch (err) {
      console.error("Error fetching companies:", err);
      setCompanies([]);
    }
  };

  const fetchBilling = async () => {
    setLoading(true);
    try {
      let url = `${BACKEND_URL}/billing?date=${selectedDate}`;
      if (selectedCompany) url += `&company=${encodeURIComponent(selectedCompany)}`;
      if (selectedPortal) url += `&portal=${encodeURIComponent(selectedPortal)}`;
      const res = await axios.get(url);
      setBillingData(Array.isArray(res.data) ? res.data : res.data.items || []);
    } catch (err) {
      console.error("Error fetching billing data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchPortals();
      fetchCompaniesForDate();
      fetchBilling();
    }
  }, [selectedDate, selectedCompany, selectedPortal, isAuthorized]);

  const handleEdit = (id) => {
    const entry = billingData.find((item) => item.id === id);
    setEditId(id);
    setEditForm(entry);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await axios.put(`${BACKEND_URL}/billing/${editForm.id}`, editForm);
      setEditId(null);
      fetchBilling();
    } catch (err) {
      alert("Error updating entry");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;
    try {
      await axios.delete(`${BACKEND_URL}/billing/${id}`);
      fetchBilling();
    } catch (err) {
      alert("Error deleting entry");
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    let currentY = 10;
    doc.text(`Billing Summary for ${selectedDate}`, 14, currentY);
    currentY += 10;

    const summary = {};
    billingData.forEach(({ company, portal, design, quantity }) => {
      if (!summary[company]) summary[company] = {};
      if (!summary[company][portal]) summary[company][portal] = {};
      if (!summary[company][portal][design]) summary[company][portal][design] = 0;
      summary[company][portal][design] += quantity;
    });

    Object.entries(summary).forEach(([company, portals]) => {
      doc.text(`Company: ${company}`, 14, currentY);
      currentY += 8;
      Object.entries(portals).forEach(([portal, designs]) => {
        doc.text(`Portal: ${portal}`, 18, currentY);
        currentY += 6;
        const tableBody = Object.entries(designs).map(([d, q]) => [d, q]);
        const totalQty = tableBody.reduce((sum, row) => sum + row[1], 0);
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
        doc.text(`Total Quantity: ${totalQty}`, 22, currentY);
        currentY += 10;
      });
      currentY += 10;
    });

    doc.save(`${selectedCompany || "AllCompanies"}_${selectedDate}.pdf`);
  };

  if (isAuthorized === null) {
    return <p>Loading user info...</p>;
  }

  if (!isAuthorized) {
    return <p>Sorry, this function is out of your scope.</p>;
  }

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
              setSelectedCompany("");
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
            {companies.map((c, i) => (
              <option key={i} value={c}>
                {c}
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
            {portals.map((p, i) => (
              <option key={i} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button onClick={exportPDF}>Export PDF Summary</button>

      {loading ? (
        <p>Loading...</p>
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {billingData.map((item) =>
              editId === item.id ? (
                <tr key={item.id}>
                  <td>
                    <input
                      name="company"
                      value={editForm.company}
                      onChange={handleEditChange}
                    />
                  </td>
                  <td>
                    <input
                      name="design"
                      value={editForm.design}
                      onChange={handleEditChange}
                    />
                  </td>
                  <td>
                    <input
                      name="quantity"
                      type="number"
                      value={editForm.quantity}
                      onChange={handleEditChange}
                    />
                  </td>
                  <td>
                    <select
                      name="portal"
                      value={editForm.portal}
                      onChange={handleEditChange}
                    >
                      {portals.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{item.date?.split("T")[0]}</td>
                  <td>{item.user_id}</td>
                  <td>
                    <button onClick={handleSave}>💾</button>
                    <button onClick={() => setEditId(null)}>❌</button>
                  </td>
                </tr>
              ) : (
                <tr key={item.id}>
                  <td>{item.company}</td>
                  <td>{item.design}</td>
                  <td>{item.quantity}</td>
                  <td>{item.portal}</td>
                  <td>{item.date?.split("T")[0]}</td>
                  <td>{item.user_id}</td>
                  <td>
                    <button onClick={() => handleEdit(item.id)}>✏️</button>
                    <button onClick={() => handleDelete(item.id)}>🗑️</button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      )}

      <style>{`
        .container { padding: 1rem; }
        .filters { display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap; }
        .form-group { display: flex; flex-direction: column; }
        table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
        th, td { border: 1px solid #ccc; padding: 0.5rem; text-align: center; }
        input, select { padding: 4px; width: 100%; }
        button { margin: 0 2px; cursor: pointer; }
      `}</style>
    </div>
  );
};

export default BillModify;

import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const BACKEND_URL = "https://return-processor-backend.onrender.com/api/data";

const BillModify = () => {
  const [selectedTable, setSelectedTable] = useState("Billing");
  const [data, setData] = useState([]);
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
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    const text = document.body.innerText || "";
    const match = text.match(/Logged in as (\w+)/i);
    const username = match?.[1]?.toLowerCase();
    setIsAuthorized(username === "shubham" || username === "akash");
  }, []);

  useEffect(() => {
    if (isAuthorized) {
      fetchPortals();
      fetchCompaniesForDate();
      fetchData();
    }
  }, [selectedDate, selectedCompany, selectedPortal, selectedTable, isAuthorized]);

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
    const table = selectedTable.toLowerCase();
    const res = await axios.get(`${BACKEND_URL}/${table}?date=${selectedDate}`);

    let companies = [];

    if (table === "billing") {
      companies = res.data.companies || [];
    } else {
      const items = Array.isArray(res.data) ? res.data : res.data.items || [];
      companies = [...new Set(items.map(item => item.company))];
    }

    setCompanies(companies);
  } catch (err) {
    console.error("Error fetching companies:", err);
    setCompanies([]);
  }
};


  const fetchData = async () => {
    setLoading(true);
    try {
      let url = `${BACKEND_URL}/${selectedTable.toLowerCase()}?date=${selectedDate}`;
      if (selectedCompany) url += `&company=${encodeURIComponent(selectedCompany)}`;
      if (selectedPortal && selectedTable === "Billing")
        url += `&portal=${encodeURIComponent(selectedPortal)}`;

      const res = await axios.get(url);
      const items = Array.isArray(res.data) ? res.data : res.data.items || [];
      setData(items);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    const entry = data.find((item) => item.id === id);
    setEditId(id);
    setEditForm(entry);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await axios.put(`${BACKEND_URL}/${selectedTable.toLowerCase()}/${editForm.id}`, editForm);
      setEditId(null);
      fetchData();
    } catch (err) {
      alert("Error updating entry");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;
    try {
      await axios.delete(`${BACKEND_URL}/${selectedTable.toLowerCase()}/${id}`);
      fetchData();
    } catch (err) {
      alert("Error deleting entry");
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    let currentY = 10;
    doc.text(`${selectedTable} Summary for ${selectedDate}`, 14, currentY);
    currentY += 10;

    if (selectedTable === "Billing") {
      const summary = {};
      data.forEach(({ company, portal, design, quantity }) => {
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
    } else {
      autoTable(doc, {
        startY: currentY,
        head: [Object.keys(data[0] || {})],
        body: data.map((item) => Object.values(item)),
      });
      doc.save(`${selectedTable}_${selectedDate}.pdf`);
    }
  };

  const renderTable = () => {
    if (selectedTable === "Billing") {
      return (
        <table>
          <thead>
            <tr>
              <th>Company</th><th>Design</th><th>Qty</th><th>Portal</th><th>Date</th><th>User</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) =>
              editId === item.id ? (
                <tr key={item.id}>
                  <td><input name="company" value={editForm.company} onChange={handleEditChange} /></td>
                  <td><input name="design" value={editForm.design} onChange={handleEditChange} /></td>
                  <td><input name="quantity" type="number" value={editForm.quantity} onChange={handleEditChange} /></td>
                  <td>
                    <select name="portal" value={editForm.portal} onChange={handleEditChange}>
                      {portals.map((p) => <option key={p} value={p}>{p}</option>)}
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
                  <td>{item.company}</td><td>{item.design}</td><td>{item.quantity}</td><td>{item.portal}</td>
                  <td>{item.date?.split("T")[0]}</td><td>{item.user_id}</td>
                  <td>
                    <button onClick={() => handleEdit(item.id)}>✏️</button>
                    <button onClick={() => handleDelete(item.id)}>🗑️</button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      );
    }

    const headers = selectedTable === "ReturnMaster"
      ? ["company", "courier", "date", "no_return", "user_id"]
      : ["company", "courier", "date", "design", "quantity", "user_id"];

    return (
      <table>
        <thead>
          <tr>
            {headers.map((h) => <th key={h}>{h}</th>)}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) =>
            editId === item.id ? (
              <tr key={item.id}>
                {headers.map((field) => (
                  <td key={field}>
                    <input
                      name={field}
                      value={editForm[field]}
                      onChange={handleEditChange}
                    />
                  </td>
                ))}
                <td>
                  <button onClick={handleSave}>💾</button>
                  <button onClick={() => setEditId(null)}>❌</button>
                </td>
              </tr>
            ) : (
              <tr key={item.id}>
                {headers.map((field) => (
                  <td key={field}>
                    {field === "date" ? item[field]?.split("T")[0] : item[field]}
                  </td>
                ))}
                <td>
                  <button onClick={() => handleEdit(item.id)}>✏️</button>
                  <button onClick={() => handleDelete(item.id)}>🗑️</button>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    );
  };

  if (isAuthorized === null) return <p className="status">Loading user info...</p>;
  if (!isAuthorized) return <p className="status error">Sorry, this function is out of your scope.</p>;

  return (
    <div className="bill-container">
      <h2>{selectedTable} Management</h2>

      <div className="filters">
        <div>
          <label>Table</label>
          <select value={selectedTable} onChange={(e) => setSelectedTable(e.target.value)}>
            <option value="Billing">Billing</option>
            <option value="ReturnMaster">Return Master</option>
            <option value="ReturnDetailedEntry">Return Detailed Entry</option>
          </select>
        </div>
        <div>
          <label>Date</label>
          <input type="date" value={selectedDate} onChange={(e) => {
            setSelectedDate(e.target.value);
            setSelectedCompany("");
          }} />
        </div>
        <div>
          <label>Company</label>
          <select value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)}>
            <option value="">-- All Companies --</option>
            {companies.map((c, i) => <option key={i} value={c}>{c}</option>)}
          </select>
        </div>
        {selectedTable === "Billing" && (
          <div>
            <label>Portal</label>
            <select value={selectedPortal} onChange={(e) => setSelectedPortal(e.target.value)}>
              <option value="">-- All Portals --</option>
              {portals.map((p, i) => <option key={i} value={p}>{p}</option>)}
            </select>
          </div>
        )}
        <button className="export-btn" onClick={exportPDF}>📤 Export PDF</button>
      </div>

      {loading ? <p className="status">Loading...</p> : <div className="table-wrapper">{renderTable()}</div>}

      <style>{/* Add any required CSS here */}</style>
    </div>
  );
};

export default BillModify;

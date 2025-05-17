import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = 'https://return-processor-backend.onrender.com/api/data';

const CourierMaster = () => {
  const [couriers, setCouriers] = useState([]);
  const [newCourier, setNewCourier] = useState('');

  useEffect(() => {
    fetchCouriers();
  }, []);

  const fetchCouriers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/Courier`);
      setCouriers(res.data);
    } catch (err) {
      console.error('Error fetching couriers:', err);
    }
  };

  const addCourier = async () => {
    if (!newCourier) return;
    try {
      await axios.post(`${BASE_URL}/Courier`, { Courier: newCourier });
      setNewCourier('');
      fetchCouriers();
    } catch (err) {
      console.error('Error adding courier:', err);
    }
  };

  const deleteCourier = async (name) => {
    try {
      await axios.delete(`${BASE_URL}/Courier/${name}`);
      fetchCouriers();
    } catch (err) {
      console.error('Error deleting courier:', err);
    }
  };

  return (
    <div>
      <h2>Courier Master</h2>
      <input
        type="text"
        value={newCourier}
        onChange={(e) => setNewCourier(e.target.value)}
        placeholder="Enter courier name"
      />
      <button onClick={addCourier}>Add</button>
      <ul>
        {couriers.map((item, index) => (
          <li key={index}>
            {item.Courier}
            <button onClick={() => deleteCourier(item.Courier)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CourierMaster;

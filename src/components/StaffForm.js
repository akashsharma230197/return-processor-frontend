import React, { useState } from 'react';
import axios from 'axios';

const StaffForm = () => {
  const [form, setForm] = useState({
    name: '',
    guardian_name: '',
    aadhar_number: '',
    delhi_address: '',
    permanent_address: '',
    emergency_contact_name: '',
    emergency_contact_number: '',
  });
  const [aadharPhoto, setAadharPhoto] = useState(null);
  const [profilePic, setProfilePic] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(form).forEach(key => data.append(key, form[key]));
    if (aadharPhoto) data.append('aadhar_photo', aadharPhoto);
    if (profilePic) data.append('profile_pic', profilePic);

    try {
      await axios.post('http://localhost:5000/api/staff', data);
      alert('Staff saved!');
    } catch (err) {
      alert('Failed to save staff.');
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {['name', 'guardian_name', 'aadhar_number', 'delhi_address', 'permanent_address', 'emergency_contact_name', 'emergency_contact_number'].map(field => (
        <div key={field}>
          <label>{field.replace(/_/g, ' ')}</label>
          <input type="text" name={field} value={form[field]} onChange={handleChange} required />
        </div>
      ))}
      <div>
        <label>Aadhar Photo</label>
        <input type="file" accept="image/*" capture="environment" onChange={(e) => setAadharPhoto(e.target.files[0])} />
      </div>
      <div>
        <label>Profile Pic</label>
        <input type="file" accept="image/*" capture="user" onChange={(e) => setProfilePic(e.target.files[0])} />
      </div>
      <button type="submit">Save</button>
    </form>
  );
};

export default StaffForm;

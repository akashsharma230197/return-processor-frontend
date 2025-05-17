import React, { useState } from 'react';
import axios from 'axios';

const BACKEND_URL = 'https://return-processor-backend.onrender.com'; // ✅ Update to your Render backend

const Login = ({ setUser }) => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? `${BACKEND_URL}/api/auth/login` : `${BACKEND_URL}/api/auth/register`;

    try {
      const res = await axios.post(endpoint, form);
      const { id, username } = res.data;

      if (id && username) {
        localStorage.setItem('user_id', id);
        setUser({ user_id: id, username });
      } else {
        alert('Unexpected response from server');
      }
    } catch (err) {
      console.error('Register/Login error:', err);
      alert(err.response?.data?.error || err.message || 'Error occurred');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto' }}>
      <h2>{isLogin ? 'Login' : 'Register'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          value={form.username}
          onChange={e => setForm({ ...form, username: e.target.value })}
          placeholder="Username"
          required
          style={{ display: 'block', width: '100%', marginBottom: '10px' }}
        />
        <input
          type="password"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          placeholder="Password"
          required
          style={{ display: 'block', width: '100%', marginBottom: '10px' }}
        />
        <button type="submit" style={{ width: '100%', padding: '10px' }}>
          {isLogin ? 'Login' : 'Register'}
        </button>
      </form>

      <button
        onClick={() => setIsLogin(!isLogin)}
        style={{ marginTop: '10px', width: '100%', padding: '10px' }}
      >
        {isLogin ? 'New user? Register' : 'Existing user? Login'}
      </button>
    </div>
  );
};

export default Login;

import React, { useState } from 'react';
import axios from 'axios';
import './Login.css'; // Add styles in a separate CSS file

const BACKEND_URL = 'https://return-processor-backend.onrender.com';

const Login = ({ setUser }) => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin
      ? `${BACKEND_URL}/api/auth/login`
      : `${BACKEND_URL}/api/auth/register`;

    try {
      const res = await axios.post(endpoint, form);
      const { id, username,access } = res.data;

      if (id && username && access) {
        localStorage.setItem('user_id', id);
        setUser({ user_id: id, username });
      } else {
        setError('Unexpected response from server');
      }
    } catch (err) {
      console.error('Register/Login error:', err);
      setError(err.response?.data?.error || 'Error occurred');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>{isLogin ? 'Welcome Back 👋' : 'Create Your Account 🎉'}</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })}
            placeholder="Username"
            required
          />
          <input
            type="password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            placeholder="Password"
            required
          />
          <button type="submit">
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>
        <div className="toggle-link" onClick={() => {
          setError('');
          setIsLogin(!isLogin);
        }}>
          {isLogin ? "Don't have an account? Register →" : "← Already have an account? Login"}
        </div>
      </div>
    </div>
  );
};

export default Login;

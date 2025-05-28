import React, { useState } from 'react';
import axios from 'axios';

const BACKEND_URL = 'https://return-processor-backend.onrender.com';

const Login = ({ setUser }) => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [changeForm, setChangeForm] = useState({ username: '', currentPassword: '', newPassword: '' });
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (mode === 'login' || mode === 'register') {
        const endpoint = `${BACKEND_URL}/api/auth/${mode}`;
        const res = await axios.post(endpoint, form);
        const { id, username } = res.data;

        if (id && username) {
          localStorage.setItem('user_id', id);
          setUser({ user_id: id, username });
        } else {
          setError('Unexpected response from server');
        }
      } else if (mode === 'changePassword') {
        const endpoint = `${BACKEND_URL}/api/auth/change-password`;
        await axios.post(endpoint, changeForm);
        setSuccess('Password changed successfully!');
        setChangeForm({ username: '', currentPassword: '', newPassword: '' });
      }
    } catch (err) {
      console.error(`${mode} error:`, err);
      setError(err.response?.data?.error || 'Error occurred');
    }
  };

  const renderForm = () => {
    if (mode === 'changePassword') {
      return (
        <>
          <input value={changeForm.username} onChange={e => setChangeForm({ ...changeForm, username: e.target.value })} placeholder="Username" required />
          <input type="password" value={changeForm.currentPassword} onChange={e => setChangeForm({ ...changeForm, currentPassword: e.target.value })} placeholder="Current Password" required />
          <input type="password" value={changeForm.newPassword} onChange={e => setChangeForm({ ...changeForm, newPassword: e.target.value })} placeholder="New Password" required />
        </>
      );
    } else {
      return (
        <>
          <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="Username" required />
          <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Password" required />
        </>
      );
    }
  };

  return (
    <div className="login-container">
      <style>{`
        .login-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #8e44ad, #6c3483);
          font-family: 'Segoe UI', sans-serif;
        }
        .login-card {
          background: white;
          padding: 40px 30px;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          width: 100%;
          max-width: 400px;
        }
        .login-card h2 {
          margin-bottom: 20px;
          color: #6c3483;
        }
        .branding {
          font-weight: bold;
          font-size: 18px;
          text-align: center;
          margin-bottom: 20px;
          color: #8e44ad;
        }
        input {
          width: 100%;
          padding: 12px;
          margin: 10px 0;
          border: 1px solid #ccc;
          border-radius: 8px;
          font-size: 16px;
        }
        button {
          width: 100%;
          padding: 12px;
          background-color: #8e44ad;
          color: white;
          font-size: 16px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.3s ease;
        }
        button:hover {
          background-color: #732d91;
        }
        .toggle-link {
          margin-top: 10px;
          text-align: center;
          color: #6c3483;
          cursor: pointer;
          font-size: 14px;
        }
        .toggle-link:hover {
          text-decoration: underline;
        }
        .error-message {
          color: red;
          text-align: center;
          margin: 10px 0;
        }
        .success-message {
          color: green;
          text-align: center;
          margin: 10px 0;
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 30px 20px;
          }
        }
      `}</style>

      <div className="login-card">
        <h2>
          {mode === 'login' && 'Welcome Back 👋'}
          {mode === 'register' && 'Create Your Account 🎉'}
          {mode === 'changePassword' && 'Change Password 🔒'}
        </h2>

        <div className="branding">Balika Creation Software</div>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <form onSubmit={handleSubmit}>
          {renderForm()}
          <button type="submit">
            {mode === 'login' ? 'Login' : mode === 'register' ? 'Register' : 'Change Password'}
          </button>
        </form>

        <div className="toggle-link" onClick={() => {
          setError('');
          setSuccess('');
          setMode(mode === 'login' ? 'register' : 'login');
        }}>
          {mode === 'login' ? "Don't have an account? Register →" : "← Already have an account? Login"}
        </div>

        {mode !== 'changePassword' && (
          <div className="toggle-link" onClick={() => {
            setError('');
            setSuccess('');
            setMode('changePassword');
          }}>
            Forgot Password? Change →
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;

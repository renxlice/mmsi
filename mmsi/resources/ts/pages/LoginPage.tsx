import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getRedirectDashboard } from '../services/api';
import '../assets/c_log-in.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '', pin: '' });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const savedError = localStorage.getItem('loginError');
    if (savedError) {
      setErrorMessage(savedError);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newValue = name === 'pin' ? value.replace(/\D/g, '') : value;
    setForm({ ...form, [name]: newValue });
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    localStorage.setItem('loginError', msg);
  };

  const handleCloseError = () => {
    setErrorMessage(null);
    localStorage.removeItem('loginError');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    localStorage.removeItem('loginError');

    const { email, password, pin } = form;

    if (!email) return showError('Email tidak boleh kosong.');
    if (!password) return showError('Password tidak boleh kosong.');
    if (!pin) return showError('PIN tidak boleh kosong.');
    if (!/^\d+$/.test(pin)) return showError('PIN hanya boleh berisi angka.');
    if (pin.length < 4) return showError('PIN harus terdiri dari minimal 4 digit.');

    setLoading(true);

    try {
      const res = await api.post('/login', form);
      const { access_token, user } = res.data;

      if (!access_token || !user) {
        return showError('Gagal login. Data tidak lengkap.');
      }

      localStorage.setItem('token', access_token);
      localStorage.setItem('role', user.role);
      localStorage.setItem('user', JSON.stringify(user));
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      const redirectRes = await getRedirectDashboard();
      const redirectTo = redirectRes.data?.redirect_to;

      if (redirectTo) {
        navigate(redirectTo, { replace: true });
      } else {
        showError('Login berhasil, tapi tidak bisa diarahkan ke dashboard.');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Gagal login. Periksa kembali data Anda.';
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="c_log-in-frame">
      <h1 className="c_log-in-text11">MMSI</h1>

      <form onSubmit={handleSubmit} className="c_log-in-form">
        {errorMessage && (
          <div className="error-message-box">
            <span className="error-text">{errorMessage}</span>
            <button
              type="button"
              className="error-close-btn"
              onClick={handleCloseError}
            >
              ✕
            </button>
          </div>
        )}

        <label className="c_log-in-label">Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          className="c_log-in-input"
          required
        />

        <label className="c_log-in-label">Password</label>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          className="c_log-in-input"
          required
        />

        <label className="c_log-in-label">PIN</label>
        <input
          name="pin"
          type="password"
          value={form.pin}
          onChange={handleChange}
          className="c_log-in-input"
          required
          minLength={4}
        />

        <button type="submit" disabled={loading} className="c_log-in-button">
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;

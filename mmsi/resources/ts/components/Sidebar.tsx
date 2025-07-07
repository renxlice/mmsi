import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

const Sidebar: React.FC = () => {
  const [role, setRole] = useState(localStorage.getItem('role'));
  const navigate = useNavigate();
  const location = useLocation();

  // 🔄 Perbarui role saat route berpindah (efek setelah logout)
  useEffect(() => {
    setRole(localStorage.getItem('role'));
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      setRole(null); // update state agar Sidebar sembunyi
      navigate('/'); // redirect ke login
    }
  };

  // ❌ Jika tidak ada role, sembunyikan Sidebar
  if (!role) return null;

  return (
    <aside className="w-64 bg-gray-800 text-white h-screen p-4 fixed">
      <h2 className="text-xl font-bold mb-6">MMSI</h2>
      <nav className="space-y-2">
        {role === 'STRATEGIST' && (
          <Link to="/strategist/dashboard" className="block hover:bg-gray-700 p-2 rounded">
            Strategist Panel
          </Link>
        )}
        {role === 'ADMIN' && (
          <Link to="/admin/dashboard" className="block hover:bg-gray-700 p-2 rounded">
            Admin Panel
          </Link>
        )}
        {role === 'NOMINEE' && (
          <Link to="/nominee/dashboard" className="block hover:bg-gray-700 p-2 rounded">
            Nominee Panel
          </Link>
        )}
        <button
          onClick={handleLogout}
          className="block w-full text-left hover:bg-red-600 mt-4 p-2 rounded bg-red-500"
        >
          Logout
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;

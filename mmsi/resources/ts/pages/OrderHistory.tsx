import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Order } from '../types/order';
import { User } from '../types/user';
import { getCurrentUser } from '../services/api';
import '@/assets/order-history.css';

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const ordersResponse = await axios.get('http://127.0.0.1:8000/api/strategist/orders', {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const userResponse = await getCurrentUser();
      setUser(userResponse.data.user);
      setOrders(ordersResponse.data.data);
    } catch (err) {
      console.error('❌ Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const filteredOrders = orders.filter((order) => {
    const lowerSearch = searchTerm.toLowerCase();
    return (
      order.stock.toLowerCase().includes(lowerSearch) ||
      order.status.toLowerCase().includes(lowerSearch) ||
      (order.source_user && order.source_user.toLowerCase().includes(lowerSearch))
    );
  });

  return (
    <div className="c_strategist-panel-ho-frame">
      {/* Sidebar */}
      <div className="sidebar">
        <div>
          <h2 className="sidebar-title">MMSI</h2>
          <nav className="sidebar-nav">
            <a href="/strategist/dashboard">Home</a>
            <a href="/strategist/order-history" className="active">Order History</a>
            <a href="/strategist/daily-execution">Grafik Eksekusi Harian</a>
            <a href="/strategist/execution-monitor-view">Execution Monitor</a>
          </nav>
        </div>

        <div>
          <div className="strategist-info">
            <div>
              <p className="font-bold text-sm">{user?.name || 'Loading...'}</p>
              <p className="role">{user?.role || '...'}</p>
            </div>
          </div>

          <div className="sidebar-buttons">
            {/* <button className="settings">Settings</button> */}
            <button className="logout" onClick={handleLogout}>Log Out</button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="content-box">
          <div className="header">
            <h2>Order History</h2>
            <input
              type="text"
              placeholder="Search by stock, status, or user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <table className="order-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Stock</th>
                  <th>Price</th>
                  <th>Lots</th>
                  <th>Order Type</th>
                  <th>Status</th>
                  <th>Source User</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td className="uppercase">{order.stock}</td>
                      <td>{order.price}</td>
                      <td>{order.lots}</td>
                      <td>{order.order_type}</td>
                      <td>{order.status}</td>
                      <td>{order.source_user}</td>
                      <td>{new Date(order.created_at ?? '').toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8}>No orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

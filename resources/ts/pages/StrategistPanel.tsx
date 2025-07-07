import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import OrderForm, { OrderFormData } from '../components/OrderForm';
import OrderTable from '../components/OrderTable';
import ExecutionChart from '../components/ExecutionChart';
import ExecutionMonitor from '../components/ExecutionMonitor';
import MiniActivityLog from '../components/MiniActivityLog';
import RecheckSummaryPanel from '../components/RecheckSummaryPanel';
import { useOrders } from '../store/useOrders';
import {
  getStrategistNominees,
  exportOrdersToExcel,
  exportExecutionToExcel,
  getCurrentUser,
} from '../services/api';
import { User } from '../types/user';
import { verifyStrategistPin } from '../services/api';
import { useLocation } from 'react-router-dom';
import '@/assets/c_strategist-panel-ho.css';

const StrategistPanel: React.FC = () => {
  const { orders, fetchOrders, submitOrder } = useOrders();
  const [nominees, setNominees] = useState<User[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportingOrders, setExportingOrders] = useState(false);
  const [exportingExec, setExportingExec] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      await fetchOrders();
      const fetchedNominees = await getStrategistNominees();
      const profileResponse = await getCurrentUser();
      if (!Array.isArray(fetchedNominees)) throw new Error('Invalid nominee response');
      setNominees(fetchedNominees);
      setUser(profileResponse.data.user);
    } catch (err) {
      console.error('❌ Initial data fetch failed:', err);
      setError('Failed to load strategist data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (order: OrderFormData) => {
    if (!order.selected_target.length) {
      setError('Mohon pilih minimal satu nominee.');
      return;
    }
    if (!order.pin || order.pin.trim() === '') {
      setError('PIN Strategist wajib diisi.');
      return;
    }

    try {
      await verifyStrategistPin(order.pin);
    } catch (err: any) {
      Swal.fire('PIN Salah', err?.response?.data?.error || 'PIN tidak sesuai.', 'error');
      return;
    }

    const confirm = await Swal.fire({
      title: 'Konfirmasi Order',
      html: `
        <p><strong>Stock:</strong> ${order.stock}</p>
        <p><strong>Price:</strong> ${order.price}</p>
        <p><strong>Lots:</strong> ${order.lots}</p>
        <p><strong>Type:</strong> ${order.order_type}</p>
        <p><strong>Target Nominee:</strong> ${order.selected_target.length} user(s)</p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Submit Order',
      cancelButtonText: 'Batal',
    });

    if (!confirm.isConfirmed) return;

    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await submitOrder(order);
      await Swal.fire('Sukses!', 'Order berhasil dikirim.', 'success');
      setSuccessMessage('✅ Order submitted successfully.');
      fetchOrders();
    } catch (err: any) {
      console.error('❌ Submit error:', err);
      Swal.fire('Gagal!', err?.response?.data?.message || 'Gagal mengirim order.', 'error');
      setError(err?.response?.data?.message || err?.message || 'Gagal submit order.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportOrderExcel = async () => {
    setExportingOrders(true);
    try {
      await exportOrdersToExcel();
      await Swal.fire('Sukses!', 'File order berhasil diunduh.', 'success');
    } catch {
      Swal.fire('Export Gagal', 'Gagal mengunduh file order.', 'error');
    } finally {
      setExportingOrders(false);
    }
  };

  const handleExportExecutionExcel = async () => {
    setExportingExec(true);
    try {
      await exportExecutionToExcel();
      await Swal.fire('Sukses!', 'File eksekusi berhasil diunduh.', 'success');
    } catch {
      Swal.fire('Export Gagal', 'Gagal mengunduh file eksekusi.', 'error');
    } finally {
      setExportingExec(false);
    }
  };

  const handleExportDailyExecutionExcel = async () => {
    try {
      await exportExecutionToExcel();
      await Swal.fire('Sukses!', 'File grafik harian berhasil diunduh.', 'success');
    } catch {
      Swal.fire('Export Gagal', 'Gagal mengunduh grafik harian.', 'error');
    }
  };

  const handleLogout = () => {
    window.location.href = '/logout';
  };

  return (
    <div className="c_strategist-panel-ho-frame">
      {/* Sidebar */}
      <aside>
        <div>
          <div className="sidebar-title">MMSI</div>
          <nav>
            <a href="/strategist/dashboard" className="active">Home</a>
            <a href="/strategist/order-history">Order History</a>
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

          <div className="action-buttons">
            {/* <button className="settings">Settings</button> */}
            <button className="logout" onClick={handleLogout}>Log Out</button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main>
        <h1>Strategist Panel</h1>

        <div className="header-actions">
          <button onClick={handleExportOrderExcel} disabled={exportingOrders}>🧾 Export Orders</button>
          <button onClick={handleExportExecutionExcel} disabled={exportingExec}>🎯 Export Execution</button>
          {/* <button onClick={handleExportDailyExecutionExcel}>📈 Export Grafik Harian</button> */}
        </div>

        {loading && <p>Loading data...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {successMessage && <p className="text-green-600">{successMessage}</p>}

        {!loading && (
          <>
            <section className="order-form">
              <OrderForm onSubmit={handleSubmit} submitting={submitting} nominees={nominees} />
            </section>

            <div className="grid-2">
              <section className="recheck-summary">
                <RecheckSummaryPanel />
              </section>
              <section className="activity-log">
                <MiniActivityLog />
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default StrategistPanel;

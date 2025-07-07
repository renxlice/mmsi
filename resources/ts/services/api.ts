import axios from 'axios';
import { saveAs } from 'file-saver';
import { Order } from '../types/order';
import { Breakdown, Recheck } from '../types/common';
import { User } from '../types/user';
import { OrderFormData } from '../components/OrderForm';

// ✅ Base URL otomatis dari .env atau fallback absolut
const baseURL = import.meta.env.VITE_API_URL?.replace(/\/+$/, '') || 'https://panel.mmsi.site/panel/api';

const api = axios.create({
  baseURL,
  headers: {
    Accept: 'application/json',
  },
});

// ✅ Tambahkan token Authorization otomatis
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Tangani 401/403 secara global
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const code = err?.response?.status;

    if (code === 401 || code === 403) {
      console.warn('Session expired or unauthorized');
      localStorage.clear();

      // redirect tetap ke halaman root panel
      window.location.href = '/panel/';
    }

    // Optional debug log
    if (import.meta.env.DEV) {
      console.error('API Error:', err);
    }

    return Promise.reject(err);
  }
);

// ========== AUTH ==========
export const login = (email: string, password: string, pin: string) =>
  api.post<{ access_token: string; user: User }>('/login', { email, password, pin });

export const logout = () => api.post('/logout');

export const getCurrentUser = () => api.get<{ user: User }>('/user');

export const getRedirectDashboard = () =>
  api.get<{ redirect_to: string }>('/redirect-dashboard');

// ========== STRATEGIST ==========
export const fetchOrders = () =>
  api.get<{ data: Order[] }>('/strategist/orders').then((res) => res.data.data);

export const createOrder = (order: Partial<OrderFormData>) =>
  api.post('/strategist/orders', order);

export const updateOrderStatus = (id: string, status: string) =>
  api.post(`/strategist/orders/${id}/status`, { status });

export const getStrategistNominees = async (): Promise<User[]> => {
  const res = await api.get('/strategist/nominees');
  const nominees = res.data?.nominees || res.data?.data;
  if (!Array.isArray(nominees)) throw new Error('Invalid nominee response');
  return nominees;
};

// ========== EXPORT ==========
const exportBlob = async (url: string, filename: string) => {
  const response = await api.get(url, { responseType: 'blob' });
  const blob = new Blob([response.data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, filename);
};

export const exportOrdersToExcel = () =>
  exportBlob('/strategist/orders/export/orders', 'orders.xlsx');

export const exportExecutionToExcel = () =>
  exportBlob('/strategist/monitor-execution/export', 'execution_data.xlsx');

export const exportRechecksToExcel = () =>
  exportBlob('/recheck-export', 'rechecks.xlsx');

// ========== NOMINEE ==========
export const getNomineeInstructions = () =>
  api.get<{ data: Breakdown[] }>('/nominee/instructions').then((res) => res.data.data);

export const executeNomineeOrder = (id: string) =>
  api.post(`/nominee/execute/${id}`);

// ========== RECHECK ==========
export const getRecheckHistory = () =>
  api.get<{ data: Recheck[] }>('/recheck').then((res) => res.data.data);

export const submitRecheck = (recheck: {
  tanggal: string;
  kas: string;
  portofolio: Record<string, string>;
  pin: string;
}) => api.post('/recheck', recheck);

export const deleteRecheck = (id: string) => api.delete(`/recheck/${id}`);

export const updateRecheck = (id: string, data: Partial<Recheck>) =>
  api.put(`/recheck/${id}`, data);

export const verifyRecheck = (id: string) => api.post(`/recheck/${id}/verify`);

export const pingAutoRecheck = () => api.get('/system/auto-recheck');
export const pingAutoDeactivate = () => api.get('/system/auto-deactivate');

export const verifyStrategistPin = (pin: string) =>
  api.post('/verify-pin', { pin });

// ========== ADMIN ==========
export const registerUser = (data: {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'STRATEGIST' | 'NOMINEE';
  pin: string;
}) => api.post('/admin/register-user', data);

export const getAdminNominees = () =>
  api.get<{ data: User[] }>('/admin/nominees').then((res) => res.data.data);

export const getAdminNomineeInstructions = () =>
  api.get<{ data: Breakdown[] }>('/admin/nominee-instructions').then((res) => res.data.data);

export const getAllUsers = () =>
  api.get<{ users: User[] }>('/admin/users').then((res) => res.data.users);

export const toggleUserAktif = (userId: string) =>
  api.post(`/admin/toggle-user/${userId}`);

// 🌐 Default export
export default api;

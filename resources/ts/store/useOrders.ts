import { create } from 'zustand';
import { Order } from '../types/order';
import { OrderFormData } from '../components/OrderForm';
import api from '../services/api';

type OrderStore = {
  orders: Order[];
  loading: boolean;
  submitting: boolean;
  error: string | null;

  fetchOrders: () => Promise<void>;
  submitOrder: (order: OrderFormData) => Promise<void>;
  resetError: () => void;
};

export const useOrders = create<OrderStore>((set, get) => ({
  orders: [],
  loading: false,
  submitting: false,
  error: null,

  fetchOrders: async () => {
    set({ loading: true, error: null });

    try {
      const res = await api.get('/strategist/orders');
      const result = res.data;

      if (result?.status === 'success' && Array.isArray(result.data)) {
        set({ orders: result.data });
      } else {
        set({ error: 'Unexpected response from API.' });
      }
    } catch (error: any) {
      set({
        error: error?.response?.data?.message || 'Failed to fetch orders.',
      });
    } finally {
      set({ loading: false });
    }
  },

  submitOrder: async (order: OrderFormData) => {
    set({ submitting: true, error: null });

    try {
      const res = await api.post('/strategist/orders', order);
      const result = res.data;

      if (result?.status === 'success') {
        await get().fetchOrders(); // 🔁 Refresh after submit
      } else {
        set({ error: result?.message || 'Order submission failed.' });
      }
    } catch (error: any) {
      set({
        error: error?.response?.data?.message || 'Failed to submit order.',
      });
    } finally {
      set({ submitting: false });
    }
  },

  resetError: () => set({ error: null }),
}));

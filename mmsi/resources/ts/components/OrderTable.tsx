import React from 'react';
import { Order } from '../types/order';

const statusColorMap: Record<'NEW' | 'IN_PROGRESS' | 'COMPLETED', string> = {
  NEW: 'bg-yellow-500',
  IN_PROGRESS: 'bg-blue-500',
  COMPLETED: 'bg-green-600',
};

interface OrderTableProps {
  orders: Order[];
}

const OrderTable: React.FC<OrderTableProps> = ({ orders }) => {
  if (!Array.isArray(orders)) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border rounded-lg overflow-hidden shadow-sm">
        <thead className="bg-gray-100 text-left text-gray-700">
          <tr>
            <th className="p-3">Stock</th>
            <th className="p-3">Type</th>
            <th className="p-3">Price</th>
            <th className="p-3">Lots</th>
            <th className="p-3">Status</th>
            <th className="p-3">Date</th>
          </tr>
        </thead>

        <tbody>
          {orders.length > 0 ? (
            orders.map((order) => (
              <tr key={order.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium text-blue-800">{order.stock ?? '-'}</td>
                <td className="p-3">{order.order_type}</td>
                <td className="p-3">
                  {typeof order.price === 'number'
                    ? order.price.toLocaleString('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                      })
                    : '-'}
                </td>
                <td className="p-3">{order.lots ?? '-'}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-white text-xs font-semibold ${
                      statusColorMap[order.status as keyof typeof statusColorMap] || 'bg-gray-400'
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="p-3">
                  {order.created_at
                    ? new Date(order.created_at).toLocaleString('id-ID', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })
                    : '-'}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="text-center text-gray-500 py-6">
                No orders available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;

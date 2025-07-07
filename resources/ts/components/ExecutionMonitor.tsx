import React, { useEffect, useState } from 'react';
import api from '../services/api';

interface Breakdown {
  id: string;
  stock: string;
  price: number;
  lots: number;
  status: string;
  execution_time: string | null;
  auto_executed: boolean;
  nominee: {
    name: string;
    email: string;
  };
}

const statusColors: Record<string, string> = {
  WAITING: 'bg-yellow-500',
  EXECUTED: 'bg-green-600',
  IN_PROGRESS: 'bg-blue-500',
};

const ExecutionMonitor: React.FC = () => {
  const [breakdowns, setBreakdowns] = useState<Breakdown[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await api.get('/strategist/monitor-execution');
      setBreakdowns(res.data.data || []);
      setLoading(false);
    };
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="c_strategist-panel-ho-rectangle17 bg-white p-6 rounded-[25px] shadow">
      <h2 className="c_strategist-panel-ho-text23 mb-4">📡 Execution Monitor</h2>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border rounded-lg overflow-hidden">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-2">Nominee</th>
                <th className="p-2">Stock</th>
                <th className="p-2">Price</th>
                <th className="p-2">Lots</th>
                <th className="p-2">Status</th>
                <th className="p-2">Executed At</th>
                <th className="p-2">Type</th>
              </tr>
            </thead>
            <tbody>
              {breakdowns.map((b) => (
                <tr key={b.id} className="border-t hover:bg-gray-50">
                  <td className="p-2 font-medium text-blue-800">{b.nominee?.name}</td>
                  <td className="p-2">{b.stock}</td>
                  <td className="p-2">{b.price}</td>
                  <td className="p-2">{b.lots}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-white text-xs font-semibold ${statusColors[b.status] || 'bg-gray-400'}`}>
                      {b.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-2 text-gray-600">
                    {b.execution_time ? new Date(b.execution_time).toLocaleString('id-ID') : '-'}
                  </td>
                  <td className="p-2 text-sm font-medium">
                    {b.auto_executed ? 'Auto' : 'Manual'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ExecutionMonitor;

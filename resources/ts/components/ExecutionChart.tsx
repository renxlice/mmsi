import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import api from '../services/api';

Chart.register(...registerables);

interface Breakdown {
  execution_time: string;
  status: string;
}

const ExecutionChart: React.FC = () => {
  const [executedPerDate, setExecutedPerDate] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchExecutionData();
  }, [startDate, endDate]);

  const fetchExecutionData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/strategist/monitor-execution');
      const data: Breakdown[] = res.data.data || [];

      const filtered = data.filter((b) => {
        if (b.status !== 'EXECUTED') return false;
        if (!b.execution_time) return false;

        const execDate = new Date(b.execution_time).toISOString().split('T')[0];

        if (startDate && execDate < startDate) return false;
        if (endDate && execDate > endDate) return false;

        return true;
      });

      const countPerDate: Record<string, number> = {};
      filtered.forEach((b) => {
        const date = new Date(b.execution_time).toISOString().split('T')[0];
        countPerDate[date] = (countPerDate[date] || 0) + 1;
      });

      setExecutedPerDate(countPerDate);
    } catch (err) {
      console.error('Gagal mengambil data eksekusi:', err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: Object.keys(executedPerDate).sort(),
    datasets: [
      {
        label: 'Jumlah Eksekusi',
        data: Object.keys(executedPerDate)
          .sort()
          .map((date) => executedPerDate[date]),
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: '#3b82f6',
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      x: {
        title: { display: true, text: 'Tanggal' },
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Jumlah Eksekusi' },
      },
    },
  };

  return (
    <div className="c_strategist-panel-ho-rectangle16 bg-white p-6 rounded-[25px] shadow">
      <h2 className="c_strategist-panel-ho-text23 mb-4">📈 Grafik Eksekusi Harian</h2>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Dari Tanggal</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border p-3 rounded-lg text-sm w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Sampai Tanggal</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border p-3 rounded-lg text-sm w-full"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading grafik...</p>
      ) : Object.keys(executedPerDate).length === 0 ? (
        <p className="text-gray-500">Belum ada data eksekusi.</p>
      ) : (
        <Line data={chartData} options={chartOptions} />
      )}
    </div>
  );
};

export default ExecutionChart;

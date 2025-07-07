import React, { useEffect, useState } from 'react';
import axios from 'axios';


type Instruction = {
  id: string;
  stock: string;
  price: number;
  lots: number;
  status: string;
  execution_time: string | null;
  order: {
    strategist: { name: string } | null;
  };
  nominee: { name: string } | null;
};

const MonitoringInstruksiNominee: React.FC = () => {
  const [instructions, setInstructions] = useState<Instruction[]>([]);

  const authHeader = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      Accept: 'application/json',
    },
  });

  const fetchInstructions = async () => {
    try {
      const res = await axios.get('/api/admin/nominee-instructions', authHeader());
      setInstructions(res.data?.data || []);
    } catch (err) {
      console.error('❌ Failed to load nominee instructions:', err);
    }
  };

  useEffect(() => {
    fetchInstructions();
  }, []);

  return (
    <div className="bg-white p-6 rounded shadow-md mb-8 overflow-x-auto">
      <h2 className="text-xl font-semibold mb-4">Monitoring Instruksi Nominee</h2>
      <table className="w-full text-sm">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 text-left">Stock</th>
            <th className="p-2 text-left">Price</th>
            <th className="p-2 text-left">Lots</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Strategist</th>
            <th className="p-2 text-left">Nominee</th>
            <th className="p-2 text-left">Executed At</th>
          </tr>
        </thead>
        <tbody>
          {instructions.map((i) => (
            <tr key={i.id} className="border-t">
              <td className="p-2">{i.stock}</td>
              <td className="p-2">{i.price}</td>
              <td className="p-2">{i.lots}</td>
              <td className="p-2">
                <span className="px-2 py-1 rounded text-white text-xs bg-blue-600">{i.status}</span>
              </td>
              <td className="p-2">{i.order?.strategist?.name ?? '-'}</td>
              <td className="p-2">{i.nominee?.name ?? '-'}</td>
              <td className="p-2">{i.execution_time ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MonitoringInstruksiNominee;

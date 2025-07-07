import React from 'react';

type Recheck = {
  id: string;
  tanggal: string;
  kas: string;
  portofolio: Record<string, string>;
  admin_name?: string;
  nominee?: { name: string };
  verifikasi_admin_1?: boolean;
};

type Props = {
  recheckList: Recheck[];
  onEditClick: (r: Recheck) => void;
  onDelete: (id: string) => void;
  onVerify: (id: string) => void;
};

export default function BreakdownAudit({ recheckList, onEditClick, onDelete, onVerify }: Props) {
  const totalPortoValue = (portofolio: Record<string, string>) =>
    Object.values(portofolio).reduce((sum, val) => sum + parseFloat(val), 0);

  return (
    <div className="bg-white p-4 rounded shadow-md mt-4">
      <h2 className="text-lg font-semibold mb-3">📊 Breakdown & Audit</h2>
      {recheckList.map((r) => (
        <div key={r.id} className="border-b py-3">
          <div className="text-sm font-bold mb-1">
            {r.tanggal} – {r.admin_name ? `Admin: ${r.admin_name}` : r.nominee?.name ? `Nominee: ${r.nominee.name}` : 'Unknown'}
          </div>
          {Object.entries(r.portofolio).map(([stock, value]) => (
            <div key={stock} className="text-xs ml-2">{stock}: {value}</div>
          ))}
          <div className="mt-2 flex gap-2">
            {!r.verifikasi_admin_1 && (
              <>
                <button onClick={() => onVerify(r.id)} className="btn-blue">Verifikasi</button>
                <button onClick={() => onEditClick(r)} className="btn-yellow">Edit</button>
              </>
            )}
            <button onClick={() => onDelete(r.id)} className="btn-red">Hapus</button>
          </div>
        </div>
      ))}
    </div>
  );
}

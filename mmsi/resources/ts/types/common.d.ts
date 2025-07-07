export interface ApiResponse<T = any> {
  message: string;
  data: T;
}

export interface Breakdown {
  id: string;
  order_id: string;
  nominee_id: string;
  broker_code: string;
  broker_id: string;
  stock: string;
  price: number;
  lots: number;
  status: 'WAITING' | 'EXECUTED';
  execution_time?: string;
  auto_executed: boolean;
}

export interface Recheck {
  id: string;
  nominee_id: string;
  tanggal: string;
  kas: number;
  portofolio: Record<string, number>; // { 'BBCA': 100, 'BBRI': 200 }
  verifikasi_admin_1: boolean;
  timestamp_verifikasi?: string;
}

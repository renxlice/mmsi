export type OrderStatus = 'NEW' | 'IN_PROGRESS' | 'COMPLETED';

export type OrderType = 'Buy' | 'Sell' | 'Withdraw';

export interface Order {
  id: string;
  stock: string;
  price: number;
  lots: number;
  order_type: OrderType;
  status: OrderStatus;
  selected_target: any[]; // bisa dibuat lebih spesifik jika struktur known
  source_user: string;
  created_at?: string;
  updated_at?: string;
}
 
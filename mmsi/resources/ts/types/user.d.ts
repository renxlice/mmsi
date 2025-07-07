export type UserRole = 'STRATEGIST' | 'ADMIN' | 'NOMINEE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  aktif: boolean;
  pin?: string;
  created_at?: string;
}

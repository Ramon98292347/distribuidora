export type AccountsPayableStatus = 'aberta' | 'paga' | 'vencida';

export interface AccountsPayable {
  id: string;
  description: string;
  supplier: string;
  category: string;
  value: number;
  dueDate: string;
  status: AccountsPayableStatus;
  paymentDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccountsPayableFilters {
  month: string;
  status: 'todas' | AccountsPayableStatus;
  category: string;
  supplier: string;
}

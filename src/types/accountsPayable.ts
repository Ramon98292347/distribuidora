export type AccountsPayableStatus = 'aberta' | 'paga' | 'vencida' | 'cancelada';

export type AccountsPayablePaymentMethod =
  | 'dinheiro'
  | 'pix'
  | 'cartao_debito'
  | 'cartao_credito'
  | 'boleto'
  | 'transferencia'
  | 'outro';

export interface AccountsPayable {
  id: string;
  description: string;
  supplier: string;
  category: string;
  value: number;
  dueDate: string;
  status: AccountsPayableStatus;
  paymentDate: string | null;
  paymentMethod: AccountsPayablePaymentMethod | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AccountsPayableFilters {
  month: string;
  status: 'todas' | AccountsPayableStatus;
  category: string;
  supplier: string;
}

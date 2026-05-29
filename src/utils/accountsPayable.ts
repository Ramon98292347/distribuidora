import { AccountsPayable, AccountsPayableStatus } from '@/types/accountsPayable';

const toDateOnly = (value: Date) => value.toISOString().slice(0, 10);

export const getCurrentMonthValue = () => {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  return `${now.getFullYear()}-${month}`;
};

export const resolveStatusByDate = (status: AccountsPayableStatus, dueDate: string): AccountsPayableStatus => {
  if (status === 'paga' || status === 'cancelada') {
    return status;
  }

  return dueDate < toDateOnly(new Date()) ? 'vencida' : 'aberta';
};

export const resolveStatus = (item: AccountsPayable): AccountsPayable => ({
  ...item,
  status: resolveStatusByDate(item.status, item.dueDate),
});

export const getMonthRange = (month: string) => {
  const [year, monthValue] = month.split('-').map(Number);
  const start = new Date(year, monthValue - 1, 1);
  const end = new Date(year, monthValue, 0);
  return {
    start: toDateOnly(start),
    end: toDateOnly(end),
  };
};

export const toDateString = (value: string) => new Date(`${value}T00:00:00`).toLocaleDateString('pt-BR');

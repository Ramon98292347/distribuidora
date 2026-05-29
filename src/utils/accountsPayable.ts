import { AccountsPayable } from '@/types/accountsPayable';

const STORAGE_KEY = 'accounts_payable_items_v1';

const toDateOnly = (value: Date) => value.toISOString().slice(0, 10);

export const getCurrentMonthValue = () => {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  return `${now.getFullYear()}-${month}`;
};

export const resolveStatus = (item: AccountsPayable): AccountsPayable => {
  if (item.status === 'paga') {
    return item;
  }

  const today = toDateOnly(new Date());
  if (item.dueDate < today) {
    return { ...item, status: 'vencida' };
  }

  return { ...item, status: 'aberta' };
};

export const loadAccountsPayable = (): AccountsPayable[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as AccountsPayable[];
    return parsed.map(resolveStatus);
  } catch {
    return [];
  }
};

export const saveAccountsPayable = (items: AccountsPayable[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.map(resolveStatus)));
};

export const getMonthRange = (month: string) => {
  const [year, monthValue] = month.split('-').map(Number);
  const start = new Date(year, monthValue - 1, 1);
  const end = new Date(year, monthValue, 0);
  return {
    start: toDateOnly(start),
    end: toDateOnly(end),
  };
};


import { Expense, Alert } from '../types';

const STORAGE_KEY = 'smartspend_expenses';
const ALERTS_KEY = 'smartspend_alerts';

export const storageService = {
  getExpenses: (): Expense[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveExpense: (expense: Expense) => {
    const expenses = storageService.getExpenses();
    const updated = [expense, ...expenses];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  deleteExpense: (id: string) => {
    const expenses = storageService.getExpenses();
    const updated = expenses.filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  getAlerts: (): Alert[] => {
    const data = localStorage.getItem(ALERTS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveAlert: (alert: Alert) => {
    const alerts = storageService.getAlerts();
    const updated = [alert, ...alerts];
    localStorage.setItem(ALERTS_KEY, JSON.stringify(updated));
    return updated;
  },

  clearAlerts: () => {
    localStorage.removeItem(ALERTS_KEY);
  }
};


import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ReceiptScanner from './components/ReceiptScanner';
import History from './components/History';
import { Expense, Alert, Category } from './types';
import { storageService } from './services/storageService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'analytics' | 'alerts'>('dashboard');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    const savedExpenses = storageService.getExpenses();
    const savedAlerts = storageService.getAlerts();
    setExpenses(savedExpenses);
    setAlerts(savedAlerts);
  }, []);

  const handleSaveExpense = (expense: Expense) => {
    const updated = storageService.saveExpense(expense);
    setExpenses(updated);
    setShowScanner(false);
    detectAlerts(expense, updated);
  };

  const detectAlerts = (newExpense: Expense, allExpenses: Expense[]) => {
    const newAlerts: Alert[] = [];
    
    // 1. Budget Threshold Check
    const monthlyTotal = allExpenses.reduce((sum, e) => sum + e.total, 0);
    const budgetLimit = 3000;
    if (monthlyTotal > budgetLimit) {
      newAlerts.push({
        id: Math.random().toString(36).substr(2, 9),
        type: 'BUDGET_EXCEEDED',
        message: `Budget Breach: Total spend ($${monthlyTotal.toFixed(2)}) exceeded $${budgetLimit} threshold.`,
        timestamp: Date.now(),
        isRead: false
      });
    }

    // 2. Unusual Spending Detection (2x Average in Category)
    const categoryExpenses = allExpenses.filter(e => e.category === newExpense.category && e.id !== newExpense.id);
    if (categoryExpenses.length >= 3) {
      const categoryAvg = categoryExpenses.reduce((sum, e) => sum + e.total, 0) / categoryExpenses.length;
      if (newExpense.total > (categoryAvg * 2.5)) {
        newAlerts.push({
          id: Math.random().toString(36).substr(2, 9),
          type: 'UNUSUAL_SPENDING',
          message: `Unusual Spending: Your ${newExpense.total} purchase at ${newExpense.merchant} is 250% higher than your average ${newExpense.category} spend.`,
          timestamp: Date.now(),
          isRead: false
        });
      }
    }

    if (newAlerts.length > 0) {
      let updatedAlerts = alerts;
      newAlerts.forEach(a => {
        updatedAlerts = storageService.saveAlert(a);
      });
      setAlerts(updatedAlerts);
    }
  };

  const deleteExpense = (id: string) => {
    const updated = storageService.deleteExpense(id);
    setExpenses(updated);
  };

  const renderContent = () => {
    if (showScanner) {
      return (
        <div className="flex justify-center items-start pt-10 px-4">
          <ReceiptScanner onSave={handleSaveExpense} onCancel={() => setShowScanner(false)} />
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard expenses={expenses} onAddClick={() => setShowScanner(true)} />;
      case 'history':
        return <History expenses={expenses} onDelete={deleteExpense} onAdd={() => setShowScanner(true)} />;
      case 'alerts':
        return (
          <div className="max-w-3xl mx-auto space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900">Security & Budget Alerts</h2>
                <p className="text-gray-400">AI monitoring for unusual financial activity</p>
              </div>
              <button 
                onClick={() => { storageService.clearAlerts(); setAlerts([]); }}
                className="text-sm font-bold text-indigo-600 hover:text-indigo-700"
              >
                Dismiss All
              </button>
            </div>
            {alerts.length === 0 && (
              <div className="bg-white rounded-3xl p-20 text-center border border-dashed border-gray-200">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">All Systems Normal</h3>
                <p className="text-gray-400 mt-2">We haven't detected any unusual spending or budget breaches.</p>
              </div>
            )}
            {alerts.map(alert => (
              <div key={alert.id} className={`p-6 rounded-3xl border shadow-sm flex items-start gap-5 transition-all ${alert.type === 'BUDGET_EXCEEDED' ? 'bg-orange-50 border-orange-100' : 'bg-rose-50 border-rose-100'}`}>
                <div className={`p-4 rounded-2xl flex-shrink-0 ${alert.type === 'BUDGET_EXCEEDED' ? 'bg-orange-600 text-white' : 'bg-rose-600 text-white'}`}>
                  {alert.type === 'BUDGET_EXCEEDED' ? (
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{alert.type.replace('_', ' ')}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(alert.timestamp).toLocaleString()}</p>
                  </div>
                  <p className="text-gray-800 font-bold text-lg leading-tight">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        );
      case 'analytics':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-700">
            <div className="bg-white rounded-3xl p-10 border border-gray-100 shadow-sm col-span-1 md:col-span-2 text-center">
               <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
               </div>
               <h2 className="text-3xl font-black text-gray-900">Advanced Analytics Hub</h2>
               <p className="text-gray-500 max-w-lg mx-auto mt-4 text-lg">Detailed projection and trend analysis based on your historical receipt scans.</p>
            </div>
            
            <AnalyticsCard title="Spend Velocity" desc="How quickly your budget is being consumed" stat="High" color="bg-rose-50 text-rose-600" />
            <AnalyticsCard title="Loyalty Leader" desc="Merchant you visit most frequently" stat={expenses[0]?.merchant || "N/A"} color="bg-indigo-50 text-indigo-600" />
          </div>
        )
      default:
        return null;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} alertCount={alerts.filter(a => !a.isRead).length}>
      {renderContent()}
    </Layout>
  );
};

const AnalyticsCard = ({ title, desc, stat, color }: any) => (
  <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex justify-between items-center">
    <div>
      <h4 className="text-gray-900 font-black text-xl">{title}</h4>
      <p className="text-gray-400 text-sm mt-1">{desc}</p>
    </div>
    <div className={`px-4 py-2 rounded-2xl font-black text-lg ${color}`}>
      {stat}
    </div>
  </div>
);

export default App;


import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Expense } from '../types';

interface DashboardProps {
  expenses: Expense[];
  onAddClick: () => void;
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#3b82f6', '#94a3b8'];

const Dashboard: React.FC<DashboardProps> = ({ expenses, onAddClick }) => {
  const totalSpend = expenses.reduce((acc, curr) => acc + curr.total, 0);
  const monthlyData = expenses.reduce((acc: any[], curr) => {
    const month = new Date(curr.date).toLocaleString('default', { month: 'short' });
    const existing = acc.find(a => a.name === month);
    if (existing) existing.total += curr.total;
    else acc.push({ name: month, total: curr.total });
    return acc;
  }, []).sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());

  const categoryData = expenses.reduce((acc: any[], curr) => {
    const existing = acc.find(a => a.name === curr.category);
    if (existing) existing.value += curr.total;
    else acc.push({ name: curr.category, value: curr.total });
    return acc;
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Financial Overview</h2>
          <p className="text-gray-500">Welcome back, John. Here's your spending summary.</p>
        </div>
        <button 
          onClick={onAddClick}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 transition-all hover:scale-105 active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          Scan New Receipt
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Total Monthly Spend" 
          value={`$${totalSpend.toLocaleString()}`} 
          sub="3.2% from last month" 
          up={true} 
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard 
          label="Average Receipt" 
          value={`$${expenses.length ? (totalSpend / expenses.length).toFixed(2) : '0.00'}`} 
          sub="Based on last 30 days" 
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>}
        />
        <StatCard 
          label="Top Category" 
          value={categoryData.sort((a, b) => b.value - a.value)[0]?.name || 'None'} 
          sub="Most frequent spending" 
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Spending Trends</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                   contentStyle={{backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                   itemStyle={{color: '#6366f1'}}
                />
                <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Category Distribution</h3>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {categoryData.map((cat, idx) => (
              <div key={cat.name} className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[idx % COLORS.length]}}></div>
                <span className="truncate">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Receipts List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">Recent Transactions</h3>
          <button className="text-indigo-600 font-semibold text-sm hover:underline">View all</button>
        </div>
        <div className="divide-y divide-gray-100">
          {expenses.slice(0, 5).map((exp) => (
            <div key={exp.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
                  <CategoryIcon category={exp.category} />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{exp.merchant}</p>
                  <p className="text-sm text-gray-400">{exp.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">${exp.total.toFixed(2)}</p>
                <p className="text-xs text-indigo-500 font-medium">{exp.category}</p>
              </div>
            </div>
          ))}
          {expenses.length === 0 && (
            <div className="p-12 text-center text-gray-400">
              No recent receipts found. Start by scanning one!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, sub, icon, up }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
        {icon}
      </div>
      {up !== undefined && (
        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${up ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {up ? '↑' : '↓'} {sub}
        </span>
      )}
    </div>
    <p className="text-sm text-gray-500 font-medium mb-1">{label}</p>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    {up === undefined && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

const CategoryIcon = ({ category }: { category: string }) => {
  switch (category) {
    case 'Food & Dining': return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;
    default: return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>;
  }
};

export default Dashboard;

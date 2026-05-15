import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  Wallet, 
  Plus, 
  Receipt, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  UploadCloud,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  Ban
} from 'lucide-react';

const Expenses = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    category: 'TRAVEL',
    description: '',
    receipt: null
  });

  const fetchExpenses = async () => {
    try {
      const response = await api.get('expenses/');
      setExpenses(response.data);
    } catch (error) {
      console.error("Failed to fetch expenses", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('amount', formData.amount);
    data.append('category', formData.category);
    data.append('description', formData.description);
    if (formData.receipt) data.append('receipt', formData.receipt);

    try {
      await api.post('expenses/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setIsFormOpen(false);
      setFormData({ amount: '', category: 'TRAVEL', description: '', receipt: null });
      fetchExpenses();
    } catch (error) {
      alert('Failed to submit expense');
    }
  };

  const handleAction = async (id, action) => {
    try {
      await api.post(`expenses/${id}/${action}/`);
      fetchExpenses();
    } catch (error) {
      alert(`Failed to ${action} expense`);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'APPROVED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'REJECTED': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-amber-50 text-amber-600 border-amber-100';
    }
  };

  if (loading) return <div className="p-20 text-center flex flex-col items-center gap-4">
    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Loading Expense Vault...</p>
  </div>;

  const totalAmount = expenses.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
  const approvedAmount = expenses.filter(e => e.status === 'APPROVED').reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

  return (
    <div className="space-y-10 animate-fade-in pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Operational <span className="gradient-text">Expenses</span></h1>
          <p className="text-slate-500 font-medium">
            {isAdmin ? "Review and manage team reimbursement claims." : "Manage and track your field reimbursements with precision."}
          </p>
        </div>
        {!isAdmin && (
          <button 
            onClick={() => setIsFormOpen(!isFormOpen)}
            className={`flex items-center gap-2 px-8 py-4 rounded-[22px] font-black transition-all ${isFormOpen ? 'bg-slate-900 text-white' : 'premium-button text-white shadow-xl shadow-blue-100'}`}
          >
            {isFormOpen ? <><X size={20} /> Close Form</> : <><Plus size={20} /> New Expense Claim</>}
          </button>
        )}
      </div>

      {/* Collapsible Form Section (Only for Agents) */}
      {isFormOpen && !isAdmin && (
        <div className="premium-card overflow-hidden animate-scale-in origin-top">
          <div className="p-1 w-full bg-gradient-to-r from-blue-600 to-indigo-600"></div>
          <div className="p-10 md:p-12">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Receipt size={20} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Submit Claim Details</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Provide accurate operational costs</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-[0.2em]">Claim Amount (₹)</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                    <input 
                      type="number" 
                      step="0.01"
                      required
                      placeholder="0.00"
                      className="w-full pl-12 pr-6 py-5 rounded-[22px] bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-bold transition-all shadow-inner"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-[0.2em]">Expense Category</label>
                  <select 
                    className="w-full px-6 py-5 rounded-[22px] bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-bold appearance-none transition-all cursor-pointer shadow-inner"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="TRAVEL">Travel / Fuel</option>
                    <option value="FOOD">Food & Beverage</option>
                    <option value="MAINTENANCE">Equipment / Maintenance</option>
                    <option value="OTHER">Other Expenses</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-[0.2em]">Upload Receipt</label>
                  <label className="flex items-center gap-4 w-full px-6 py-5 rounded-[22px] bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer shadow-inner group">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                      <UploadCloud size={20} />
                    </div>
                    <span className="text-sm font-bold text-slate-500 truncate">
                      {formData.receipt ? formData.receipt.name : 'Select file (JPG, PNG, PDF)'}
                    </span>
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={(e) => setFormData({...formData, receipt: e.target.files[0]})}
                      accept="image/*,.pdf"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-[0.2em]">Operational Description</label>
                <textarea 
                  required
                  rows="2"
                  placeholder="Provide context for this expenditure..."
                  className="w-full px-6 py-5 rounded-[25px] bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium transition-all resize-none shadow-inner"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>

              <div className="flex justify-end gap-6 pt-4 border-t border-slate-50">
                <button 
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-10 py-5 rounded-[22px] font-black text-slate-400 hover:text-slate-900 transition-all uppercase tracking-widest text-xs"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="premium-button px-14 py-5 rounded-[22px] font-black text-white transition-all uppercase tracking-widest text-xs shadow-xl shadow-blue-100"
                >
                  Authorize Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-8">
        {[
          { label: 'Total Claims', val: `₹${totalAmount.toLocaleString()}`, icon: <TrendingUp size={24} />, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Approved', val: `₹${approvedAmount.toLocaleString()}`, icon: <ShieldCheck size={24} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Pending Review', val: `₹${(totalAmount - approvedAmount).toLocaleString()}`, icon: <Clock size={24} />, color: 'text-amber-600', bg: 'bg-amber-50' }
        ].map((stat, i) => (
          <div key={i} className="premium-card p-8 group">
            <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              {stat.icon}
            </div>
            <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mb-1">{stat.label}</p>
            <p className={`text-3xl font-black ${stat.color}`}>{stat.val}</p>
          </div>
        ))}
      </div>

      {/* Expense List */}
      <div className="premium-card overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">
            {isAdmin ? "Team Claims Ledger" : "Historical Ledger"}
          </h3>
          <span className="bg-white px-4 py-1.5 rounded-xl text-xs font-bold text-slate-500 border border-slate-100">
            {expenses.length} Records Found
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] border-b border-slate-50">
                <th className="px-8 py-5">Date</th>
                {isAdmin && <th className="px-8 py-5">User</th>}
                <th className="px-8 py-5">Category</th>
                <th className="px-8 py-5">Amount</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6 text-sm font-bold text-slate-600">
                    {new Date(expense.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  {isAdmin && (
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs">
                          {expense.user_name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-black text-slate-900">{expense.user_name}</span>
                      </div>
                    </td>
                  )}
                  <td className="px-8 py-6">
                    <span className="px-4 py-1.5 bg-slate-100 rounded-lg text-[10px] font-black text-slate-600 uppercase tracking-widest">
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-8 py-6 font-black text-slate-900 text-lg">
                    ₹{parseFloat(expense.amount).toLocaleString()}
                  </td>
                  <td className="px-8 py-6">
                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border ${getStatusStyle(expense.status)}`}>
                      {expense.status === 'APPROVED' && <CheckCircle2 size={14} />}
                      {expense.status === 'REJECTED' && <AlertCircle size={14} />}
                      {expense.status === 'PENDING' && <Clock size={14} />}
                      {expense.status}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {expense.receipt && (
                        <a href={expense.receipt} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm" title="View Receipt">
                          <Receipt size={18} />
                        </a>
                      )}
                      {isAdmin && expense.status === 'PENDING' && (
                        <>
                          <button 
                            onClick={() => handleAction(expense.id, 'approve')}
                            className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-all shadow-sm" 
                            title="Approve"
                          >
                            <Check size={18} />
                          </button>
                          <button 
                            onClick={() => handleAction(expense.id, 'reject')}
                            className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white flex items-center justify-center transition-all shadow-sm" 
                            title="Reject"
                          >
                             <Ban size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <Wallet size={64} />
                      <p className="font-black uppercase tracking-widest text-sm">No operational costs recorded</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Expenses;

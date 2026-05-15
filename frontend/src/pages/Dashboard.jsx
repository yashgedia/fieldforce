import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  Activity, 
  CheckCircle, 
  Clock, 
  Layout, 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('reports/dashboard/');
        setMetrics(res.data);
      } catch (err) {
        console.error("Error fetching dashboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="p-20 text-center flex flex-col items-center gap-4">
    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Assembling Intelligence...</p>
  </div>;

  return (
    <div className="space-y-10 animate-fade-in pb-10">
      {/* Header with Welcome Message */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] mb-2">
            <Sparkles size={14} />
            Operations Overview
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
            Welcome, <span className="gradient-text">{user?.username}</span>
          </h1>
          <p className="text-slate-500 font-medium">Your field intelligence dashboard is ready.</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 flex items-center gap-3 shadow-sm">
          <Calendar size={18} className="text-slate-400" />
          <span className="text-sm font-bold text-slate-700">
            {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Total Tasks', val: metrics?.total_tasks || 0, icon: <Layout size={24} />, bg: 'bg-blue-50', text: 'text-blue-600' },
          { label: 'Field Visits', val: metrics?.total_visits || 0, icon: <Activity size={24} />, bg: 'bg-purple-50', text: 'text-purple-600' },
          { label: 'Recent (7d)', val: metrics?.recent_completed_visits || 0, icon: <CheckCircle size={24} />, bg: 'bg-emerald-50', text: 'text-emerald-600' },
          { label: 'Stale Tasks', val: metrics?.delayed_tasks_count || 0, icon: <AlertTriangle size={24} />, bg: 'bg-rose-50', text: 'text-rose-600' }
        ].map((kpi, i) => (
          <div key={i} className="premium-card p-8 group overflow-hidden relative">
            <div className={`absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform ${kpi.text}`}>
              {kpi.icon}
            </div>
            <div className={`w-14 h-14 ${kpi.bg} ${kpi.text} rounded-2xl flex items-center justify-center mb-6`}>
              {kpi.icon}
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{kpi.label}</p>
            <h3 className="text-3xl font-black text-slate-900">{kpi.val}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Task Distribution */}
        <div className="lg:col-span-1 premium-card flex flex-col overflow-hidden">
          <div className="p-8 border-b border-slate-50 bg-slate-50/30">
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Workforce Distribution</h3>
          </div>
          <div className="p-8 flex-1 flex flex-col justify-center space-y-6">
            {metrics?.task_status_distribution?.length > 0 ? (
              metrics.task_status_distribution.map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-black uppercase tracking-widest">
                    <span className="text-slate-500">{item.status.replace('_', ' ')}</span>
                    <span className="text-slate-900">{item.count}</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        item.status === 'COMPLETED' ? 'bg-emerald-500' : 
                        item.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-amber-400'
                      }`}
                      style={{ width: `${(item.count / metrics.total_tasks) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 opacity-20">
                <TrendingUp size={48} className="mx-auto mb-2" />
                <p className="font-bold text-xs uppercase tracking-widest">No Active Workflows</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Agents & Regional Performance */}
        <div className="lg:col-span-2 premium-card flex flex-col overflow-hidden">
          <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Field Leaderboard</h3>
            <button className="text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline flex items-center gap-1">
              View All Agents <ArrowRight size={12} />
            </button>
          </div>
          <div className="p-8 grid md:grid-cols-2 gap-10">
            {/* Agents List */}
            <div className="space-y-5">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Efficiency Rankings</h4>
              {metrics?.top_agents?.length > 0 ? (
                metrics.top_agents.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-900 font-black shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                        {item.agent__username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{item.agent__username}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Field Elite</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-emerald-600">{item.completed_count} Visits</p>
                      <div className="flex gap-1 justify-end">
                        {[1,2,3].map(s => <div key={s} className="w-1 h-1 bg-emerald-400 rounded-full"></div>)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 font-bold italic py-4">Awaiting field data...</p>
              )}
            </div>

            {/* Regional Map Placeholder / List */}
            <div className="bg-slate-50 rounded-[30px] p-8 flex flex-col justify-center border border-slate-100 border-dashed">
              <div className="text-center">
                <Users size={32} className="mx-auto text-slate-200 mb-4" />
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Regional Load</h4>
                <div className="space-y-4">
                  {metrics?.pending_tasks_by_region?.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center px-4 py-2 bg-white rounded-xl shadow-sm">
                      <span className="text-xs font-black text-slate-600">{item.region__name}</span>
                      <span className="text-xs font-black text-rose-500">{item.count} Pending</span>
                    </div>
                  ))}
                  {(!metrics?.pending_tasks_by_region || metrics.pending_tasks_by_region.length === 0) && (
                    <p className="text-xs font-bold text-slate-300 italic">All regions optimized.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

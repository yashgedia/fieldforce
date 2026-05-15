import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  Clock, 
  MapPin, 
  CheckCircle2, 
  History, 
  UserCheck, 
  Map as MapIcon, 
  Navigation,
  ArrowUpRight,
  ExternalLink,
  Users,
  Search
} from 'lucide-react';

const Attendance = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState(null);
  const [status, setStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAttendance = async () => {
    try {
      const response = await api.get('attendance/');
      setLogs(response.data);
      if (!isAdmin) {
        const active = response.data.find(log => !log.check_out);
        setActiveSession(active);
      }
    } catch (error) {
      console.error("Failed to fetch attendance", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleClockIn = () => {
    if (!navigator.geolocation) {
      setStatus('Geolocation is not supported by your browser');
      return;
    }

    setStatus('Retrieving GPS Coordinates...');
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        await api.post('attendance/', {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setStatus('Shift started successfully!');
        fetchAttendance();
        setTimeout(() => setStatus(''), 3000);
      } catch (error) {
        setStatus('Failed to verify location');
      }
    }, () => {
      setStatus('Unable to retrieve your location');
    });
  };

  const handleClockOut = async () => {
    try {
      await api.post('attendance/clock_out/');
      setStatus('Shift completed successfully!');
      fetchAttendance();
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      setStatus('Failed to clock out');
    }
  };

  const filteredLogs = isAdmin 
    ? logs.filter(log => log.user_name?.toLowerCase().includes(searchQuery.toLowerCase()))
    : logs;

  if (loading) return <div className="p-20 text-center flex flex-col items-center gap-4">
    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Accessing Shift Vault...</p>
  </div>;

  return (
    <div className="space-y-10 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Shift <span className="gradient-text">Management</span></h1>
          <p className="text-slate-500 font-medium">
            {isAdmin ? "Comprehensive oversight of team operational presence." : "Verify your field presence and track operational hours."}
          </p>
        </div>
        {isAdmin && (
           <div className="relative group w-full md:w-80">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Filter by agent name..."
              className="w-full pl-14 pr-6 py-4 rounded-[22px] bg-white border border-slate-100 text-sm font-bold focus:ring-2 focus:ring-blue-600 transition-all placeholder:text-slate-400 shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Main Action Card (Hide for Admins) */}
      {!isAdmin && (
        <div className="premium-card p-10 md:p-14 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03]">
            <Navigation size={200} />
          </div>
          
          <div className="flex items-center gap-10 relative z-10">
            <div className={`w-24 h-24 rounded-[35px] flex items-center justify-center transition-all duration-500 shadow-2xl ${activeSession ? 'bg-emerald-600 text-white shadow-emerald-100 rotate-3' : 'bg-blue-600 text-white shadow-blue-100'}`}>
              <UserCheck size={48} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">
                {activeSession ? 'Shift in Progress' : 'Begin Your Shift'}
              </h2>
              <div className="flex items-center gap-4">
                <p className="text-slate-500 font-semibold">
                  {activeSession 
                    ? `Active since ${new Date(activeSession.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                    : 'Capture your location to start receiving tasks.'}
                </p>
                {activeSession && (
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 relative z-10">
            {activeSession ? (
              <button 
                onClick={handleClockOut}
                className="bg-slate-900 text-white px-14 py-5 rounded-[25px] font-black text-lg hover:bg-red-600 transition-all shadow-2xl shadow-slate-200 transform hover:-translate-y-1"
              >
                Finish Shift
              </button>
            ) : (
              <button 
                onClick={handleClockIn}
                className="premium-button text-white px-14 py-5 rounded-[25px] font-black text-lg transition-all transform hover:-translate-y-1"
              >
                Check-In Now
              </button>
            )}
            {status && (
              <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${status.includes('failed') || status.includes('Unable') ? 'bg-rose-50 text-rose-500 border border-rose-100' : 'bg-emerald-50 text-emerald-500 border border-emerald-100'}`}>
                <CheckCircle2 size={14} />
                {status}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        {[
          { label: isAdmin ? 'Team Personnel' : 'This Week', val: isAdmin ? logs.length : '42.5h', icon: isAdmin ? <Users size={20} /> : <Clock size={20} />, color: 'text-blue-600' },
          { label: 'Live Sessions', val: logs.filter(l => !l.check_out).length, icon: <Navigation size={20} />, color: 'text-emerald-600' },
          { label: 'Total Logs', val: logs.length, icon: <History size={20} />, color: 'text-indigo-600' },
          { label: 'Avg Presence', val: '8.2h', icon: <ArrowUpRight size={20} />, color: 'text-purple-600' }
        ].map((stat, i) => (
          <div key={i} className="premium-card p-6 flex items-center gap-5">
            <div className={`w-12 h-12 rounded-2xl bg-slate-50 ${stat.color} flex items-center justify-center`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-xl font-black text-slate-900">{stat.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Shift History / Team Report */}
      <div className="premium-card overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-3">
            <History size={20} className="text-slate-400" />
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">{isAdmin ? "Consolidated Team Presence" : "Personal Shift History"}</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] border-b border-slate-50">
                {isAdmin && <th className="px-8 py-5">Agent</th>}
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5">Check-In</th>
                <th className="px-8 py-5">Check-Out</th>
                <th className="px-8 py-5">Duration</th>
                <th className="px-8 py-5">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                  {isAdmin && (
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs">
                          {log.user_name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-black text-slate-900">{log.user_name}</span>
                      </div>
                    </td>
                  )}
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-slate-900">
                      {new Date(log.check_in).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 font-bold text-slate-700 text-sm">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      {new Date(log.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 font-bold text-slate-700 text-sm">
                      <div className={`w-2 h-2 rounded-full ${log.check_out ? 'bg-rose-500' : 'bg-slate-200 animate-pulse'}`}></div>
                      {log.check_out 
                        ? new Date(log.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                        : 'Active Now'}
                    </div>
                  </td>
                  <td className="px-8 py-6 font-black text-slate-900 text-sm">
                    {log.check_out 
                      ? `${Math.floor((new Date(log.check_out) - new Date(log.check_in)) / 1000 / 60 / 60)}h ${Math.round(((new Date(log.check_out) - new Date(log.check_in)) / 1000 / 60) % 60)}m`
                      : '---'}
                  </td>
                  <td className="px-8 py-6">
                    <a 
                      href={`https://www.google.com/maps?q=${log.latitude},${log.longitude}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all group/map"
                    >
                      <MapPin size={12} />
                      GPS Verified
                      <ExternalLink size={10} />
                    </a>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-sm opacity-20">
                    No presence records found
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

export default Attendance;

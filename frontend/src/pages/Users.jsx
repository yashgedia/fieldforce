import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  Users as UsersIcon, 
  Shield, 
  MapPin, 
  UserCheck, 
  UserX, 
  KeyIcon, 
  X,
  Mail,
  UserPlus,
  ArrowRight
} from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();
  
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetStatus, setResetStatus] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, regionsRes] = await Promise.all([
        api.get('users/'),
        api.get('regions/')
      ]);
      setUsers(usersRes.data);
      setRegions(regionsRes.data);
    } catch (err) {
      console.error("Error fetching data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await api.patch(`users/${userId}/`, { role: newRole });
      fetchData();
    } catch (err) {
      alert("Failed to update role");
    }
  };

  const handleToggleActive = async (userId, currentActive) => {
    try {
      await api.patch(`users/${userId}/`, { is_active: !currentActive });
      fetchData();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetStatus('loading');
    try {
      await api.post(`users/${selectedUser.id}/set_password/`, { password: newPassword });
      setResetStatus('success');
      setTimeout(() => {
        setResetModalOpen(false);
        setResetStatus('');
        setNewPassword('');
        setSelectedUser(null);
      }, 2000);
    } catch (err) {
      setResetStatus('error');
    }
  };

  if (loading) return <div className="p-20 text-center flex flex-col items-center gap-4">
    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Authenticating Team Vault...</p>
  </div>;

  return (
    <div className="space-y-10 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Team <span className="gradient-text">Directory</span></h1>
          <p className="text-slate-500 font-medium">Manage operational roles and administrative access levels.</p>
        </div>
      </div>

      <div className="premium-card overflow-hidden">
        <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
          <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">Active Personnel</h3>
          <span className="bg-white px-4 py-1.5 rounded-xl text-xs font-bold text-slate-500 border border-slate-100">
            {users.length} Records Found
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] border-b border-slate-50">
                <th className="px-8 py-5">Personnel</th>
                <th className="px-8 py-5">Access Protocol</th>
                <th className="px-8 py-5">Region Hub</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Operational Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-900 font-black shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                        {u.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-sm mb-0.5">{u.username}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                          <Mail size={10} /> {u.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <Shield size={14} className={u.role === 'ADMIN' ? 'text-purple-500' : 'text-slate-400'} />
                      <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">{u.role.replace('_', ' ')}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                      <MapPin size={14} className="text-slate-300" />
                      {u.region ? regions.find(r => r.id === u.region)?.name : 'Unassigned'}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] rounded-full border ${u.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                      {u.is_active ? 'Authorized' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {currentUser.role === 'ADMIN' && u.id !== currentUser.id && (
                        <>
                          <select 
                            className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-600 border-none rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            value={u.role}
                            onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                          >
                            <option value="FIELD_AGENT">Field Agent</option>
                            <option value="TEAM_LEAD">Team Lead</option>
                            <option value="REGIONAL_MANAGER">Regional Manager</option>
                            <option value="AUDITOR">Auditor</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                          <button 
                            onClick={() => handleToggleActive(u.id, u.is_active)}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${u.is_active ? 'bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white' : 'bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white'}`}
                          >
                            {u.is_active ? <UserX size={18} /> : <UserCheck size={18} />}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setResetModalOpen(true);
                              setResetStatus('');
                              setNewPassword('');
                            }}
                            className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white flex items-center justify-center transition-all"
                          >
                            <KeyIcon size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Password Reset Modal */}
      {resetModalOpen && selectedUser && (
        <div className="fixed inset-0 glass-overlay flex items-center justify-center z-50 p-4">
          <div className="modal-content rounded-[35px] p-10 w-full max-w-md animate-scale-in relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 to-orange-500"></div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Security Reset</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">User: {selectedUser.username}</p>
              </div>
              <button onClick={() => setResetModalOpen(false)} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 flex items-center justify-center transition-all">
                <X size={20} />
              </button>
            </div>
            
            <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8">
              Initiating a security reset will override existing credentials. Ensure this request is authorized before proceeding.
            </p>

            {resetStatus === 'success' && (
              <div className="mb-6 p-4 bg-emerald-50 text-emerald-600 rounded-2xl text-[11px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                <CheckCircle2 size={16} /> Update Synchronized
              </div>
            )}

            {resetStatus === 'error' && (
              <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-2xl text-[11px] font-black uppercase tracking-widest border border-rose-100 flex items-center gap-2">
                <XCircle size={16} /> Synchronization Failure
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-[0.2em]">New Security Key</label>
                <input
                  type="password"
                  required
                  minLength="8"
                  className="w-full px-6 py-4 rounded-[22px] bg-slate-50 border-none focus:ring-2 focus:ring-amber-500 font-bold transition-all"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setResetModalOpen(false)}
                  className="flex-1 px-8 py-4 bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-[20px] text-xs font-black uppercase tracking-widest transition-all"
                >
                  Abort
                </button>
                <button
                  type="submit"
                  disabled={resetStatus === 'loading' || !newPassword}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-[20px] text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-100 disabled:opacity-50"
                >
                  {resetStatus === 'loading' ? 'Encrypting...' : 'Update Key'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;

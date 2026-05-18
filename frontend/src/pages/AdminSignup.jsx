import React, { useEffect, useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, ShieldAlert, ShieldCheck, ArrowRight } from 'lucide-react';

const AdminSignup = () => {
  const [adminExists, setAdminExists] = useState(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ADMIN');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  // If already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const res = await api.get('auth/admin-status/');
      setAdminExists(res.data.admin_exists);
    } catch (err) {
      console.error("Error checking administrative registration status", err);
      // Fallback
      setAdminExists(false);
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('auth/register-admin/', { username, email, password, role });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Decrypting Administrative Gateways...</p>
      </div>
    );
  }

  // If admin already exists, this page is auto-disabled!
  if (adminExists) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden p-4">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-red-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-rose-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>

        <div className="w-full max-w-md relative z-10 p-8 glass-panel rounded-3xl border border-red-100 text-center shadow-2xl">
          <div className="w-20 h-20 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-rose-500 shadow-inner">
            <ShieldAlert size={40} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-3">Portal Deactivated</h1>
          <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8">
            An administrator account has already been registered in the database. 
            For security reasons, this administrative registration portal has been permanently disabled.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 justify-center w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold uppercase tracking-wider text-xs transition-all shadow-lg"
          >
            Go to Sign In <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden p-4">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="w-full max-w-lg relative z-10 p-8 glass-panel rounded-[30px] border border-indigo-100/50 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600 shadow-sm">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Administrative Hub Setup</h1>
          <p className="text-slate-500 font-medium text-sm">Configure your primary system admin and operator keys.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm border border-red-100 font-medium animate-shake">
            {error}
          </div>
        )}

        {success ? (
          <div className="p-8 text-center bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              ✓
            </div>
            <h3 className="text-lg font-black text-emerald-800 mb-1">Registration Initialized</h3>
            <p className="text-emerald-600 text-sm font-medium mb-4">Credentials saved and encrypted. The administrative registration portal will now be permanently disabled for security.</p>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Redirecting to Access Protocol...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User size={18} className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-bold transition-all"
                    placeholder="Admin username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail size={18} className="text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-bold transition-all"
                    placeholder="email@fieldforce.ai"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">Security Credentials (Password)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  minLength="8"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-bold transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">Role Protocol Designation</label>
              <select
                className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-200/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer font-bold text-slate-700 transition-all"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="ADMIN">ADMIN (System Administrator)</option>
                <option value="REGIONAL_MANAGER">REGIONAL MANAGER (Regional Operations)</option>
                <option value="TEAM_LEAD">TEAM LEAD (Operations Lead)</option>
                <option value="FIELD_AGENT">FIELD AGENT (Field Representative)</option>
                <option value="AUDITOR">AUDITOR (Read-Only Systems Auditor)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold uppercase tracking-wider text-xs hover:from-indigo-700 hover:to-purple-700 transition-all transform active:scale-[0.98] shadow-lg shadow-indigo-100 disabled:opacity-75 flex justify-center items-center gap-2"
            >
              {loading ? 'Encrypting and Initializing...' : 'Initialize Administrative Key'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminSignup;

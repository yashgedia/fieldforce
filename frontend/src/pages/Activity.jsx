import React, { useEffect, useState } from 'react';
import api from '../api';
import { Activity as ActivityIcon } from 'lucide-react';

const Activity = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('activity-logs/');
        setLogs(res.data);
      } catch (err) {
        console.error("Error fetching logs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) return <div className="flex justify-center mt-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Activity Log</h1>
          <p className="text-slate-500 mt-1">Recent actions across your scope.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No recent activity.</div>
          ) : (
            logs.map(log => (
              <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors flex gap-4">
                <div className="mt-1">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <ActivityIcon size={16} />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-800">
                    <span className="font-semibold text-slate-900">{log.user_name}</span> {log.description}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(log.created_at).toLocaleString()} • <span className="font-medium text-slate-400">{log.action.replace(/_/g, ' ')}</span>
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Activity;

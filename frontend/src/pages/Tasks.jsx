import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { ChevronRight, Filter, Search, Plus, X, Download, Map as MapIcon, List } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet markers in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  
  // Create Modal State
  const [showModal, setShowModal] = useState(false);
  const [regions, setRegions] = useState([]);
  const [users, setUsers] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', region: '', assigned_to: '' });

  useEffect(() => {
    fetchTasks();
    if (['ADMIN', 'REGIONAL_MANAGER', 'TEAM_LEAD'].includes(user?.role)) {
      fetchRegionsAndUsers();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      const res = await api.get('tasks/');
      setTasks(res.data);
    } catch (err) {
      console.error("Error fetching tasks", err);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (filteredTasks.length === 0) return;
    
    // Create CSV Headers
    const headers = ['Task ID', 'Title', 'Status', 'Agent', 'Region', 'Created At'];
    
    // Map data to CSV rows
    const csvRows = filteredTasks.map(task => {
      return [
        task.id,
        `"${task.title.replace(/"/g, '""')}"`, // escape quotes
        task.status,
        task.assigned_to_name || 'Unassigned',
        task.region_name || 'N/A',
        new Date(task.created_at).toLocaleDateString()
      ].join(',');
    });
    
    // Combine headers and rows
    const csvString = [headers.join(','), ...csvRows].join('\n');
    
    // Create a Blob and trigger download
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `fieldforce_tasks_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchRegionsAndUsers = async () => {
    try {
      const [rRes, uRes] = await Promise.all([api.get('regions/'), api.get('users/')]);
      setRegions(rRes.data);
      setUsers(uRes.data);
    } catch (err) {}
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('tasks/', newTask);
      setShowModal(false);
      setNewTask({ title: '', description: '', region: '', assigned_to: '' });
      fetchTasks();
    } catch (err) {
      alert("Failed to create task");
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'PENDING': 
        return <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-medium border border-amber-200">Pending</span>;
      case 'IN_PROGRESS': 
        return <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-medium border border-blue-200">In Progress</span>;
      case 'COMPLETED': 
        return <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-medium border border-emerald-200">Completed</span>;
      default: 
        return <span className="bg-slate-100 text-slate-800 text-xs px-2.5 py-1 rounded-full font-medium border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tasks</h1>
          <p className="text-slate-500 mt-1">Manage and track your field tasks.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={exportToCSV}
            disabled={filteredTasks.length === 0}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm disabled:opacity-50"
          >
            <Download size={18} /> Export CSV
          </button>
          
          {['ADMIN', 'REGIONAL_MANAGER', 'TEAM_LEAD'].includes(user?.role) && (
            <button 
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
            >
              <Plus size={18} /> Create Task
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
          
          <div className="flex-1 w-full relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Filter size={16} className="text-slate-400" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-auto text-sm border border-slate-200 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <List size={16} /> List
            </button>
            <button 
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'map' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <MapIcon size={16} /> Map
            </button>
          </div>

        </div>
        
        {loading ? (
          <div className="p-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No tasks found matching your criteria.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTasks.map(task => (
              <Link to={`/dashboard/tasks/${task.id}`} key={task.id} className="block hover:bg-slate-50 transition-colors group">
                <div className="p-5 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{task.title}</h3>
                      {getStatusBadge(task.status)}
                    </div>
                    <p className="text-sm text-slate-500 mb-3 line-clamp-1">{task.description}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                        {task.region_name}
                      </span>
                      {task.assigned_to_name && (
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-blue-300"></span>
                          Assignee: {task.assigned_to_name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 text-slate-400 group-hover:text-blue-500 transition-colors">
                    <ChevronRight size={20} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && viewMode === 'map' && filteredTasks.length > 0 && (
          <div className="h-[600px] w-full z-0 relative">
            <MapContainer center={[28.6139, 77.2090]} zoom={11} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filteredTasks.filter(t => t.latitude && t.longitude).map(task => (
                <Marker key={task.id} position={[task.latitude, task.longitude]}>
                  <Popup>
                    <div className="p-1 min-w-[200px]">
                      <h3 className="font-bold text-slate-900 mb-1">{task.title}</h3>
                      <p className="text-xs text-slate-500 mb-2 line-clamp-2">{task.description}</p>
                      <div className="flex justify-between items-center mt-3">
                        {getStatusBadge(task.status)}
                        <Link to={`/dashboard/tasks/${task.id}`} className="text-xs font-medium text-blue-600 hover:text-blue-700">View Details &rarr;</Link>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">Create New Task</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Task Title</label>
                <input 
                  type="text" required
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"
                  value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea 
                  required rows="3"
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"
                  value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Region</label>
                  <select 
                    required className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"
                    value={newTask.region} onChange={e => setNewTask({...newTask, region: e.target.value})}
                  >
                    <option value="">Select Region</option>
                    {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Assign To</label>
                  <select 
                    required className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"
                    value={newTask.assigned_to} onChange={e => setNewTask({...newTask, assigned_to: e.target.value})}
                  >
                    <option value="">Select Agent</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.username} ({u.role})</option>)}
                  </select>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-50 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-xl">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Tasks;

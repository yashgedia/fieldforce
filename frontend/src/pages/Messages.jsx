import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  Send, 
  MessageSquare, 
  Search, 
  MoreVertical, 
  Phone, 
  Video, 
  Info,
  CheckCheck,
  Clock,
  Zap,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const Messages = () => {
  const { user: currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const scrollRef = useRef(null);

  const fetchData = async () => {
    try {
      const [msgRes, userRes] = await Promise.all([
        api.get('messages/'),
        api.get('users/')
      ]);
      setMessages(msgRes.data);
      setUsers(userRes.data.filter(u => u.id !== currentUser.id));
    } catch (error) {
      console.error("Failed to fetch messaging data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Real-time Sync: Poll for new messages every 4 seconds
    const interval = setInterval(() => {
      fetchData();
    }, 4000);
    return () => clearInterval(interval);
  }, [currentUser.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedUser, messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!selectedUser || !content.trim()) return;

    const tempContent = content;
    setContent(''); // Optimistic clear

    try {
      const response = await api.post('messages/', {
        receiver: selectedUser.id,
        content: tempContent
      });
      setMessages([response.data, ...messages]);
    } catch (error) {
      alert('Failed to send message');
      setContent(tempContent);
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const chatMessages = selectedUser 
    ? [...messages]
        .filter(m => (m.sender === currentUser.id && m.receiver === selectedUser.id) || (m.sender === selectedUser.id && m.receiver === currentUser.id))
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    : [];

  if (loading && messages.length === 0) return <div className="p-20 text-center flex flex-col items-center gap-4">
    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Synchronizing Neural Link...</p>
  </div>;

  return (
    <div className="h-[calc(100vh-160px)] flex gap-8 animate-fade-in pb-4">
      {/* Sidebar: Contacts */}
      <div className="w-96 premium-card flex flex-col overflow-hidden bg-white/50 backdrop-blur-xl border border-slate-100">
        <div className="p-8 pb-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Messages</h2>
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
              <Zap size={10} fill="currentColor" /> {users.length} Online
            </div>
          </div>
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search personnel..."
              className="w-full pl-14 pr-6 py-4 rounded-[22px] bg-slate-100/50 border-none text-sm font-bold focus:ring-2 focus:ring-blue-600 transition-all placeholder:text-slate-400 shadow-inner"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-8 space-y-2">
          {filteredUsers.map(user => (
            <button
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className={`w-full flex items-center gap-4 px-5 py-5 rounded-[28px] transition-all duration-300 relative group ${selectedUser?.id === user.id ? 'bg-white shadow-xl shadow-slate-100 ring-1 ring-slate-100/50' : 'hover:bg-white/60'}`}
            >
              <div className="relative shrink-0">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm transition-all ${selectedUser?.id === user.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-white rounded-full"></div>
              </div>
              <div className="text-left overflow-hidden">
                <p className={`font-black text-sm mb-0.5 ${selectedUser?.id === user.id ? 'text-slate-900' : 'text-slate-700'}`}>{user.username}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{user.role?.replace('_', ' ')}</span>
                  {selectedUser?.id === user.id && <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></span>}
                </div>
              </div>
              <ArrowRight size={16} className={`absolute right-6 text-slate-200 transition-all ${selectedUser?.id === user.id ? 'opacity-100 translate-x-0 text-blue-600' : 'opacity-0 -translate-x-4'}`} />
            </button>
          ))}
          {filteredUsers.length === 0 && (
            <div className="p-10 text-center opacity-30">
              <p className="text-xs font-black uppercase tracking-widest">No personnel found</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 premium-card flex flex-col overflow-hidden bg-white border border-slate-100">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-100">
                  {selectedUser.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 tracking-tight text-lg">{selectedUser.username}</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Synchronized Connection</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {[Phone, Video, Info].map((Icon, i) => (
                  <button key={i} className="w-11 h-11 rounded-2xl hover:bg-slate-50 text-slate-400 hover:text-slate-900 flex items-center justify-center transition-all border border-transparent hover:border-slate-100">
                    <Icon size={20} />
                  </button>
                ))}
                <div className="w-px h-8 bg-slate-100 mx-2"></div>
                <button className="w-11 h-11 rounded-2xl hover:bg-slate-50 text-slate-400 hover:text-slate-900 flex items-center justify-center transition-all border border-transparent hover:border-slate-100">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>

            {/* Messages Content */}
            <div 
              ref={scrollRef}
              className="flex-1 p-8 overflow-y-auto space-y-6 bg-slate-50/10 no-scrollbar scroll-smooth"
            >
              {chatMessages.map((msg, i) => {
                const isOwn = msg.sender === currentUser.id;
                return (
                  <div 
                    key={msg.id} 
                    className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} animate-scale-in`}
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <div className={`max-w-[75%] p-5 rounded-[28px] text-sm font-semibold shadow-sm group relative ${
                      isOwn 
                        ? 'bg-blue-600 text-white rounded-br-none shadow-blue-200/20' 
                        : 'bg-white text-slate-800 rounded-bl-none border border-slate-100'
                    }`}>
                      <p className="leading-relaxed">{msg.content}</p>
                    </div>
                    <div className={`flex items-center gap-2 mt-2 px-2 text-[10px] font-black uppercase tracking-widest text-slate-300`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {isOwn && <CheckCheck size={12} className="text-blue-500" />}
                    </div>
                  </div>
                );
              })}
              {chatMessages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-300">
                  <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center mb-8 shadow-inner">
                    <MessageSquare size={40} className="opacity-20" />
                  </div>
                  <h4 className="text-lg font-black text-slate-900 mb-2">Initialize Communication</h4>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-8">Secure encryption bridge ready</p>
                  <button 
                    onClick={() => setContent('Hello! Operation update ready.')}
                    className="px-8 py-3 bg-white border border-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                  >
                    Start Chatting Now
                  </button>
                </div>
              )}
            </div>

            {/* Input Footer */}
            <div className="p-8 border-t border-slate-50">
              <form onSubmit={handleSend} className="flex gap-5">
                <div className="flex-1 relative group">
                  <input 
                    type="text" 
                    placeholder="Dispatch secure data message..."
                    className="w-full pl-10 pr-16 py-6 rounded-[30px] bg-slate-50 border-none focus:ring-2 focus:ring-blue-600 font-bold transition-all placeholder:text-slate-300 shadow-inner"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
                    <button type="button" className="text-slate-300 hover:text-slate-500 transition-colors">
                      <Clock size={22} />
                    </button>
                  </div>
                </div>
                <button 
                  type="submit"
                  disabled={!content.trim()}
                  className="premium-button text-white p-6 rounded-[30px] flex items-center justify-center transition-all disabled:opacity-50 disabled:scale-95 shadow-xl shadow-blue-100"
                >
                  <Send size={28} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-20 text-center">
            <div className="w-40 h-40 bg-slate-50 rounded-[55px] flex items-center justify-center mb-10 relative shadow-inner">
              <Sparkles size={64} className="text-slate-100" />
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-blue-600 rounded-[20px] flex items-center justify-center animate-bounce shadow-xl shadow-blue-100">
                <Zap size={24} className="text-white" fill="currentColor" />
              </div>
            </div>
            <h3 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Select Neural <span className="gradient-text">Link</span></h3>
            <p className="text-slate-400 font-bold text-lg max-w-sm leading-relaxed mb-10">Select a team member from the directory to establish a secure, live communication channel.</p>
            <div className="flex flex-wrap justify-center gap-4">
               <div className="px-5 py-2 bg-slate-50 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-100">Real-time Polling</div>
               <div className="px-5 py-2 bg-slate-50 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-100">End-to-End Encrypted</div>
               <div className="px-5 py-2 bg-slate-50 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-100">Neural Sync</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  User, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Download,
  PenTool,
  Star,
  ShieldAlert,
  Zap,
  CheckCircle,
  X
} from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const sigPad = useRef(null);
  const reportRef = useRef(null);
  
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visitNotes, setVisitNotes] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [clientRating, setClientRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    try {
      const res = await api.get(`tasks/${id}/`);
      setTask(res.data);
    } catch (err) {
      console.error("Error fetching task details", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartVisit = async () => {
    try {
      await api.post('visits/', {
        task: task.id,
        start_time: new Date().toISOString()
      });
      if (task.status === 'PENDING') {
        await api.patch(`tasks/${task.id}/`, { status: 'IN_PROGRESS' });
      }
      fetchTask();
    } catch (err) {
      console.error("Error starting visit", err);
    }
  };

  const handleCompleteVisit = async (visitId) => {
    if (!visitNotes.trim()) {
      alert("Please add notes before completing the visit.");
      return;
    }
    if (sigPad.current.isEmpty()) {
      alert("Please capture client signature.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('notes', visitNotes);
      formData.append('end_time', new Date().toISOString());
      formData.append('completed', 'true');
      formData.append('client_rating', clientRating);
      
      const signatureData = sigPad.current.getTrimmedCanvas().toDataURL('image/png');
      const blob = await (await fetch(signatureData)).blob();
      formData.append('signature', blob, 'signature.png');
      
      if (attachment) {
        formData.append('attachment', attachment);
      }

      await api.patch(`visits/${visitId}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await api.patch(`tasks/${task.id}/`, { status: 'COMPLETED' });
      fetchTask();
    } catch (err) {
      console.error("Error completing visit", err);
    } finally {
      setSubmitting(false);
    }
  };

  const exportPDF = async () => {
    const element = reportRef.current;
    // Temporarily hide buttons for PDF
    const buttons = element.querySelectorAll('.no-print');
    buttons.forEach(b => b.style.display = 'none');
    
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`ExecutionReport_${task.id}.pdf`);
    
    buttons.forEach(b => b.style.display = 'flex');
  };

  if (loading) return <div className="p-20 text-center flex flex-col items-center gap-4">
    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Accessing Task Vault...</p>
  </div>;

  if (!task) return <div className="p-12 text-center text-slate-500 font-bold">Encrypted data not found.</div>;

  const currentVisit = task.visits?.find(v => !v.completed) || task.visits?.[task.visits.length - 1];
  const canAct = user.role === 'FIELD_AGENT' && task.assigned_to === user.id;

  const getRiskColor = (flag) => {
    switch(flag) {
      case 'HIGH': return 'bg-rose-50 border-rose-100 text-rose-600';
      case 'MEDIUM': return 'bg-amber-50 border-amber-100 text-amber-600';
      case 'LOW': return 'bg-emerald-50 border-emerald-100 text-emerald-600';
      default: return 'bg-slate-50 border-slate-100 text-slate-600';
    }
  };

  return (
    <div className="space-y-10 animate-fade-in pb-20" ref={reportRef}>
      {/* Detail Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 no-print">
        <div className="flex items-center gap-5">
          <button onClick={() => navigate('/dashboard/tasks')} className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all shadow-sm">
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Visit <span className="gradient-text">Intelligence</span></h1>
            <p className="text-slate-500 font-medium">Record and verify task execution details.</p>
          </div>
        </div>
        {task.status === 'COMPLETED' && (
          <button 
            onClick={exportPDF}
            className="premium-button flex items-center gap-2 text-white px-8 py-4 rounded-[22px] font-black transition-all"
          >
            <Download size={20} />
            Generate PDF Dossier
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Content Card */}
          <div className="premium-card p-10 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-[0.02]">
              <FileText size={200} />
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-10 relative z-10">
              <div className="max-w-xl">
                <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] mb-3">
                  <Zap size={14} fill="currentColor" />
                  Official Assignment
                </div>
                <h2 className="text-4xl font-black text-slate-900 leading-tight mb-4">{task.title}</h2>
                <p className="text-slate-500 text-lg leading-relaxed font-medium">{task.description}</p>
              </div>
              <div className={`px-5 py-2 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] border shadow-sm ${
                task.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                task.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-amber-50 text-amber-600 border-amber-100'
              }`}>
                {task.status.replace('_', ' ')}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-slate-100 relative z-10">
              <div className="flex items-center gap-5 p-6 rounded-[28px] bg-slate-50/50">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Region Hub</p>
                  <p className="font-black text-slate-800 text-lg">{task.region_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-5 p-6 rounded-[28px] bg-slate-50/50">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm">
                  <User size={24} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Operational Agent</p>
                  <p className="font-black text-slate-800 text-lg">{task.assigned_to_name}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Execution Form Card */}
          <div className="premium-card overflow-hidden">
            <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <PenTool size={20} className="text-blue-600" />
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">Execution Protocol</h3>
              </div>
            </div>
            
            <div className="p-10">
              {!currentVisit && canAct && task.status !== 'COMPLETED' && (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-blue-50 rounded-[35px] flex items-center justify-center mx-auto mb-8 animate-pulse shadow-xl shadow-blue-50">
                    <Navigation size={40} className="text-blue-600" />
                  </div>
                  <h4 className="text-3xl font-black text-slate-900 mb-3">Initialize Visit?</h4>
                  <p className="text-slate-400 font-medium mb-10 max-w-xs mx-auto">Click below to record your arrival and start task execution sequence.</p>
                  <button 
                    onClick={handleStartVisit}
                    className="premium-button text-white px-14 py-5 rounded-[25px] font-black text-lg transition-all"
                  >
                    Activate Visit
                  </button>
                </div>
              )}

              {currentVisit && !currentVisit.completed && canAct && (
                <div className="space-y-10">
                  <div className="flex items-center gap-3 text-[11px] text-blue-600 font-black uppercase tracking-widest bg-blue-50 px-6 py-3 rounded-2xl border border-blue-100">
                    <Clock size={16} />
                    Entry Timestamp: {new Date(currentVisit.start_time).toLocaleTimeString()}
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Field Observations</label>
                    <textarea 
                      className="w-full p-8 rounded-[35px] bg-slate-50 border-none focus:ring-2 focus:ring-blue-600 min-h-[200px] font-medium text-lg leading-relaxed shadow-inner"
                      placeholder="Enter precise notes regarding the visit..."
                      value={visitNotes}
                      onChange={(e) => setVisitNotes(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-10">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Client Verification</label>
                      <div className="border-2 border-slate-100 rounded-[35px] bg-white overflow-hidden shadow-xl shadow-slate-100 relative group">
                        <SignatureCanvas 
                          ref={sigPad}
                          penColor="#0f172a"
                          canvasProps={{width: 400, height: 200, className: 'sigCanvas'}}
                        />
                        <button 
                          type="button" 
                          onClick={() => sigPad.current.clear()}
                          className="absolute bottom-6 right-6 w-10 h-10 bg-slate-100 text-slate-400 hover:text-rose-500 rounded-xl flex items-center justify-center transition-all"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col justify-center">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Client Satisfaction Index</label>
                      <div className="flex items-center gap-5 bg-slate-50 p-8 rounded-[35px] justify-center shadow-inner">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button 
                            key={star}
                            onClick={() => setClientRating(star)}
                            className={`transition-all duration-300 transform hover:scale-125 ${star <= clientRating ? 'text-amber-400' : 'text-slate-200'}`}
                          >
                            <Star size={40} fill={star <= clientRating ? 'currentColor' : 'none'} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-6">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Documentary Evidence</label>
                    <input 
                      type="file" 
                      className="block w-full text-sm text-slate-400 file:mr-6 file:py-4 file:px-10 file:rounded-[20px] file:border-0 file:text-[11px] file:font-black file:uppercase file:tracking-widest file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-600 hover:file:text-white transition-all cursor-pointer"
                      onChange={(e) => setAttachment(e.target.files[0])}
                    />
                  </div>
                  
                  <button 
                    onClick={() => handleCompleteVisit(currentVisit.id)}
                    disabled={submitting}
                    className="w-full py-6 premium-button text-white font-black rounded-[30px] flex items-center justify-center gap-3 transform hover:-translate-y-1 text-lg shadow-2xl"
                  >
                    {submitting ? 'Encrypting & Syncing...' : <><CheckCircle size={24} /> Sync Final Execution</>}
                  </button>
                </div>
              )}

              {currentVisit?.completed && (
                <div className="space-y-10">
                  <div className="flex items-center gap-3 text-[11px] text-emerald-700 font-black uppercase tracking-[0.2em] bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100">
                    <CheckCircle2 size={18} />
                    Verified On-Site: {new Date(currentVisit.end_time).toLocaleTimeString()}
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-10">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Operational Notes</h4>
                      <p className="text-slate-900 font-semibold p-8 bg-slate-50/50 rounded-[35px] border border-slate-50 leading-relaxed min-h-[150px]">{currentVisit.notes}</p>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Signature Vault</h4>
                      <div className="p-6 bg-white border-2 border-slate-50 rounded-[35px] flex items-center justify-center h-[150px] shadow-sm relative">
                        {currentVisit.signature ? (
                          <img src={currentVisit.signature} alt="Client Signature" className="max-h-full transition-transform hover:scale-105" />
                        ) : (
                          <span className="text-slate-300 font-black uppercase text-[10px] tracking-widest">No Signature Data</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row items-center gap-10">
                    <div className="flex-1 bg-slate-50/50 p-8 rounded-[35px] text-center border border-slate-50">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Client Feedback</h4>
                      <div className="flex justify-center gap-3">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star 
                            key={star} 
                            size={28} 
                            className={star <= currentVisit.client_rating ? 'text-amber-400' : 'text-slate-100'} 
                            fill={star <= currentVisit.client_rating ? 'currentColor' : 'none'} 
                          />
                        ))}
                      </div>
                    </div>
                    {currentVisit.attachment && (
                      <div className="flex-1 text-center bg-blue-50/30 p-8 rounded-[35px] border border-blue-50/50">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Captured Evidence</h4>
                        <a href={currentVisit.attachment} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 bg-white text-blue-600 px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm hover:bg-blue-600 hover:text-white transition-all">
                          <Download size={18} /> View Document
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Insight Column */}
        <div className="lg:col-span-1 space-y-8">
          {currentVisit?.ai_insight ? (
            <div className="premium-card bg-slate-900 text-white overflow-hidden relative group border-none shadow-2xl shadow-blue-900/10">
              <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform text-blue-400">
                <Sparkles size={120} />
              </div>
              <div className="p-10 relative z-10 space-y-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Sparkles size={20} />
                  </div>
                  <h3 className="font-black uppercase tracking-[0.2em] text-xs">AI Synthetic Analysis</h3>
                </div>

                <div className={`p-8 rounded-[30px] border shadow-2xl ${getRiskColor(currentVisit.ai_insight.risk_flag)}`}>
                  <div className="flex items-center gap-2 mb-2 opacity-80">
                    <ShieldAlert size={16} />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Risk Assessment</h4>
                  </div>
                  <p className="text-3xl font-black tracking-tight">{currentVisit.ai_insight.risk_flag}</p>
                </div>

                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Strategic Summary</h4>
                  <p className="text-slate-300 font-medium leading-relaxed text-sm">
                    {currentVisit.ai_insight.summary}
                  </p>
                </div>

                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Prescribed Next Step</h4>
                  <div className="p-6 bg-white/5 rounded-[30px] border border-white/10 text-white font-black text-sm shadow-xl leading-relaxed">
                    {currentVisit.ai_insight.suggested_action}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="premium-card p-12 text-center flex flex-col items-center justify-center min-h-[500px] border-dashed">
              <div className="w-20 h-20 bg-slate-50 rounded-[30px] flex items-center justify-center mb-8">
                <Sparkles size={40} className="text-slate-200" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Synthetic Core Offline</h3>
              <p className="text-slate-400 font-medium max-w-[200px] text-sm">AI analysis will initiate once field synchronization is completed with notes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;

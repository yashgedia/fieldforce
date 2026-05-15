import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Map as MapIcon, 
  Shield, 
  Zap, 
  ArrowRight, 
  CheckCircle, 
  Globe, 
  Smartphone, 
  BarChart, 
  Users, 
  Layers,
  Mail,
  Phone,
  MapPin,
  ClipboardList,
  UserPlus,
  PlayCircle,
  BarChartHorizontal
} from 'lucide-react';

const Landing = () => {
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-[#fcfdfe] font-sans overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">
      
      {/* Header */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 backdrop-blur-lg shadow-sm border-b border-slate-100 py-3' : 'bg-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-2.5 group cursor-pointer">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:rotate-6 transition-transform">
              <MapIcon className="text-white" size={24} />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">Field<span className="text-blue-600">Force</span></span>
          </div>

          <nav className="hidden lg:flex items-center gap-10">
            {['Home', 'Features', 'How it Works'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} className="text-slate-600 font-semibold hover:text-blue-600 transition-colors text-sm">
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-slate-600 font-bold hover:text-blue-600 transition-colors text-sm px-4">
              Sign In
            </Link>
            <Link to="/register" className="bg-slate-900 text-white px-7 py-3 rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 hover:shadow-blue-200 transform hover:-translate-y-1 text-sm">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative pt-32 pb-20 lg:pt-52 lg:pb-32 overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-purple-100/50 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white shadow-sm border border-slate-100 text-blue-600 font-bold text-xs uppercase tracking-widest mb-10 animate-fade-in">
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            Enterprise Field Operations 2026
          </div>
          
          <h1 className="text-6xl lg:text-8xl font-black text-slate-900 tracking-tight leading-[0.95] mb-8 max-w-5xl mx-auto">
            The next generation of <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">field intelligence.</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-xl text-slate-500 font-medium leading-relaxed mb-12">
            Automate task assignments, track your team in real-time with geospatial maps, and leverage AI to predict risks before they happen.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-5">
            <Link to="/register" className="flex items-center justify-center gap-2 bg-blue-600 text-white px-10 py-5 rounded-3xl font-black text-lg hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 hover:shadow-blue-300 transform hover:-translate-y-1">
              Register Your Team <ArrowRight size={22} />
            </Link>
            <Link to="/login" className="flex items-center justify-center gap-2 bg-white text-slate-900 border border-slate-200 px-10 py-5 rounded-3xl font-black text-lg hover:bg-slate-50 transition-all shadow-lg shadow-slate-100 transform hover:-translate-y-1">
              View Demo Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { val: '2.5k+', label: 'Active Teams' },
            { val: '99.9%', label: 'Uptime SLA' },
            { val: '40%', label: 'Efficiency Boost' },
            { val: '1M+', label: 'Tasks Completed' },
          ].map((stat, i) => (
            <div key={i}>
              <p className="text-3xl font-black text-slate-900">{stat.val}</p>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Core Capabilities</h2>
            <h3 className="text-4xl lg:text-5xl font-black text-slate-900 leading-tight">Everything you need to lead a world-class team.</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap size={30} className="text-amber-500" />,
                title: "AI Risk Assessment",
                desc: "Our engine analyzes agent notes in real-time to flag potential issues and suggest corrective actions automatically.",
                bg: 'bg-amber-50'
              },
              {
                icon: <Smartphone size={30} className="text-blue-500" />,
                title: "PWA Offline Mode",
                desc: "Never lose data. Agents can work perfectly in areas with zero connectivity; data syncs automatically when back online.",
                bg: 'bg-blue-50'
              },
              {
                icon: <Globe size={30} className="text-indigo-500" />,
                title: "Live Map Operations",
                desc: "Visualize your entire workforce on interactive geospatial maps. Assign tasks based on proximity to optimize routes.",
                bg: 'bg-indigo-50'
              },
              {
                icon: <Shield size={30} className="text-emerald-500" />,
                title: "Enterprise Governance",
                desc: "Multi-layered role permissions (Admin, RM, TL, Agent) ensure absolute data security and operational integrity.",
                bg: 'bg-emerald-50'
              },
              {
                icon: <BarChart size={30} className="text-purple-500" />,
                title: "Advanced Analytics",
                desc: "Export detailed CSV reports and view productivity leaderboards to reward your top-performing field agents.",
                bg: 'bg-purple-50'
              },
              {
                icon: <Layers size={30} className="text-rose-500" />,
                title: "Media Verification",
                desc: "Capture proof of work with high-resolution photo and document attachments directly within each visit log.",
                bg: 'bg-rose-50'
              }
            ].map((f, idx) => (
              <div key={idx} className="p-10 rounded-[35px] bg-white border border-slate-100 hover:shadow-2xl hover:shadow-slate-200 transition-all group hover:-translate-y-2">
                <div className={`w-16 h-16 ${f.bg} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                  {f.icon}
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4">{f.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] mb-4">The Process</h2>
            <h3 className="text-4xl lg:text-5xl font-black text-slate-900 leading-tight">Simple steps to field excellence.</h3>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                icon: <UserPlus size={32} />,
                title: "1. Onboard Team",
                desc: "Create accounts for your managers and agents. Assign them to specific regions."
              },
              {
                icon: <ClipboardList size={32} />,
                title: "2. Create Tasks",
                desc: "Define visit targets, set coordinates, and assign them to your field force instantly."
              },
              {
                icon: <PlayCircle size={32} />,
                title: "3. Field Visits",
                desc: "Agents receive tasks on their mobile devices, upload media, and complete visits offline or online."
              },
              {
                icon: <BarChartHorizontal size={32} />,
                title: "4. Analyze Results",
                desc: "Monitor progress on the live map and export automated reports for management review."
              }
            ].map((step, i) => (
              <div key={i} className="relative">
                {i < 3 && (
                  <div className="hidden lg:block absolute top-12 left-1/2 w-full h-0.5 bg-slate-200 z-0"></div>
                )}
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center text-blue-600 mb-8 border border-slate-100 transform hover:rotate-6 transition-transform">
                    {step.icon}
                  </div>
                  <h4 className="text-xl font-black text-slate-900 mb-3">{step.title}</h4>
                  <p className="text-slate-500 font-medium leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof CTA */}
      <section className="py-32 px-4">
        <div className="max-w-7xl mx-auto rounded-[50px] bg-slate-900 text-white p-12 lg:p-24 relative overflow-hidden text-center lg:text-left">
          <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[150px] pointer-events-none"></div>
          
          <div className="grid lg:grid-cols-2 items-center gap-16 relative z-10">
            <div>
              <h2 className="text-4xl lg:text-6xl font-black mb-8 leading-[1.1]">Ready to scale your field operations?</h2>
              <p className="text-xl text-slate-400 font-medium mb-10 max-w-xl">
                Join 2,500+ enterprises worldwide who trust FieldForce for their daily operational intelligence.
              </p>
              <div className="flex flex-col sm:flex-row gap-5">
                <Link to="/register" className="bg-white text-slate-900 px-10 py-5 rounded-3xl font-black text-lg hover:bg-blue-600 hover:text-white transition-all transform hover:-translate-y-1 text-center">
                  Register Your Team
                </Link>
                <Link to="/login" className="border-2 border-slate-700 text-white px-10 py-5 rounded-3xl font-black text-lg hover:bg-slate-800 transition-all transform hover:-translate-y-1 text-center">
                  Talk to Sales
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                'Real-time Tracking', 'AI Insights', 'Offline Mode', 'Advanced RBAC', 'Geospatial Analytics', 'CSV Reports'
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-300 font-bold bg-white/5 p-5 rounded-2xl border border-white/5">
                  <CheckCircle size={20} className="text-blue-500" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 pt-24 pb-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <MapIcon className="text-white" size={18} />
                </div>
                <span className="text-xl font-black text-slate-900 tracking-tight">Field<span className="text-blue-600">Force</span></span>
              </div>
              <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                Empowering modern teams with intelligent field operation tools and real-time geospatial insights.
              </p>
            </div>

            <div>
              <h4 className="text-slate-900 font-black uppercase tracking-widest text-xs mb-8">Solution</h4>
              <ul className="space-y-4 text-slate-500 font-bold text-sm">
                <li><Link to="/info/task-management" className="hover:text-blue-600 transition-colors">Task Management</Link></li>
                <li><Link to="/info/team-collaboration" className="hover:text-blue-600 transition-colors">Team Collaboration</Link></li>
                <li><Link to="/info/geospatial-mapping" className="hover:text-blue-600 transition-colors">Geospatial Mapping</Link></li>
                <li><Link to="/info/ai-diagnostics" className="hover:text-blue-600 transition-colors">AI Diagnostics</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-slate-900 font-black uppercase tracking-widest text-xs mb-8">Company</h4>
              <ul className="space-y-4 text-slate-500 font-bold text-sm">
                <li><Link to="/info/about-us" className="hover:text-blue-600 transition-colors">About Us</Link></li>
                <li><Link to="/info/case-studies" className="hover:text-blue-600 transition-colors">Case Studies</Link></li>
                <li><Link to="/info/careers" className="hover:text-blue-600 transition-colors">Careers</Link></li>
                <li><Link to="/info/contact" className="hover:text-blue-600 transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-slate-900 font-black uppercase tracking-widest text-xs mb-8">Contact</h4>
              <ul className="space-y-4 text-slate-500 font-bold text-sm">
                <li className="flex items-center gap-3"><Mail size={16} className="text-blue-500" /> support@fieldforce.ai</li>
                <li className="flex items-center gap-3"><Phone size={16} className="text-blue-500" /> +91 (800) 123-4567</li>
                <li className="flex items-center gap-3 leading-relaxed">
                  <MapPin size={16} className="text-blue-500 shrink-0" />
                  123 Tech Park, Phase 1,<br />New Delhi, India 110001
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
            <p className="text-slate-400 font-bold text-sm">
              &copy; {new Date().getFullYear()} FieldForce Systems International.
            </p>
            <div className="flex items-center gap-2 text-sm font-black text-slate-900">
              Developed by 
              <a 
                href="https://webnovatech.co.in" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-slate-900 text-white px-4 py-1.5 rounded-lg hover:bg-blue-600 transition-all flex items-center gap-2 group"
              >
                WEBNOVA TECH
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

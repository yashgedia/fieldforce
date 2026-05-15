import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Map as MapIcon, 
  CheckCircle, 
  Mail, 
  Phone, 
  MapPin, 
  Globe,
  Shield,
  Zap,
  BarChart,
  Users,
  Layers,
  ClipboardList,
  Target,
  Briefcase,
  Trophy
} from 'lucide-react';

const contentMap = {
  // Solutions
  'task-management': {
    title: 'Task Management',
    category: 'Solution',
    description: 'Optimize your workforce with intelligent task distribution and real-time monitoring.',
    icon: <ClipboardList className="text-blue-600" size={48} />,
    details: [
      'Automated task assignment based on agent proximity.',
      'Customizable priority levels and deadlines.',
      'Real-time status updates and completion alerts.',
      'Historical data logs for performance auditing.'
    ]
  },
  'team-collaboration': {
    title: 'Team Collaboration',
    category: 'Solution',
    description: 'Break down silos and keep your field force connected with centralized communication.',
    icon: <Users className="text-indigo-600" size={48} />,
    details: [
      'Hierarchical role management (Admin, RM, TL, Agent).',
      'Shared visit logs and team activity feeds.',
      'Instant notifications for new assignments.',
      'Collaborative risk assessment and field notes.'
    ]
  },
  'geospatial-mapping': {
    title: 'Geospatial Mapping',
    category: 'Solution',
    description: 'Visualize your operations on interactive, high-precision maps.',
    icon: <MapIcon className="text-emerald-600" size={48} />,
    details: [
      'Live agent tracking and movement history.',
      'Geofenced task areas for improved accuracy.',
      'Visual density maps of field activities.',
      'Integration with open-source mapping (Leaflet).'
    ]
  },
  'ai-diagnostics': {
    title: 'AI Diagnostics',
    category: 'Solution',
    description: 'Predictive analytics to help you identify risks before they become problems.',
    icon: <Zap className="text-amber-600" size={48} />,
    details: [
      'Automated sentiment analysis of field agent notes.',
      'Risk scoring based on historical performance.',
      'Anomaly detection in visit patterns.',
      'Smart recommendations for field interventions.'
    ]
  },
  // Company
  'about-us': {
    title: 'About Us',
    category: 'Company',
    description: 'Leading the digital transformation of field force management.',
    icon: <Globe className="text-blue-600" size={48} />,
    details: [
      'Founded with a mission to empower mobile workforces.',
      'Built by the expert team at WEBNOVA TECH.',
      'Serving 2,500+ enterprises worldwide.',
      'Committed to data security and operational excellence.'
    ]
  },
  'case-studies': {
    title: 'Case Studies',
    category: 'Company',
    description: 'Real-world examples of how we help teams achieve 40% more efficiency.',
    icon: <Trophy className="text-purple-600" size={48} />,
    details: [
      'Logistics: Reducing delivery times by 25%.',
      'Finance: Improving field audit accuracy by 99%.',
      'Healthcare: Optimizing home-visit schedules.',
      'Telecom: Managing large-scale infrastructure maintenance.'
    ]
  },
  'careers': {
    title: 'Careers',
    category: 'Company',
    description: 'Build the future of field intelligence with us.',
    icon: <Briefcase className="text-rose-600" size={48} />,
    details: [
      'Open roles for Software Engineers and Data Scientists.',
      'Remote-first culture with global impact.',
      'Competitive benefits and professional growth.',
      'Work on cutting-edge AI and Geospatial tech.'
    ]
  },
  'contact': {
    title: 'Contact',
    category: 'Company',
    description: 'Get in touch with our support and sales teams.',
    icon: <Mail className="text-slate-600" size={48} />,
    details: [
      'Email: support@fieldforce.ai',
      'Phone: +91 (800) 123-4567',
      'Office: 123 Tech Park, New Delhi, India.',
      'Available 24/7 for enterprise support.'
    ]
  }
};

const InfoPage = () => {
  const { slug } = useParams();
  const page = contentMap[slug];

  if (!page) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-black text-slate-900 mb-4">Page Not Found</h1>
        <Link to="/" className="text-blue-600 font-bold flex items-center gap-2">
          <ArrowLeft size={20} /> Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfdfe] font-sans">
      <header className="bg-white border-b border-slate-100 py-4 px-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <MapIcon className="text-white" size={18} />
            </div>
            <span className="text-xl font-black text-slate-900">FieldForce</span>
          </Link>
          <Link to="/" className="text-slate-500 hover:text-blue-600 font-bold text-sm flex items-center gap-2">
            <ArrowLeft size={16} /> Home
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-20">
        <div className="flex flex-col items-center text-center mb-16">
          <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-8 border border-slate-100">
            {page.icon}
          </div>
          <span className="text-blue-600 font-black uppercase tracking-[0.2em] text-xs mb-4">{page.category}</span>
          <h1 className="text-5xl lg:text-6xl font-black text-slate-900 mb-6 tracking-tight">{page.title}</h1>
          <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">
            {page.description}
          </p>
        </div>

        <div className="bg-white rounded-[40px] border border-slate-100 p-8 md:p-12 shadow-sm">
          <h2 className="text-2xl font-black text-slate-900 mb-8">Key Highlights</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {page.details.map((detail, i) => (
              <div key={i} className="flex gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <CheckCircle className="text-blue-600 shrink-0" size={24} />
                <p className="text-slate-700 font-bold leading-relaxed">{detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 text-center">
          <h3 className="text-2xl font-black text-slate-900 mb-6">Interested in {page.title}?</h3>
          <div className="flex justify-center gap-4">
            <Link to="/register" className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 transform hover:-translate-y-1">
              Register Your Team
            </Link>
            <Link to="/login" className="bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-2xl font-black hover:bg-slate-50 transition-all transform hover:-translate-y-1">
              Sign In
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-12 border-t border-slate-100 text-center">
        <p className="text-slate-400 font-bold text-sm">
          Developed by <a href="https://webnovatech.co.in" className="text-slate-900 hover:text-blue-600 transition-colors">WEBNOVA TECH</a>
        </p>
      </footer>
    </div>
  );
};

export default InfoPage;

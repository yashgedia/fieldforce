import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#fcfdfe]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto no-scrollbar relative">
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-slate-50/50 to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto p-6 md:p-10 lg:p-12 relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;

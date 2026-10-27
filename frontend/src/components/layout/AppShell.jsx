import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const AppShell = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleGlobalSearch = (term) => {
    if (term.trim()) {
      navigate(`/leads?search=${encodeURIComponent(term.trim())}`);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f7fb]">
      {/* Persistent / Responsive Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-y-auto">
        <Topbar
          onOpenSidebar={() => setSidebarOpen(true)}
          onGlobalSearch={handleGlobalSearch}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

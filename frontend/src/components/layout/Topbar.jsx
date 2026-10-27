import React, { useState } from 'react';
import { Menu, Search, Bell, CheckCircle2, X } from 'lucide-react';
import { useAuth } from '../../app/AuthContext';
import { notificationsApi } from '../../services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const Topbar = ({ onOpenSidebar, onGlobalSearch }) => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsApi.getAll,
    refetchInterval: 30000
  });

  const markAllReadMutation = useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  const unreadCount = notifData?.data?.unreadCount || 0;
  const notifications = notifData?.data?.notifications || [];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onGlobalSearch) {
      onGlobalSearch(searchTerm);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-white border-b border-slate-200 shadow-sm sm:px-6">
      {/* Left: Hamburger & Global Search */}
      <div className="flex items-center flex-1 gap-4 max-w-xl">
        <button
          onClick={onOpenSidebar}
          className="p-2 text-slate-500 rounded-lg lg:hidden hover:bg-slate-100"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
          <Search className="absolute w-4 h-4 text-slate-400 left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks, tracking IDs, recipients, drivers, plate numbers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-2 pl-10 pr-4 text-sm bg-slate-100/80 border border-transparent rounded-full focus:bg-white focus:border-brand-teal focus:ring-2 focus:ring-teal-500/20 transition-all outline-none"
          />
        </form>
      </div>

      {/* Right: User Pill & Notifications */}
      <div className="flex items-center gap-3">
        {/* Welcome Back Pill (Matching Image 1) */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Welcome back, {user?.name || 'Administrator'}!</span>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-600 transition-colors rounded-full hover:bg-slate-100"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Notifications Flyout */}
          {showNotifications && (
            <div className="absolute right-0 w-80 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                <span className="font-semibold text-sm text-slate-800">Notifications ({unreadCount})</span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllReadMutation.mutate()}
                    className="text-xs text-brand-teal hover:underline font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      className={`p-3 text-xs transition-colors hover:bg-slate-50 ${
                        !n.isRead ? 'bg-teal-50/40 font-medium' : 'text-slate-600'
                      }`}
                    >
                      <div className="font-semibold text-slate-800 mb-0.5">{n.title}</div>
                      <div>{n.message}</div>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

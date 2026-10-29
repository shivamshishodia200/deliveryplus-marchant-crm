import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  MapPin,
  Users,
  CalendarDays,
  Building,
  Truck,
  BookOpen,
  Package,
  BarChart2,
  Sliders,
  Settings,
  LogOut,
  X
} from 'lucide-react';
import { CrmLogo } from './DeliveryPlusLogo';
import { useAuth } from '../../app/AuthContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isMerchant = user?.role === 'merchant';

  const navItems = [
    { label: 'Dashboard', to: '/', icon: LayoutDashboard },
    { label: 'Tasks', to: '/tasks', icon: CheckSquare, badge: 'Active' },
    { label: 'Map', to: '/map', icon: MapPin },
    { label: 'Users', to: '/admin', icon: Users, roles: ['superadmin', 'admin'] },
    { label: 'Roster', to: '/roster', icon: CalendarDays },
    { label: 'Merchants', to: '/merchants', icon: Building },
    { label: 'Vehicles', to: '/vehicles', icon: Truck },
    { label: 'Contacts', to: '/contacts', icon: BookOpen },
    { label: 'Products', to: '/products', icon: Package },
    { label: 'Analytics', to: '/reports', icon: BarChart2 },
    { label: 'Extensions', to: '/quotations', icon: Sliders },
    { label: 'Settings', to: '/settings', icon: Settings }
  ];

  const merchantNavItems = [
    { label: 'Merchant Orders & Tasks', to: '/merchant-portal', icon: Package, badge: 'Portal' },
    ...(user?.permissions?.add_contact || user?.permissions?.edit_contact
      ? [{ label: 'Address Book & Contacts', to: '/contacts', icon: BookOpen }]
      : []),
    ...(user?.permissions?.manage_product
      ? [{ label: 'Product Catalog', to: '/products', icon: Package }]
      : []),
    { label: 'Account Settings', to: '/settings', icon: Settings }
  ];

  const itemsToRender = isMerchant
    ? merchantNavItems
    : navItems.filter((item) => {
        if (!item.roles) return true;
        return item.roles.includes(user?.role);
      });

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-[#0a1128] border-r border-slate-800/80 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-800/70">
          <CrmLogo />
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>


        {/* Navigation Items (Matching Screenshot) */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {itemsToRender.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2 rounded-xl font-medium text-xs transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-teal text-white shadow-md font-bold'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-brand-teal/30 text-teal-200">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Card at Bottom */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white font-bold text-xs flex items-center justify-center shadow-md">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-semibold text-white truncate">
                  {user?.name || 'User'}
                </span>
                <span className="text-[10px] text-teal-400 font-medium tracking-wide uppercase">
                  {isMerchant ? 'Merchant Partner' : (user?.role || 'Staff')}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

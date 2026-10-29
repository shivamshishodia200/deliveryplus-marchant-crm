import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { AppShell } from '../components/layout/AppShell';

import { Login } from '../features/auth/Login';
import { Dashboard } from '../features/dashboard/Dashboard';
import { LeadsList } from '../features/leads/LeadsList';
import { ContactsList } from '../features/contacts/ContactsList';
import { CompaniesList } from '../features/companies/CompaniesList';
import { OpportunitiesBoard } from '../features/opportunities/OpportunitiesBoard';
import { TasksView } from '../features/tasks/TasksView';
import { QuotationsList } from '../features/quotations/QuotationsList';
import { SupportTickets } from '../features/support/SupportTickets';
import { ProductsList } from '../features/products/ProductsList';
import { ReportsView } from '../features/reports/ReportsView';
import { AdminManagement } from '../features/admin/AdminManagement';
import { SettingsView } from '../features/settings/SettingsView';
import { TelematicsMap } from '../features/map/TelematicsMap';
import { RosterView } from '../features/roster/RosterView';
import { VehiclesView } from '../features/vehicles/VehiclesView';
import { MerchantsView } from '../features/merchants/MerchantsView';
import { MerchantPortalView } from '../features/merchant-portal/MerchantPortalView';

const ProtectedRoute = ({ children, roles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-brand-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user?.role)) {
    if (user?.role === 'merchant') {
      return <Navigate to="/merchant-portal" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (isAuthenticated) {
    if (user?.role === 'merchant') {
      return <Navigate to="/merchant-portal" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

const DashboardIndex = () => {
  const { user } = useAuth();
  if (user?.role === 'merchant') {
    return <Navigate to="/merchant-portal" replace />;
  }
  return <Dashboard />;
};

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    )
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardIndex /> },
      { path: 'leads', element: <LeadsList /> },
      { path: 'contacts', element: <ContactsList /> },
      { path: 'companies', element: <CompaniesList /> },
      { path: 'merchants', element: <MerchantsView /> },
      { path: 'merchant-portal', element: <MerchantPortalView /> },
      { path: 'opportunities', element: <OpportunitiesBoard /> },
      { path: 'map', element: <TelematicsMap /> },
      { path: 'tasks', element: <TasksView /> },
      { path: 'roster', element: <RosterView /> },
      { path: 'vehicles', element: <VehiclesView /> },
      { path: 'quotations', element: <QuotationsList /> },
      { path: 'support', element: <SupportTickets /> },
      { path: 'products', element: <ProductsList /> },
      { path: 'reports', element: <ReportsView /> },
      { path: 'analytics', element: <ReportsView /> },
      { path: 'extensions', element: <QuotationsList /> },
      {
        path: 'admin',
        element: (
          <ProtectedRoute roles={['superadmin', 'admin']}>
            <AdminManagement />
          </ProtectedRoute>
        )
      },
      {
        path: 'users',
        element: (
          <ProtectedRoute roles={['superadmin', 'admin']}>
            <AdminManagement />
          </ProtectedRoute>
        )
      },
      { path: 'settings', element: <SettingsView /> },
      { path: '*', element: <Navigate to="/" replace /> }
    ]
  }
]);

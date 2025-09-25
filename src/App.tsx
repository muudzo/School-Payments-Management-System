import React, { useState } from 'react';
import { LoginScreen } from './components/auth/LoginScreen';
import { AppLayout } from './components/layout/AppLayout';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { ParentPortal } from './components/parent/ParentPortal';
import { StudentList } from './components/students/StudentList';
import { PaymentForm } from './components/payments/PaymentForm';
import { ReceiptGenerator } from './components/receipts/ReceiptGenerator';
import { NotificationSystem } from './components/notifications/NotificationSystem';
import { SystemSettings } from './components/settings/SystemSettings';
import { AppProvider } from './components/context/AppContext';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<'admin' | 'staff' | 'parent' | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');

  const handleLogin = (role: 'admin' | 'staff' | 'parent', userData: any) => {
    setUserRole(role);
    setUser(userData);
    
    // Set default view based on role
    if (role === 'parent') {
      setCurrentView('overview');
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setUserRole(null);
    setCurrentView('dashboard');
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view);
  };

  // If not logged in, show login screen
  if (!user || !userRole) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Render appropriate content based on current view and user role
  const renderContent = () => {
    if (userRole === 'parent') {
      return (
        <ParentPortal 
          user={user} 
          currentView={currentView}
          onViewChange={handleViewChange}
        />
      );
    }

    // Admin and Staff views
    switch (currentView) {
      case 'dashboard':
        return <AdminDashboard onViewChange={handleViewChange} />;
      case 'students':
        return <StudentList onViewChange={handleViewChange} />;
      case 'payments':
        return <PaymentForm onBack={() => setCurrentView('dashboard')} />;
      case 'receipts':
        return <ReceiptGenerator onBack={() => setCurrentView('dashboard')} />;
      case 'settings':
        return <SystemSettings onBack={() => setCurrentView('dashboard')} />;
      case 'notifications':
        return <NotificationSystem onBack={() => setCurrentView('dashboard')} />;
      default:
        return <AdminDashboard onViewChange={handleViewChange} />;
    }
  };

  return (
    <AppProvider>
      <AppLayout
        user={user}
        userRole={userRole}
        currentView={currentView}
        onViewChange={handleViewChange}
        onLogout={handleLogout}
      >
        {renderContent()}
      </AppLayout>
    </AppProvider>
  );
}
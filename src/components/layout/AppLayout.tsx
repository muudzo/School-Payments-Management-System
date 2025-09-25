import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  GraduationCap,
  Home,
  Users,
  CreditCard,
  Receipt,
  Settings,
  LogOut,
  Menu,
  Bell,
  Search
} from 'lucide-react';
import { Input } from '../ui/input';

interface AppLayoutProps {
  children: React.ReactNode;
  user: any;
  userRole: 'admin' | 'staff' | 'parent';
  currentView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
}

export function AppLayout({ 
  children, 
  user, 
  userRole, 
  currentView, 
  onViewChange, 
  onLogout 
}: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigationItems = {
    admin: [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
      { id: 'students', label: 'Students', icon: Users },
      { id: 'payments', label: 'Payments', icon: CreditCard },
      { id: 'receipts', label: 'Receipts', icon: Receipt },
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
    staff: [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
      { id: 'students', label: 'Students', icon: Users },
      { id: 'payments', label: 'Payments', icon: CreditCard },
      { id: 'receipts', label: 'Receipts', icon: Receipt },
      { id: 'notifications', label: 'Notifications', icon: Bell },
    ],
    parent: [
      { id: 'overview', label: 'Overview', icon: Home },
      { id: 'payments', label: 'Make Payment', icon: CreditCard },
      { id: 'history', label: 'Payment History', icon: Receipt },
    ]
  };

  const navItems = navigationItems[userRole];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`bg-white shadow-lg transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-16'
      } lg:w-64 flex flex-col`}>
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block`}>
              <h2 className="text-blue-900">Riverton Academy</h2>
              <p className="text-sm text-gray-600">Payment System</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <Button
                    variant={currentView === item.id ? "default" : "ghost"}
                    className={`w-full justify-start gap-3 ${
                      currentView === item.id 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'text-gray-700 hover:bg-blue-50'
                    }`}
                    onClick={() => onViewChange(item.id)}
                  >
                    <Icon className="w-5 h-5" />
                    <span className={`${sidebarOpen ? 'block' : 'hidden'} lg:block`}>
                      {item.label}
                    </span>
                  </Button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              
              <div className="hidden md:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    placeholder="Search students, payments..." 
                    className="pl-10 w-80"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-blue-600 text-white">
                        {user.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <p className="text-sm">{user.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{userRole}</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
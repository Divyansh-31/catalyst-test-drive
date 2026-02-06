import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Header } from '@/components/Header';
import { CartSheet } from '@/components/CartSheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Package,
  Settings,
  User,
  CreditCard,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/orders', label: 'Orders', icon: Package },
  { href: '/dashboard/payments', label: 'Payments', icon: CreditCard },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartSheet />

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`sticky top-16 h-[calc(100vh-4rem)] border-r border-border/40 bg-sidebar transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'
            }`}
        >
          <div className="flex flex-col h-full p-4">
            {/* User info */}
            {!collapsed && (
              <div className="mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center">
                    <User className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate text-sidebar-foreground">
                      {user?.name}
                    </p>
                    <p className="text-xs text-sidebar-foreground/60 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {collapsed && (
              <div className="mb-6 flex justify-center">
                <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center">
                  <User className="h-5 w-5 text-primary-foreground" />
                </div>
              </div>
            )}

            <Separator className="mb-4 bg-sidebar-border" />

            {/* Navigation */}
            <nav className="space-y-1 flex-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link key={item.href} to={item.href}>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start gap-3 ${collapsed ? 'px-3' : ''
                        } ${isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                        }`}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                    </Button>
                  </Link>
                );
              })}
            </nav>

            {/* Collapse toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="mt-auto text-sidebar-foreground/50 hover:text-sidebar-foreground"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

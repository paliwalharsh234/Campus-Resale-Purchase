import { Outlet, Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Users, Package, Flag, Building2, LayoutDashboard } from 'lucide-react';

const navItems = [
  { to: '/admin',           icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users',     icon: Users,           label: 'Users' },
  { to: '/admin/listings',  icon: Package,         label: 'Listings' },
  { to: '/admin/reports',   icon: Flag,            label: 'Reports' },
  { to: '/admin/campuses',  icon: Building2,       label: 'Campuses' },
];

export default function AdminLayout() {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-60 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="p-5 border-b border-gray-700">
          <Link to="/admin" className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-indigo-400" />
            <span className="font-bold text-sm">CampusResale Admin</span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <Link to="/marketplace" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
            ← Back to Marketplace
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 h-14 flex items-center px-6">
          <h1 className="text-sm font-semibold text-gray-600">Admin Panel</h1>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

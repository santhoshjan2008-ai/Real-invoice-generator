import { Bell, Plus, Home, FileText, User, LogOut } from 'lucide-react';
import type { NavTab } from './BottomNav';

interface AppHeaderProps {
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  activeTab?: NavTab;
  onTabChange?: (tab: NavTab) => void;
  onCreateInvoice?: () => void;
  onSignOut?: () => void;
  onNotificationClick?: () => void;
}

export default function AppHeader({
  userName = 'Alex De Silva',
  userEmail,
  userAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  activeTab = 'home',
  onTabChange,
  onCreateInvoice,
  onSignOut,
  onNotificationClick,
}: AppHeaderProps) {
  return (
    <header className="w-full flex items-center justify-between pt-2 pb-6 px-1">
      {/* User Greeting & Avatar */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            src={userAvatar}
            alt={userName}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ring-white shadow-sm"
          />
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] sm:text-xs text-slate-500 font-medium tracking-tight">
            Good Morning
          </span>
          <span className="text-sm sm:text-base font-bold text-slate-900 tracking-tight truncate max-w-[160px] sm:max-w-xs">
            {userName}
          </span>
        </div>
      </div>

      {/* Desktop Navigation Bar (Visible on md+ screens) */}
      {onTabChange && (
        <nav className="hidden md:flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200/90 shadow-sm">
          <button
            type="button"
            onClick={() => onTabChange('home')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'home'
                ? 'bg-[#86efac]/80 text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('invoices')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'invoices'
                ? 'bg-[#86efac]/80 text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>All Invoices</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('profile')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#86efac]/80 text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>
        </nav>
      )}

      {/* Right Side: Quick Action, Notification Bell & Sign Out */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {onCreateInvoice && (
          <button
            type="button"
            onClick={onCreateInvoice}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
            <span>Create Invoice</span>
          </button>
        )}

        <button
          type="button"
          onClick={onNotificationClick}
          className="w-10 h-10 rounded-full bg-white/90 border border-slate-200/90 shadow-sm flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-white transition-all cursor-pointer relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
        </button>

        {onSignOut && (
          <button
            type="button"
            onClick={onSignOut}
            className="hidden sm:inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/90 border border-slate-200/90 shadow-sm text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
}

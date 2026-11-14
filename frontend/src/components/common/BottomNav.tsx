import { motion } from 'framer-motion';
import { Home, Plus, FileText, User, Building2 } from 'lucide-react';

export type NavTab = 'home' | 'create' | 'invoices' | 'businesses' | 'profile';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 md:hidden">
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-full px-3 py-2 shadow-[0_12px_36px_rgba(0,0,0,0.15)] flex items-center gap-1 sm:gap-2"
      >
        {/* Home Tab */}
        <button
          type="button"
          onClick={() => onTabChange('home')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full transition-all cursor-pointer ${
            activeTab === 'home'
              ? 'bg-[#86efac]/80 text-slate-900 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center ${
              activeTab === 'home' ? 'bg-slate-900 text-white' : ''
            }`}
          >
            <Home className="w-3.5 h-3.5" />
          </div>
          {activeTab === 'home' && <span className="text-xs">Home</span>}
        </button>

        {/* Create (+) Quick Action */}
        <button
          type="button"
          onClick={() => onTabChange('create')}
          className={`p-2.5 rounded-full transition-all cursor-pointer ${
            activeTab === 'create'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Create New Invoice"
        >
          <Plus className="w-5 h-5" />
        </button>

        {/* Invoices List Tab */}
        <button
          type="button"
          onClick={() => onTabChange('invoices')}
          className={`p-2.5 rounded-full transition-all cursor-pointer ${
            activeTab === 'invoices'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="All Invoices"
        >
          <FileText className="w-5 h-5" />
        </button>

        {/* Businesses Tab */}
        <button
          type="button"
          onClick={() => onTabChange('businesses')}
          className={`p-2.5 rounded-full transition-all cursor-pointer ${
            activeTab === 'businesses'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Businesses"
        >
          <Building2 className="w-5 h-5" />
        </button>

        {/* Profile Tab */}
        <button
          type="button"
          onClick={() => onTabChange('profile')}
          className={`p-2.5 rounded-full transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="User Profile"
        >
          <User className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  );
}

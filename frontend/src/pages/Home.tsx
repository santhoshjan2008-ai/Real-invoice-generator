import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import AppHeader from '../components/common/AppHeader';
import RevenueCard from '../components/invoice/RevenueCard';
import InvoiceCard from '../components/invoice/InvoiceCard';
import InvoicePreview from '../components/invoice/InvoicePreview';
import { useInvoices } from '../context/InvoiceContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';
import type { Invoice } from '../types';
import type { NavTab } from '../components/common/BottomNav';

interface HomeProps {
  onCreateInvoice: () => void;
  onViewAllInvoices: () => void;
  onTabChange?: (tab: NavTab) => void;
}

export default function Home({ onCreateInvoice, onViewAllInvoices, onTabChange }: HomeProps) {
  const { invoices, totalRevenue, outstandingAmount, outstandingCount } = useInvoices();
  const { user, profile, signOut } = useAuth();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const displayName =
    profile?.fullName ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Alex De Silva';

  const displayAvatar =
    profile?.avatarUrl ||
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';

  // Take recent invoices for display
  const recentInvoices = invoices.slice(0, 6);
  const paidCount = invoices.filter((i) => i.status === 'paid').length;
  const totalCount = invoices.length || 1;
  const collectionRate = Math.round((paidCount / totalCount) * 100);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top Profile & Desktop Navigation Header */}
      <AppHeader
        userName={displayName}
        userEmail={user?.email}
        userAvatar={displayAvatar}
        activeTab="home"
        onTabChange={onTabChange}
        onCreateInvoice={onCreateInvoice}
        onSignOut={signOut}
      />

      {/* Main Responsive Dashboard Container */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column on Desktop (Full width on Mobile) */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-5 w-full max-w-[440px] lg:max-w-none mx-auto lg:mx-0">
          {/* Main Revenue Card matching mockup */}
          <RevenueCard
            totalRevenue={totalRevenue}
            outstandingAmount={outstandingAmount}
            outstandingCount={outstandingCount}
            percentageChange={12.5}
            onCreateClick={onCreateInvoice}
          />

          {/* Desktop Supplementary Insight Cards (Hidden on mobile to preserve 1:1 mobile mockup) */}
          <div className="hidden lg:flex flex-col gap-4">
            {/* Outstanding Summary Tile */}
            <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                    Outstanding Balance
                  </span>
                  <span className="text-xl font-bold text-slate-900 tracking-tight">
                    {formatCurrency(outstandingAmount)}
                  </span>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                {outstandingCount} unpaid
              </span>
            </div>

            {/* Collection Performance Tile */}
            <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-slate-700">Collection Rate</span>
                </div>
                <span className="text-xs font-bold text-emerald-600">{collectionRate}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${collectionRate}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-400">
                {paidCount} of {invoices.length} invoices settled successfully this cycle.
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Activity (Spans wide on desktop, stacks below on mobile) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-3 w-full max-w-[440px] lg:max-w-none mx-auto lg:mx-0">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Recent Activity
              </h2>
              <span className="hidden sm:inline-flex text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                {invoices.length} Invoices
              </span>
            </div>

            <button
              type="button"
              onClick={onViewAllInvoices}
              className="text-xs font-semibold text-slate-400 hover:text-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>See More</span>
              <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
            </button>
          </div>

          {/* List of activity cards */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-2.5 sm:p-4 border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex flex-col divide-y divide-slate-100">
            {recentInvoices.map((inv, idx) => (
              <InvoiceCard
                key={inv.id}
                invoice={inv}
                index={idx}
                onClick={() => setSelectedInvoice(inv)}
              />
            ))}

            {recentInvoices.length === 0 && (
              <div className="py-12 text-center text-slate-400 text-sm">
                No recent activity found. Click &quot;Create Invoice&quot; to begin.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Quick Preview Modal */}
      <AnimatePresence>
        {selectedInvoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedInvoice(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar rounded-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <InvoicePreview formData={selectedInvoice} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface RevenueCardProps {
  totalRevenue: number;
  outstandingAmount: number;
  outstandingCount: number;
  percentageChange?: number;
  onCreateClick: () => void;
}

export default function RevenueCard({
  totalRevenue,
  outstandingAmount,
  outstandingCount,
  percentageChange = 12.5,
  onCreateClick,
}: RevenueCardProps) {
  const [activeTab, setActiveTab] = useState<'accounts' | 'outstanding'>('accounts');

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full bg-white/95 backdrop-blur-md rounded-[32px] p-6 sm:p-7 shadow-[0_10px_35px_-10px_rgba(16,185,129,0.12),0_4px_16px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col items-center text-center"
    >
      {/* Subtitle */}
      <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-slate-400 mb-2">
        {activeTab === 'accounts' ? 'TOTAL REVENUE' : 'TOTAL OUTSTANDING'}
      </span>

      {/* Main Metric with Smooth Tab Transition */}
      <div className="min-h-[52px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {activeTab === 'accounts' ? (
            <motion.h1
              key="accounts-rev"
              initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
              transition={{ duration: 0.25 }}
              className="text-4xl sm:text-[42px] font-bold text-slate-900 tracking-tight"
            >
              {formatCurrency(totalRevenue)}
            </motion.h1>
          ) : (
            <motion.div
              key="outstanding-rev"
              initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
              transition={{ duration: 0.25 }}
              className="flex items-baseline gap-2"
            >
              <span className="text-4xl sm:text-[42px] font-bold text-slate-900 tracking-tight">
                {formatCurrency(outstandingAmount)}
              </span>
              <span className="text-sm font-medium text-slate-400">
                / {outstandingCount} Invoices
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Badge */}
      <div className="mt-2.5 mb-5">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100/80 text-emerald-700 tracking-tight">
          +{percentageChange.toFixed(1)}%
        </span>
      </div>

      {/* Segmented Toggle Control */}
      <div className="w-full max-w-[280px] bg-slate-100/90 p-1 rounded-full flex relative mb-5">
        <button
          type="button"
          onClick={() => setActiveTab('accounts')}
          className={`flex-1 relative z-10 py-1.5 text-xs font-semibold rounded-full transition-colors duration-200 ${
            activeTab === 'accounts' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {activeTab === 'accounts' && (
            <motion.div
              layoutId="activeTabBadge"
              className="absolute inset-0 bg-white rounded-full shadow-sm"
              transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            />
          )}
          <span className="relative z-10">Accounts</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('outstanding')}
          className={`flex-1 relative z-10 py-1.5 text-xs font-semibold rounded-full transition-colors duration-200 ${
            activeTab === 'outstanding' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {activeTab === 'outstanding' && (
            <motion.div
              layoutId="activeTabBadge"
              className="absolute inset-0 bg-white rounded-full shadow-sm"
              transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            />
          )}
          <span className="relative z-10">Outstanding</span>
        </button>
      </div>

      {/* Create Invoice Primary Action Button */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.015, y: -1 }}
        whileTap={{ scale: 0.985 }}
        onClick={onCreateClick}
        className="w-full py-3.5 px-6 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(0,0,0,0.15)] transition-all cursor-pointer"
      >
        <Plus className="w-4 h-4" strokeWidth={2.5} />
        <span>Create Invoice</span>
      </motion.button>
    </motion.div>
  );
}

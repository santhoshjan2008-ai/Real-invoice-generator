import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, Clock, Eye } from 'lucide-react';
import type { Invoice } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface InvoiceCardProps {
  invoice: Invoice;
  index?: number;
  onClick?: () => void;
}

export default function InvoiceCard({
  invoice,
  index = 0,
  onClick,
}: InvoiceCardProps) {
  const isPaid = invoice.status === 'paid';
  const isOverdue = invoice.status === 'overdue';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: index * 0.04,
        ease: 'easeOut',
      }}
      whileHover={{ scale: 1.008, backgroundColor: 'rgba(248, 250, 252, 0.95)' }}
      whileTap={{ scale: 0.992 }}
      onClick={onClick}
      className="flex cursor-pointer items-center justify-between py-3.5 px-3 sm:px-4 rounded-2xl transition-all duration-150 group"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Directional Circular Badge matching the mockup */}
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-105 ${
            isPaid
              ? 'bg-[#86efac]/70 text-slate-900'
              : isOverdue
              ? 'bg-[#fca5a5]/70 text-rose-950'
              : 'bg-[#fed7aa]/70 text-amber-950'
          }`}
        >
          {isPaid ? (
            <ArrowUpRight className="h-5 w-5 stroke-[2]" />
          ) : isOverdue ? (
            <ArrowDownLeft className="h-5 w-5 stroke-[2]" />
          ) : (
            <Clock className="h-4 w-4 stroke-[2]" />
          )}
        </div>

        {/* Invoice Title & Subtitle */}
        <div className="min-w-0 flex flex-col">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-slate-900 text-[15px] truncate tracking-tight">
              Invoice {invoice.invoiceNumber}
            </span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
                isPaid
                  ? 'bg-emerald-50 text-emerald-700'
                  : isOverdue
                  ? 'bg-rose-50 text-rose-700'
                  : 'bg-amber-50 text-amber-700'
              }`}
            >
              {invoice.status}
            </span>
          </div>
          <span className="text-xs text-slate-400 truncate mt-0.5 font-normal">
            {formatDate(invoice.issueDate)} • {invoice.clientDetails.name}
          </span>
        </div>
      </div>

      {/* Right side amount & hover action */}
      <div className="shrink-0 flex items-center gap-3 pl-3">
        <span
          className={`font-semibold text-[15px] tracking-tight ${
            isPaid ? 'text-slate-900' : isOverdue ? 'text-rose-600' : 'text-slate-800'
          }`}
        >
          {isPaid ? '+' : ''}
          {formatCurrency(invoice.grandTotal, invoice.currency)}
        </span>

        <span className="hidden sm:flex opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
          <Eye className="w-4 h-4" />
        </span>
      </div>
    </motion.div>
  );
}

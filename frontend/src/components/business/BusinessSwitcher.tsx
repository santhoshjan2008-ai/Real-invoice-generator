import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Check,
  Plus,
  Settings,
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';

interface BusinessSwitcherProps {
  onAddNewBusiness: () => void;
  onManageBusinesses: () => void;
}

export default function BusinessSwitcher({
  onAddNewBusiness,
  onManageBusinesses,
}: BusinessSwitcherProps) {
  const { businesses, activeBusiness, setActiveBusinessId } = useBusiness();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!activeBusiness && businesses.length === 0) {
    return null;
  }

  const otherBusinesses = businesses.filter((b) => b.id !== activeBusiness?.id);

  return (
    <div className="relative" ref={containerRef}>
      {/* Switcher Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl bg-white/90 hover:bg-white border border-slate-200/90 shadow-sm hover:shadow transition-all text-left cursor-pointer group"
        title="Switch Business"
      >
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-sm overflow-hidden flex-shrink-0">
          {activeBusiness?.logoUrl ? (
            <img
              src={activeBusiness.logoUrl}
              alt={activeBusiness.businessName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{(activeBusiness?.businessName || 'B')[0]}</span>
          )}
        </div>

        <div className="flex flex-col max-w-[110px] sm:max-w-[160px] truncate">
          <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            Active
          </span>
          <span className="text-xs sm:text-sm font-bold text-slate-800 truncate">
            {activeBusiness?.businessName || 'Select Business'}
          </span>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-emerald-600' : 'group-hover:text-slate-600'
          }`}
        />
      </button>

      {/* Floating Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-72 sm:w-80 bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200/90 shadow-[0_12px_36px_rgba(0,0,0,0.12)] p-2 z-50 overflow-hidden"
          >
            {/* Active Business Section */}
            <div className="px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase text-slate-400">
              Active Business
            </div>

            {activeBusiness && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-100">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-sm overflow-hidden flex-shrink-0">
                    {activeBusiness.logoUrl ? (
                      <img
                        src={activeBusiness.logoUrl}
                        alt={activeBusiness.businessName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{activeBusiness.businessName[0]}</span>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {activeBusiness.businessName}
                    </span>
                    <span className="text-[11px] text-slate-500 truncate">
                      {activeBusiness.businessType} • {activeBusiness.city || activeBusiness.defaultCurrency}
                    </span>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              </div>
            )}

            {/* Other Businesses List */}
            {otherBusinesses.length > 0 && (
              <>
                <div className="px-3 pt-3 pb-1 text-[10px] font-bold tracking-wider uppercase text-slate-400">
                  Other Businesses
                </div>
                <div className="max-h-48 overflow-y-auto flex flex-col gap-1 pr-1">
                  {otherBusinesses.map((biz) => (
                    <button
                      key={biz.id}
                      type="button"
                      onClick={() => {
                        setActiveBusinessId(biz.id);
                        setIsOpen(false);
                      }}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 text-left transition-colors cursor-pointer group w-full"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs overflow-hidden flex-shrink-0 group-hover:bg-white">
                          {biz.logoUrl ? (
                            <img
                              src={biz.logoUrl}
                              alt={biz.businessName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>{biz.businessName[0]}</span>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-semibold text-slate-800 group-hover:text-emerald-700 truncate">
                            {biz.businessName}
                          </span>
                          <span className="text-[11px] text-slate-400 truncate">
                            {biz.businessType} {biz.isDefault ? '• Default' : ''}
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] font-medium text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        Switch
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Divider */}
            <div className="my-2 border-t border-slate-100" />

            {/* Actions */}
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onAddNewBusiness();
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer w-full text-left"
              >
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>Add Another Business</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onManageBusinesses();
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer w-full text-left"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Manage All Businesses</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  ArrowLeft,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';
import BusinessCard from '../components/business/BusinessCard';
import BusinessFormModal from '../components/business/BusinessFormModal';
import type { BusinessProfile, BusinessProfileFormData } from '../types';

interface BusinessManagementProps {
  onBack: () => void;
  onOpenCreateInvoice?: () => void;
}

export default function BusinessManagement({
  onBack,
  onOpenCreateInvoice,
}: BusinessManagementProps) {
  const {
    businesses,
    activeBusiness,
    createBusiness,
    updateBusiness,
    deleteBusiness,
    setActiveBusinessId,
    setDefaultBusinessId,
  } = useBusiness();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<BusinessProfile | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const filteredBusinesses = businesses.filter((b) =>
    b.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.city && b.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
    b.businessType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingBusiness(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (business: BusinessProfile) => {
    setEditingBusiness(business);
    setIsModalOpen(true);
  };

  const handleSubmitModal = async (data: BusinessProfileFormData) => {
    if (editingBusiness) {
      await updateBusiness(editingBusiness.id, data);
      triggerToast(`Updated profile for "${data.businessName}"`);
    } else {
      const created = await createBusiness(data);
      triggerToast(`Created new business "${created.businessName}"`);
    }
  };

  const handleSelectActive = async (id: string) => {
    await setActiveBusinessId(id);
    const target = businesses.find((b) => b.id === id);
    if (target) {
      triggerToast(`Switched active business to "${target.businessName}"`);
    }
  };

  const handleSetDefault = async (id: string) => {
    await setDefaultBusinessId(id);
    const target = businesses.find((b) => b.id === id);
    if (target) {
      triggerToast(`Set "${target.businessName}" as primary default business`);
    }
  };

  const handleDelete = async (id: string) => {
    const target = businesses.find((b) => b.id === id);
    const name = target?.businessName || 'Business';
    await deleteBusiness(id);
    triggerToast(`Deleted "${name}"`);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 shadow-sm transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          {onOpenCreateInvoice && (
            <button
              type="button"
              onClick={onOpenCreateInvoice}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <span>Create Invoice</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
            <span>Add Business</span>
          </button>
        </div>
      </div>

      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Manage Businesses</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              {businesses.length}
            </span>
          </h1>
          <p className="text-xs text-slate-500">
            Create and switch between company profiles. Active business details will auto-fill on new invoices.
          </p>
        </div>
      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs font-semibold text-emerald-800 shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Bar */}
      {businesses.length > 2 && (
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by business name, city, or type..."
            className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-sm"
          />
        </div>
      )}

      {/* Business Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBusinesses.map((biz) => (
          <BusinessCard
            key={biz.id}
            business={biz}
            isActive={activeBusiness?.id === biz.id}
            onSelectActive={handleSelectActive}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
            onSetDefault={handleSetDefault}
            canDelete={businesses.length > 1}
          />
        ))}

        {/* Add Business Dotted Card */}
        <button
          type="button"
          onClick={handleOpenAdd}
          className="p-6 rounded-3xl border-2 border-dashed border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/20 transition-all flex flex-col items-center justify-center gap-3 text-center cursor-pointer min-h-[220px] group"
        >
          <div className="w-12 h-12 rounded-2xl bg-slate-100 group-hover:bg-emerald-100 text-slate-500 group-hover:text-emerald-700 flex items-center justify-center transition-colors">
            <Plus className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 group-hover:text-emerald-900">
              Add Another Business
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Freelance, consulting, or another brand entity
            </p>
          </div>
        </button>
      </div>

      {filteredBusinesses.length === 0 && businesses.length > 0 && (
        <div className="py-12 text-center text-slate-400 text-sm">
          No businesses match your search term "{searchTerm}".
        </div>
      )}

      {/* Edit / Create Modal */}
      <BusinessFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitModal}
        initialData={editingBusiness}
        isFirstBusiness={businesses.length === 0}
      />
    </div>
  );
}

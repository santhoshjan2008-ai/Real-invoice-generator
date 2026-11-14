import { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Check,
  Star,
  Edit2,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import type { BusinessProfile } from '../../types';

interface BusinessCardProps {
  business: BusinessProfile;
  isActive: boolean;
  onSelectActive: (id: string) => void;
  onEdit: (business: BusinessProfile) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
  canDelete?: boolean;
}

export default function BusinessCard({
  business,
  isActive,
  onSelectActive,
  onEdit,
  onDelete,
  onSetDefault,
  canDelete = true,
}: BusinessCardProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const location = [business.city, business.state, business.country]
    .filter(Boolean)
    .join(', ');

  return (
    <div
      className={`relative p-5 rounded-3xl border transition-all duration-200 flex flex-col justify-between ${
        isActive
          ? 'bg-white border-emerald-400 shadow-[0_8px_30px_rgba(16,185,129,0.12)] ring-1 ring-emerald-400/50'
          : 'bg-white/85 hover:bg-white border-slate-200/90 hover:border-slate-300 shadow-sm hover:shadow-md'
      }`}
    >
      {/* Top Row: Logo, Info & Badges */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center font-bold text-lg shadow-sm overflow-hidden flex-shrink-0">
              {business.logoUrl ? (
                <img
                  src={business.logoUrl}
                  alt={business.businessName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{business.businessName[0]}</span>
              )}
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 truncate">
                  {business.businessName}
                </h3>
              </div>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                  {business.businessType}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                  {business.defaultCurrency}
                </span>
              </div>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            {isActive && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Active Now
              </span>
            )}
            {business.isDefault && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-500" />
                Default
              </span>
            )}
          </div>
        </div>

        {/* Contact & Location Details */}
        <div className="space-y-1.5 text-xs text-slate-500 py-2 border-t border-slate-100">
          {business.email && (
            <div className="flex items-center gap-2 truncate">
              <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">{business.email}</span>
            </div>
          )}
          {business.phone && (
            <div className="flex items-center gap-2 truncate">
              <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">{business.phone}</span>
            </div>
          )}
          {location && (
            <div className="flex items-center gap-2 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          )}
          {business.taxNumber && (
            <div className="text-[11px] text-slate-400 pt-0.5">
              <span className="font-medium text-slate-600">{business.taxType || 'Tax ID'}:</span>{' '}
              {business.taxNumber}
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          {!isActive && (
            <button
              type="button"
              onClick={() => onSelectActive(business.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Check className="w-3 h-3" />
              <span>Make Active</span>
            </button>
          )}

          {!business.isDefault && (
            <button
              type="button"
              onClick={() => onSetDefault(business.id)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium transition-colors cursor-pointer"
              title="Set as Default Business"
            >
              Set Default
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(business)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Edit Business Profile"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          {canDelete && (
            <button
              type="button"
              onClick={() => setShowConfirmDelete(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Delete Business Profile"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Delete Confirmation Overlay */}
      {showConfirmDelete && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-3xl p-5 flex flex-col items-center justify-center text-center z-20">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-2">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">Delete Business?</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">
            Are you sure you want to delete <span className="font-semibold text-slate-800">{business.businessName}</span>? Previously generated invoices will retain their original business details.
          </p>

          <div className="flex items-center gap-2 mt-4">
            <button
              type="button"
              onClick={() => setShowConfirmDelete(false)}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setShowConfirmDelete(false);
                onDelete(business.id);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

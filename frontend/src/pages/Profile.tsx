import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  ArrowLeft,
  Database,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Fingerprint,
} from 'lucide-react';
import { checkSupabaseConnection } from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useBusiness } from '../context/BusinessContext';

interface ProfileProps {
  onBack: () => void;
  onManageBusinesses?: () => void;
}

export default function Profile({ onBack, onManageBusinesses }: ProfileProps) {
  const { user, profile, signOut } = useAuth();
  const { activeBusiness, businesses } = useBusiness();
  const [supabaseStatus, setSupabaseStatus] = useState<{
    loading: boolean;
    connected: boolean;
    message: string;
  }>({
    loading: true,
    connected: false,
    message: 'Checking connection...',
  });

  useEffect(() => {
    let isMounted = true;
    checkSupabaseConnection().then((res) => {
      if (isMounted) {
        setSupabaseStatus({
          loading: false,
          connected: res.connected,
          message: res.message,
        });
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const displayName =
    profile?.fullName ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Alex De Silva';

  const displayEmail = profile?.email || user?.email || 'alex@company.com';
  const displayAvatar =
    profile?.avatarUrl ||
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="w-full flex flex-col gap-6"
    >
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 shadow-sm transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>

        <button
          type="button"
          onClick={() => signOut()}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col items-center text-center">
        <div className="relative mb-4">
          <img
            src={displayAvatar}
            alt={displayName}
            className="w-24 h-24 rounded-full object-cover ring-4 ring-emerald-100 shadow-md"
          />
          <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded-full ring-2 ring-white flex items-center justify-center text-white">
            <ShieldCheck className="w-3 h-3" />
          </div>
        </div>

        <h1 className="text-xl font-bold text-slate-900">{displayName}</h1>
        <p className="text-xs text-slate-400 mt-0.5">{displayEmail}</p>

        {user && (
          <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-slate-100 text-[11px] text-slate-600 font-mono">
            <Fingerprint className="w-3 h-3 text-slate-400" />
            <span>ID: {user.id.slice(0, 13)}...</span>
          </div>
        )}

        <div className="w-full max-w-md mt-6 flex flex-col gap-3 text-left">
          {/* Supabase Connection Status Badge */}
          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[11px] text-slate-400 font-medium">Backend Database</span>
                <span className="text-xs font-semibold text-slate-800">Supabase Auth &amp; RLS</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {supabaseStatus.loading ? (
                <span className="text-xs text-slate-400 font-medium">Checking...</span>
              ) : supabaseStatus.connected ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Connected</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Disconnected</span>
                </span>
              )}
            </div>
          </div>

          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 flex items-center gap-3">
            <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[11px] text-slate-400 font-medium">Primary Email</span>
              <span className="text-xs font-semibold text-slate-800">{displayEmail}</span>
            </div>
          </div>

          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Building className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] text-slate-400 font-medium">Active Business</span>
                <span className="text-xs font-semibold text-slate-800 truncate">
                  {activeBusiness?.businessName || 'No business selected'}
                </span>
              </div>
            </div>
            {onManageBusinesses && (
              <button
                type="button"
                onClick={onManageBusinesses}
                className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50 shrink-0 cursor-pointer shadow-sm"
              >
                Manage ({businesses.length})
              </button>
            )}
          </div>

          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 flex items-center gap-3">
            <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[11px] text-slate-400 font-medium">Phone</span>
              <span className="text-xs font-semibold text-slate-800">
                {activeBusiness?.phone || '+1 (555) 234-5678'}
              </span>
            </div>
          </div>

          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 flex items-center gap-3">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[11px] text-slate-400 font-medium">Office Address</span>
              <span className="text-xs font-semibold text-slate-800">
                {activeBusiness?.streetAddress || activeBusiness?.city || 'Not specified'}
              </span>
            </div>
          </div>

          {/* Sign Out Button in list */}
          <button
            type="button"
            onClick={() => signOut()}
            className="w-full mt-3 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 text-xs font-semibold border border-slate-200/80 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of Account</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

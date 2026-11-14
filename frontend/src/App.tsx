import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BusinessProvider, useBusiness } from './context/BusinessContext';
import { InvoiceProvider } from './context/InvoiceContext';
import AuthPage from './pages/AuthPage';
import Home from './pages/Home';
import CreateInvoice from './pages/CreateInvoice';
import InvoicesPage from './pages/Invoices';
import BusinessManagement from './pages/BusinessManagement';
import BusinessOnboarding from './pages/BusinessOnboarding';
import Profile from './pages/Profile';
import BottomNav, { type NavTab } from './components/common/BottomNav';
import { Loader2, Receipt } from 'lucide-react';

function AppContent() {
  const { isAuthenticated, isLoading, isPasswordRecovery } = useAuth();
  const { businesses, isLoading: isBusinessLoading } = useBusiness();
  const [currentTab, setCurrentTab] = useState<NavTab>('home');

  if (isLoading || (isAuthenticated && isBusinessLoading)) {
    return (
      <div className="relative min-h-screen bg-[#F8FAF9] flex flex-col items-center justify-center p-4">
        <div className="absolute top-0 left-0 right-0 h-[480px] bg-[radial-gradient(ellipse_at_50%_-5%,#86efac_0%,#bbf7d0_28%,#dcfce7_55%,#f8faf9_88%)] pointer-events-none z-0" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
            <Receipt className="w-7 h-7 text-emerald-400" />
          </div>
          <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            <span>Connecting session & business profiles...</span>
          </div>
        </div>
      </div>
    );
  }

  // If user is unauthenticated or in password recovery mode, render AuthPage
  if (!isAuthenticated || isPasswordRecovery) {
    return <AuthPage />;
  }

  // First-time users with no business profiles must complete onboarding first
  if (businesses.length === 0) {
    return <BusinessOnboarding onComplete={() => setCurrentTab('home')} />;
  }

  return (
    <div className="relative min-h-screen bg-[#F8FAF9] text-slate-800 font-sans flex flex-col items-center selection:bg-emerald-200 selection:text-emerald-900 pb-28 md:pb-16 overflow-x-hidden">
      {/* Ambient Mint Top Glow spreading beautifully across wide and mobile screens */}
      <div className="absolute top-0 left-0 right-0 h-[480px] bg-[radial-gradient(ellipse_at_50%_-5%,#86efac_0%,#bbf7d0_28%,#dcfce7_55%,#f8faf9_88%)] pointer-events-none z-0" />

      {/* Content Container (Adapts fluidly: full width on mobile, up to max-w-7xl on desktop) */}
      <main className="relative z-10 w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-3 sm:pt-6 transition-all duration-300">
        <AnimatePresence mode="wait">
          {currentTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <Home
                onCreateInvoice={() => setCurrentTab('create')}
                onViewAllInvoices={() => setCurrentTab('invoices')}
                onTabChange={setCurrentTab}
              />
            </motion.div>
          )}

          {currentTab === 'create' && (
            <motion.div
              key="create"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <CreateInvoice
                onBack={() => setCurrentTab('home')}
                onSuccess={() => setCurrentTab('home')}
                onManageBusinesses={() => setCurrentTab('businesses')}
              />
            </motion.div>
          )}

          {currentTab === 'invoices' && (
            <motion.div
              key="invoices"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <InvoicesPage
                onBack={() => setCurrentTab('home')}
                onCreateInvoice={() => setCurrentTab('create')}
              />
            </motion.div>
          )}

          {currentTab === 'businesses' && (
            <motion.div
              key="businesses"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <BusinessManagement
                onBack={() => setCurrentTab('home')}
                onOpenCreateInvoice={() => setCurrentTab('create')}
              />
            </motion.div>
          )}

          {currentTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <Profile
                onBack={() => setCurrentTab('home')}
                onManageBusinesses={() => setCurrentTab('businesses')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Bottom Navigation Bar (Visible on mobile, desktop uses top navbar) */}
      <BottomNav activeTab={currentTab} onTabChange={setCurrentTab} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BusinessProvider>
        <InvoiceProvider>
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
          <AppContent />
        </InvoiceProvider>
      </BusinessProvider>
    </AuthProvider>
  );
}

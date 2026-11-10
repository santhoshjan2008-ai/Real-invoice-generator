import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Receipt } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/auth/LoginForm';
import SignUpForm from '../components/auth/SignUpForm';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';
import ResetPasswordForm from '../components/auth/ResetPasswordForm';

type AuthView = 'login' | 'signup' | 'forgot' | 'reset';

export default function AuthPage() {
  const {
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    requestPasswordReset,
    resetPassword,
    isLoading,
    isPasswordRecovery,
  } = useAuth();

  const [currentView, setCurrentView] = useState<AuthView>('login');

  useEffect(() => {
    if (isPasswordRecovery) {
      setCurrentView('reset');
    }
  }, [isPasswordRecovery]);

  return (
    <div className="relative min-h-screen bg-[#F8FAF9] flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Ambient Top Glow exactly matching the Invoice Dashboard */}
      <div className="absolute top-0 left-0 right-0 h-[480px] bg-[radial-gradient(ellipse_at_50%_-5%,#86efac_0%,#bbf7d0_28%,#dcfce7_55%,#f8faf9_88%)] pointer-events-none z-0" />

      {/* Main Auth Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-[430px] flex flex-col items-center"
      >
        {/* Brand / Logo Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md mb-3">
            <Receipt className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-[11px] font-semibold tracking-wide mb-1.5">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>Smart Invoicing Platform</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Invoice Generator
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage, generate, and export professional invoices with ease
          </p>
        </div>

        {/* Floating Card */}
        <div className="w-full bg-white/95 backdrop-blur-xl rounded-[32px] p-6 sm:p-8 border border-slate-100 shadow-[0_12px_45px_-10px_rgba(16,185,129,0.14),0_4px_16px_rgba(0,0,0,0.04)]">
          {/* Segmented Switcher for Login / Signup (hidden when on forgot or reset) */}
          {(currentView === 'login' || currentView === 'signup') && (
            <div className="w-full bg-slate-100/90 p-1 rounded-full flex relative mb-6">
              <button
                type="button"
                onClick={() => setCurrentView('login')}
                className={`flex-1 relative z-10 py-2 text-xs font-semibold rounded-full transition-colors duration-200 cursor-pointer ${
                  currentView === 'login' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {currentView === 'login' && (
                  <motion.div
                    layoutId="activeAuthTab"
                    className="absolute inset-0 bg-white rounded-full shadow-sm"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}
                <span className="relative z-10">Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentView('signup')}
                className={`flex-1 relative z-10 py-2 text-xs font-semibold rounded-full transition-colors duration-200 cursor-pointer ${
                  currentView === 'signup' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {currentView === 'signup' && (
                  <motion.div
                    layoutId="activeAuthTab"
                    className="absolute inset-0 bg-white rounded-full shadow-sm"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}
                <span className="relative z-10">Create Account</span>
              </button>
            </div>
          )}

          {/* Animated View Transitions */}
          <AnimatePresence mode="wait">
            {currentView === 'login' && (
              <motion.div
                key="view-login"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <LoginForm
                  onSubmit={signInWithEmail}
                  onGoogleSignIn={signInWithGoogle}
                  onForgotPassword={() => setCurrentView('forgot')}
                  onSwitchToSignUp={() => setCurrentView('signup')}
                  isLoading={isLoading}
                />
              </motion.div>
            )}

            {currentView === 'signup' && (
              <motion.div
                key="view-signup"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <SignUpForm
                  onSubmit={signUpWithEmail}
                  onGoogleSignIn={signInWithGoogle}
                  onSwitchToSignIn={() => setCurrentView('login')}
                  isLoading={isLoading}
                />
              </motion.div>
            )}

            {currentView === 'forgot' && (
              <motion.div
                key="view-forgot"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <ForgotPasswordForm
                  onSubmit={requestPasswordReset}
                  onBackToSignIn={() => setCurrentView('login')}
                  isLoading={isLoading}
                />
              </motion.div>
            )}

            {currentView === 'reset' && (
              <motion.div
                key="view-reset"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <ResetPasswordForm
                  onSubmit={resetPassword}
                  onSuccess={() => setCurrentView('login')}
                  isLoading={isLoading}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Security & Privacy Notice Footer */}
        <p className="text-[11px] text-slate-400 text-center mt-6">
          Protected by Supabase Auth with Row-Level Security encryption.
        </p>
      </motion.div>
    </div>
  );
}


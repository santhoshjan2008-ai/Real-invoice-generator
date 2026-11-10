import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, ArrowRight, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface ForgotPasswordFormProps {
  onSubmit: (email: string) => Promise<void>;
  onBackToSignIn: () => void;
  isLoading: boolean;
}

export default function ForgotPasswordForm({
  onSubmit,
  onBackToSignIn,
  isLoading,
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    try {
      await onSubmit(trimmedEmail);
      setIsSubmitted(true);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to send reset email. Please try again.');
    }
  };

  return (
    <div className="w-full flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBackToSignIn}
          className="p-1 rounded-full text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Reset Password</h2>
          <p className="text-xs text-slate-400">Enter your email and we&apos;ll send recovery instructions</p>
        </div>
      </div>

      {isSubmitted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex flex-col gap-3 leading-relaxed"
        >
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-900">Email Dispatched</p>
              <p className="mt-1 text-emerald-800 text-xs">
                We&apos;ve sent a password reset link to <strong className="font-semibold">{email}</strong>. Please check your inbox and follow the instructions.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onBackToSignIn}
            className="w-full py-2.5 px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors cursor-pointer text-center"
          >
            Return to Sign In
          </button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Account Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@company.com"
                autoComplete="email"
                className="w-full bg-slate-50/70 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            disabled={isLoading}
            className="w-full mt-2 py-3.5 px-6 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(0,0,0,0.12)] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending Instructions...</span>
              </>
            ) : (
              <>
                <span>Send Reset Link</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </form>
      )}
    </div>
  );
}


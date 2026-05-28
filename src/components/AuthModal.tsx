import React, { useState } from 'react';
import { X, Lock, Mail, User, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserType } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserType, token: string) => void;
}

export function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!isLogin && !name) {
      setError('Name is required for registration.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    const url = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin 
      ? { email, password }
      : { email, password, name };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed.');
      }

      onAuthSuccess(data.user, data.token);
      resetForm();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setError(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm"
          id="auth-backdrop"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl"
          id="auth-modal-content"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
            id="auth-close-btn"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Form Header */}
          <div className="mb-6 mt-2">
            <h2 className="font-sans text-2xl font-bold tracking-tight text-zinc-900" id="auth-title">
              {isLogin ? 'Sign in to Storefront' : 'Create an Account'}
            </h2>
            <p className="mt-1 font-sans text-xs text-zinc-500">
              {isLogin 
                ? 'Access your orders, track delivery, and checkout easily' 
                : 'Join us to purchase exquisite lifestyle goods'}
            </p>
          </div>

          {/* Error Alert panel */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-start gap-2.5 rounded-lg border border-red-100 bg-red-50 p-3 text-red-700 text-xs font-sans leading-relaxed"
              id="auth-error-alert"
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Main Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4" id="auth-form">
            
            {/* Registration Name Field */}
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-sans font-semibold text-zinc-700" htmlFor="auth-name-input">
                  Your Full Name
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    id="auth-name-input"
                    placeholder="E.g., Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 py-2.5 pl-9 pr-4 text-sm tracking-tight text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900/10"
                    required={!isLogin}
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-sans font-semibold text-zinc-700" htmlFor="auth-email-input">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  id="auth-email-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 py-2.5 pl-9 pr-4 text-sm tracking-tight text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900/10"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-sans font-semibold text-zinc-700" htmlFor="auth-password-input">
                  Password
                </label>
                {isLogin && (
                  <span className="text-[10px] font-sans font-medium text-zinc-400 cursor-not-allowed">
                    Forgot password?
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  id="auth-password-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 py-2.5 pl-9 pr-4 text-sm tracking-tight text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900/10"
                  required
                  disabled={loading}
                />
              </div>
              <p className="text-[10px] font-sans text-zinc-400 mt-1">
                Password must contain at least 6 characters.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-zinc-900 py-3 text-sm font-sans font-semibold text-white shadow-sm transition-transform hover:bg-zinc-850 active:scale-[0.98] disabled:scale-100 disabled:opacity-75 disabled:cursor-not-allowed"
              id="auth-submit-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Tab Footer */}
          <div className="mt-6 border-t border-zinc-100 pt-4 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              disabled={loading}
              className="font-sans text-xs font-medium text-zinc-650 hover:text-zinc-900 hover:underline disabled:opacity-50 disabled:no-underline"
              id="auth-toggle-btn"
            >
              {isLogin 
                ? "Don't have an account? Register instead" 
                : 'Already have an account? Sign in'}
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
export default AuthModal;

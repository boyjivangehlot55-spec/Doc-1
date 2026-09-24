import React, { useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  FileSearch,
  MessageSquareQuote,
  Eye,
  EyeOff,
  UserCheck,
  Zap,
} from 'lucide-react';

interface AuthViewProps {
  onDemoLogin: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onDemoLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Google sign-in popup was closed before completion.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        // Ignored
      } else {
        setError(err.message || 'Failed to sign in with Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let message = 'Authentication failed. Please try again.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        message = 'Invalid email or password. Please check your credentials.';
      } else if (err.code === 'auth/user-not-found') {
        message = 'No account found with this email. Try signing up instead.';
      } else if (err.code === 'auth/email-already-in-use') {
        message = 'An account with this email already exists. Please sign in.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters long.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Please provide a valid email address.';
      } else if (err.code === 'auth/operation-not-allowed') {
        message =
          'Email password provider is not enabled on this Firebase project. You can "Continue with Google" or click "One-Click Demo Account" below to enter immediately!';
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = () => {
    setError(null);
    onDemoLogin();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Left Column: Product Value Props */}
        <div className="lg:col-span-6 space-y-6 lg:pr-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Legal & Contract Intelligence</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Review contracts without{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                hidden traps.
              </span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Upload any PDF contract, rental agreement, or terms of service.
              ClauseClear detects one-sided clauses, matches verbatim snippets with
              color-coded risk highlights, and answers your questions grounded in full contract text.
            </p>
          </div>

          <div className="space-y-3 pt-2 text-left">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300 shrink-0 mt-0.5">
                <FileSearch className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">
                  Verbatim Snippet Highlighting
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  High (Red), Medium (Yellow), and Low (Green) severity indicators mapped directly onto the source contract text.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300 shrink-0 mt-0.5">
                <MessageSquareQuote className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">
                  100% Grounded Contract Chat
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Powered by Gemini AI with full contract text context, so follow-up answers are always verified against the real clauses.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">
                  Persistent Cloud History
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Saved securely in Firebase Firestore. Revisit previous analyses and chat threads without re-running token-heavy endpoints.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Authentication Card */}
        <div className="lg:col-span-6">
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
            {/* Header / Tabs */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-700/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    ClauseClear
                  </h2>
                  <p className="text-[11px] text-slate-400">Secure Legal Portal</p>
                </div>
              </div>

              {/* Mode Toggle */}
              <div className="flex p-1 bg-slate-900/80 rounded-xl border border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    setError(null);
                  }}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    !isSignUp
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true);
                    setError(null);
                  }}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    isSignUp
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-200 text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                  <span>{error}</span>
                </div>
                <button
                  type="button"
                  onClick={handleDemoClick}
                  className="w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-center transition flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Enter instantly via One-Click Demo Mode</span>
                </button>
              </div>
            )}

            {/* Google One-Click Sign-In */}
            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3 px-4 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold rounded-xl shadow-md flex items-center justify-center gap-3 transition disabled:opacity-50 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700/60" />
              </div>
              <div className="relative flex justify-center text-[11px]">
                <span className="px-3 bg-slate-800 text-slate-400 font-medium">
                  Or use email and password
                </span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isSignUp ? 'Create secure password (min 6 chars)' : 'Enter your password'}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isSignUp ? 'Create Account' : 'Sign In with Email'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Login Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700/60" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-slate-800 text-slate-400 font-medium">
                  Instant Evaluator Access
                </span>
              </div>
            </div>

            {/* Instant Demo Login Button */}
            <button
              type="button"
              onClick={handleDemoClick}
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] text-white border border-emerald-500/40 text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2.5 transition cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-emerald-200 shrink-0" />
              <span>One-Click Demo Account (Instant Access)</span>
            </button>

            <div className="mt-4 text-center">
              <p className="text-[11px] text-slate-400">
                Explore pre-analyzed sample contracts, live Gemini AI chat, and verbatim highlights with 1 click.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

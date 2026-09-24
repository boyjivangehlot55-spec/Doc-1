import React from 'react';
import { ShieldCheck, Plus, LogOut, FileText, ArrowLeft } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signOut, User } from 'firebase/auth';

interface NavbarProps {
  user: User | null;
  currentDocTitle?: string | null;
  onBackToHistory: () => void;
  onOpenUpload: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  currentDocTitle,
  onBackToHistory,
  onOpenUpload,
}) => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBackToHistory}
            className="flex items-center gap-2.5 group text-left transition"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                  ClauseClear
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Legal AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden md:block">
                Contract Risk Intelligence
              </p>
            </div>
          </button>

          {/* Current Document Breadcrumb */}
          {currentDocTitle && (
            <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-200 min-w-0">
              <button
                onClick={onBackToHistory}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                History
              </button>
              <span className="text-slate-300">/</span>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 truncate max-w-xs">
                <FileText className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="truncate">{currentDocTitle}</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {currentDocTitle && (
            <button
              onClick={onBackToHistory}
              className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>History</span>
            </button>
          )}

          <button
            onClick={onOpenUpload}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm shadow-indigo-600/20 hover:shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Contract</span>
          </button>

          {user && (
            <div className="flex items-center gap-2 pl-2 sm:pl-3 sm:border-l border-slate-200">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-medium text-slate-700 max-w-[140px] truncate">
                  {user.email}
                </div>
                <div className="text-[10px] text-emerald-600 flex items-center justify-end gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Connected
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import { LegalDocument, RiskLevel } from '../types';
import { RiskBadge } from './RiskBadge';
import {
  FileText,
  Calendar,
  Trash2,
  ChevronRight,
  Search,
  AlertTriangle,
  FileCheck,
  Plus,
  Shield,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, deleteDoc } from 'firebase/firestore';

interface DocumentListProps {
  documents: LegalDocument[];
  loading: boolean;
  onSelectDocument: (doc: LegalDocument) => void;
  onOpenUpload: () => void;
  userId: string;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  loading,
  onSelectDocument,
  onOpenUpload,
  userId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<'All' | RiskLevel>('All');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleDeleteConfirm = async (e: React.MouseEvent, docId: string) => {
    e.stopPropagation();
    setActionError(null);

    try {
      setDeletingId(docId);
      await deleteDoc(doc(db, `users/${userId}/documents`, docId));
      setConfirmDeleteId(null);
    } catch (err: any) {
      console.error('Failed to delete document:', err);
      setActionError(err.message || 'Could not delete document. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredDocs = documents.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterRisk === 'All' || d.analysis?.risk_score === filterRisk;
    return matchesSearch && matchesFilter;
  });

  const highRiskCount = documents.filter(
    (d) => d.analysis?.risk_score === 'High'
  ).length;
  const mediumRiskCount = documents.filter(
    (d) => d.analysis?.risk_score === 'Medium'
  ).length;
  const lowRiskCount = documents.filter(
    (d) => d.analysis?.risk_score === 'Low'
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-2 relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Legal & Contract Risk Repository</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Document Analysis History
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Revisit your previously reviewed contracts, inspect color-coded clause highlights,
            or resume grounded chat threads anytime without re-running analysis.
          </p>
        </div>

        <div className="relative z-10 shrink-0">
          <button
            onClick={onOpenUpload}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl bg-indigo-500 hover:bg-indigo-400 active:bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Analyze New Contract</span>
          </button>
        </div>
      </div>

      {actionError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
          <span>{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-xs font-bold text-red-800 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">
              {documents.length}
            </div>
            <div className="text-xs font-medium text-slate-500">
              Total Contracts
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-red-600">
              {highRiskCount}
            </div>
            <div className="text-xs font-medium text-slate-500">
              High Risk Alerts
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-amber-600">
              {mediumRiskCount}
            </div>
            <div className="text-xs font-medium text-slate-500">
              Medium Risk Warnings
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-emerald-600">
              {lowRiskCount}
            </div>
            <div className="text-xs font-medium text-slate-500">
              Low Risk Documents
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
        {/* Search */}
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents by title or file name..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-xs transition"
          />
        </div>

        {/* Severity Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['All', 'High', 'Medium', 'Low'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterRisk(filter)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer whitespace-nowrap ${
                filterRisk === filter
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {filter === 'All' ? 'All Contracts' : `${filter} Risk`}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid / List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading your legal contracts...</span>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 max-w-xl mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {searchQuery || filterRisk !== 'All'
                ? 'No matching contracts found'
                : 'No analyzed contracts yet'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
              {searchQuery || filterRisk !== 'All'
                ? 'Try clearing your search query or switching the risk filter to see all agreements.'
                : 'Upload your first contract PDF or try one of our realistic sample agreements to inspect color-coded clause highlights.'}
            </p>
          </div>
          <button
            onClick={onOpenUpload}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload or Try Sample</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocs.map((docItem) => {
            const risk = docItem.analysis?.risk_score || 'Medium';
            const findings = docItem.analysis?.key_findings || [];
            const highFindings = findings.filter((f) => f.severity === 'High').length;
            const medFindings = findings.filter((f) => f.severity === 'Medium').length;
            const lowFindings = findings.filter((f) => f.severity === 'Low').length;

            const dateStr = docItem.uploadedAt
              ? new Date(docItem.uploadedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Recent';

            return (
              <div
                key={docItem.id}
                onClick={() => onSelectDocument(docItem)}
                className="group bg-white rounded-2xl border border-slate-200 hover:border-indigo-400/80 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer relative"
              >
                <div>
                  {/* Top Bar: Risk Badge & Delete */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <RiskBadge level={risk} size="sm" />
                    <div className="flex items-center gap-1">
                      {confirmDeleteId === docItem.id ? (
                        <div
                          className="flex items-center gap-1.5 bg-red-50 p-1 rounded-lg border border-red-200"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="text-[10px] text-red-700 font-semibold px-1">
                            Delete?
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteConfirm(e, docItem.id)}
                            disabled={deletingId === docItem.id}
                            className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-bold"
                          >
                            {deletingId === docItem.id ? '...' : 'Yes'}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDeleteId(null);
                            }}
                            className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[10px] font-bold"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteId(docItem.id);
                          }}
                          disabled={deletingId === docItem.id}
                          title="Delete from history"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Document Title */}
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {docItem.title}
                  </h3>

                  {/* File name and metadata */}
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1.5">
                    <FileText className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{docItem.fileName}</span>
                  </div>

                  {/* Executive Summary Preview */}
                  {docItem.analysis?.summary && (
                    <p className="text-xs text-slate-600 mt-3 line-clamp-3 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {docItem.analysis.summary}
                    </p>
                  )}
                </div>

                {/* Bottom Row: Breakdown badges and Open button */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      {dateStr}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                    <span>Open Review</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

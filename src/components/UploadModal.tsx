import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileText,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  FileCode,
  Zap,
  BookOpen,
} from 'lucide-react';
import { extractTextFromPDF } from '../lib/pdfExtractor';
import { SAMPLE_CONTRACTS, SampleContract } from '../lib/sampleContracts';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { LegalDocument, AnalysisResult } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onDocumentCreated: (doc: LegalDocument) => void;
}

type TabMode = 'pdf' | 'sample' | 'text';

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  userId,
  onDocumentCreated,
}) => {
  const [tab, setTab] = useState<TabMode>('pdf');
  const [file, setFile] = useState<File | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [selectedSample, setSelectedSample] = useState<SampleContract | null>(null);

  const [status, setStatus] = useState<
    'idle' | 'extracting' | 'analyzing' | 'saving' | 'done' | 'error'
  >('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (
        selected.type !== 'application/pdf' &&
        !selected.name.toLowerCase().endsWith('.pdf')
      ) {
        setErrorMessage('Please select a valid PDF document.');
        return;
      }
      setFile(selected);
      setErrorMessage(null);
      if (!customTitle) {
        setCustomTitle(selected.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      if (
        selected.type !== 'application/pdf' &&
        !selected.name.toLowerCase().endsWith('.pdf')
      ) {
        setErrorMessage('Please drop a valid PDF document.');
        return;
      }
      setFile(selected);
      setErrorMessage(null);
      if (!customTitle) {
        setCustomTitle(selected.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const runAnalysisAndSave = async (
    textToAnalyze: string,
    docTitle: string,
    fileName: string,
    fileSize: number
  ) => {
    try {
      // Step 1: Call /api/analyze
      setStatus('analyzing');
      setStatusMessage('Gemini AI analyzing clauses and verifying verbatim snippets...');

      const resp = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToAnalyze,
          title: docTitle,
        }),
      });

      if (!resp.ok) {
        const errJson = await resp.json().catch(() => ({}));
        throw new Error(errJson.error || `Analysis failed with status ${resp.status}`);
      }

      const analysisResult: AnalysisResult = await resp.json();

      // Step 2: Save to Firestore
      setStatus('saving');
      setStatusMessage('Saving contract, verbatim highlights, and analysis to Firestore...');

      const newDocData = {
        userId,
        title: docTitle,
        fileName,
        fileSize,
        uploadedAt: new Date().toISOString(),
        extractedText: textToAnalyze,
        analysis: analysisResult,
      };

      const docRef = await addDoc(
        collection(db, `users/${userId}/documents`),
        newDocData
      );

      const createdDoc: LegalDocument = {
        id: docRef.id,
        ...newDocData,
      };

      setStatus('done');
      setStatusMessage('Analysis complete!');

      setTimeout(() => {
        onDocumentCreated(createdDoc);
        handleReset();
        onClose();
      }, 500);
    } catch (err: any) {
      console.error('Processing error:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Failed to process and analyze contract.');
    }
  };

  const handleStartProcess = async () => {
    setErrorMessage(null);

    if (tab === 'pdf') {
      if (!file) {
        setErrorMessage('Please choose or drop a PDF file first.');
        return;
      }

      try {
        setStatus('extracting');
        setStatusMessage('Extracting readable text from PDF pages...');
        const extracted = await extractTextFromPDF(file);
        const title = customTitle.trim() || file.name.replace(/\.[^/.]+$/, '');
        await runAnalysisAndSave(extracted, title, file.name, file.size);
      } catch (err: any) {
        setStatus('error');
        setErrorMessage(err.message || 'Failed to extract text from PDF.');
      }
    } else if (tab === 'sample') {
      if (!selectedSample) {
        setErrorMessage('Please select one of the sample agreements.');
        return;
      }
      const title = customTitle.trim() || selectedSample.title;
      await runAnalysisAndSave(
        selectedSample.text,
        title,
        `${selectedSample.id}.pdf`,
        selectedSample.text.length
      );
    } else if (tab === 'text') {
      if (!pastedText.trim() || pastedText.trim().length < 50) {
        setErrorMessage('Please paste at least 50 characters of contract text.');
        return;
      }
      const title = customTitle.trim() || 'Custom Contract Text';
      await runAnalysisAndSave(
        pastedText.trim(),
        title,
        'pasted-contract.txt',
        pastedText.length
      );
    }
  };

  const handleReset = () => {
    setFile(null);
    setCustomTitle('');
    setPastedText('');
    setSelectedSample(null);
    setStatus('idle');
    setStatusMessage('');
    setErrorMessage(null);
  };

  const isProcessing =
    status === 'extracting' || status === 'analyzing' || status === 'saving';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8 transition-all">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Upload Contract for AI Risk Review
              </h3>
              <p className="text-xs text-slate-500">
                Extracts text, matches verbatim snippets, and identifies clauses
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (!isProcessing) {
                handleReset();
                onClose();
              }
            }}
            disabled={isProcessing}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Source Mode Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-white gap-4">
          <button
            type="button"
            onClick={() => setTab('pdf')}
            disabled={isProcessing}
            className={`py-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              tab === 'pdf'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload PDF File</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('sample')}
            disabled={isProcessing}
            className={`py-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              tab === 'sample'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Try Sample Contracts (1-Click)</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('text')}
            disabled={isProcessing}
            className={`py-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              tab === 'text'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Paste Raw Text</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Document Title input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Document Display Title
            </label>
            <input
              type="text"
              disabled={isProcessing}
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="e.g. Master SaaS Agreement 2024, Downtown Apartment Lease"
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* TAB 1: PDF Upload */}
          {tab === 'pdf' && (
            <div className="space-y-3">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => !isProcessing && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  file
                    ? 'border-indigo-500 bg-indigo-50/40'
                    : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,application/pdf"
                  className="hidden"
                />

                {file ? (
                  <div className="flex flex-col items-center gap-2 text-indigo-900">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{file.name}</p>
                      <p className="text-xs text-slate-500">
                        {(file.size / 1024).toFixed(1)} KB • PDF Document
                      </p>
                    </div>
                    <span className="text-xs text-indigo-600 hover:underline font-semibold mt-1">
                      Click to choose a different PDF
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Click to browse or drop your contract PDF here
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Supports contracts, NDAs, leases, and terms of service
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Sample Contracts */}
          {tab === 'sample' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Select a ready-to-test contract pre-loaded with realistic high-risk clauses:
              </p>
              <div className="space-y-2.5">
                {SAMPLE_CONTRACTS.map((sample) => (
                  <div
                    key={sample.id}
                    onClick={() => {
                      if (!isProcessing) {
                        setSelectedSample(sample);
                        setCustomTitle(sample.title);
                      }
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                      selectedSample?.id === sample.id
                        ? 'border-indigo-600 bg-indigo-50/70 shadow-xs'
                        : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>{sample.title}</span>
                      </h4>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {sample.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {sample.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Text Paste */}
          {tab === 'text' && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Paste Full Agreement Text
              </label>
              <textarea
                disabled={isProcessing}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste the contract text or terms here..."
                rows={7}
                className="w-full p-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
              <p className="text-[11px] text-slate-400">
                {pastedText.length} characters entered
              </p>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Processing Progress Status */}
          {isProcessing && (
            <div className="p-4 rounded-xl bg-indigo-50/80 border border-indigo-200 text-indigo-900 space-y-2">
              <div className="flex items-center gap-2.5 text-xs font-bold text-indigo-700">
                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <span>{statusMessage}</span>
              </div>
              <div className="w-full bg-indigo-200/60 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full bg-indigo-600 rounded-full transition-all duration-500 ${
                    status === 'extracting'
                      ? 'w-1/3'
                      : status === 'analyzing'
                      ? 'w-2/3'
                      : 'w-5/6'
                  }`}
                />
              </div>
            </div>
          )}

          {status === 'done' && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Analysis ready! Opening document dashboard...</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              handleReset();
              onClose();
            }}
            disabled={isProcessing}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleStartProcess}
            disabled={
              isProcessing ||
              (tab === 'pdf' && !file) ||
              (tab === 'sample' && !selectedSample) ||
              (tab === 'text' && pastedText.trim().length < 50)
            }
            className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md shadow-indigo-600/25 transition flex items-center gap-2 disabled:opacity-40 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-indigo-200" />
                <span>Analyze Contract</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

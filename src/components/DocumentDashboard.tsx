import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  LegalDocument,
  Finding,
  RiskLevel,
  ChatMessage,
} from '../types';
import { RiskBadge } from './RiskBadge';
import { buildTextSegments, TextSegment } from '../lib/snippetMatcher';
import { db } from '../lib/firebase';
import {
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  ArrowLeft,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Search,
  MessageSquare,
  Shield,
  FileText,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Send,
  CornerDownLeft,
  Quote,
  HelpCircle,
  Share2,
  Printer,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Compass,
} from 'lucide-react';

interface DocumentDashboardProps {
  document: LegalDocument;
  userId: string;
  onBack: () => void;
}

type RightPanelTab = 'findings' | 'chat' | 'summary';

export const DocumentDashboard: React.FC<DocumentDashboardProps> = ({
  document: docItem,
  userId,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<RightPanelTab>('findings');
  const [severityFilter, setSeverityFilter] = useState<'All' | RiskLevel>('All');
  const [activeFindingIndex, setActiveFindingIndex] = useState<number | null>(null);
  const [fontSize, setFontSize] = useState<number>(13); // in px
  const [textSearch, setTextSearch] = useState('');

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatError, setChatError] = useState<string | null>(null);

  // References
  const textContainerRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const findings = useMemo(() => {
    return docItem.analysis?.key_findings || [];
  }, [docItem.analysis]);

  // Build highlighted text segments based on verbatim snippets
  const { segments, matchedCount } = useMemo(() => {
    return buildTextSegments(docItem.extractedText, findings);
  }, [docItem.extractedText, findings]);

  // Load chat messages from Firestore on mount
  useEffect(() => {
    let isMounted = true;
    const loadMessages = async () => {
      try {
        const messagesRef = collection(
          db,
          `users/${userId}/documents/${docItem.id}/messages`
        );
        const q = query(messagesRef, orderBy('timestamp', 'asc'));
        const snap = await getDocs(q);
        if (!isMounted) return;

        if (!snap.empty) {
          const loaded = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<ChatMessage, 'id'>),
          }));
          setChatMessages(loaded);
        } else {
          // Default greeting
          setChatMessages([
            {
              id: 'welcome',
              role: 'model',
              content: `Hello! I have analyzed **${docItem.title}**. All my answers are grounded strictly in the full contract text. Feel free to ask about any obligations, notice periods, liability caps, or potential risks!`,
              timestamp: new Date().toISOString(),
            },
          ]);
        }
      } catch (err) {
        console.error('Error fetching chat messages:', err);
      }
    };

    loadMessages();
    return () => {
      isMounted = false;
    };
  }, [docItem.id, userId, docItem.title]);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (activeTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab]);

  // Synchronized scrolling: Left panel snippet click -> Right panel finding card
  const handleSnippetClick = (index: number) => {
    setActiveFindingIndex(index);
    setActiveTab('findings');
    const targetFinding = findings[index];
    if (targetFinding && severityFilter !== 'All' && targetFinding.severity !== severityFilter) {
      setSeverityFilter('All');
    }

    // Smooth scroll right panel to card
    setTimeout(() => {
      const cardEl = window.document.getElementById(`finding-card-${index}`);
      if (cardEl) {
        cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 60);
  };

  // Synchronized scrolling: Right panel finding card click -> Left panel snippet
  const handleFindingCardClick = (index: number) => {
    setActiveFindingIndex(index);
    const targetFinding = findings[index];
    if (targetFinding && severityFilter !== 'All' && targetFinding.severity !== severityFilter) {
      setSeverityFilter('All');
    }

    // Smooth scroll left text panel to snippet
    setTimeout(() => {
      const snippetEl = window.document.getElementById(`snippet-match-${index}`);
      if (snippetEl) {
        snippetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 30);
  };

  // Navigation between risks (Next / Previous)
  const handleNextRisk = () => {
    if (findings.length === 0) return;
    const nextIdx =
      activeFindingIndex === null || activeFindingIndex >= findings.length - 1
        ? 0
        : activeFindingIndex + 1;
    handleFindingCardClick(nextIdx);
  };

  const handlePrevRisk = () => {
    if (findings.length === 0) return;
    const prevIdx =
      activeFindingIndex === null || activeFindingIndex <= 0
        ? findings.length - 1
        : activeFindingIndex - 1;
    handleFindingCardClick(prevIdx);
  };

  // Handle grounded chat question
  const handleSendChat = async (questionText?: string) => {
    const q = (questionText || chatInput).trim();
    if (!q || chatLoading) return;

    setChatInput('');
    setChatError(null);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: q,
      timestamp: new Date().toISOString(),
    };

    const updated = [...chatMessages, userMessage];
    setChatMessages(updated);
    setChatLoading(true);

    try {
      // Save user message to Firestore
      await addDoc(
        collection(db, `users/${userId}/documents/${docItem.id}/messages`),
        {
          role: 'user',
          content: q,
          timestamp: new Date().toISOString(),
        }
      );

      // Call /api/chat with full contract text + prior turns + question
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractText: docItem.extractedText,
          messages: updated
            .filter((m) => m.id !== 'welcome')
            .map((m) => ({ role: m.role, content: m.content })),
          question: q,
        }),
      });

      if (!resp.ok) {
        const errJson = await resp.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to generate grounded answer.');
      }

      const data = await resp.json();
      const modelAnswer = data.reply || 'No answer found in the contract.';

      const modelMessage: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        content: modelAnswer,
        timestamp: new Date().toISOString(),
      };

      setChatMessages((prev) => [...prev, modelMessage]);

      // Save model reply to Firestore
      await addDoc(
        collection(db, `users/${userId}/documents/${docItem.id}/messages`),
        {
          role: 'model',
          content: modelAnswer,
          timestamp: new Date().toISOString(),
        }
      );
    } catch (err: any) {
      console.error('Chat error:', err);
      setChatError(err.message || 'Could not reach contract assistant.');
    } finally {
      setChatLoading(false);
    }
  };

  const filteredFindings = findings.filter(
    (f) => severityFilter === 'All' || f.severity === severityFilter
  );

  const highCount = findings.filter((f) => f.severity === 'High').length;
  const medCount = findings.filter((f) => f.severity === 'Medium').length;
  const lowCount = findings.filter((f) => f.severity === 'Low').length;

  // Suggested prompt chips for grounded chat
  const suggestedPrompts = [
    'What are the termination and notice requirements?',
    'Is there an automatic renewal or price hike clause?',
    'What are the indemnification and liability caps?',
    'Can the vendor modify terms unilaterally?',
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-xs px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Left: Back + Title + Risk Badge */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onBack}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
              title="Return to documents history"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                  {docItem.title}
                </h1>
                {/* Risk score badge at the top of the page */}
                <RiskBadge
                  level={docItem.analysis?.risk_score || 'Medium'}
                  size="md"
                />
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                <span className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  {docItem.fileName}
                </span>
                <span>•</span>
                <span>
                  {docItem.uploadedAt
                    ? new Date(docItem.uploadedAt).toLocaleDateString()
                    : 'Today'}
                </span>
                <span>•</span>
                <span className="text-indigo-600 font-semibold">
                  {matchedCount} clauses highlighted in text
                </span>
              </div>
            </div>
          </div>

          {/* Right: Quick actions and navigation */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            {/* Risk navigator buttons */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <span className="px-2 text-slate-500 font-medium">Risk Jump:</span>
              <button
                onClick={handlePrevRisk}
                className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition"
                title="Previous highlighted clause"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-bold text-slate-700 px-1">
                {activeFindingIndex !== null ? `#${activeFindingIndex + 1}` : '–'}
              </span>
              <button
                onClick={handleNextRisk}
                className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition"
                title="Next highlighted clause"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Split-Screen Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================================================================= */}
        {/* LEFT COLUMN: Extracted PDF Text with Color-Coded Highlights (7 cols) */}
        {/* ================================================================= */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[78vh] sticky top-36 overflow-hidden">
          {/* Left Header Controls */}
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Source Contract Text
              </span>
              <span className="text-[11px] text-slate-400">
                (Text-Snippet Matched)
              </span>
            </div>

            {/* In-text search & font sizing */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={textSearch}
                  onChange={(e) => setTextSearch(e.target.value)}
                  placeholder="Find in text..."
                  className="w-28 sm:w-36 pl-8 pr-2 py-1 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center border border-slate-200 rounded-lg bg-white p-0.5">
                <button
                  onClick={() => setFontSize((s) => Math.max(11, s - 1))}
                  className="p-1 text-slate-500 hover:text-slate-800 rounded-md"
                  title="Smaller font"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono px-1 text-slate-600">
                  {fontSize}px
                </span>
                <button
                  onClick={() => setFontSize((s) => Math.min(18, s + 1))}
                  className="p-1 text-slate-500 hover:text-slate-800 rounded-md"
                  title="Larger font"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Color Legend Bar */}
          <div className="px-4 py-2 bg-slate-50/50 border-b border-slate-200 flex items-center gap-4 text-xs">
            <span className="text-slate-500 text-[11px] font-semibold">
              Highlight Legend:
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-red-100 border border-red-500" />
              <span className="text-red-700 font-medium text-[11px]">High Risk</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-amber-100 border border-amber-500" />
              <span className="text-amber-700 font-medium text-[11px]">
                Medium Risk
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-emerald-100 border border-emerald-500" />
              <span className="text-emerald-700 font-medium text-[11px]">Low Risk</span>
            </div>
          </div>

          {/* Extracted Text Content with Interactive Highlights */}
          <div
            ref={textContainerRef}
            className="flex-1 p-6 overflow-y-auto font-mono leading-relaxed whitespace-pre-wrap selection:bg-indigo-500/20 text-slate-800"
            style={{ fontSize: `${fontSize}px` }}
          >
            {segments.map((seg, idx) => {
              if (seg.type === 'text') {
                // If search active, highlight search query occurrences in plain text
                if (
                  textSearch.trim() &&
                  seg.content.toLowerCase().includes(textSearch.toLowerCase())
                ) {
                  const parts = seg.content.split(
                    new RegExp(`(${textSearch})`, 'gi')
                  );
                  return (
                    <span key={idx}>
                      {parts.map((p, pIdx) =>
                        p.toLowerCase() === textSearch.toLowerCase() ? (
                          <mark
                            key={pIdx}
                            className="bg-indigo-200 text-indigo-900 rounded-xs px-0.5"
                          >
                            {p}
                          </mark>
                        ) : (
                          p
                        )
                      )}
                    </span>
                  );
                }
                return <span key={idx}>{seg.content}</span>;
              }

              // Highlighted snippet
              const finding = seg.finding!;
              const fIndex = seg.findingIndex!;
              const isSelected = activeFindingIndex === fIndex;

              // Color mapping: red for High, yellow for Medium, green for Low
              const colorClasses = {
                High: isSelected
                  ? 'bg-red-200 text-red-950 ring-2 ring-red-500 font-medium'
                  : 'bg-red-100 text-red-950 border-b-2 border-red-500 hover:bg-red-200',
                Medium: isSelected
                  ? 'bg-amber-200 text-amber-950 ring-2 ring-amber-500 font-medium'
                  : 'bg-amber-100 text-amber-950 border-b-2 border-amber-500 hover:bg-amber-200',
                Low: isSelected
                  ? 'bg-emerald-200 text-emerald-950 ring-2 ring-emerald-500 font-medium'
                  : 'bg-emerald-100 text-emerald-950 border-b-2 border-emerald-500 hover:bg-emerald-200',
              }[finding.severity];

              return (
                <span
                  key={idx}
                  id={seg.highlightId}
                  onClick={() => handleSnippetClick(fIndex)}
                  title={`Click to view analysis: ${finding.clause_title} (${finding.severity} Risk)`}
                  className={`inline px-1 py-0.5 rounded-xs transition cursor-pointer ${colorClasses}`}
                >
                  {seg.content}
                </span>
              );
            })}
          </div>

          {/* Left Footer Info */}
          <div className="px-4 py-2 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 flex items-center justify-between">
            <span>
              Length: {docItem.extractedText.length.toLocaleString()} characters
            </span>
            <span>Click any colored clause to inspect plain-English advice</span>
          </div>
        </div>

        {/* ================================================================= */}
        {/* RIGHT COLUMN: Plain-English Findings & Grounded Chat (5 cols)     */}
        {/* ================================================================= */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[78vh] sticky top-36 overflow-hidden">
          {/* Right Header Tabs */}
          <div className="px-4 pt-3 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('findings')}
                className={`pb-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
                  activeTab === 'findings'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Risk Findings ({findings.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className={`pb-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
                  activeTab === 'chat'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Grounded Chat</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('summary')}
                className={`pb-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
                  activeTab === 'summary'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Summary</span>
              </button>
            </div>
          </div>

          {/* TAB 1: RISK FINDINGS & PLAIN-ENGLISH EXPLANATION */}
          {activeTab === 'findings' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Severity Filter Subheader */}
              <div className="p-3 border-b border-slate-100 bg-white flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-slate-500">
                  Filter by Severity:
                </span>
                <div className="flex items-center gap-1">
                  {(['All', 'High', 'Medium', 'Low'] as const).map((sev) => {
                    const count =
                      sev === 'All'
                        ? findings.length
                        : sev === 'High'
                        ? highCount
                        : sev === 'Medium'
                        ? medCount
                        : lowCount;

                    return (
                      <button
                        key={sev}
                        onClick={() => setSeverityFilter(sev)}
                        className={`px-2 py-0.5 text-[11px] font-bold rounded-md transition cursor-pointer ${
                          severityFilter === sev
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {sev} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Finding Cards List */}
              <div
                ref={rightPanelRef}
                className="flex-1 p-4 space-y-4 overflow-y-auto bg-slate-50/50"
              >
                {filteredFindings.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <p className="text-xs">No clauses match the selected filter.</p>
                  </div>
                ) : (
                  filteredFindings.map((finding, idx) => {
                    // Find actual original finding index for ID alignment
                    const originalIndex = findings.indexOf(finding);
                    const isSelected = activeFindingIndex === originalIndex;

                    const cardBorder = {
                      High: isSelected
                        ? 'border-red-500 ring-2 ring-red-500/30'
                        : 'border-red-200 hover:border-red-400',
                      Medium: isSelected
                        ? 'border-amber-500 ring-2 ring-amber-500/30'
                        : 'border-amber-200 hover:border-amber-400',
                      Low: isSelected
                        ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                        : 'border-emerald-200 hover:border-emerald-400',
                    }[finding.severity];

                    return (
                      <div
                        key={finding.id || idx}
                        id={`finding-card-${originalIndex}`}
                        onClick={() => handleFindingCardClick(originalIndex)}
                        className={`bg-white rounded-xl p-4 border shadow-xs transition-all duration-200 cursor-pointer ${cardBorder}`}
                      >
                        {/* Card Header: Title & Severity Badge */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="text-sm font-bold text-slate-900">
                            {finding.clause_title}
                          </h4>
                          <RiskBadge
                            level={finding.severity}
                            size="sm"
                            className="shrink-0"
                          />
                        </div>

                        {/* Verbatim Snippet Quote */}
                        <div className="my-2.5 p-2.5 rounded-lg bg-slate-50 border-l-3 border-indigo-400 text-xs font-mono text-slate-700 italic">
                          <div className="flex items-center gap-1 text-[10px] text-indigo-600 font-sans font-bold uppercase tracking-wider mb-1 not-italic">
                            <Quote className="w-3 h-3" />
                            <span>Verbatim Clause Text:</span>
                          </div>
                          "{finding.snippet}"
                        </div>

                        {/* Plain-English Explanation */}
                        <div className="mt-3 space-y-1">
                          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Plain-English Breakdown:
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed">
                            {finding.explanation}
                          </p>
                        </div>

                        {/* Recommendation */}
                        {finding.recommendation && (
                          <div className="mt-3 p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950">
                            <div className="font-bold text-indigo-900 flex items-center gap-1 mb-0.5">
                              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Negotiation Advice:</span>
                            </div>
                            <p className="leading-relaxed text-[11px]">
                              {finding.recommendation}
                            </p>
                          </div>
                        )}

                        {/* Bottom action hint */}
                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                          <span>Clause #{originalIndex + 1}</span>
                          <span className="text-indigo-600 font-semibold hover:underline">
                            Click to highlight in text &rarr;
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: GROUNDED CONTRACT CHAT */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/40">
              {/* Grounded notice */}
              <div className="px-4 py-2 bg-indigo-50/80 border-b border-indigo-100 text-[11px] text-indigo-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>
                  Answers are strictly grounded in <strong>{docItem.title}</strong>{' '}
                  full text.
                </span>
              </div>

              {/* Chat Messages List */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
                {chatMessages.map((msg) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        isUser ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`max-w-[88%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                          isUser
                            ? 'bg-indigo-600 text-white rounded-br-xs shadow-xs'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-xs'
                        }`}
                      >
                        <div className="font-semibold text-[10px] mb-1 opacity-75 uppercase tracking-wider">
                          {isUser ? 'You' : 'ClauseClear Assistant'}
                        </div>
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      </div>
                    </div>
                  );
                })}

                {chatLoading && (
                  <div className="flex items-start">
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-xs px-4 py-3 shadow-xs">
                      <div className="flex items-center gap-2 text-xs text-indigo-600 font-medium">
                        <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        <span>Searching contract text...</span>
                      </div>
                    </div>
                  </div>
                )}

                {chatError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                    <span>{chatError}</span>
                  </div>
                )}

                <div ref={chatBottomRef} />
              </div>

              {/* Suggested Prompt Chips */}
              {chatMessages.length <= 2 && (
                <div className="p-3 border-t border-slate-100 bg-white space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Suggested Questions:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedPrompts.map((prompt, pIdx) => (
                      <button
                        key={pIdx}
                        onClick={() => handleSendChat(prompt)}
                        className="text-[11px] text-slate-700 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 rounded-lg px-2.5 py-1 transition cursor-pointer text-left"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Input Box */}
              <div className="p-3 bg-white border-t border-slate-200">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendChat();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    disabled={chatLoading}
                    placeholder="Ask anything about this contract's terms..."
                    className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <button
                    type="submit"
                    disabled={chatLoading || !chatInput.trim()}
                    className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white transition shadow-xs cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: EXECUTIVE SUMMARY */}
          {activeTab === 'summary' && (
            <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-white">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Executive Briefing
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Overall Contract Evaluation
                </h3>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                {docItem.analysis?.summary || 'No summary available.'}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-center">
                  <div className="text-lg font-extrabold text-red-600">
                    {highCount}
                  </div>
                  <div className="text-[11px] font-semibold text-red-700">
                    High Risk
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center">
                  <div className="text-lg font-extrabold text-amber-600">
                    {medCount}
                  </div>
                  <div className="text-[11px] font-semibold text-amber-700">
                    Medium Risk
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                  <div className="text-lg font-extrabold text-emerald-600">
                    {lowCount}
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-700">
                    Low Risk
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 space-y-2">
                <div className="font-bold flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-indigo-600" />
                  <span>Legal Disclaimer</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  ClauseClear provides automated AI-assisted contract review and clause risk detection for educational and pre-review workflows. It does not constitute formal attorney-client legal counsel.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

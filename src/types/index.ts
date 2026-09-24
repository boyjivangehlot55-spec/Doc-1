export type RiskLevel = 'High' | 'Medium' | 'Low';

export interface Finding {
  id?: string;
  clause_title: string;
  snippet: string;
  severity: RiskLevel;
  explanation: string;
  recommendation: string;
  startIndex?: number;
  endIndex?: number;
}

export interface AnalysisResult {
  risk_score: RiskLevel;
  summary: string;
  key_findings: Finding[];
}

export interface LegalDocument {
  id: string;
  userId: string;
  title: string;
  fileName: string;
  fileSize?: number;
  uploadedAt: string;
  extractedText: string;
  analysis: AnalysisResult;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  isDemo?: boolean;
}


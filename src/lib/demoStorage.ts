import { LegalDocument, ChatMessage } from '../types';
import { SAMPLE_CONTRACTS } from './sampleContracts';

const DEMO_STORAGE_KEY = 'clauseclear_demo_docs_v1';
const DEMO_USER_KEY = 'clauseclear_demo_user';

export const DEFAULT_DEMO_DOCUMENTS: LegalDocument[] = [
  {
    id: 'demo-saas-agreement',
    userId: 'demo-evaluator',
    title: 'Enterprise Software & Cloud Services Agreement',
    fileName: 'ApexCloud_Enterprise_MSA_2024.pdf',
    fileSize: 48200,
    uploadedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    extractedText: SAMPLE_CONTRACTS[0].text,
    analysis: {
      risk_score: 'High',
      summary:
        'This Enterprise Software & Cloud Services Agreement heavily favors the Vendor (ApexCloud Solutions Inc.) with predatory terms: an automatic 36-month renewal with an onerous 120-day notice requirement, unilateral 15% annual fee increases without consent, a draconian 1-month fee liability cap, and immediate forfeiture/destruction of customer data within 5 days of termination.',
      key_findings: [
        {
          id: 'finding-1',
          clause_title: 'Automatic 36-Month Renewal Lock-In',
          snippet:
            'This Agreement shall automatically renew for successive thirty-six (36) month terms unless Customer provides written notice of non-renewal at least one hundred and twenty (120) days prior to the expiration of the then-current term.',
          severity: 'High',
          explanation:
            'Requires an unreasonably long 4-month advance cancellation window; missing this deadline locks your organization into another binding 3-year commitment.',
          recommendation:
            'Request 12-month renewal terms with a standard 30-day prior written notice requirement.',
        },
        {
          id: 'finding-2',
          clause_title: 'Unilateral 15% Annual Price Escalation',
          snippet:
            'Vendor reserves the sole right to adjust, increase, or modify annual subscription fees by up to fifteen percent (15%) at each annual anniversary without prior customer consent or renegotiation right.',
          severity: 'High',
          explanation:
            'Grants Vendor unchecked authority to increase contract fees compounded annually with zero customer renegotiation or exit recourse.',
          recommendation:
            'Cap annual increases to CPI or a maximum of 3-5%, with explicit right to terminate if exceeded.',
        },
        {
          id: 'finding-3',
          clause_title: 'Severe One-Month Liability Cap',
          snippet:
            "Vendor's aggregate cumulative liability for all claims arising out of this Agreement shall strictly not exceed the total fees paid by Customer to Vendor during the one (1) month immediately preceding the incident.",
          severity: 'High',
          explanation:
            'Caps the vendor’s liability to a mere single month of subscription fees, which would leave the customer unprotected in event of security breach or downtime.',
          recommendation:
            'Increase liability cap to 12 months fees paid, with standard carve-outs for data breaches and willful misconduct.',
        },
        {
          id: 'finding-4',
          clause_title: 'Immediate 5-Day Data Destruction',
          snippet:
            'Upon expiration or termination of this Agreement for any reason, Vendor may immediately purge and destroy all Customer confidential data, backups, and configurations, and shall bear no obligation to preserve data beyond five (5) business days.',
          severity: 'High',
          explanation:
            'Exposes the customer to massive business continuity risk if migration takes longer than one week.',
          recommendation:
            'Require Vendor to preserve data and provide export assistance for at least 60-90 days post-termination.',
        },
        {
          id: 'finding-5',
          clause_title: 'Aggressive 30% Annualized Late Interest',
          snippet:
            'Late payments shall accrue interest at a rate of 2.5% per month or the maximum statutory rate allowed by law.',
          severity: 'Medium',
          explanation:
            'An interest rate of 2.5% per month equates to 30% APR, which is punitive and exceeds typical commercial norms.',
          recommendation:
            'Counter with 1.0% per month after a 10-business-day written notice and grace period.',
        },
        {
          id: 'finding-6',
          clause_title: 'Delaware Governing Law & Jury Trial Waiver',
          snippet:
            'Any legal proceeding shall be conducted exclusively in Wilmington, Delaware, and Customer irrevocably waives all rights to a jury trial or class action participation.',
          severity: 'Low',
          explanation:
            'Specifies Delaware jurisdiction and class action waiver, common in enterprise software but requiring litigation away from home state.',
          recommendation:
            'Acceptable standard commercial clause, or request mutual neutral arbitration.',
        },
      ],
    },
  },
  {
    id: 'demo-lease-agreement',
    userId: 'demo-evaluator',
    title: 'Standard Residential Tenancy Agreement',
    fileName: 'Residential_Apartment_Lease.pdf',
    fileSize: 32400,
    uploadedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    extractedText: SAMPLE_CONTRACTS[1].text,
    analysis: {
      risk_score: 'High',
      summary:
        'This apartment rental lease contains multiple one-sided clauses that heavily disadvantage the tenant, including landlord entry without prior notice, forfeiture of the entire security deposit for minor wear-and-tear, and shifting structural plumbing and HVAC repair burdens onto the tenant.',
      key_findings: [
        {
          id: 'lease-1',
          clause_title: 'Landlord Entry Without Notice',
          snippet:
            'Landlord, its agents, and designated contractors may enter the leased premises at any time, with or without prior notice to Tenant, for inspection, maintenance, repairs, or showing the premises to prospective purchasers or tenants.',
          severity: 'High',
          explanation:
            'Violates the fundamental tenant right to quiet enjoyment by allowing entry without any advance warning.',
          recommendation:
            'Require at least 24 hours advance written notice except in confirmed life-safety emergencies.',
        },
        {
          id: 'lease-2',
          clause_title: 'Automatic Security Deposit Forfeiture',
          snippet:
            'Any scuffs, nail holes, carpet traffic wear, or paint touch-ups shall constitute damage beyond normal wear and tear and will result in total forfeiture of the Security Deposit.',
          severity: 'High',
          explanation:
            'Redefines normal, inevitable wear-and-tear as property damage to justify keeping the entire deposit.',
          recommendation:
            'Strike this clause and insert language guaranteeing that reasonable wear and tear is exempt from deductions with itemized receipts required.',
        },
        {
          id: 'lease-3',
          clause_title: 'Tenant Burden for Structural & HVAC Repairs',
          snippet:
            'Tenant shall be solely responsible for the ongoing repair, maintenance, servicing, and replacement of all plumbing fixtures, major appliances, HVAC filters and units, electrical switches, and window glass.',
          severity: 'High',
          explanation:
            'Shifts expensive capital replacement and major utility infrastructure costs from the property owner onto the renter.',
          recommendation:
            'Limit tenant maintenance strictly to minor consumables (light bulbs, interior cleanliness); owner must maintain structural and HVAC systems.',
        },
        {
          id: 'lease-4',
          clause_title: 'Strict Ban on Subletting and Guests',
          snippet:
            'Tenant shall not assign, sublet, transfer, or license the leased premises in whole or in part, nor allow any guest or visitor to remain on the premises for more than forty-eight (48) consecutive hours.',
          severity: 'Medium',
          explanation:
            'A 48-hour guest limit is intrusive and could prevent family or friends from visiting.',
          recommendation:
            'Expand guest allowance to 14 consecutive days or 30 days per calendar year.',
        },
      ],
    },
  },
];

export function getDemoDocuments(): LegalDocument[] {
  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(DEFAULT_DEMO_DOCUMENTS));
      return DEFAULT_DEMO_DOCUMENTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse demo documents:', e);
    return DEFAULT_DEMO_DOCUMENTS;
  }
}

export function saveDemoDocument(doc: LegalDocument): void {
  const current = getDemoDocuments();
  const updated = [doc, ...current.filter((d) => d.id !== doc.id)];
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(updated));
}

export function deleteDemoDocument(docId: string): void {
  const current = getDemoDocuments();
  const updated = current.filter((d) => d.id !== docId);
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(updated));
}

export function getDemoMessages(docId: string): ChatMessage[] {
  try {
    const raw = localStorage.getItem(`clauseclear_demo_msgs_${docId}`);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveDemoMessage(docId: string, message: ChatMessage): void {
  const current = getDemoMessages(docId);
  const updated = [...current, message];
  localStorage.setItem(`clauseclear_demo_msgs_${docId}`, JSON.stringify(updated));
}

export function isDemoSessionActive(): boolean {
  return localStorage.getItem(DEMO_USER_KEY) === 'true';
}

export function setDemoSession(active: boolean): void {
  if (active) {
    localStorage.setItem(DEMO_USER_KEY, 'true');
  } else {
    localStorage.removeItem(DEMO_USER_KEY);
  }
}

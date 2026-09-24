export interface SampleContract {
  id: string;
  title: string;
  category: string;
  description: string;
  text: string;
}

export const SAMPLE_CONTRACTS: SampleContract[] = [
  {
    id: 'saas-enterprise-agreement',
    title: 'Enterprise Software & Cloud Services Agreement',
    category: 'Commercial Tech Contract',
    description: 'A vendor-leaning SaaS contract containing unilateral price increases, auto-renewal traps, and lopsided liability caps.',
    text: `ENTERPRISE SOFTWARE AND CLOUD SERVICES AGREEMENT

This Master Services Agreement ("Agreement") is made and entered into as of October 1, 2024 ("Effective Date"), by and between ApexCloud Solutions Inc. ("Vendor"), a Delaware corporation, and Enterprise Client LLC ("Customer").

RECITALS
WHEREAS, Vendor develops and operates proprietary cloud-based workflow intelligence platforms; and
WHEREAS, Customer desires to subscribe to the Services subject to the terms and conditions outlined herein.

1. SUBSCRIPTION GRANT AND ACCEPTABLE USE
1.1 Grant: Subject to timely payment of Fees, Vendor grants Customer a non-exclusive, non-transferable, revocable license to access the Platform.
1.2 Restrictions: Customer shall not reverse engineer, decompile, or create derivative works. All intellectual property, telemetry data, and derived usage models remain the sole and exclusive property of Vendor.

2. TERM AND AUTOMATIC RENEWAL TRAP
2.1 Term: The Initial Term shall be thirty-six (36) months commencing on the Effective Date.
2.2 Renewal: This Agreement shall automatically renew for successive thirty-six (36) month terms unless Customer provides written notice of non-renewal at least one hundred and twenty (120) days prior to the expiration of the then-current term.
2.3 Price Increases: Vendor reserves the sole right to adjust, increase, or modify annual subscription fees by up to fifteen percent (15%) at each annual anniversary without prior customer consent or renegotiation right.

3. FEES AND PAYMENT DISPUTES
3.1 Invoicing: Customer shall pay all undisputed and disputed invoiced amounts within fifteen (15) days of receipt. Late payments shall accrue interest at a rate of 2.5% per month or the maximum statutory rate allowed by law.
3.2 Suspension: Vendor reserves the right to immediately suspend Customer access to all mission-critical services and export capabilities without prior warning if any payment remains delinquent past ten (10) calendar days.

4. LIMITATION OF LIABILITY AND UNILATERAL INDEMNIFICATION
4.1 Exclusion of Damages: To the maximum extent permitted by applicable law, in no event shall Vendor be liable for any indirect, incidental, punitive, or consequential damages, including loss of profits, data corruption, or business interruption.
4.2 Liability Cap: Vendor's aggregate cumulative liability for all claims arising out of this Agreement shall strictly not exceed the total fees paid by Customer to Vendor during the one (1) month immediately preceding the incident.
4.3 Customer Indemnification: Customer agrees to defend, indemnify, and hold harmless Vendor and its officers, directors, and employees against any and all claims, regulatory penalties, damages, attorney fees, or liabilities arising from Customer data, integration misconduct, or breach of this Agreement.

5. TERMINATION AND DATA FORFEITURE
5.1 Termination for Convenience: Vendor may terminate this Agreement at any time, with or without cause, upon thirty (30) days written notice. Customer shall have no right to terminate for convenience.
5.2 Data Deletion: Upon expiration or termination of this Agreement for any reason, Vendor may immediately purge and destroy all Customer confidential data, backups, and configurations, and shall bear no obligation to preserve data beyond five (5) business days.

6. GOVERNING LAW AND DISPUTE RESOLUTION
6.1 Venue: This Agreement shall be governed by the laws of the State of Delaware, without regard to conflict of law principles. Any legal proceeding shall be conducted exclusively in Wilmington, Delaware, and Customer irrevocably waives all rights to a jury trial or class action participation.

IN WITNESS WHEREOF, the parties hereto have executed this Agreement as of the Effective Date.

ApexCloud Solutions Inc.
By: Johnathan Miller, VP Enterprise Sales

Enterprise Client LLC
By: ______________________________`
  },
  {
    id: 'residential-lease-agreement',
    title: 'Standard Residential Tenancy Agreement',
    category: 'Real Estate / Rental',
    description: 'A high-risk apartment rental lease with landlord access without notice, security deposit forfeitures, and structural repair shifts.',
    text: `RESIDENTIAL APARTMENT LEASE AGREEMENT

THIS LEASE AGREEMENT is entered into on June 1, 2024, by and between Metro Heights Real Estate Holdings ("Landlord") and the individual tenant signatory below ("Tenant").

1. PREMISES AND OCCUPANCY
1.1 Property: Landlord leases to Tenant Unit 4B located at 742 Evergreen Terrace, Springfield.
1.2 Use: The premises shall be occupied solely for private residential living. No overnight guests are permitted for more than two (2) consecutive nights without prior written consent and an additional fee of $100 per night.

2. RENT AND PENALTIES
2.1 Monthly Rent: Tenant shall pay monthly rent of $2,450.00 due promptly on the first (1st) day of each calendar month.
2.2 Late Fees: If rent is received after 5:00 PM on the 2nd day of the month, a mandatory late fee of $250.00 shall be assessed, plus $25.00 for each additional day rent remains unpaid.
2.3 Rent Escalation: Landlord reserves the right to increase the monthly rent by giving fifteen (15) days written notice during any month of the tenancy to account for property tax or utility cost adjustments.

3. SECURITY DEPOSIT AND MANDATORY DEDUCTIONS
3.1 Deposit Amount: Tenant tenders a deposit of $4,900.00 (two months rent).
3.2 Forfeiture Clause: Any breach of community guidelines, noise complaint, or unauthorized pet shall result in immediate, full forfeiture of the entire security deposit as liquidated damages, without prejudice to Landlord's right to pursue additional damages.
3.3 Carpet and Painting: Tenant shall be solely responsible for professional deep-cleaning of carpets and complete repainting of the entire unit upon move-out regardless of original condition or normal wear and tear.

4. MAINTENANCE, UTILITIES, AND STRUCTURAL REPAIRS
4.1 Tenant Repairs: Tenant agrees to repair and maintain all plumbing fixtures, electrical panels, heating and air conditioning units, and appliances at Tenant's sole expense.
4.2 Landlord Exemption: Landlord shall bear no responsibility or liability for water leaks, roof failures, mold growth, or electrical interruptions regardless of cause.

5. LANDLORD ACCESS AND INSPECTIONS
5.1 Right of Entry: Landlord and Landlord's agents reserve the unrestricted right to enter the leased premises at any hour of the day or night without prior notice for inspections, renovations, or prospective buyer showings. Tenant hereby waives all claims of trespass or disturbance of quiet enjoyment.

6. TERMINATION AND EARLY BREAK PENALTY
6.1 Early Vacancy: If Tenant vacates prior to the 12-month lease expiration, Tenant remains strictly liable for the remaining balance of the entire lease term immediately due in lump sum, plus a $3,000 remarketing re-rental penalty fee.

LANDLORD:
Metro Heights Real Estate Holdings
Property Manager

TENANT:
_________________________________`
  },
  {
    id: 'freelance-contractor-agreement',
    title: 'Independent Consulting & IP Assignment Agreement',
    category: 'Employment / Contracting',
    description: 'An independent contractor contract containing broad non-compete covenants, 90-day payment delays, and universal moral rights assignment.',
    text: `INDEPENDENT CONTRACTOR SERVICES AGREEMENT

This Agreement is made as of August 15, 2024, between InnovateX Global Corp ("Company") and the independent contractor ("Contractor").

1. SERVICES AND DELIVERABLES
1.1 Scope of Work: Contractor will provide software design and engineering services as described in mutually signed Statements of Work.
1.2 Work Schedule: Contractor maintains full discretion over methods, subject to strict adherence to Company delivery deadlines and sprint cadence.

2. COMPENSATION AND DELAYED PAYMENT TERMS
2.1 Rate: Company shall compensate Contractor at the agreed rate of $85.00 per billable hour upon verified milestone completion.
2.2 Net-90 Payment: Invoices shall be payable within ninety (90) calendar days following final formal verification and written sign-off by Company. Company reserves the right to withhold payment indefinitely if client satisfaction metrics are unmet.

3. INTELLECTUAL PROPERTY AND MORAL RIGHTS WAIVER
3.1 Assignment: Contractor unconditionally and irrevocably assigns to Company all worldwide rights, title, copyright, patent rights, trade secrets, and ownership in all works created during the term.
3.2 Moral Rights: Contractor hereby irrevocably waives all moral rights, paternity rights, and integrity rights in the deliverables, permitting Company to alter, edit, or utilize the materials in any format without attribution.
3.3 Pre-existing Works: Any tools, libraries, or scripts utilized by Contractor in performing services shall become licensed to Company on a perpetual, royalty-free, worldwide, transferable basis.

4. NON-COMPETE AND NON-SOLICITATION COVENANTS
4.1 Restrictive Covenant: During the term of this Agreement and for a period of twenty-four (24) months following termination, Contractor shall not directly or indirectly provide consulting, advisory, or software development services to any entity operating in the same market sector anywhere in North America or Europe.
4.2 Non-Solicitation: Contractor shall not solicit, recruit, or hire any employee or contractor of Company for thirty-six (36) months following termination.

5. TERMINATION AND INDEPENDENT CONTRACTOR STATUS
5.1 Termination at Will: Company may terminate this Agreement immediately with zero days notice for any reason. Contractor must provide sixty (60) days advance written notice to terminate.
5.2 Independent Contractor: The parties are independent contractors. Contractor shall receive no health benefits, retirement contributions, or unemployment compensation.

IN WITNESS WHEREOF, the parties have executed this Agreement.

InnovateX Global Corp
Representative Signature: _______________

Contractor Signature: __________________`
  }
];

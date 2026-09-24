import { GoogleGenAI } from '@google/genai';

const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }
  return new GoogleGenAI({ apiKey });
};

const PRIMARY_MODELS = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.6-flash'];

async function generateWithRetry(options: {
  contents: string;
  config?: any;
}) {
  const ai = getAiClient();
  let lastError: any = null;

  for (const model of PRIMARY_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: options.contents,
          config: options.config,
        });
        if (response && response.text) {
          return response;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} attempt ${attempt + 1} failed:`, err?.message || err);
        // If rate limit (429), wait 2.5s and retry once
        if (err?.status === 429 || err?.message?.includes('429')) {
          await new Promise((resolve) => setTimeout(resolve, 2500));
          continue;
        }
        // Non-rate limit error, proceed to next candidate
        break;
      }
    }
  }

  throw lastError || new Error('Failed to generate response with Gemini.');
}

export interface AnalyzeRequest {
  text: string;
  title?: string;
}

export interface ChatRequest {
  contractText: string;
  messages: Array<{ role: 'user' | 'model'; content: string }>;
  question: string;
}

export async function analyzeContract(text: string, title?: string) {
  if (!text || text.trim().length < 20) {
    throw new Error('The contract text is too short or empty for analysis.');
  }

  const prompt = `You are an elite legal contract risk analyst. Thoroughly analyze the legal agreement provided below.
Identify all high-risk, one-sided, ambiguous, or trap clauses, as well as key boilerplate provisions.

CRITICAL INSTRUCTIONS:
1. For every item in "key_findings", the "snippet" field MUST be an EXACT, VERBATIM substring copied directly from the extracted text below.
   - Do NOT paraphrase.
   - Do NOT summarize.
   - Do NOT change punctuation, quotes, or case.
   - If no exact snippet exists for a point, omit that finding rather than inventing one.
2. "severity" MUST be strictly one of: "High", "Medium", "Low".
   - High: Extreme liabilities, unilateral cancellation, uncapped indemnities, automatic multi-year renewal, forfeiture of rights/deposits, broad non-competes.
   - Medium: Significant payment penalties, dispute venue disadvantages, ambiguous deliverables, unreasonable delays.
   - Low: Standard confidentiality, typical notice periods, routine boilerplate, mutual rights.
3. "risk_score" MUST be strictly one of: "High", "Medium", "Low", representing the overall danger/one-sidedness of the contract.
4. "summary" MUST be a clear 2-4 sentence plain-English executive summary describing what the contract is, who it benefits most, and the primary warning signs.

Document Title: ${title || 'Legal Contract'}

CONTRACT TEXT:
${text}

Return ONLY valid JSON matching this schema:
{
  "risk_score": "High" | "Medium" | "Low",
  "summary": "Plain-English executive summary",
  "key_findings": [
    {
      "clause_title": "Concise clause title",
      "snippet": "Exact verbatim text copied directly from the contract text",
      "severity": "High" | "Medium" | "Low",
      "explanation": "Clear explanation of why this clause matters or poses risk to the signing party",
      "recommendation": "Practical counter-offer, amendment, or negotiation tip"
    }
  ]
}`;

  const response = await generateWithRetry({
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      temperature: 0.2,
    },
  });

  const responseText = response.text || '{}';
  let parsed: any;
  try {
    parsed = JSON.parse(responseText);
  } catch (err) {
    console.error('Failed to parse Gemini JSON response:', responseText);
    throw new Error('AI analysis produced invalid JSON output. Please try again.');
  }

  const validSeverities = ['High', 'Medium', 'Low'];
  const validRiskScores = ['High', 'Medium', 'Low'];

  const risk_score = validRiskScores.includes(parsed.risk_score)
    ? parsed.risk_score
    : 'Medium';

  const summary = parsed.summary || 'No summary provided by analyzer.';

  const rawFindings: any[] = Array.isArray(parsed.key_findings)
    ? parsed.key_findings
    : [];

  const verifiedFindings = rawFindings
    .filter((f) => f && typeof f.snippet === 'string' && f.snippet.trim().length > 0)
    .map((f, index) => ({
      id: `finding-${index + 1}`,
      clause_title: f.clause_title || `Clause finding #${index + 1}`,
      snippet: f.snippet.trim(),
      severity: validSeverities.includes(f.severity) ? f.severity : 'Medium',
      explanation: f.explanation || 'No explanation provided.',
      recommendation: f.recommendation || 'Consider reviewing with legal counsel.',
    }));

  return {
    risk_score,
    summary,
    key_findings: verifiedFindings,
  };
}

export async function chatAboutContract(
  contractText: string,
  messages: Array<{ role: 'user' | 'model'; content: string }>,
  question: string
) {
  if (!contractText) {
    throw new Error('Contract text is required for grounded chat.');
  }
  if (!question || !question.trim()) {
    throw new Error('User question cannot be empty.');
  }

  const systemInstruction = `Answer only using the contract text provided below. If the answer isn't in the contract, say so. Do not speculate, invent clauses, or rely on external assumptions. Cite specific section numbers or clause language whenever possible.`;

  let promptHistory = '';
  if (messages && messages.length > 0) {
    promptHistory = messages
      .map(
        (m) =>
          `${m.role === 'user' ? 'User' : 'Legal Assistant'}: ${m.content}`
      )
      .join('\n\n');
  }

  const userPrompt = `=== FULL CONTRACT TEXT ===
${contractText}
=== END OF CONTRACT TEXT ===

${promptHistory ? `=== CONVERSATION HISTORY ===\n${promptHistory}\n=== END OF HISTORY ===\n\n` : ''}User Question: ${question}

Provide a direct, concise, grounded answer based strictly on the contract text above.`;

  const response = await generateWithRetry({
    contents: userPrompt,
    config: {
      systemInstruction,
      temperature: 0.3,
    },
  });

  return {
    reply: response.text || 'I could not find an answer in the provided contract text.',
  };
}

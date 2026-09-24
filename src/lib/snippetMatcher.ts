import { Finding, RiskLevel } from '../types';

export interface TextSegment {
  type: 'text' | 'highlight';
  content: string;
  finding?: Finding;
  findingIndex?: number;
  highlightId?: string;
}

export interface MatchedSnippetRange {
  findingIndex: number;
  finding: Finding;
  start: number;
  end: number;
  severity: RiskLevel;
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Finds location of snippet in text using exact match or whitespace-tolerant match
 */
export function locateSnippet(
  fullText: string,
  snippet: string,
  searchFromIndex: number = 0
): { start: number; end: number } | null {
  if (!snippet || !fullText) return null;
  const trimmed = snippet.trim();
  if (!trimmed) return null;

  // 1. Direct exact substring match
  const exactIndex = fullText.indexOf(trimmed, searchFromIndex);
  if (exactIndex !== -1) {
    return {
      start: exactIndex,
      end: exactIndex + trimmed.length,
    };
  }

  // 2. Whitespace-tolerant match (handles \n vs spaces)
  try {
    const tokens = trimmed.split(/\s+/).filter(Boolean).map(escapeRegExp);
    if (tokens.length > 0) {
      const pattern = tokens.join('\\s+');
      const regex = new RegExp(pattern, 'g');
      regex.lastIndex = searchFromIndex;
      const match = regex.exec(fullText);
      if (match) {
        return {
          start: match.index,
          end: match.index + match[0].length,
        };
      }
    }
  } catch {
    // Regex compile error fallback
  }

  // 3. Normalized punctuation & case-insensitive partial match
  const normalizedFull = fullText.toLowerCase().replace(/\s+/g, ' ');
  const normalizedSnippet = trimmed.toLowerCase().replace(/\s+/g, ' ');
  const normIndex = normalizedFull.indexOf(normalizedSnippet);
  if (normIndex !== -1) {
    // Map normalized index back approximately
    let currentNorm = 0;
    let actualStart = -1;
    let actualEnd = -1;

    for (let i = 0; i < fullText.length; i++) {
      if (currentNorm === normIndex && actualStart === -1) {
        actualStart = i;
      }
      if (currentNorm === normIndex + normalizedSnippet.length) {
        actualEnd = i;
        break;
      }
      const char = fullText[i];
      if (/\s/.test(char)) {
        if (i === 0 || !/\s/.test(fullText[i - 1])) {
          currentNorm++;
        }
      } else {
        currentNorm++;
      }
    }

    if (actualStart !== -1) {
      return {
        start: actualStart,
        end: actualEnd !== -1 ? actualEnd : actualStart + trimmed.length,
      };
    }
  }

  return null;
}

/**
 * Builds non-overlapping highlighted segments from full text and findings
 */
export function buildTextSegments(
  fullText: string,
  findings: Finding[]
): { segments: TextSegment[]; matchedCount: number } {
  if (!fullText) {
    return { segments: [], matchedCount: 0 };
  }

  // Severity rank for overlap conflict resolution
  const severityRank: Record<RiskLevel, number> = {
    High: 3,
    Medium: 2,
    Low: 1,
  };

  const ranges: MatchedSnippetRange[] = [];

  findings.forEach((finding, index) => {
    if (!finding.snippet) return;
    const match = locateSnippet(fullText, finding.snippet);
    if (match) {
      ranges.push({
        findingIndex: index,
        finding: {
          ...finding,
          startIndex: match.start,
          endIndex: match.end,
        },
        start: match.start,
        end: match.end,
        severity: finding.severity,
      });
    }
  });

  // Sort ranges by start position
  ranges.sort((a, b) => a.start - b.start);

  // Filter overlapping ranges (prefer higher severity or earlier start)
  const nonOverlapping: MatchedSnippetRange[] = [];
  for (const range of ranges) {
    if (nonOverlapping.length === 0) {
      nonOverlapping.push(range);
      continue;
    }

    const last = nonOverlapping[nonOverlapping.length - 1];
    if (range.start < last.end) {
      // Overlap detected: keep the one with higher severity
      if (severityRank[range.severity] > severityRank[last.severity]) {
        nonOverlapping[nonOverlapping.length - 1] = range;
      }
      // Otherwise skip lower severity range to avoid invalid markup
    } else {
      nonOverlapping.push(range);
    }
  }

  const segments: TextSegment[] = [];
  let currentIndex = 0;

  for (const range of nonOverlapping) {
    if (range.start > currentIndex) {
      segments.push({
        type: 'text',
        content: fullText.slice(currentIndex, range.start),
      });
    }

    segments.push({
      type: 'highlight',
      content: fullText.slice(range.start, range.end),
      finding: range.finding,
      findingIndex: range.findingIndex,
      highlightId: `snippet-match-${range.findingIndex}`,
    });

    currentIndex = range.end;
  }

  if (currentIndex < fullText.length) {
    segments.push({
      type: 'text',
      content: fullText.slice(currentIndex),
    });
  }

  return {
    segments,
    matchedCount: nonOverlapping.length,
  };
}

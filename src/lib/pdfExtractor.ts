import * as pdfjsLib from 'pdfjs-dist';

// Set worker to CDN matching current pdfjs version
if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  } catch {
    // Worker fallback
  }
}

export async function extractTextFromPDF(file: File | ArrayBuffer): Promise<string> {
  try {
    let arrayBuffer: ArrayBuffer;
    if (file instanceof File) {
      arrayBuffer = await file.arrayBuffer();
    } else {
      arrayBuffer = file;
    }

    const typedArray = new Uint8Array(arrayBuffer);
    const loadingTask = pdfjsLib.getDocument({
      data: typedArray,
      useSystemFonts: true,
    });

    const pdfDoc = await loadingTask.promise;
    const pageTexts: string[] = [];

    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Group items by line based on transform Y position or join with spaces
      let lastY: number | null = null;
      let pageString = '';

      for (const item of textContent.items as any[]) {
        if (!item.str) continue;
        
        // If vertical position changed significantly, treat as new line
        const currentY = item.transform ? item.transform[5] : null;
        if (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 5) {
          pageString += '\n' + item.str;
        } else {
          pageString += (pageString && !pageString.endsWith('\n') && !pageString.endsWith(' ') ? ' ' : '') + item.str;
        }
        lastY = currentY;
      }

      if (pageString.trim()) {
        pageTexts.push(pageString.trim());
      }
    }

    const fullText = pageTexts.join('\n\n');
    if (!fullText.trim()) {
      throw new Error('No readable text found in PDF. The document might be scanned as an image.');
    }

    return fullText;
  } catch (err: any) {
    console.error('PDF extraction error in browser:', err);
    // If it's a worker issue, attempt without worker if possible or throw user-friendly error
    throw new Error(
      err?.message || 'Failed to extract text from PDF. Please make sure it is a valid text-based PDF.'
    );
  }
}

import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

export async function parseDocument(file: File): Promise<string> {
  const fileType = file.type;
  
  try {
    switch (fileType) {
      case 'application/pdf':
        return await parsePDF(file);
      case 'text/plain':
        return await parseText(file);
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return await parseDocx(file);
      default:
        throw new Error('Unsupported file type. Please upload a PDF, DOCX, or text file.');
    }
  } catch (error) {
    console.error('Error parsing document:', error);
    throw new Error('Failed to parse document. Please make sure the file is not corrupted and try again.');
  }
}

async function parsePDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      useWorkerFetch: true,
      isEvalSupported: true,
      useSystemFonts: true
    });

    const pdf = await loadingTask.promise;
    
    // Check if the PDF is empty
    if (pdf.numPages === 0) {
      throw new Error('The PDF file appears to be empty.');
    }

    let fullText = '';
    const totalPages = pdf.numPages;

    // Extract text from all pages
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
          
        fullText += pageText + '\n';
      } catch (pageError) {
        console.error(`Error extracting text from page ${pageNum}:`, pageError);
        // Continue with next page if one fails
        continue;
      }
    }

    const trimmedText = fullText.trim();
    if (!trimmedText) {
      throw new Error('No readable text found in the PDF. The file might be scanned or contain only images.');
    }

    return trimmedText;
  } catch (error) {
    console.error('PDF parsing error:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Invalid PDF structure')) {
        throw new Error('The PDF file appears to be corrupted or invalid.');
      } else if (error.message.includes('Password')) {
        throw new Error('The PDF file is password protected. Please provide an unprotected file.');
      } else if (error.message.includes('Missing PDF')) {
        throw new Error('The file does not appear to be a valid PDF.');
      }
    }
    
    throw new Error('Failed to parse PDF. Please ensure the file is a valid, unprotected PDF document.');
  }
}

async function parseText(file: File): Promise<string> {
  try {
    const text = await file.text();
    const trimmedText = text.trim();
    
    if (!trimmedText) {
      throw new Error('The text file is empty.');
    }
    
    return trimmedText;
  } catch (error) {
    console.error('Error parsing text file:', error);
    throw new Error('Failed to read text file. Please ensure the file is a valid text document.');
  }
}

async function parseDocx(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    const trimmedText = result.value.trim();
    if (!trimmedText) {
      throw new Error('No text content found in the DOCX file.');
    }
    
    return trimmedText;
  } catch (error) {
    console.error('Error parsing DOCX:', error);
    throw new Error('Failed to parse DOCX file. Please ensure the file is a valid Word document.');
  }
}
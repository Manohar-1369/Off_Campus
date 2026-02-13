import fs from "fs/promises";
import { createRequire } from "module";

// Alternative solution using pdf-parse via createRequire
const require = createRequire(import.meta.url);

/**
 * Extract text from PDF using pdf-parse (CommonJS fallback)
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<string>} - Extracted text content
 */
export const extractPDFText = async (filePath) => {
  try {
    // Dynamically import pdf-parse
    let pdfParse;
    
    try {
      pdfParse = require("pdf-parse");
    } catch (err) {
      // Try alternative require method
      const pdfParseModule = await import("pdf-parse");
      pdfParse = pdfParseModule.default || pdfParseModule;
    }

    // Read the PDF file
    const dataBuffer = await fs.readFile(filePath);

    // Parse the PDF
    const data = await pdfParse(dataBuffer);

    if (!data || !data.text) {
      throw new Error("No text extracted from PDF");
    }

    return data.text.trim();

  } catch (error) {
    console.error("PDF extraction error:", error);
    throw new Error(`Failed to extract PDF text: ${error.message}`);
  }
};

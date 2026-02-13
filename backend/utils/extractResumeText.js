import fs from "fs";
import { createRequire } from "module";

// pdf-parse 1.1.1 is CommonJS, so we need createRequire
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

/**
 * Extract text from a PDF file using pdf-parse
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<string>} - Extracted text content
 */
export const extractPDFText = async (filePath) => {
  try {
    // Read the PDF file synchronously
    const dataBuffer = fs.readFileSync(filePath);

    // Parse the PDF - pdf-parse returns a Promise
    const data = await pdfParse(dataBuffer);

    if (!data || !data.text || data.text.trim().length === 0) {
      throw new Error("No text could be extracted from PDF");
    }

    console.log("✅ Successfully extracted text from PDF");
    console.log(`📊 Pages: ${data.numpages}, Characters: ${data.text.length}`);
    
    return data.text.trim();

  } catch (error) {
    console.error("❌ PDF extraction error:", error);
    throw new Error(`Failed to extract PDF text: ${error.message}`);
  }
};

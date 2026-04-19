import { readFileSync } from 'fs';
import PDFParser from 'pdf2json';

/**
 * Extract text from a PDF file.
 * @param {string} path - Path to the PDF file.
 * @returns {Promise<string>} - Extracted text from the PDF.
 */
const extractTextFromPDF = async (path: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser();
        pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
        pdfParser.on("pdfParser_dataReady", pdfData => resolve(pdfData?.text));
        pdfParser.loadPDF(path);
    });
};

/**
 * Parse PDF text into structured JSON.
 * @param {string} pdfText - The extracted text from the PDF.
 * @returns {Object[]} - Array of structured questions.
 */
const parseQuestions = (pdfText: string): Object[] => {
    const questions = pdfText.split(/\n\n+/).map(q => ({ question: q.trim() }));
    return questions.filter(q => q.question.length > 0);
};

/**
 * Extract and parse PDF exam papers into structured JSON questions with retry logic.
 * @param {string} path - Path to the PDF to process.
 * @param {number} retries - Number of retries for transient failures.
 * @returns {Promise<Object[]>} - Structured JSON questions.
 */
const extractAndParsePDF = async (path: string, retries: number = 3): Promise<Object[]> => {
    let attempt = 0;
    while (attempt < retries) {
        try {
            const pdfText = await extractTextFromPDF(path);
            return parseQuestions(pdfText);
        } catch (error) {
            console.error(`Attempt ${attempt + 1} failed: ${error}`);
            attempt++;
            if (attempt >= retries) {
                throw new Error(`Failed to extract and parse PDF after ${retries} attempts.`);
            }
        }
    }
    return [];
};

export { extractTextFromPDF, parseQuestions, extractAndParsePDF };
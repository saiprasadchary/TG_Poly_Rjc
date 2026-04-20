import { readFileSync } from "node:fs";
import { PDFParse } from "pdf-parse";

/**
 * Extract text from a PDF file using the same parser as the local import scripts.
 */
const extractTextFromPDF = async (path: string): Promise<string> => {
  const parser = new PDFParse({ data: readFileSync(path) });
  const result = await parser.getText();
  await parser.destroy();
  return result.text ?? "";
};

/**
 * Parse PDF text into simple blocks. Production question parsing lives in the exam-specific importers.
 */
const parseQuestions = (pdfText: string): Array<{ question: string }> => {
  const questions = pdfText.split(/\n\n+/).map((question) => ({ question: question.trim() }));
  return questions.filter((question) => question.question.length > 0);
};

/**
 * Extract and parse PDF exam papers into structured JSON blocks with retry logic.
 */
const extractAndParsePDF = async (path: string, retries = 3): Promise<Array<{ question: string }>> => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      const pdfText = await extractTextFromPDF(path);
      return parseQuestions(pdfText);
    } catch (error) {
      attempt += 1;
      if (attempt >= retries) {
        throw new Error(`Failed to extract and parse PDF after ${retries} attempts: ${String(error)}`);
      }
    }
  }
  return [];
};

export { extractTextFromPDF, parseQuestions, extractAndParsePDF };

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export enum SummaryStyle {
  ABSTRACT = "abstract",
  KEY_FINDINGS = "key_findings",
  METHODOLOGY = "methodology",
  CRITICAL_REVIEW = "critical_review",
  EXPLAIN_LIKE_IM_FIVE = "eli5"
}

export interface SummaryRequest {
  text: string;
  style: SummaryStyle;
}

const SYSTEM_PROMPTS: Record<SummaryStyle, string> = {
  [SummaryStyle.ABSTRACT]: "You are a professional academic assistant. Provide a concise, highly technical abstract-style summary of the provided text. Focus on the core objective and outcome.",
  [SummaryStyle.KEY_FINDINGS]: "You are a research analyst. Extract and catalog the most significant findings and data points from the paper. Use bullet points and focus on empirical evidence.",
  [SummaryStyle.METHODOLOGY]: "You are a scientific peer reviewer. Focus exclusively on the research design, data collection methods, and analytical techniques used in the study. Be precise and critical.",
  [SummaryStyle.CRITICAL_REVIEW]: "You are a critical academic reviewer. Provide a balanced critique of the paper, identifying its strengths, limitations, and potential implications for the field.",
  [SummaryStyle.EXPLAIN_LIKE_IM_FIVE]: "You are a science communicator. Explain the complex research findings in simple terms that a non-specialist (or a five-year-old) can understand, without losing the core truth."
};

export async function summarizeText({ text, style }: SummaryRequest) {
  if (!text || text.trim().length < 50) {
    throw new Error("Text is too short to summarize effectively.");
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { text: `TEXT TO ANALYZE:\n\n${text}` }
      ],
      config: {
        systemInstruction: SYSTEM_PROMPTS[style],
        temperature: 0.2, // Lower temperature for more consistent academic output
      }
    });

    return response.text;
  } catch (error) {
    console.error("Summarization error:", error);
    throw new Error("Failed to generate summary. Please try again later.");
  }
}

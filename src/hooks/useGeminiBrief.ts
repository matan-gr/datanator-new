import { useState } from 'react';
import { fetchJson } from '../lib/api';
import { GoogleGenAI } from "@google/genai";

export function useGeminiBrief() {
  const [geminiBrief, setGeminiBrief] = useState<string | null>(null);
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [geminiError, setGeminiError] = useState<string | null>(null);

  const fetchGeminiBrief = async () => {
    setGeminiLoading(true);
    setGeminiError(null);
    try {
      // Step 1: Fetch the content from the backend
      const data = await fetchJson('/api/v1/gemini/content');
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch content for brief');
      }

      if (!data.content) {
        setGeminiBrief("No data available yet. Please run a sync first.");
        return;
      }

      // Step 2: Generate the brief using Gemini on the frontend
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API key is not configured in the environment.');
      }

      const ai = new GoogleGenAI({ apiKey });
      
      // Implement retry for Gemini generation to handle 429 errors
      let response;
      const genRetries = 3;
      for (let i = 0; i < genRetries; i++) {
        try {
          response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [
              {
                role: "user",
                parts: [{
                  text: `You are an expert data analyst and technical writer. Below is a collection of recent internal data feeds from various sources (AI research, cloud innovation, security bulletins, releases, etc.). 
                  
                  Your task is to generate a "Weekly Intelligence Brief" that provides a high-impact, actionable summary of the most critical developments from the last week.
                  
                  Requirements:
                  1. Format the output using high-quality, sophisticated Markdown.
                  2. Use a professional, authoritative, and concise tone.
                  3. Include the following mandatory sections: 
                     - **Executive Intelligence Summary**: A high-level overview of the most significant trends.
                     - **Critical Security Bulletins**: A detailed table summarizing vulnerabilities, severity levels, and required actions.
                     - **Release Notes & Product Updates**: A categorized list of major feature launches and technical improvements.
                     - **Product Deprecations & Lifecycle Alerts**: Clearly highlight upcoming deprecations or end-of-life notices.
                     - **Strategic Recommendations**: Actionable steps for the engineering and security teams.
                  4. Use tables for security data, bolding for emphasis, and nested lists for technical details.
                  5. Ensure the formatting is visually impressive and easy to scan.
                  6. Focus strictly on the most recent and critical information provided in the feeds.
                  
                  Here is the raw data feed content:
                  
                  ${data.content}`
                }]
              }
            ]
          });
          break; // Success, break out of retry loop
        } catch (err: any) {
          if (err.status === 429 && i < genRetries - 1) {
            // Wait with exponential backoff before retrying
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
          } else {
            throw err; // Re-throw if not 429 or out of retries
          }
        }
      }

      if (response && response.text) {
        setGeminiBrief(response.text);
      } else {
        throw new Error('Failed to generate brief from Gemini');
      }
    } catch (error) {
      console.error("Gemini brief generation failed:", error);
      setGeminiError(error instanceof Error ? error.message : String(error));
    } finally {
      setGeminiLoading(false);
    }
  };

  return { geminiBrief, geminiLoading, geminiError, fetchGeminiBrief };
}

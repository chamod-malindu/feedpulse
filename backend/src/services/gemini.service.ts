import { GoogleGenAI } from '@google/genai';
import Feedback from '../models/feedback.model';

// Single instance reused across all calls — avoids reconnecting on every request
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

interface GeminiAnalysis {
  category: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  priority_score: number;
  summary: string;
  tags: string[];
}

// Free-tier Gemini has per-minute request limits
// instead of failing on 429, we wait and retry with increasing delays (30s → 60s → 120s)
const callGeminiWithRetry = async (
  prompt: string,
  maxRetries: number = 3
): Promise<string> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return result.text ?? '';

    } catch (error: any) {
      const status = error?.status || error?.code;

      if (status === 429 && attempt < maxRetries) {
        const waitSeconds = Math.pow(2, attempt) * 15; // 30s, 60s, 120s
        await new Promise(resolve => setTimeout(resolve, waitSeconds * 1000));
      } else {
        throw error;
      }
    }
  }

  throw new Error('Max retries exceeded');
};


// Runs in the background after feedback is saved
// user gets instant response without waiting for Gemini to finish
export const analyseWithGemini = async (
  feedbackId: string,
  title: string,
  description: string
): Promise<void> => {
  try {
    const prompt = `
      Analyse this product feedback.

      Return ONLY valid JSON with these fields:
      - category: one of "Bug", "Feature Request", "Improvement", "Other"
      - sentiment: one of "Positive", "Neutral", "Negative"
      - priority_score: a number from 1 to 10
      - summary: a one-sentence summary
      - tags: an array of 1 to 5 relevant tags

      Feedback Title: ${title}
      Feedback Description: ${description}

      Return ONLY the JSON object. No markdown, no code block, no explanation.
      `;

    const responseText = await callGeminiWithRetry(prompt);

    // Gemini sometimes wraps its response in ```json ... ``` despite being told not to
    const cleanedText = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
      
    let analysis: GeminiAnalysis;
    try {
      analysis = JSON.parse(cleanedText) as GeminiAnalysis;
    } catch (parseError) {
      console.error(`Failed to parse Gemini JSON for feedback ${feedbackId}:`, parseError);

      await Feedback.findByIdAndUpdate(feedbackId, {
        ai_processed: false,
        ai_summary: 'AI analysis failed — parse error. Can be retried later.',
      });

      return;
    }

    // Validate before saving — Gemini can return values outside the expected enums
    const validCategories = ['Bug', 'Feature Request', 'Improvement', 'Other'];
    const validSentiments = ['Positive', 'Neutral', 'Negative'];

    await Feedback.findByIdAndUpdate(feedbackId, {
      ai_category: validCategories.includes(analysis.category) ? analysis.category : 'Other',
      ai_sentiment: validSentiments.includes(analysis.sentiment) ? analysis.sentiment : 'Neutral',
      ai_priority: Math.min(10, Math.max(1, Math.round(analysis.priority_score))),
      ai_summary: analysis.summary || 'No summary available',
      ai_tags: Array.isArray(analysis.tags) ? analysis.tags.slice(0, 5) : [],
      ai_processed: true,
    });

    console.log(`AI analysis completed for feedback: ${feedbackId}`);

  } catch (error) {
    console.error(`Gemini analysis failed for feedback ${feedbackId}:`, error);

    await Feedback.findByIdAndUpdate(feedbackId, {
      ai_processed: false,
      ai_summary: 'AI analysis failed — can be retried later',
    });
  }
};

// Returns plain text not JSON — output is displayed directly to the admin
export const generateTrendSummary = async (
  feedbackItems: Array<{
    title: string;
    ai_summary?: string;
    ai_category?: string;
    ai_sentiment?: string;
    ai_priority?: number;
    ai_tags?: string[];
  }>
): Promise<string> => {
  try {
    const feedbackList = feedbackItems
      .map(
        (item, index) =>
          `${index + 1}. [${item.ai_category || 'Unknown'}] ${item.title} — ${item.ai_summary || 'No summary'
          } (Priority: ${item.ai_priority || 'N/A'}, Sentiment: ${item.ai_sentiment || 'N/A'
          })`
      )
      .join('\n');

    const prompt = `You are a product analyst. Analyse these 
      ${feedbackItems.length} feedback items from the last 7 days.

      Identify the top 3 themes. For each theme write:
      1. Theme title (one line)
      2. What users report (one paragraph)  
      3. Business impact (one paragraph)
      4. Recommended action (one paragraph)

      Use clean markdown formatting:
      - Use ## for theme titles
      - Use **bold** for section labels
      - No bullet points with *
      - Keep language clear and direct

      Feedback:
      ${feedbackList}
      `;

    const text = await callGeminiWithRetry(prompt);
    return text || 'Unable to generate trend summary at this time.';

  } catch (error) {
    console.error('Trend summary generation failed:', error);
    return 'Unable to generate trend summary at this time.';
  }
};
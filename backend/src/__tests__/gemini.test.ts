// Mock the Gemini API so no need to make real API calls during testing
const mockGenerateContent = jest.fn();

jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: { generateContent: mockGenerateContent },
  })),
}));

// Mock the Feedback model to check what gets saved to the database
const mockFindByIdAndUpdate = jest.fn().mockResolvedValue({});
jest.mock('../models/feedback.model', () => ({
  __esModule: true,
  default: {
    findByIdAndUpdate: (...args: any[]) => mockFindByIdAndUpdate(...args),
  },
}));

import { analyseWithGemini } from '../services/gemini.service';

// sample data used across tests
const feedbackId = '507f1f77bcf86cd799439011';
const title = 'Add dark mode to the settings panel';
const description = 'It would be helpful to have a dark mode option for better usability at night.';

afterEach(() => {
  jest.clearAllMocks();
});

// ─── TEST SUITE 4: Gemini Response Parsing ─────────────────────

describe('Gemini Response Parsing', () => {

  it('should parse a valid JSON response and save to database', async () => {
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({
        category: 'Feature Request',
        sentiment: 'Positive',
        priority_score: 8,
        summary: 'User wants dark mode in settings.',
        tags: ['UI', 'Settings', 'Accessibility'],
      }),
    });

    await analyseWithGemini(feedbackId, title, description);

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(feedbackId, {
      ai_category: 'Feature Request',
      ai_sentiment: 'Positive',
      ai_priority: 8,
      ai_summary: 'User wants dark mode in settings.',
      ai_tags: ['UI', 'Settings', 'Accessibility'],
      ai_processed: true,
    });
  });

  it('should clean JSON wrapped in markdown code blocks', async () => {
    // Sometimes Gemini wraps JSON in markdown like this:
    // ```json
    // { ... }
    // ```
    // Code must removes these wrappers before parsing
    const wrapped = '```json\n{"category":"Bug","sentiment":"Negative","priority_score":9,"summary":"App crashes on load.","tags":["crash","startup"]}\n```';

    mockGenerateContent.mockResolvedValue({ text: wrapped });
    await analyseWithGemini(feedbackId, title, description);

    expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(feedbackId, {
      ai_category: 'Bug',
      ai_sentiment: 'Negative',
      ai_priority: 9,
      ai_summary: 'App crashes on load.',
      ai_tags: ['crash', 'startup'],
      ai_processed: true,
    });
  });

  it('should clamp priority score that is out of range', async () => {
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({
        category: 'Bug',
        sentiment: 'Negative',
        priority_score: 15, // out of 1-10 range
        summary: 'Critical crash.',
        tags: ['crash'],
      }),
    });

    await analyseWithGemini(feedbackId, title, description);

    // 15 should be clamped down to 10
    const savedData = mockFindByIdAndUpdate.mock.calls[0][1];
    expect(savedData.ai_priority).toBe(10);
  });
});

// ─── TEST SUITE 5: Gemini Validation Logic ─────────────────────

describe('Gemini Service Validation Logic', () => {

  it('should default to Other for invalid category', async () => {
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({
        category: 'SomeRandomCategory',
        sentiment: 'Positive',
        priority_score: 5,
        summary: 'Some feedback.',
        tags: ['misc'],
      }),
    });

    await analyseWithGemini(feedbackId, title, description);

    const savedData = mockFindByIdAndUpdate.mock.calls[0][1];
    expect(savedData.ai_category).toBe('Other');
  });

  it('should default to Neutral for invalid sentiment', async () => {
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({
        category: 'Bug',
        sentiment: 'VeryAngry',
        priority_score: 7,
        summary: 'User is upset.',
        tags: ['support'],
      }),
    });

    await analyseWithGemini(feedbackId, title, description);

    const savedData = mockFindByIdAndUpdate.mock.calls[0][1];
    expect(savedData.ai_sentiment).toBe('Neutral');
  });

  it('should limit tags to 5 items max', async () => {
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({
        category: 'Improvement',
        sentiment: 'Positive',
        priority_score: 6,
        summary: 'Multiple suggestions.',
        tags: ['UI', 'Login', 'Bug', 'Crash', 'Mobile', 'Android', 'iOS'],
      }),
    });

    await analyseWithGemini(feedbackId, title, description);

    const savedData = mockFindByIdAndUpdate.mock.calls[0][1];
    expect(savedData.ai_tags.length).toBe(5);
  });

  it('should handle invalid JSON from Gemini', async () => {
    mockGenerateContent.mockResolvedValue({
      text: 'not valid json!!',
    });

    await analyseWithGemini(feedbackId, title, description);

    expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(feedbackId, {
      ai_processed: false,
      ai_summary: 'AI analysis failed — parse error. Can be retried later.',
    });
  });

  it('should handle API errors without crashing', async () => {
    mockGenerateContent.mockRejectedValue(new Error('API quota exceeded'));

    await analyseWithGemini(feedbackId, title, description);

    expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(feedbackId, {
      ai_processed: false,
      ai_summary: 'AI analysis failed — can be retried later',
    });
  });
});
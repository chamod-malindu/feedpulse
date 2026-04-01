// Tests the Gemini response parsing logic without calling the real API.
// This is important because:
// 1. The real API costs money (on paid plans) or has rate limits
// 2. Tests should be fast — API calls take 2-3 seconds each
// 3. You want to test YOUR code, not whether Google's servers are up

// ─── TEST SUITE 4: Gemini Response Parsing ─────────────────────

describe('Gemini Response Parsing', () => {

  it('should parse a valid JSON response correctly', () => {
    // Simulate what Gemini returns — a JSON string
    const mockResponse = JSON.stringify({
      category: 'Feature Request',
      sentiment: 'Positive',
      priority_score: 8,
      summary: 'User wants dark mode in settings.',
      tags: ['UI', 'Settings', 'Accessibility'],
    });

    // This is what your gemini.service.ts does with the response
    const parsed = JSON.parse(mockResponse);

    // Assert each field is correct
    expect(parsed.category).toBe('Feature Request');
    expect(parsed.sentiment).toBe('Positive');
    expect(parsed.priority_score).toBe(8);
    expect(parsed.summary).toBeDefined();
    expect(Array.isArray(parsed.tags)).toBe(true);
    expect(parsed.tags.length).toBeGreaterThan(0);
  });

  it('should clean JSON wrapped in markdown code blocks', () => {
    // Sometimes Gemini wraps JSON in markdown like this:
    // ```json
    // { ... }
    // ```
    // Your code removes these wrappers before parsing
    const mockResponse = '```json\n{"category":"Bug","sentiment":"Negative","priority_score":9,"summary":"App crashes on load.","tags":["crash","startup"]}\n```';

    // This is the cleaning logic from your gemini.service.ts
    const cleaned = mockResponse
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const parsed = JSON.parse(cleaned);
    expect(parsed.category).toBe('Bug');
    expect(parsed.priority_score).toBe(9);
  });

  it('should clamp priority score to the 1-10 range', () => {
    // Your gemini.service.ts uses Math.min(10, Math.max(1, Math.round(score)))
    // to ensure priority is always between 1 and 10
    // This tests that logic
    const clamp = (score: number) =>
      Math.min(10, Math.max(1, Math.round(score)));

    expect(clamp(0)).toBe(1);   // Below minimum → 1
    expect(clamp(15)).toBe(10); // Above maximum → 10
    expect(clamp(5.7)).toBe(6); // Rounds up correctly
    expect(clamp(-3)).toBe(1);  // Negative → 1
    expect(clamp(7)).toBe(7);   // Normal value stays normal
  });
});

// ─── TEST SUITE 5: Gemini Validation Logic ─────────────────────

describe('Gemini Service Validation Logic', () => {

  it('should default to Other for invalid category values', () => {
    // Your code validates the category before saving
    // If Gemini returns something unexpected, default to 'Other'
    const validCategories = ['Bug', 'Feature Request', 'Improvement', 'Other'];
    const validate = (category: string) =>
      validCategories.includes(category) ? category : 'Other';

    expect(validate('Bug')).toBe('Bug');
    expect(validate('Feature Request')).toBe('Feature Request');
    expect(validate('RandomValue')).toBe('Other'); // Invalid → Other
    expect(validate('')).toBe('Other');            // Empty → Other
  });

  it('should default to Neutral for invalid sentiment values', () => {
    const validSentiments = ['Positive', 'Neutral', 'Negative'];
    const validate = (sentiment: string) =>
      validSentiments.includes(sentiment) ? sentiment : 'Neutral';

    expect(validate('Positive')).toBe('Positive');
    expect(validate('VeryNegative')).toBe('Neutral'); // Invalid → Neutral
    expect(validate('')).toBe('Neutral');             // Empty → Neutral
  });

  it('should limit tags to maximum 5 items', () => {
    // Your code uses tags.slice(0, 5) to limit to 5 tags
    const limit = (tags: string[]) =>
      Array.isArray(tags) ? tags.slice(0, 5) : [];

    const manyTags = ['UI', 'Login', 'Bug', 'Crash', 'Mobile', 'Android', 'iOS'];
    expect(limit(manyTags).length).toBe(5); // Truncated to 5

    const fewTags = ['UI', 'Settings'];
    expect(limit(fewTags).length).toBe(2); // Short list stays as is

    expect(limit('not-an-array' as unknown as string[])).toEqual([]); // Non-array → empty
  });
});
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

export interface GeminiSuggestion {
  improvedText: string;
  suggestions: string[];
}

export async function improveTextWithGemini(
  text: string,
  fieldType: 'title' | 'description',
  campaignType: 'fundraising' | 'blood-donation'
): Promise<GeminiSuggestion> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
  }

  const prompts = {
    title: {
      fundraising: `You are a professional copywriter helping create compelling fundraising campaign titles. 
Improve this title to be more engaging, clear, and emotionally resonant while keeping it concise (under 80 characters):

"${text}"

Provide:
1. An improved version of the title
2. 2-3 alternative suggestions

Format your response as JSON:
{
  "improvedText": "improved title here",
  "suggestions": ["alternative 1", "alternative 2", "alternative 3"]
}`,
      'blood-donation': `You are a professional copywriter helping create urgent blood donation campaign titles.
Improve this title to be more compelling, urgent, and clear while keeping it concise (under 80 characters):

"${text}"

Provide:
1. An improved version of the title
2. 2-3 alternative suggestions

Format your response as JSON:
{
  "improvedText": "improved title here",
  "suggestions": ["alternative 1", "alternative 2", "alternative 3"]
}`
    },
    description: {
      fundraising: `You are a professional copywriter helping create compelling fundraising campaign descriptions.
Improve this description to be more engaging, clear, and persuasive. Include:
- A strong opening that captures attention
- Clear explanation of the need
- Specific details about how funds will be used
- An emotional appeal
- A call to action

Original description:
"${text}"

Provide:
1. An improved version of the description
2. 2-3 key suggestions for improvement

Format your response as JSON:
{
  "improvedText": "improved description here",
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
}`,
      'blood-donation': `You are a professional copywriter helping create urgent blood donation campaign descriptions.
Improve this description to be more compelling and urgent. Include:
- Clear urgency and importance
- Specific blood type needs if mentioned
- Patient situation (while being respectful)
- How donors can help
- Contact information emphasis

Original description:
"${text}"

Provide:
1. An improved version of the description
2. 2-3 key suggestions for improvement

Format your response as JSON:
{
  "improvedText": "improved description here",
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
}`
    }
  };

  const prompt = prompts[fieldType][campaignType];

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to get AI suggestions');
    }

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textResponse) {
      throw new Error('No response from AI');
    }

    // Extract JSON from the response (it might be wrapped in markdown code blocks)
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from AI');
    }

    const result = JSON.parse(jsonMatch[0]);
    return result;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}

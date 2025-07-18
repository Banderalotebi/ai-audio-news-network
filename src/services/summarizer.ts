export async function summarizeText(text: string): Promise<string> {
  try {
    // Check Google AI API key first
    const googleApiKey = process.env.GOOGLE_AI_API_KEY;
    if (googleApiKey && !googleApiKey.includes('demo_') && !googleApiKey.includes('your_')) {
      return await summarizeWithGoogleAI(text, googleApiKey);
    }

    // Fallback to OpenAI if Google AI is not available
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (openaiApiKey && !openaiApiKey.includes('demo_') && !openaiApiKey.includes('your_')) {
      return await summarizeWithOpenAI(text, openaiApiKey);
    }

    // Demo mode if no valid API keys
    console.warn('No AI API keys properly configured, using demo response');
    return `Demo Mode: This is a simulated AI summary of breaking news. Original text: "${text.substring(0, 100)}..." To get real AI summaries, please configure your GOOGLE_AI_API_KEY or OPENAI_API_KEY in the .env file.`;
  } catch (error) {
    console.error('Error summarizing text:', error);
    return `Demo summary: ${text.substring(0, 200)}... (This is a demo response. Configure your AI API keys for AI-generated summaries.)`;
  }
}

async function summarizeWithGoogleAI(text: string, apiKey: string): Promise<string> {
  try {
    // Dynamic import of Google AI
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Summarize the following news in 30 seconds for an audio news format. Make it engaging and professional like a real news anchor would deliver it:\n\n${text}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    return summary || 'Breaking news summary unavailable.';
  } catch (error) {
    console.error('Error with Google AI:', error);
    throw error;
  }
}

async function summarizeWithOpenAI(text: string, apiKey: string): Promise<string> {
  try {
    // Dynamic import of OpenAI to avoid initialization errors
    const { OpenAI } = await import('openai');
    
    // Initialize OpenAI client only when needed and API key is available
    const openai = new OpenAI({ 
      apiKey: apiKey 
    });

    const prompt = `Summarize the following news in 30 seconds for an audio news format. Make it engaging and professional like a real news anchor would deliver it:\n\n${text}`;
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
      temperature: 0.7
    });

    return completion.choices[0].message.content || 'Breaking news summary unavailable.';
  } catch (error) {
    console.error('Error with OpenAI:', error);
    throw error;
  }
}

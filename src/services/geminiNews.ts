import { getCategoryPrompt, getCategoryById } from './newsCategories.js';

export async function generateNewsWithGemini(categoryId: string = 'breaking'): Promise<{ headline: string; content: string; category: string }> {
  try {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    
    if (!apiKey || apiKey.includes('demo_') || apiKey.includes('your_')) {
      console.warn('Google AI API key not configured, using demo news');
      const category = getCategoryById(categoryId);
      return {
        headline: `Demo News: ${category?.name || 'Breaking'} - ${new Date().toLocaleDateString()}`,
        content: 'This is demo content. Configure your Google AI API key to get real AI-generated news.',
        category: categoryId
      };
    }

    // Dynamic import of Google AI
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Get category-specific prompt
    const basePrompt = getCategoryPrompt(categoryId);
    const category = getCategoryById(categoryId);

    // Generate current breaking news headlines
    const newsPrompt = `${basePrompt}

    Requirements:
    - Focus on ${category?.name || 'Breaking News'} content
    - Make it realistic and current for today (${new Date().toLocaleDateString()})
    - Create a compelling headline and 2-3 sentence news story
    - Make it sound like real breaking news appropriate for professional broadcast
    
    Format your response as:
    HEADLINE: [headline here]
    CONTENT: [2-3 sentence news story here]`;
    
    const result = await model.generateContent(newsPrompt);
    const response = await result.response;
    const text = response.text();

    // Parse the response
    const headlineMatch = text.match(/HEADLINE:\s*(.+)/);
    const contentMatch = text.match(/CONTENT:\s*(.+)/s);

    if (headlineMatch && contentMatch) {
      return {
        headline: headlineMatch[1].trim(),
        content: contentMatch[1].trim(),
        category: categoryId
      };
    } else {
      // Fallback if parsing fails
      return {
        headline: `Breaking: ${category?.name || 'News'} Update`,
        content: text.trim(),
        category: categoryId
      };
    }

  } catch (error) {
    console.error('Error generating news with Gemini:', error);
    const category = getCategoryById(categoryId);
    return {
      headline: `Demo News: ${category?.name || 'Technology'} sector sees continued growth - ${new Date().toLocaleDateString()}`,
      content: `Demo content: Major developments continue in ${category?.name || 'technology'}. This represents significant progress in the field. Error details: ${error instanceof Error ? error.message : 'Unknown error'}`,
      category: categoryId
    };
  }
}

export async function summarizeNewsWithGemini(headline: string, content: string): Promise<string> {
  try {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    
    if (!apiKey || apiKey.includes('demo_') || apiKey.includes('your_')) {
      return `Demo summary: ${headline}. ${content} (This is a demo response. Configure your Google AI API key for AI-generated summaries.)`;
    }

    // Dynamic import of Google AI
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a professional news anchor. Take this breaking news and create a 30-45 second news segment that sounds natural and engaging for radio/audio broadcast.

    Headline: ${headline}
    Content: ${content}

    Guidelines:
    - Start with "Good evening" or "Breaking news"
    - Speak in a professional, authoritative tone
    - Make it conversational but informative
    - End with something like "We'll continue to follow this story" or "Stay tuned for updates"
    - Keep it between 30-45 seconds when read aloud
    
    Write only the news anchor script, no stage directions:`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    return summary.trim();
  } catch (error) {
    console.error('Error summarizing with Gemini:', error);
    return `Demo summary: ${headline}. ${content} (Error generating AI summary: ${error instanceof Error ? error.message : 'Unknown error'})`;
  }
}

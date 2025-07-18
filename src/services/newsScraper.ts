import { getNewsHeadlines } from './newsSources.js';
import { summarizeText } from './summarizer.js';
import { generateNewsWithGemini, summarizeNewsWithGemini } from './geminiNews.js';
import { synthesizeSpeech } from './tts.js';
import { getRealNewsFetcher } from './realNewsFetcher.js';

export interface NewsResult {
  headline?: string;
  script?: string;
  audioUrl?: string;
  timestamp: string;
  category?: string;
}

export async function generateAudioNews(
  returnAudio = false, 
  categoryId: string = 'breaking', 
  voiceType: 'male' | 'female' | 'neutral' = 'neutral'
): Promise<NewsResult> {
  try {
    console.log(`📰 Generating ${categoryId} news with real sources...`);
    
    // Try to get real news first
    const realNewsFetcher = getRealNewsFetcher();
    let headline: string;
    let content: string;
    let category: string = categoryId;
    
    try {
      const realNews = await realNewsFetcher.fetchRealNews(categoryId as any, 1);
      if (realNews && realNews.length > 0) {
        console.log('📡 Using real news from SerpAPI');
        headline = realNews[0].headline;
        content = realNews[0].content || realNews[0].headline;
        category = realNews[0].category || categoryId;
      } else {
        throw new Error('No real news found');
      }
    } catch (realNewsError) {
      console.log('🧠 Falling back to Gemini AI for news generation...');
      const geminiNews = await generateNewsWithGemini(categoryId);
      headline = geminiNews.headline;
      content = geminiNews.content;
      category = geminiNews.category;
    }
    
    console.log('🧠 Creating news script with Gemini AI...');
    const script = await summarizeNewsWithGemini(headline, content);
    
    const result: NewsResult = {
      headline,
      script,
      timestamp: new Date().toISOString(),
      category
    };

    if (returnAudio) {
      console.log(`🎙️ Synthesizing speech with ${voiceType} voice...`);
      const audioFile = await synthesizeSpeech(script, voiceType);
      result.audioUrl = `/audio/${audioFile}`;
      console.log('✅ Audio news generated successfully');
    }

    return result;
  } catch (error) {
    console.error('Error generating audio news:', error);
    
    // Fallback to original method if Gemini fails
    try {
      console.log('📰 Falling back to traditional news sources...');
      const news = await getNewsHeadlines();
      const script = await summarizeText(news);
      
      return {
        headline: news,
        script,
        timestamp: new Date().toISOString(),
        category: categoryId
      };
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      return {
        headline: 'Error fetching news',
        script: 'Unable to generate news at this time. Please try again later.',
        timestamp: new Date().toISOString(),
        category: categoryId
      };
    }
  }
}

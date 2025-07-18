import { getJson } from 'serpapi';
import { generateNewsWithGemini } from './geminiNews.js';

interface SerpNewsResult {
  title: string;
  link: string;
  snippet: string;
  date: string;
  source: string;
  thumbnail?: string;
}

interface RealNewsStory {
  headline: string;
  content: string;
  category: string;
  source: string;
  url: string;
  publishedAt: string;
}

export class RealNewsFetcher {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.SERPAPI_API_KEY || '';
    console.log('🔑 Debug - SERPAPI_API_KEY:', this.apiKey ? 'Found' : 'Not found');
    console.log('🔑 Debug - All env keys:', Object.keys(process.env).filter(k => k.includes('SERP')));
    if (!this.apiKey) {
      console.warn('⚠️ SerpAPI key not configured, falling back to AI-generated news');
    } else {
      console.log('✅ SerpAPI key configured successfully');
    }
  }

  async fetchRealNews(query: string = 'breaking news', count: number = 10): Promise<RealNewsStory[]> {
    if (!this.apiKey) {
      console.warn('🔄 No SerpAPI key, generating AI news instead');
      return this.generateFallbackNews(query, count);
    }

    try {
      console.log(`🔍 Fetching real news for: "${query}"`);
      
      const searchParams = {
        engine: 'google_news',
        q: query,
        api_key: this.apiKey,
        num: count,
        hl: 'en',
        gl: 'us'
      };

      const results = await getJson(searchParams);
      
      if (!results.news_results || results.news_results.length === 0) {
        console.warn('⚠️ No news results found, falling back to AI generation');
        return this.generateFallbackNews(query, count);
      }

      console.log(`📰 Found ${results.news_results.length} real news articles`);
      
      // Process and enhance the real news with AI
      const realNewsStories = await this.processRealNews(results.news_results, query);
      
      return realNewsStories;
    } catch (error) {
      console.error('❌ Error fetching real news:', error);
      console.log('🔄 Falling back to AI-generated news');
      return this.generateFallbackNews(query, count);
    }
  }

  private async processRealNews(newsResults: any[], category: string): Promise<RealNewsStory[]> {
    const stories: RealNewsStory[] = [];

    for (const result of newsResults.slice(0, 10)) {
      try {
        // Use AI to enhance and expand the news snippet
        const enhancedStory = await this.enhanceNewsStory(result, category);
        
        if (enhancedStory) {
          stories.push({
            headline: enhancedStory.headline,
            content: enhancedStory.content,
            category: enhancedStory.category,
            source: result.source || 'Unknown Source',
            url: result.link || '',
            publishedAt: result.date || new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Error processing news story:', error);
        // Continue with other stories
      }
    }

    return stories;
  }

  private async enhanceNewsStory(newsResult: any, category: string): Promise<{ headline: string; content: string; category: string } | null> {
    try {
      const enhancementPrompt = `Based on this real news headline and snippet, create an enhanced news story suitable for broadcast:

Original Headline: ${newsResult.title}
Snippet: ${newsResult.snippet}
Source: ${newsResult.source}
Category Context: ${category}

Please:
1. Create a compelling headline (maintain factual accuracy)
2. Expand the content into a 200-300 word broadcast-ready story
3. Assign an appropriate news category
4. Maintain journalistic integrity and factual accuracy

Format:
HEADLINE: [Enhanced headline]
CATEGORY: [News category]
CONTENT: [200-300 word expanded story suitable for broadcast]`;

      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const result = await model.generateContent(enhancementPrompt);
      const response = await result.response;
      const text = response.text();

      // Parse the AI response
      const headlineMatch = text.match(/HEADLINE:\s*(.+)/);
      const categoryMatch = text.match(/CATEGORY:\s*(.+)/);
      const contentMatch = text.match(/CONTENT:\s*([\s\S]+)/);

      if (headlineMatch && categoryMatch && contentMatch) {
        return {
          headline: headlineMatch[1].trim(),
          category: categoryMatch[1].trim(),
          content: contentMatch[1].trim()
        };
      }

      return null;
    } catch (error) {
      console.error('Error enhancing news story with AI:', error);
      return null;
    }
  }

  private async generateFallbackNews(query: string, count: number): Promise<RealNewsStory[]> {
    const stories: RealNewsStory[] = [];

    for (let i = 0; i < Math.min(count, 5); i++) {
      try {
        const aiStory = await generateNewsWithGemini(query);
        
        stories.push({
          headline: aiStory.headline,
          content: aiStory.content,
          category: aiStory.category,
          source: 'AI Generated',
          url: '',
          publishedAt: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error generating fallback news:', error);
      }
    }

    return stories;
  }

  async fetchCategoryNews(category: string, count: number = 5): Promise<RealNewsStory[]> {
    const queries = this.getCategoryQueries(category);
    const allStories: RealNewsStory[] = [];

    for (const query of queries.slice(0, 2)) { // Limit to 2 queries per category
      const stories = await this.fetchRealNews(query, Math.ceil(count / 2));
      allStories.push(...stories);
    }

    return allStories.slice(0, count);
  }

  private getCategoryQueries(category: string): string[] {
    const queryMap: Record<string, string[]> = {
      'breaking': ['breaking news', 'latest news today', 'urgent news'],
      'technology': ['technology news', 'tech innovation', 'artificial intelligence news'],
      'business': ['business news', 'financial markets', 'economy news'],
      'science': ['science news', 'scientific breakthrough', 'research discovery'],
      'health': ['health news', 'medical breakthrough', 'healthcare news'],
      'environment': ['climate change news', 'environmental news', 'sustainability'],
      'politics': ['political news', 'government news', 'election news'],
      'international': ['world news', 'international news', 'global events'],
      'sports': ['sports news', 'athletic competition', 'sports results'],
      'entertainment': ['entertainment news', 'celebrity news', 'movies music']
    };

    return queryMap[category] || [category + ' news', 'latest ' + category];
  }

  async fetchRegionalNews(region: string, count: number = 5): Promise<RealNewsStory[]> {
    const queries = this.getRegionalQueries(region);
    const allStories: RealNewsStory[] = [];

    for (const query of queries.slice(0, 2)) { // Limit to 2 queries per region
      const stories = await this.fetchRealNews(query, Math.ceil(count / 2));
      allStories.push(...stories);
    }

    return allStories.slice(0, count);
  }

  private getRegionalQueries(region: string): string[] {
    const queryMap: Record<string, string[]> = {
      'US': ['United States news', 'US politics', 'American news'],
      'Europe': ['European news', 'EU news', 'European Union'],
      'Middle East': ['Middle East news', 'Arab news', 'Persian Gulf news'],
      'Asia': ['Asian news', 'China news', 'India news', 'Japan news'],
      'International': ['world news', 'international news', 'global events']
    };

    return queryMap[region] || [region + ' news', region + ' latest'];
  }
}

// Export a function to get the fetcher instead of a pre-instantiated object
export function getRealNewsFetcher(): RealNewsFetcher {
  return new RealNewsFetcher();
}

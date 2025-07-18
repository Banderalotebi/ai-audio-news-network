import { generateNewsWithGemini } from './geminiNews.js';
import { synthesizeSpeech, VoiceType } from './tts.js';
import { NEWS_CATEGORIES } from './newsCategories.js';
import { PDFProcessor } from './pdfProcessor.js';
import { getRealNewsFetcher } from './realNewsFetcher.js';

interface NewsSegment {
  category: string;
  headline: string;
  content: string;
  region?: string;
}

interface NewsOfTheHourConfig {
  breakingNews: number;
  regionalNews: {
    us: number;
    europe: number;
    middleEast: number;
    asia: number;
    general: number;
  };
  categoryNews: number; // Per category
  voiceType: VoiceType;
  includePDFSources?: boolean; // New option to include PDF magazine content
  pdfFilename?: string; // Specific PDF file to process
}

const DEFAULT_CONFIG: Omit<NewsOfTheHourConfig, 'voiceType'> = {
  breakingNews: 20, // Back to 20 for full hour coverage
  regionalNews: {
    us: 5,      // 5 US stories
    europe: 5,  // 5 Europe stories
    middleEast: 5, // 5 Middle East stories
    asia: 5,    // 5 Asia stories
    general: 5  // 5 General international stories
  },
  categoryNews: 3, // 3 stories per category for comprehensive coverage
  includePDFSources: true, // Include PDF magazine content by default
  pdfFilename: 'The Economist USA 07.12.2025_freemagazines.top.pdf' // Default PDF file
};

export async function generateNewsOfTheHour(
  config: Partial<NewsOfTheHourConfig> = {},
  voiceType: VoiceType = 'neutral'
): Promise<{ audioFile: string; segments: NewsSegment[]; totalDuration: string; script: string }> {
  const realNewsFetcher = getRealNewsFetcher(); // Get fetcher instance after environment is loaded
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const segments: NewsSegment[] = [];
  
  console.log('🎙️ Generating comprehensive News of the Hour with PDF integration...');
  
  // 1. Generate 20 Breaking News stories (Priority #1) - NOW WITH REAL NEWS
  console.log('📰 Generating 20 Breaking News stories using real news sources...');
  try {
    const realBreakingNews = await realNewsFetcher.fetchRealNews('breaking news latest urgent', finalConfig.breakingNews);
    
    if (realBreakingNews.length > 0) {
      console.log(`📡 Found ${realBreakingNews.length} real breaking news stories`);
      realBreakingNews.forEach(story => {
        segments.push({
          category: 'Breaking News',
          headline: story.headline,
          content: story.content
        });
      });
    } else {
      // Fallback to AI-generated news if no real news found
      console.log('🤖 Falling back to AI-generated breaking news');
      for (let i = 0; i < finalConfig.breakingNews; i++) {
        try {
          const news = await generateNewsWithGemini('breaking');
          segments.push({
            category: 'Breaking News',
            headline: news.headline,
            content: news.content
          });
        } catch (error) {
          console.warn(`Failed to generate breaking news ${i + 1}:`, error);
        }
      }
    }
  } catch (error) {
    console.warn('Failed to fetch real breaking news, using AI fallback:', error);
    // AI fallback
    for (let i = 0; i < finalConfig.breakingNews; i++) {
      try {
        const news = await generateNewsWithGemini('breaking');
        segments.push({
          category: 'Breaking News',
          headline: news.headline,
          content: news.content
        });
      } catch (error) {
        console.warn(`Failed to generate breaking news ${i + 1}:`, error);
      }
    }
  }
  
  // 2. Process PDF Magazine Content (NEW - Major Content Addition)
  if (finalConfig.includePDFSources && finalConfig.pdfFilename) {
    try {
      console.log('📖 Processing PDF magazine content for comprehensive coverage...');
      const pdfProcessor = new PDFProcessor();
      const pdfNews = await pdfProcessor.generateLongFormNewsFromPDF(finalConfig.pdfFilename);
      
      console.log(`📚 Extracted ${pdfNews.articles.length} magazine articles (${pdfNews.wordCount} words)`);
      
      // Add PDF articles as "Magazine Analysis" segments
      pdfNews.articles.forEach(article => {
        segments.push({
          category: `Magazine Analysis - ${article.category}`,
          headline: article.title,
          content: article.content
        });
      });
      
    } catch (error) {
      console.warn('Failed to process PDF content:', error);
    }
  }
  
  // 3. Generate Regional News - NOW WITH REAL NEWS
  console.log('🌍 Generating Regional News using real sources...');
  
  // US News
  try {
    const realUSNews = await realNewsFetcher.fetchRegionalNews('US', finalConfig.regionalNews.us);
    if (realUSNews.length > 0) {
      console.log(`🇺🇸 Found ${realUSNews.length} real US news stories`);
      realUSNews.forEach(story => {
        segments.push({
          category: 'US News',
          headline: story.headline,
          content: story.content,
          region: 'US'
        });
      });
    } else {
      // AI fallback
      for (let i = 0; i < finalConfig.regionalNews.us; i++) {
        try {
          const news = await generateRegionalNews('United States');
          segments.push({
            category: 'US News',
            headline: news.headline,
            content: news.content,
            region: 'US'
          });
        } catch (error) {
          console.warn(`Failed to generate US news ${i + 1}:`, error);
        }
      }
    }
  } catch (error) {
    console.warn('Failed to fetch real US news:', error);
  }
  
  // Europe News
  try {
    const realEuropeNews = await realNewsFetcher.fetchRegionalNews('Europe', finalConfig.regionalNews.europe);
    if (realEuropeNews.length > 0) {
      console.log(`🇪🇺 Found ${realEuropeNews.length} real Europe news stories`);
      realEuropeNews.forEach(story => {
        segments.push({
          category: 'Europe News',
          headline: story.headline,
          content: story.content,
          region: 'Europe'
        });
      });
    } else {
      // AI fallback
      for (let i = 0; i < finalConfig.regionalNews.europe; i++) {
        try {
          const news = await generateRegionalNews('Europe');
          segments.push({
            category: 'Europe News',
            headline: news.headline,
            content: news.content,
            region: 'Europe'
          });
        } catch (error) {
          console.warn(`Failed to generate Europe news ${i + 1}:`, error);
        }
      }
    }
  } catch (error) {
    console.warn('Failed to fetch real Europe news:', error);
  }
  
  // Middle East News
  try {
    const realMiddleEastNews = await realNewsFetcher.fetchRegionalNews('Middle East', finalConfig.regionalNews.middleEast);
    if (realMiddleEastNews.length > 0) {
      console.log(`🕌 Found ${realMiddleEastNews.length} real Middle East news stories`);
      realMiddleEastNews.forEach(story => {
        segments.push({
          category: 'Middle East News',
          headline: story.headline,
          content: story.content,
          region: 'Middle East'
        });
      });
    } else {
      // AI fallback
      for (let i = 0; i < finalConfig.regionalNews.middleEast; i++) {
        try {
          const news = await generateRegionalNews('Middle East');
          segments.push({
            category: 'Middle East News',
            headline: news.headline,
            content: news.content,
            region: 'Middle East'
          });
        } catch (error) {
          console.warn(`Failed to generate Middle East news ${i + 1}:`, error);
        }
      }
    }
  } catch (error) {
    console.warn('Failed to fetch real Middle East news:', error);
  }
  
  // Asia News
  try {
    const realAsiaNews = await realNewsFetcher.fetchRegionalNews('Asia', finalConfig.regionalNews.asia);
    if (realAsiaNews.length > 0) {
      console.log(`🌏 Found ${realAsiaNews.length} real Asia news stories`);
      realAsiaNews.forEach(story => {
        segments.push({
          category: 'Asia News',
          headline: story.headline,
          content: story.content,
          region: 'Asia'
        });
      });
    } else {
      // AI fallback
      for (let i = 0; i < finalConfig.regionalNews.asia; i++) {
        try {
          const news = await generateRegionalNews('Asia');
          segments.push({
            category: 'Asia News',
            headline: news.headline,
            content: news.content,
            region: 'Asia'
          });
        } catch (error) {
          console.warn(`Failed to generate Asia news ${i + 1}:`, error);
        }
      }
    }
  } catch (error) {
    console.warn('Failed to fetch real Asia news:', error);
  }
  
  // General International News
  try {
    const realInternationalNews = await realNewsFetcher.fetchRegionalNews('International', finalConfig.regionalNews.general);
    if (realInternationalNews.length > 0) {
      console.log(`🌍 Found ${realInternationalNews.length} real international news stories`);
      realInternationalNews.forEach(story => {
        segments.push({
          category: 'International News',
          headline: story.headline,
          content: story.content
        });
      });
    } else {
      // AI fallback
      for (let i = 0; i < finalConfig.regionalNews.general; i++) {
        try {
          const news = await generateNewsWithGemini('international');
          segments.push({
            category: 'International News',
            headline: news.headline,
            content: news.content
          });
        } catch (error) {
          console.warn(`Failed to generate international news ${i + 1}:`, error);
        }
      }
    }
  } catch (error) {
    console.warn('Failed to fetch real international news:', error);
  }
  
  // 4. Generate Category-specific News (3 stories per category) - NOW WITH REAL NEWS
  console.log('📊 Generating Category News using real sources...');
  
  const categoryIds = ['technology', 'business', 'science', 'health', 'environment', 'sports', 'entertainment', 'politics'];
  
  for (const categoryId of categoryIds) {
    console.log(`📰 Generating ${finalConfig.categoryNews} ${categoryId} stories...`);
    try {
      const realCategoryNews = await realNewsFetcher.fetchCategoryNews(categoryId, finalConfig.categoryNews);
      if (realCategoryNews.length > 0) {
        console.log(`📑 Found ${realCategoryNews.length} real ${categoryId} news stories`);
        realCategoryNews.forEach(story => {
          const category = NEWS_CATEGORIES.find(c => c.id === categoryId);
          segments.push({
            category: category?.name || categoryId,
            headline: story.headline,
            content: story.content
          });
        });
      } else {
        // AI fallback
        for (let i = 0; i < finalConfig.categoryNews; i++) {
          try {
            const news = await generateNewsWithGemini(categoryId);
            const category = NEWS_CATEGORIES.find(c => c.id === categoryId);
            segments.push({
              category: category?.name || categoryId,
              headline: news.headline,
              content: news.content
            });
          } catch (error) {
            console.warn(`Failed to generate ${categoryId} news ${i + 1}:`, error);
          }
        }
      }
    } catch (error) {
      console.warn(`Failed to fetch real ${categoryId} news:`, error);
    }
  }
  
  // 4. Create comprehensive script
  const script = createComprehensiveScript(segments);
  
  // 5. Generate audio
  console.log('🎙️ Synthesizing comprehensive news audio...');
  const audioFile = await synthesizeSpeech(script, voiceType, {
    stability: 0.6,
    similarityBoost: 0.8
  });
  
  // Calculate estimated duration (average 150 words per minute)
  const wordCount = script.split(' ').length;
  const estimatedMinutes = Math.round(wordCount / 150);
  const totalDuration = `${Math.floor(estimatedMinutes / 60)}h ${estimatedMinutes % 60}m`;
  
  console.log(`✅ News of the Hour generated: ${segments.length} stories, ~${totalDuration} duration`);
  
  return {
    audioFile,
    segments,
    totalDuration,
    script
  };
}

async function generateRegionalNews(region: string): Promise<{ headline: string; content: string }> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  
  if (!apiKey || apiKey.includes('demo_') || apiKey.includes('your_')) {
    return {
      headline: `Demo News: ${region} - ${new Date().toLocaleDateString()}`,
      content: `This is demo content for ${region}. Configure your Google AI API key to get real regional news.`
    };
  }

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const regionalPrompt = `Generate current breaking news specifically about ${region} for today (${new Date().toLocaleDateString()}).

    Focus on:
    - Current events happening in ${region}
    - Political developments
    - Economic news
    - Social issues
    - Cultural events
    - Regional conflicts or diplomacy
    
    Requirements:
    - Make it realistic and current
    - Create a compelling headline and 3-4 sentence news story
    - Sound professional and authoritative
    - Focus specifically on ${region} region
    
    Format your response as:
    HEADLINE: [headline here]
    CONTENT: [3-4 sentence news story here]`;
    
    const result = await model.generateContent(regionalPrompt);
    const response = await result.response;
    const text = response.text();

    const headlineMatch = text.match(/HEADLINE:\s*(.+)/);
    const contentMatch = text.match(/CONTENT:\s*(.+)/s);

    if (headlineMatch && contentMatch) {
      return {
        headline: headlineMatch[1].trim(),
        content: contentMatch[1].trim()
      };
    }
    
    throw new Error('Failed to parse regional news response');
  } catch (error) {
    console.error(`Failed to generate ${region} news:`, error);
    return {
      headline: `${region} News Update - ${new Date().toLocaleDateString()}`,
      content: `Regional news update for ${region}. Multiple developments are being monitored across the region today.`
    };
  }
}

function createComprehensiveScript(segments: NewsSegment[]): string {
  const timestamp = new Date().toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  let script = `Welcome to News of the Hour - Your comprehensive one-hour global news briefing for ${timestamp}.

I'm your AI news anchor, bringing you the most important stories from around the world in this extensive broadcast.

Today's one-hour program includes breaking news, comprehensive regional updates from the United States, Europe, Middle East, and Asia, plus detailed coverage across technology, business, science, health, environment, sports, entertainment, and politics.

This is your complete news digest for the hour. Let's begin with our top stories.

`;

  // Group segments by category
  const groupedSegments: { [key: string]: NewsSegment[] } = {};
  segments.forEach(segment => {
    if (!groupedSegments[segment.category]) {
      groupedSegments[segment.category] = [];
    }
    groupedSegments[segment.category].push(segment);
  });

  // Order categories for better flow
  const categoryOrder = [
    'Breaking News',
    'US News',
    'Europe News',
    'Middle East News',
    'Asia News',
    'International News',
    'Magazine Analysis - Politics',
    'Magazine Analysis - Economics',
    'Magazine Analysis - Business',
    'Magazine Analysis - International',
    'Magazine Analysis - Technology',
    'Magazine Analysis - Science',
    'Magazine Analysis - Social Issues',
    'Magazine Analysis - Culture',
    'Magazine Analysis - General',
    'Technology',
    'Business & Finance',
    'Science & Research',
    'Health & Medicine',
    'Environment & Climate',
    'Politics & Government',
    'Sports & Recreation',
    'Entertainment & Culture'
  ];

  let storyCounter = 1;

  categoryOrder.forEach(categoryName => {
    const categorySegments = groupedSegments[categoryName];
    if (categorySegments && categorySegments.length > 0) {
      script += `

--- ${categoryName.toUpperCase()} SEGMENT ---

`;
      
      categorySegments.forEach((segment, index) => {
        script += `

Story ${storyCounter}: ${segment.headline}

${segment.content}

`;
        
        // Add meaningful transitions between stories
        if (index < categorySegments.length - 1) {
          script += `Moving on to our next ${categoryName.toLowerCase()} story...

`;
        } else {
          script += `That concludes our ${categoryName.toLowerCase()} segment.

`;
        }
        
        storyCounter++;
      });
      
      // Add segment transition
      script += `

Now let's move to our next news segment.

`;
    }
  });

  script += `

This concludes your comprehensive one-hour News of the Hour briefing. We've covered ${segments.length} stories from across the globe, bringing you the latest developments in breaking news, regional updates from four major world regions, and specialized coverage across all major sectors.

You've been listening to your AI News Network's most comprehensive news program, designed to keep you fully informed about world events in just one hour.

Thank you for staying informed with us. We'll be back with another comprehensive one-hour update at the top of the next hour.

This is your AI News Network, keeping you connected to the world. Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}.

`;

  console.log(`📊 Generated script with ${script.length} characters for comprehensive one-hour broadcast`);
  
  return script;
}

export default { generateNewsOfTheHour };

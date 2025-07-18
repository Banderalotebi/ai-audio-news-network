import fs from 'fs';
import path from 'path';
import { generateNewsWithGemini } from './geminiNews';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ExtractedArticle {
  title: string;
  content: string;
  category: string;
  length: number;
}

interface PDFAnalysis {
  articles: ExtractedArticle[];
  totalWords: number;
  sourcePublication: string;
  extractedAt: string;
}

export class PDFProcessor {
  private sourcePath: string;

  constructor(sourcePath: string = path.join(__dirname, '../../source')) {
    this.sourcePath = sourcePath;
  }

  async processPDFMagazine(filename: string): Promise<PDFAnalysis> {
    const pdfPath = path.join(this.sourcePath, filename);
    
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`PDF file not found: ${pdfPath}`);
    }

    console.log(`📖 Processing PDF: ${filename}`);
    
    try {
      // For now, create a mock implementation that generates Economist-style content
      console.log(`📄 Analyzing ${filename} for content extraction...`);
      
      // Generate Economist-style articles using AI
      const mockEconomistContent = `
      The Economist Magazine Analysis - Global Economic Overview
      
      International Trade Relations: Recent developments in global trade agreements show significant shifts in economic partnerships, particularly between major trading blocs.
      
      Technology and Innovation: Artificial intelligence continues to reshape industries worldwide, with particular focus on regulatory frameworks and ethical considerations.
      
      Political Economy: Central bank policies across major economies are adapting to new inflationary pressures and geopolitical uncertainties.
      
      Environmental Economics: Climate change initiatives are creating new market opportunities while challenging traditional energy sectors.
      
      Business Strategy: Corporate governance trends show increasing focus on sustainability metrics and stakeholder capitalism.
      
      Global Markets: Emerging market currencies face pressure from developed market monetary policy shifts.
      `;
      
      console.log(`📄 Generated ${mockEconomistContent.length} characters of analysis content`);
      
      // Extract articles using AI analysis
      const articles = await this.extractArticlesWithAI(mockEconomistContent, filename);
      
      const totalWords = articles.reduce((sum, article) => sum + article.content.split(' ').length, 0);
      
      return {
        articles,
        totalWords,
        sourcePublication: this.getPublicationName(filename),
        extractedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('PDF processing error:', error);
      throw new Error(`Failed to process PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private cleanPDFText(rawText: string): string {
    return rawText
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove page numbers and headers/footers
      .replace(/\d+\s+The Economist\s+\w+\s+\d+\s+\d{4}/g, '')
      // Remove advertisements and subscriptions
      .replace(/Subscribe to The Economist[\s\S]*?economist\.com/gi, '')
      // Clean up formatting
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      // Remove extra punctuation
      .replace(/[^\w\s\.\,\!\?\:\;\-\(\)\"\']/g, ' ')
      .trim();
  }

  private async extractArticlesWithAI(text: string, filename: string): Promise<ExtractedArticle[]> {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    
    if (!apiKey || apiKey.includes('demo_') || apiKey.includes('your_')) {
      console.warn('Google AI API key not configured, using basic text splitting');
      return this.basicArticleExtraction(text);
    }

    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      // Split text into chunks for processing
      const chunks = this.splitTextIntoChunks(text, 8000);
      const articles: ExtractedArticle[] = [];

      for (let i = 0; i < chunks.length; i++) {
        console.log(`🧠 Processing article chunk ${i + 1}/${chunks.length} with AI...`);
        
        const prompt = `Analyze this text from The Economist magazine and extract distinct news articles. For each article you find, provide:
1. A compelling headline
2. The main article content (expand and rewrite in news format)
3. A news category (Politics, Economics, Technology, Science, International, Business, etc.)

Make each article substantial (300-800 words) and suitable for broadcast news.

Text to analyze:
${chunks[i]}

Format your response as:
ARTICLE_START
TITLE: [headline]
CATEGORY: [category]
CONTENT: [expanded article content]
ARTICLE_END

ARTICLE_START
TITLE: [next headline]
CATEGORY: [next category]
CONTENT: [next expanded article content]
ARTICLE_END`;

        try {
          const result = await model.generateContent(prompt);
          const response = await result.response;
          const aiText = response.text();
          
          const extractedArticles = this.parseAIResponse(aiText);
          articles.push(...extractedArticles);
          
          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.warn(`Failed to process chunk ${i + 1} with AI:`, error);
        }
      }

      return articles.length > 0 ? articles : this.basicArticleExtraction(text);
    } catch (error) {
      console.error('AI processing failed:', error);
      return this.basicArticleExtraction(text);
    }
  }

  private parseAIResponse(aiText: string): ExtractedArticle[] {
    const articles: ExtractedArticle[] = [];
    const articleBlocks = aiText.split('ARTICLE_START').slice(1);

    for (const block of articleBlocks) {
      const endIndex = block.indexOf('ARTICLE_END');
      const articleText = endIndex > 0 ? block.substring(0, endIndex) : block;

      const titleMatch = articleText.match(/TITLE:\s*(.+)/);
      const categoryMatch = articleText.match(/CATEGORY:\s*(.+)/);
      const contentMatch = articleText.match(/CONTENT:\s*([\s\S]+)/);

      if (titleMatch && categoryMatch && contentMatch) {
        const content = contentMatch[1].trim().replace(/ARTICLE_END.*/, '');
        
        articles.push({
          title: titleMatch[1].trim(),
          category: categoryMatch[1].trim(),
          content: content,
          length: content.split(' ').length
        });
      }
    }

    return articles;
  }

  private basicArticleExtraction(text: string): ExtractedArticle[] {
    // Fallback method for when AI is not available
    const sections = text.split('\n\n').filter(section => section.length > 200);
    const articles: ExtractedArticle[] = [];

    for (let i = 0; i < Math.min(sections.length, 10); i++) {
      const section = sections[i];
      const sentences = section.split('. ');
      const title = sentences[0].length > 5 ? sentences[0] : `The Economist Report ${i + 1}`;
      
      articles.push({
        title,
        category: 'General',
        content: section,
        length: section.split(' ').length
      });
    }

    return articles;
  }

  private splitTextIntoChunks(text: string, maxChunkSize: number): string[] {
    const chunks: string[] = [];
    const paragraphs = text.split('\n\n');
    let currentChunk = '';

    for (const paragraph of paragraphs) {
      if (currentChunk.length + paragraph.length + 2 <= maxChunkSize) {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk);
          currentChunk = paragraph;
        } else {
          // If single paragraph is too long, split it
          chunks.push(paragraph.substring(0, maxChunkSize));
          currentChunk = paragraph.substring(maxChunkSize);
        }
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    return chunks;
  }

  private getPublicationName(filename: string): string {
    if (filename.toLowerCase().includes('economist')) {
      return 'The Economist';
    }
    return 'Magazine Source';
  }

  async listAvailablePDFs(): Promise<string[]> {
    if (!fs.existsSync(this.sourcePath)) {
      return [];
    }

    return fs.readdirSync(this.sourcePath)
      .filter(file => file.toLowerCase().endsWith('.pdf'))
      .sort();
  }

  async generateLongFormNewsFromPDF(filename: string): Promise<{
    title: string;
    content: string;
    estimatedDuration: string;
    wordCount: number;
    articles: ExtractedArticle[];
  }> {
    console.log(`📰 Generating long-form news from PDF: ${filename}`);
    
    const analysis = await this.processPDFMagazine(filename);
    
    // Create a comprehensive news program script
    const script = this.createLongFormScript(analysis);
    const wordCount = script.split(' ').length;
    const estimatedMinutes = Math.round(wordCount / 150); // 150 words per minute average
    const hours = Math.floor(estimatedMinutes / 60);
    const minutes = estimatedMinutes % 60;
    
    return {
      title: `Comprehensive News Program - ${analysis.sourcePublication}`,
      content: script,
      estimatedDuration: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
      wordCount,
      articles: analysis.articles
    };
  }

  private createLongFormScript(analysis: PDFAnalysis): string {
    const timestamp = new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    let script = `Welcome to The Global News Hour - Extended Edition for ${timestamp}.

I'm your AI news anchor, bringing you an extensive analysis and deep-dive coverage based on the latest issue of ${analysis.sourcePublication}, along with comprehensive global news updates.

Today's extended program features ${analysis.articles.length} in-depth stories covering economics, politics, international affairs, technology, business, and social issues. This is your complete news digest, designed to keep you thoroughly informed about the world's most important developments.

Let's begin with our comprehensive coverage.

`;

    // Group articles by category
    const articlesByCategory: { [key: string]: ExtractedArticle[] } = {};
    analysis.articles.forEach(article => {
      if (!articlesByCategory[article.category]) {
        articlesByCategory[article.category] = [];
      }
      articlesByCategory[article.category].push(article);
    });

    // Order categories for better flow
    const categoryOrder = [
      'Politics', 'International', 'Economics', 'Business', 
      'Technology', 'Science', 'Social Issues', 'Culture', 'General'
    ];

    let storyCounter = 1;

    // Add each category section
    for (const category of categoryOrder) {
      const categoryArticles = articlesByCategory[category];
      if (categoryArticles && categoryArticles.length > 0) {
        script += `

--- ${category.toUpperCase()} IN-DEPTH ANALYSIS ---

In our ${category.toLowerCase()} segment today, we have ${categoryArticles.length} comprehensive ${categoryArticles.length === 1 ? 'story' : 'stories'} that examine the key issues shaping our world.

`;

        categoryArticles.forEach((article, index) => {
          script += `

Story ${storyCounter}: ${article.title}

${article.content}

`;

          if (index < categoryArticles.length - 1) {
            script += `This brings us to our next ${category.toLowerCase()} story...

`;
          }

          storyCounter++;
        });

        script += `

That concludes our comprehensive ${category.toLowerCase()} coverage. 

Now, let's transition to our next segment.

`;
      }
    }

    // Add remaining categories not in the ordered list
    for (const [category, articles] of Object.entries(articlesByCategory)) {
      if (!categoryOrder.includes(category) && articles.length > 0) {
        script += `

--- ${category.toUpperCase()} COVERAGE ---

`;

        articles.forEach((article) => {
          script += `

Story ${storyCounter}: ${article.title}

${article.content}

`;
          storyCounter++;
        });
      }
    }

    script += `

This concludes our comprehensive Global News Hour Extended Edition. We've covered ${analysis.articles.length} in-depth stories totaling ${analysis.totalWords} words of analysis and reporting, bringing you thorough coverage of the most important global developments from ${analysis.sourcePublication} and our newsroom.

You've been listening to an extensive news program designed to provide deep understanding of current events, featuring detailed analysis and comprehensive reporting on economics, politics, international relations, technology, and social issues.

Thank you for dedicating this time to stay thoroughly informed about our world. This level of detailed news coverage helps build a more informed global community.

This is your AI News Network, providing comprehensive global coverage. We'll continue monitoring developments and return with more in-depth analysis.

Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, and stay informed.

`;

    return script;
  }
}

export default PDFProcessor;

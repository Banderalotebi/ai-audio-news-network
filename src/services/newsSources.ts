import axios from 'axios';

export async function getNewsHeadlines(): Promise<string> {
  try {
    const apiKey = process.env.GNEWS_API_KEY;
    
    if (!apiKey || apiKey === 'your_gnews_api_key_here') {
      console.warn('GNews API key not configured, using demo news');
      return `Breaking: AI Audio News Network Demo - ${new Date().toLocaleDateString()}. This is a demonstration of the AI-powered news system. Configure your API keys in the .env file to get real breaking news headlines from around the world.`;
    }
    
    const response = await axios.get(`https://gnews.io/api/v4/top-headlines?lang=en&token=${apiKey}`);
    
    if (!response.data.articles || response.data.articles.length === 0) {
      return 'No breaking news available at this time.';
    }
    
    const topArticle = response.data.articles[0];
    return `${topArticle.title}. ${topArticle.description}`;
  } catch (error) {
    console.error('Error fetching news:', error);
    return `Demo News: Technology companies continue to advance AI capabilities. This is sample content while your API keys are being configured. Error details: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

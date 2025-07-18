import { Router } from 'express';
import { generateRSSFeed, saveRSSFeed, PodcastEpisode } from '../services/podcastFeed.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// GET /podcast/feed.xml - RSS feed for podcast platforms
router.get('/feed.xml', (req, res) => {
  try {
    const feedPath = path.join(__dirname, '../../public/podcast/feed.xml');
    
    if (fs.existsSync(feedPath)) {
      const rssContent = fs.readFileSync(feedPath, 'utf8');
      res.set('Content-Type', 'application/rss+xml; charset=utf-8');
      res.send(rssContent);
    } else {
      // Generate initial empty feed
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const emptyFeed = generateRSSFeed([], baseUrl);
      saveRSSFeed(emptyFeed);
      
      res.set('Content-Type', 'application/rss+xml; charset=utf-8');
      res.send(emptyFeed);
    }
  } catch (error) {
    console.error('Error serving RSS feed:', error);
    res.status(500).json({ error: 'Failed to generate RSS feed' });
  }
});

// GET /podcast/episodes - List all episodes
router.get('/episodes', (req, res) => {
  try {
    const audioDir = path.join(__dirname, '../../public/audio');
    const episodes: any[] = [];
    
    if (fs.existsSync(audioDir)) {
      const files = fs.readdirSync(audioDir)
        .filter(file => file.endsWith('.mp3'))
        .map(file => {
          const filePath = path.join(audioDir, file);
          const stats = fs.statSync(filePath);
          const baseUrl = `${req.protocol}://${req.get('host')}`;
          
          return {
            id: file.replace('.mp3', ''),
            title: `Breaking News - ${new Date(stats.birthtime).toLocaleDateString()}`,
            audioUrl: `/audio/${file}`,
            fullUrl: `${baseUrl}/audio/${file}`,
            fileSize: stats.size,
            publishDate: stats.birthtime,
            duration: 'Unknown' // Would need audio analysis for actual duration
          };
        })
        .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
      
      episodes.push(...files);
    }
    
    res.json({
      episodes,
      total: episodes.length,
      feedUrl: `${req.protocol}://${req.get('host')}/podcast/feed.xml`
    });
  } catch (error) {
    console.error('Error listing episodes:', error);
    res.status(500).json({ error: 'Failed to list episodes' });
  }
});

// POST /podcast/refresh - Regenerate RSS feed
router.post('/refresh', (req, res) => {
  try {
    const audioDir = path.join(__dirname, '../../public/audio');
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const episodes: PodcastEpisode[] = [];
    
    if (fs.existsSync(audioDir)) {
      const files = fs.readdirSync(audioDir)
        .filter(file => file.endsWith('.mp3'))
        .map(file => {
          const filePath = path.join(audioDir, file);
          const stats = fs.statSync(filePath);
          
          return {
            title: `AI News Update - ${new Date(stats.birthtime).toLocaleDateString()}`,
            description: `AI-generated news summary for ${new Date(stats.birthtime).toLocaleDateString()}. Real-time breaking news delivered through artificial intelligence.`,
            audioUrl: `/audio/${file}`,
            pubDate: new Date(stats.birthtime),
            duration: '00:02:30', // Estimated duration
            fileSize: stats.size,
            guid: file.replace('.mp3', '')
          };
        })
        .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
        .slice(0, 50); // Keep last 50 episodes in feed
      
      episodes.push(...files);
    }
    
    const rssContent = generateRSSFeed(episodes, baseUrl);
    saveRSSFeed(rssContent);
    
    res.json({
      message: 'RSS feed regenerated successfully',
      episodeCount: episodes.length,
      feedUrl: `${baseUrl}/podcast/feed.xml`
    });
  } catch (error) {
    console.error('Error refreshing RSS feed:', error);
    res.status(500).json({ error: 'Failed to refresh RSS feed' });
  }
});

// GET /podcast/info - Podcast information
router.get('/info', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  
  res.json({
    title: "AI Audio News Network",
    description: "Real-time AI-powered news summaries delivered as audio",
    feedUrl: `${baseUrl}/podcast/feed.xml`,
    websiteUrl: baseUrl,
    language: "en-US",
    category: "News",
    author: "AI Audio News Network",
    coverImage: `${baseUrl}/images/podcast-cover.jpg`,
    platforms: {
      apple: "Submit to Apple Podcasts Connect",
      spotify: "Submit to Spotify for Podcasters", 
      google: "Automatically indexed",
      rss: `${baseUrl}/podcast/feed.xml`
    }
  });
});

export default router;

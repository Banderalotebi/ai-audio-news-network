import express from 'express';
import newsRouter from './routes/news.js';
import podcastRouter from './routes/podcast.js';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { startScheduler } from './utils/scheduler.js';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('🔍 Debug - Environment loading:');
console.log('🔍 Current directory:', __dirname);
console.log('🔍 Env file path:', path.join(__dirname, '../.env'));
console.log('🔍 SERPAPI_API_KEY exists:', !!process.env.SERPAPI_API_KEY);
console.log('🔍 ELEVENLABS_API_KEY exists:', !!process.env.ELEVENLABS_API_KEY);
console.log('🔍 GOOGLE_AI_API_KEY exists:', !!process.env.GOOGLE_AI_API_KEY);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.use('/api/news', newsRouter);
app.use('/podcast', podcastRouter);
app.use('/audio', express.static(path.join(__dirname, '../public/audio')));
app.use(express.static(path.join(__dirname, '../public')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'AI News Audio Server is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'AI Audio News Network API',
    endpoints: {
      categories: '/api/news/categories',
      breaking: '/api/news/breaking',
      technology: '/api/news/technology',
      business: '/api/news/business',
      science: '/api/news/science',
      entertainment: '/api/news/entertainment',
      sports: '/api/news/sports',
      health: '/api/news/health',
      audio: {
        breaking: '/api/news/breaking/audio',
        technology: '/api/news/technology/audio',
        business: '/api/news/business/audio'
      },
      healthCheck: '/health',
      podcast: {
        feed: '/podcast/feed.xml',
        episodes: '/podcast/episodes',
        info: '/podcast/info'
      }
    },
    voiceOptions: ['male', 'female', 'neutral'],
    examples: {
      femaleBreaking: '/api/news/breaking?voice=female',
      maleTech: '/api/news/technology?voice=male',
      neutralScience: '/api/news/science?voice=neutral'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🎙️ AI News Audio Server running on port ${PORT}`);
  console.log(`📰 Categories: http://localhost:${PORT}/api/news/categories`);
  console.log(`📰 Breaking news: http://localhost:${PORT}/api/news/breaking`);
  console.log(`🔊 Audio news: http://localhost:${PORT}/api/news/breaking/audio`);
  console.log(`💻 Technology: http://localhost:${PORT}/api/news/technology`);
  console.log(`💼 Business: http://localhost:${PORT}/api/news/business`);
  console.log(`🔬 Science: http://localhost:${PORT}/api/news/science`);
  
  // Start the news scheduler
  startScheduler();
});

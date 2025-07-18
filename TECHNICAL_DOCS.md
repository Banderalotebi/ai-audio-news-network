# 🎙️ AI Audio News Network - Technical Documentation

## 📋 Table of Contents
- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Configuration](#configuration)
- [Development Guide](#development-guide)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## 🏗️ Architecture Overview

The AI Audio News Network is a real-time news processing system that:

1. **Fetches** breaking news from GNews API
2. **Summarizes** content using OpenAI GPT-4
3. **Synthesizes** speech using ElevenLabs TTS
4. **Serves** via REST API endpoints
5. **Schedules** automatic updates

### Technology Stack
- **Backend**: Node.js + Express + TypeScript
- **AI/ML**: OpenAI GPT-4, ElevenLabs TTS
- **News Source**: GNews API
- **Scheduling**: Node-cron
- **Development**: ts-node-dev, TypeScript

## 📁 Project Structure

```
ai-audio-news-network/
├── src/
│   ├── routes/
│   │   └── news.ts                 # API route handlers
│   ├── services/
│   │   ├── newsScraper.ts         # Main orchestration service
│   │   ├── newsSources.ts         # News fetching logic
│   │   ├── summarizer.ts          # GPT-4 text processing
│   │   └── tts.ts                 # ElevenLabs voice synthesis
│   ├── utils/
│   │   └── scheduler.ts           # Automated cron jobs
│   └── server.ts                  # Express application entry
├── public/
│   ├── audio/                     # Generated audio files
│   └── index.html                 # Demo web interface
├── scripts/
│   └── test.ts                    # Testing utilities
├── dist/                          # Compiled JavaScript (build output)
├── .env                          # Environment variables
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
└── setup.sh                     # Automated setup script
```

## 🔌 API Documentation

### Base URL
```
http://localhost:3000
```

### Endpoints

#### 1. Get Breaking News (Text Only)
```http
GET /api/news/breaking
```

**Response:**
```json
{
  "headline": "Breaking: Major news headline here",
  "script": "AI-generated news script for audio delivery",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### 2. Generate Audio News
```http
GET /api/news/breaking/audio
```

**Response:**
```json
{
  "headline": "Breaking: Major news headline here",
  "script": "AI-generated news script for audio delivery",
  "audioUrl": "/audio/uuid-filename.mp3",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### 3. Service Status
```http
GET /api/news/status
```

**Response:**
```json
{
  "status": "operational",
  "message": "AI Audio News Network is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "endpoints": {
    "breaking": "/api/news/breaking",
    "audio": "/api/news/breaking/audio"
  }
}
```

#### 4. Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "message": "AI News Audio Server is running"
}
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | `3000` |
| `GNEWS_API_KEY` | GNews.io API key | Yes | `abc123...` |
| `OPENAI_API_KEY` | OpenAI API key | Yes | `sk-proj-...` |
| `ELEVENLABS_API_KEY` | ElevenLabs API key | Yes | `abc123...` |
| `ELEVENLABS_VOICE_ID` | ElevenLabs voice ID | Yes | `21m00Tcm4TlvDq8ikWAM` |

### Getting API Keys

#### GNews API
1. Visit [gnews.io](https://gnews.io/)
2. Sign up for free account
3. Get API key from dashboard
4. Free tier: 100 requests/day

#### OpenAI API
1. Visit [platform.openai.com](https://platform.openai.com/)
2. Create account and add billing
3. Generate API key in API Keys section
4. Cost: ~$0.03 per request (GPT-4)

#### ElevenLabs API
1. Visit [elevenlabs.io](https://elevenlabs.io/)
2. Sign up for account
3. Get API key from Profile & API Key
4. Get Voice ID from Voices section
5. Free tier: 10,000 characters/month

## 🛠️ Development Guide

### Quick Start
```bash
# Clone and setup
git clone <repository>
cd ai-audio-news-network
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Run development server
npm run dev

# Test generation
npm run generate
```

### Development Commands
```bash
npm run dev      # Start development server with auto-reload
npm run build    # Compile TypeScript to JavaScript
npm start        # Run production server
npm run generate # Test news generation
npm run clean    # Clean build files and audio cache
npm run setup    # Run automated setup script
```

### Code Structure

#### Services Layer
- **newsScraper.ts**: Main orchestration service
- **newsSources.ts**: External API integration
- **summarizer.ts**: AI text processing
- **tts.ts**: Voice synthesis

#### Routes Layer
- **news.ts**: Express route handlers

#### Utils Layer
- **scheduler.ts**: Background task management

### Error Handling
All services include comprehensive error handling:
- API failures return fallback content
- Detailed logging for debugging
- Graceful degradation when services unavailable

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Setup
1. Ensure Node.js 18+ is installed
2. Set all required environment variables
3. Configure reverse proxy (nginx/Apache) if needed
4. Set up process manager (PM2/systemd)

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Process Management with PM2
```bash
npm install -g pm2
pm2 start npm --name "ai-news" -- start
pm2 save
pm2 startup
```

## 🧪 Testing

### Manual Testing
```bash
# Test news generation
npm run generate

# Test API endpoints
curl http://localhost:3000/api/news/breaking
curl http://localhost:3000/api/news/breaking/audio
curl http://localhost:3000/health
```

### Demo Interface
Visit `http://localhost:3000` for interactive testing interface.

## 🔧 Troubleshooting

### Common Issues

#### 1. TypeScript Compilation Errors
```bash
# Clean and rebuild
npm run clean
npm run build
```

#### 2. API Key Issues
- Verify all API keys are set in `.env`
- Check API key quotas and billing
- Test individual APIs separately

#### 3. Audio Generation Fails
- Check ElevenLabs API key and voice ID
- Verify audio directory permissions
- Monitor API rate limits

#### 4. News Fetching Fails
- Check GNews API key and quota
- Verify internet connectivity
- Check GNews service status

### Debugging
Enable detailed logging by setting `NODE_ENV=development`.

### Performance Optimization
- Audio files are cached in `public/audio/`
- Consider implementing Redis for caching news
- Use CDN for audio file distribution
- Implement request queuing for high load

### Monitoring
- Check server logs for errors
- Monitor API usage and quotas
- Track audio file storage usage
- Set up health check endpoints

## 📊 Scheduling Details

### Automatic News Generation
- **Hourly**: Every hour, 24/7
- **Peak Hours**: Every 15 minutes (6 AM - 10 PM)
- **Configurable**: Edit `src/utils/scheduler.ts`

### Cron Patterns
```javascript
'0 * * * *'      // Every hour
'*/15 6-22 * * *' // Every 15 min, 6 AM - 10 PM
```

## 🔒 Security Considerations

1. **API Keys**: Never commit `.env` to version control
2. **Rate Limiting**: Implement API rate limiting for production
3. **File Storage**: Regularly clean old audio files
4. **CORS**: Configure CORS for production domains
5. **HTTPS**: Use HTTPS in production

## 📈 Scaling Considerations

1. **Database**: Add Redis/MongoDB for news caching
2. **Queue System**: Use Bull/Agenda for background jobs
3. **Load Balancing**: Use nginx for multiple instances
4. **CDN**: Serve audio files from CDN
5. **Microservices**: Split services for independent scaling

---

**Need help?** Check the logs, verify API keys, and ensure all dependencies are installed.

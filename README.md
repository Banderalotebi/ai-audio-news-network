# 🎙️ AI Audio News Network

A comprehensive AI-powered audio news network that generates real-time news summaries with professional voice synthesis, powered by real news sources and enhanced with artificial intelligence.

## 🚀 Features

### 📡 **Real News Integration**
- **SerpAPI Integration**: Fetches 100+ real news articles from Google News
- **Multi-Category Support**: Breaking news, Technology, Business, Science
- **Regional Targeting**: US and international news coverage
- **Real-time Updates**: Automated hourly news generation

### 🤖 **AI Enhancement**
- **Google Gemini AI**: Enhances raw news into professional broadcast scripts
- **Intelligent Summarization**: Converts articles into engaging audio-ready content
- **Content Analysis**: PDF magazine integration for comprehensive coverage
- **Smart Fallbacks**: AI-generated content when real news is unavailable

### 🎙️ **Professional Audio Synthesis**
- **ElevenLabs TTS**: High-quality voice synthesis with multiple voice types
- **Voice Options**: Male, Female, and Neutral voice personalities
- **Long-form Audio**: Chunked processing for comprehensive news broadcasts
- **Graceful Fallbacks**: Demo mode when API services are unavailable

## 📁 Project Structure

```
ai-audio-news-network/
├── src/
│   ├── routes/
│   │   └── news.ts           # API endpoints
│   ├── services/
│   │   ├── newsScraper.ts    # Main orchestration service
│   │   ├── newsSources.ts    # News fetching from GNews
│   │   ├── summarizer.ts     # GPT-4 text summarization
│   │   └── tts.ts           # ElevenLabs voice synthesis
│   ├── utils/
│   │   └── scheduler.ts      # Automated news generation
│   └── server.ts            # Express server entry point
├── public/
│   └── audio/               # Generated audio files
├── scripts/
│   └── test.ts             # Test script
└── package.json
```

## � Quick Start

### Option 1: Docker (Recommended)
```bash
# Clone and configure
git clone <repository>
cd ai-audio-news-network
cp .env.example .env
# Edit .env with your API keys

# Run with Docker
docker-compose up -d
```

### Option 2: Local Development
```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Run development server
npm run dev
```

### Option 3: Automated Setup
```bash
# Run the setup script
chmod +x setup.sh
./setup.sh
```

### 3. Get API Keys

#### GNews API
1. Visit [GNews.io](https://gnews.io/)
2. Sign up for a free account
3. Get your API key from the dashboard

#### OpenAI API
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an account and add billing information
3. Generate an API key from the API keys section

#### ElevenLabs API
1. Visit [ElevenLabs](https://elevenlabs.io/)
2. Sign up for an account
3. Go to Profile & API Key to get your API key
4. Go to Voices to get a Voice ID (or use a default one)

### 4. Run the Server

```bash
# Development mode with auto-reload
npm run dev

# Build and run production
npm run build
npm start

# Test the news generation
npm run generate
```

## 📡 API Endpoints

### News Endpoints
### GET `/api/news/breaking`
Returns the latest breaking news with AI-generated script (text only).

### GET `/api/news/breaking/audio`
Returns the latest breaking news with audio URL.

### GET `/api/news/status`
Health check endpoint for the news service.

### Podcast Endpoints
### GET `/podcast/feed.xml`
RSS feed for podcast platforms (Apple Podcasts, Spotify, etc.)

### GET `/podcast/episodes`
List all available podcast episodes.

### GET `/podcast/info`
Podcast information and platform submission details.

### General Endpoints
### GET `/health`
General server health check.

## ⏰ Automated Scheduling

The system automatically generates news updates:
- **Hourly**: Every hour, 24/7
- **Peak Hours**: Every 15 minutes from 6 AM to 10 PM

## 🧪 Testing

Run the test script to verify everything is working:

```bash
npm run generate
```

This will:
1. Test text-only news generation
2. Test audio news generation
3. Display results and confirm API functionality

## 🔊 Audio Files

Generated audio files are stored in `public/audio/` and served at `/audio/{filename}.mp3`.

## 🛡️ Error Handling

The system includes comprehensive error handling:
- Graceful fallbacks when APIs are unavailable
- Detailed logging for debugging
- Default responses when services fail

## 📝 Development

### Build
```bash
npm run build
```

### Development with auto-reload
```bash
npm run dev
```

### Testing
```bash
npm run generate
```

## 🌟 Usage Examples

### Fetch Latest News Text
```bash
curl http://localhost:3000/api/news/breaking
```

### Generate Audio News
```bash
curl http://localhost:3000/api/news/breaking/audio
```

### Play Generated Audio
Open the returned audio URL in your browser or use an audio player.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

---

**Made with ❤️ and AI** 🤖

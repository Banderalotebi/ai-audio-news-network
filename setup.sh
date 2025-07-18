#!/bin/bash

echo "🎙️ AI Audio News Network - Setup Script"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ and try again.${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version 18+ required. Current version: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) detected${NC}"

# Install dependencies if not already installed
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install dependencies${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi

# Check for .env file
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from template...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}📝 Please edit .env file with your API keys:${NC}"
    echo -e "   - GNEWS_API_KEY: Get from https://gnews.io/"
    echo -e "   - OPENAI_API_KEY: Get from https://platform.openai.com/"
    echo -e "   - ELEVENLABS_API_KEY: Get from https://elevenlabs.io/"
    echo -e "   - ELEVENLABS_VOICE_ID: Voice ID from ElevenLabs"
    echo ""
else
    echo -e "${GREEN}✅ .env file exists${NC}"
fi

# Create audio directory if it doesn't exist
mkdir -p public/audio
echo -e "${GREEN}✅ Audio directory created${NC}"

# Build the project
echo -e "${BLUE}🔨 Building TypeScript project...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Build completed${NC}"

echo ""
echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo -e "1. Edit .env file with your API keys"
echo -e "2. Run: ${YELLOW}npm run dev${NC} (development)"
echo -e "3. Run: ${YELLOW}npm start${NC} (production)"
echo -e "4. Run: ${YELLOW}npm run generate${NC} (test generation)"
echo ""
echo -e "${BLUE}🌐 Endpoints:${NC}"
echo -e "- Demo page: ${YELLOW}http://localhost:3000${NC}"
echo -e "- Breaking news: ${YELLOW}http://localhost:3000/api/news/breaking${NC}"
echo -e "- Audio news: ${YELLOW}http://localhost:3000/api/news/breaking/audio${NC}"
echo ""
echo -e "${GREEN}Happy news generating! 🚀${NC}"

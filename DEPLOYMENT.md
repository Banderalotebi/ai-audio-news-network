# 🚀 AI Audio News Network - Deployment Guide

## 📋 Deployment Options

### 1. 🐳 Docker Deployment

#### Quick Start with Docker Compose
```bash
# Clone the repository
git clone <your-repo>
cd ai-audio-news-network

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Build and run with Docker Compose
docker-compose up -d

# Check logs
docker-compose logs -f
```

#### Manual Docker Build
```bash
# Build the image
docker build -t ai-news-network .

# Run the container
docker run -d \
  --name ai-news \
  --env-file .env \
  -p 3000:3000 \
  -v $(pwd)/public/audio:/app/public/audio \
  ai-news-network
```

### 2. ☁️ Google Cloud Platform (GCP)

#### Option A: Cloud Run (Serverless)
```bash
# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# Build and deploy
gcloud builds submit --tag gcr.io/PROJECT_ID/ai-news
gcloud run deploy ai-news-network \
  --image gcr.io/PROJECT_ID/ai-news \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --port 3000 \
  --set-env-vars "NODE_ENV=production"
```

#### Option B: Google Kubernetes Engine (GKE)
```yaml
# k8s-deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ai-news-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ai-news
  template:
    metadata:
      labels:
        app: ai-news
    spec:
      containers:
      - name: ai-news
        image: gcr.io/PROJECT_ID/ai-news
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        envFrom:
        - secretRef:
            name: ai-news-secrets
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: ai-news-service
spec:
  selector:
    app: ai-news
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

Deploy to GKE:
```bash
# Create cluster
gcloud container clusters create ai-news-cluster \
  --zone us-central1-a \
  --num-nodes 3

# Create secrets
kubectl create secret generic ai-news-secrets \
  --from-env-file=.env

# Deploy
kubectl apply -f k8s-deployment.yml
```

### 3. 🖥️ VPS Deployment (DigitalOcean, Linode, AWS EC2)

#### Ubuntu/Debian Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Clone and setup project
git clone <your-repo>
cd ai-audio-news-network
npm install
npm run build

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### PM2 Configuration
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'ai-news-network',
    script: 'dist/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
}
```

#### Nginx Configuration
```bash
# Install Nginx
sudo apt install nginx

# Create site configuration
sudo nano /etc/nginx/sites-available/ai-news

# Copy the nginx.conf content we created
# Enable the site
sudo ln -s /etc/nginx/sites-available/ai-news /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. 🔒 SSL/HTTPS Setup

#### Let's Encrypt with Certbot
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔧 Environment Configuration

### Production Environment Variables
```env
# Server
NODE_ENV=production
PORT=3000

# API Keys (REQUIRED)
GNEWS_API_KEY=your_gnews_api_key
OPENAI_API_KEY=your_openai_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_VOICE_ID=your_voice_id

# Optional: Database (for future scaling)
# REDIS_URL=redis://localhost:6379
# MONGODB_URI=mongodb://localhost:27017/ai-news
```

## 📊 Monitoring & Logging

### Health Checks
```bash
# Basic health check
curl -f http://your-domain.com/health

# API status check
curl http://your-domain.com/api/news/status
```

### Log Management
```bash
# PM2 logs
pm2 logs ai-news-network

# Docker logs
docker-compose logs -f

# System logs
sudo journalctl -u nginx -f
```

### Monitoring Tools
- **Uptime**: UptimeRobot, Pingdom
- **Performance**: New Relic, DataDog
- **Logs**: LogRocket, Papertrail
- **Errors**: Sentry

## 💰 Cost Estimation

### API Costs (Monthly)
- **GNews**: Free (100 req/day) or $10/month
- **OpenAI GPT-4**: ~$50-200 (depends on usage)
- **ElevenLabs**: Free (10k chars) or $5-22/month

### Infrastructure Costs
- **VPS**: $5-20/month (DigitalOcean, Linode)
- **Cloud Run**: $0-50/month (pay per use)
- **GKE**: $75+/month (minimum cluster cost)

## 🔧 Performance Optimization

### Caching Strategy
```javascript
// Add to services for caching
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function getCachedNews() {
  const cached = cache.get('latest_news');
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}
```

### Load Balancing
- Use PM2 cluster mode
- Implement Redis for session storage
- Use CDN for audio files (CloudFlare, AWS CloudFront)

## 🚨 Security Best Practices

1. **Environment Security**
   - Never commit `.env` files
   - Use secrets management (AWS Secrets, GCP Secret Manager)
   - Rotate API keys regularly

2. **Network Security**
   - Use HTTPS only
   - Implement rate limiting
   - Use firewall rules

3. **Application Security**
   - Validate all inputs
   - Sanitize file uploads
   - Monitor for anomalies

## 📋 Deployment Checklist

- [ ] API keys configured and tested
- [ ] SSL certificate installed
- [ ] Health checks working
- [ ] Monitoring setup
- [ ] Backup strategy in place
- [ ] Error tracking configured
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Performance monitoring active
- [ ] Logs centralized

## 🆘 Troubleshooting

### Common Issues
1. **502 Bad Gateway**: Check if app is running on correct port
2. **API Errors**: Verify API keys and quotas
3. **Audio Generation Fails**: Check ElevenLabs account limits
4. **High Memory Usage**: Implement caching and cleanup old audio files

### Debug Commands
```bash
# Check running processes
pm2 status

# Monitor resource usage
htop

# Check disk space
df -h

# Test API endpoints
curl -v http://localhost:3000/health
```

---

🎉 **Your AI Audio News Network is now production-ready!**

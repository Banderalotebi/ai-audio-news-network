import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface PodcastEpisode {
  title: string;
  description: string;
  audioUrl: string;
  pubDate: Date;
  duration: string;
  fileSize: number;
  guid: string;
}

export function generateRSSFeed(episodes: PodcastEpisode[], baseUrl: string): string {
  const podcastInfo = {
    title: "AI Audio News Network",
    description: "Real-time AI-powered news summaries delivered as audio",
    language: "en-US",
    category: "News",
    author: "AI Audio News Network",
    email: "contact@ainews.com",
    imageUrl: `${baseUrl}/images/podcast-cover.jpg`,
    link: baseUrl
  };

  const rssHeader = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <channel>
    <title><![CDATA[${podcastInfo.title}]]></title>
    <description><![CDATA[${podcastInfo.description}]]></description>
    <link>${podcastInfo.link}</link>
    <language>${podcastInfo.language}</language>
    <managingEditor>${podcastInfo.email} (${podcastInfo.author})</managingEditor>
    <webMaster>${podcastInfo.email} (${podcastInfo.author})</webMaster>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <pubDate>${new Date().toUTCString()}</pubDate>
    <generator>AI Audio News Network</generator>
    
    <atom:link href="${baseUrl}/podcast/feed.xml" rel="self" type="application/rss+xml"/>
    
    <itunes:author>${podcastInfo.author}</itunes:author>
    <itunes:summary><![CDATA[${podcastInfo.description}]]></itunes:summary>
    <itunes:category text="${podcastInfo.category}"/>
    <itunes:owner>
      <itunes:name>${podcastInfo.author}</itunes:name>
      <itunes:email>${podcastInfo.email}</itunes:email>
    </itunes:owner>
    <itunes:image href="${podcastInfo.imageUrl}"/>
    <itunes:explicit>false</itunes:explicit>
    <itunes:type>episodic</itunes:type>`;

  const rssItems = episodes.map(episode => `
    <item>
      <title><![CDATA[${episode.title}]]></title>
      <description><![CDATA[${episode.description}]]></description>
      <link>${baseUrl}</link>
      <guid isPermaLink="false">${episode.guid}</guid>
      <pubDate>${episode.pubDate.toUTCString()}</pubDate>
      <enclosure url="${baseUrl}${episode.audioUrl}" 
                 length="${episode.fileSize}" 
                 type="audio/mpeg"/>
      <itunes:duration>${episode.duration}</itunes:duration>
      <itunes:explicit>false</itunes:explicit>
      <itunes:episodeType>full</itunes:episodeType>
    </item>`).join('');

  const rssFooter = `
  </channel>
</rss>`;

  return rssHeader + rssItems + rssFooter;
}

export function saveRSSFeed(rssContent: string): void {
  const feedPath = path.join(__dirname, '../../public/podcast/feed.xml');
  
  // Ensure directory exists
  const feedDir = path.dirname(feedPath);
  if (!fs.existsSync(feedDir)) {
    fs.mkdirSync(feedDir, { recursive: true });
  }
  
  fs.writeFileSync(feedPath, rssContent, 'utf8');
  console.log('📻 RSS feed updated:', feedPath);
}

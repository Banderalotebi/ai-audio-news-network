import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export type VoiceType = 'male' | 'female' | 'neutral';

// Lazy-loaded configuration
function getElevenLabsConfig() {
  return {
    apiKey: process.env.ELEVENLABS_API_KEY || 'demo_elevenlabs_key',
    baseUrl: 'https://api.elevenlabs.io/v1',
    voices: {
      male: process.env.ELEVENLABS_MALE_VOICE_ID || 'onwK4e9ZLuTAKqWW03F9', // Daniel (male)
      female: process.env.ELEVENLABS_FEMALE_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL', // Sarah (female)
      neutral: process.env.ELEVENLABS_NEUTRAL_VOICE_ID || 'SAz9YHcvj6GT2YYXdXww' // River (neutral)
    }
  };
}

// Google Cloud TTS configuration
const GOOGLE_TTS_KEY = process.env.GOOGLE_TTS_API_KEY;

interface TTSOptions {
  voiceType?: VoiceType;
  stability?: number;
  similarityBoost?: number;
  speed?: number;
}

export async function synthesizeSpeech(
  text: string, 
  voiceType: VoiceType = 'neutral',
  options: TTSOptions = {}
): Promise<string> {
  // Get configuration at runtime
  const elevenLabsConfig = getElevenLabsConfig();
  const googleTTSKey = process.env.GOOGLE_TTS_API_KEY;
  
  // Check if we have real API keys
  const hasRealElevenLabs = elevenLabsConfig.apiKey && 
    elevenLabsConfig.apiKey !== 'demo_elevenlabs_key' && 
    elevenLabsConfig.apiKey.startsWith('sk_');
  const hasRealGoogle = googleTTSKey;
  
  if (!hasRealElevenLabs && !hasRealGoogle) {
    // Create a mock audio file for demo purposes
    console.log(`🎭 Demo mode: Creating mock audio for ${voiceType} voice`);
    return await createMockAudio(text, voiceType);
  }
  
  // For very long content (over 4000 chars), split into chunks
  if (text.length > 4000) {
    console.log(`📏 Long content detected (${text.length} chars), creating chunked audio`);
    return await synthesizeLongFormSpeech(text, voiceType, options);
  }
  
  try {
    if (hasRealElevenLabs) {
      // Use ElevenLabs with real API key
      console.log('🎙️ Using ElevenLabs with real API key');
      const audioFile = await synthesizeWithElevenLabs(text, voiceType, options);
      return audioFile;
    } else if (hasRealGoogle) {
      // Use Google Cloud TTS
      console.log('🎙️ Using Google Cloud TTS');
      const audioFile = await synthesizeWithGoogleTTS(text, voiceType, options);
      return audioFile;
    }
  } catch (error) {
    console.warn('TTS synthesis failed:', error);
    
    try {
      // Try the fallback service
      if (hasRealElevenLabs && hasRealGoogle) {
        console.log('🔄 Trying fallback TTS service');
        const audioFile = await synthesizeWithGoogleTTS(text, voiceType, options);
        return audioFile;
      }
    } catch (fallbackError) {
      console.error('Fallback TTS also failed:', fallbackError);
    }
    
    // If all else fails, create mock audio
    console.log('🎭 All TTS services failed, falling back to demo mode');
    return await createMockAudio(text, voiceType);
  }
  
  // Shouldn't reach here, but just in case
  console.log('🎭 Unexpected path, falling back to demo mode');
  return await createMockAudio(text, voiceType);
}

async function synthesizeLongFormSpeech(
  text: string, 
  voiceType: VoiceType,
  options: TTSOptions
): Promise<string> {
  console.log(`🎙️ Generating long-form audio broadcast (${text.length} characters)`);
  
  // Split text into chunks of approximately 3500 characters at natural breaks
  const chunks = splitTextIntoChunks(text, 3500);
  console.log(`📝 Split into ${chunks.length} audio segments`);
  
  const audioFiles: string[] = [];
  
  for (let i = 0; i < chunks.length; i++) {
    console.log(`🎵 Generating audio segment ${i + 1}/${chunks.length}`);
    try {
      const audioFile = await synthesizeWithElevenLabs(chunks[i], voiceType, {
        ...options,
        // Add slight pauses between segments
        stability: options.stability || 0.6,
        similarityBoost: options.similarityBoost || 0.8
      });
      audioFiles.push(audioFile);
    } catch (error) {
      console.error(`Failed to generate segment ${i + 1}:`, error);
      // Continue with other segments
    }
  }
  
  if (audioFiles.length === 0) {
    throw new Error('Failed to generate any audio segments');
  }
  
  // For now, return the first segment filename
  // In a full implementation, you would concatenate the audio files
  console.log(`✅ Generated ${audioFiles.length} audio segments for long-form broadcast`);
  return audioFiles[0];
}

function splitTextIntoChunks(text: string, maxChunkSize: number): string[] {
  const chunks: string[] = [];
  let currentChunk = '';
  
  // Split by paragraphs first
  const paragraphs = text.split('\n\n');
  
  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length + 2 <= maxChunkSize) {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
        currentChunk = paragraph;
      } else {
        // If single paragraph is too long, split by sentences
        const sentences = paragraph.split('. ');
        for (const sentence of sentences) {
          if (currentChunk.length + sentence.length + 2 <= maxChunkSize) {
            currentChunk += (currentChunk ? '. ' : '') + sentence;
          } else {
            if (currentChunk) {
              chunks.push(currentChunk);
              currentChunk = sentence;
            } else {
              // If single sentence is too long, force split
              chunks.push(sentence.substring(0, maxChunkSize));
              currentChunk = sentence.substring(maxChunkSize);
            }
          }
        }
      }
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  
  return chunks;
}

async function synthesizeWithElevenLabs(
  text: string, 
  voiceType: VoiceType,
  options: TTSOptions
): Promise<string> {
  const elevenLabsConfig = getElevenLabsConfig();
  const voiceId = elevenLabsConfig.voices[voiceType];
  const url = `${elevenLabsConfig.baseUrl}/text-to-speech/${voiceId}`;
  
  const payload = {
    text,
    voice_settings: {
      stability: options.stability || 0.5,
      similarity_boost: options.similarityBoost || 0.8
    }
  };

  const response = await axios({
    method: 'POST',
    url,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'xi-api-key': elevenLabsConfig.apiKey
    },
    data: payload,
    responseType: 'stream'
  });

  // Create audio directory if it doesn't exist
  const audioDir = path.join(__dirname, '../../public/audio');
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }

  // Generate unique filename
  const filename = `news-${voiceType}-${Date.now()}.mp3`;
  const filePath = path.join(audioDir, filename);

  // Save the audio file
  const writer = fs.createWriteStream(filePath);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', () => {
      console.log(`✅ Audio saved as ${filename}`);
      resolve(filename);
    });
    writer.on('error', reject);
  });
}

async function synthesizeWithGoogleTTS(
  text: string, 
  voiceType: VoiceType,
  options: TTSOptions
): Promise<string> {
  if (!GOOGLE_TTS_KEY) {
    throw new Error('Google TTS API key not configured');
  }

  const voiceGender = voiceType === 'male' ? 'MALE' : 
                     voiceType === 'female' ? 'FEMALE' : 'NEUTRAL';

  const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_KEY}`;
  
  const payload = {
    input: { text },
    voice: {
      languageCode: 'en-US',
      ssmlGender: voiceGender
    },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: options.speed || 1.0
    }
  };

  const response = await axios.post(url, payload);
  
  // Create audio directory if it doesn't exist
  const audioDir = path.join(__dirname, '../../public/audio');
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }

  // Generate unique filename
  const filename = `news-google-${voiceType}-${Date.now()}.mp3`;
  const filePath = path.join(audioDir, filename);

  // Decode base64 audio and save
  const audioBuffer = Buffer.from(response.data.audioContent, 'base64');
  fs.writeFileSync(filePath, audioBuffer);

  console.log(`✅ Google TTS audio saved as ${filename}`);
  return filename;
}

async function createMockAudio(text: string, voiceType: VoiceType): Promise<string> {
  // Create audio directory if it doesn't exist
  const audioDir = path.join(__dirname, '../../public/audio');
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }

  // Generate unique filename
  const filename = `mock-news-${voiceType}-${Date.now()}.txt`;
  const filePath = path.join(audioDir, filename);

  // Create a mock audio metadata file instead of actual audio
  const mockAudioData = {
    type: 'mock-audio',
    voiceType,
    text: text.substring(0, 200) + '...',
    duration: Math.floor(text.length / 10), // Rough estimate: 10 chars per second
    timestamp: new Date().toISOString(),
    message: 'This is a demo audio file. Set ELEVENLABS_API_KEY or GOOGLE_TTS_API_KEY for real audio generation.'
  };

  fs.writeFileSync(filePath, JSON.stringify(mockAudioData, null, 2));
  
  console.log(`🎭 Mock audio metadata saved as ${filename}`);
  return filename;
}

export default { synthesizeSpeech };

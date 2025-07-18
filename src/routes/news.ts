import express from 'express';
import { generateAudioNews } from '../services/newsScraper.js';
import { NEWS_CATEGORIES, getCategoryById } from '../services/newsCategories.js';
import { generateNewsOfTheHour } from '../services/newsOfTheHour.js';
import { VoiceType } from '../services/tts.js';

const router = express.Router();

// Get all available news categories
router.get('/categories', (req, res) => {
  try {
    const categories = NEWS_CATEGORIES.map(cat => ({
      id: cat.id,
      name: cat.name,
      description: cat.description
    }));
    
    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
});

// Test PDF processing endpoint
router.get('/test-pdf', async (req, res) => {
  try {
    console.log('🧪 PDF Processing Test request received');
    
    const filename = req.query.filename as string || 'The Economist USA 07.12.2025_freemagazines.top.pdf';
    
    const { PDFProcessor } = await import('../services/pdfProcessor.js');
    const pdfProcessor = new PDFProcessor();
    
    console.log(`📖 Testing PDF processing for: ${filename}`);
    const pdfAnalysis = await pdfProcessor.processPDFMagazine(filename);
    
    res.json({
      success: true,
      analysis: {
        totalArticles: pdfAnalysis.articles.length,
        totalWords: pdfAnalysis.totalWords,
        sourcePublication: pdfAnalysis.sourcePublication,
        extractedAt: pdfAnalysis.extractedAt,
        articles: pdfAnalysis.articles.map(article => ({
          title: article.title,
          category: article.category,
          contentLength: article.content.length
        }))
      }
    });
  } catch (error) {
    console.error('Error testing PDF processing:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process PDF'
    });
  }
});

// Generate news for specific category
router.get('/:category', async (req, res) => {
  try {
    const categoryId = req.params.category;
    const voiceType = req.query.voice as string || 'female';
    
    // Validate category
    const category = getCategoryById(categoryId);
    if (!category) {
      return res.status(400).json({
        success: false,
        error: `Invalid category: ${categoryId}. Available categories: ${NEWS_CATEGORIES.map(c => c.id).join(', ')}`
      });
    }

    console.log(`📡 ${category.name} news request received`);
    
    const newsData = await generateAudioNews(false, categoryId, voiceType as 'male' | 'female' | 'neutral');
    
    res.json({
      success: true,
      category: category.name,
      voiceType,
      ...newsData
    });
  } catch (error) {
    console.error('Error generating news:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate news'
    });
  }
});

// Generate audio for specific category
router.get('/:category/audio', async (req, res) => {
  try {
    const categoryId = req.params.category;
    const voiceType = req.query.voice as string || 'female';
    
    // Validate category
    const category = getCategoryById(categoryId);
    if (!category) {
      return res.status(400).json({
        success: false,
        error: `Invalid category: ${categoryId}`
      });
    }

    console.log(`🔊 ${category.name} audio news request received`);
    
    const newsData = await generateAudioNews(true, categoryId, voiceType as 'male' | 'female' | 'neutral');
    
    if (newsData.audioUrl) {
      // Redirect to the audio file
      res.redirect(newsData.audioUrl);
    } else {
      res.json({
        success: true,
        category: category.name,
        message: 'Audio generation currently unavailable',
        script: newsData.script
      });
    }
  } catch (error) {
    console.error('Error generating audio news:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate audio news'
    });
  }
});

// Generate comprehensive "News of the Hour" with all segments
router.get('/hourly/comprehensive', async (req, res) => {
  try {
    console.log('🎙️ Comprehensive News of the Hour request received');
    
    const voiceType = (req.query.voice as VoiceType) || 'neutral';
    
    // Validate voice type
    if (!['male', 'female', 'neutral'].includes(voiceType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid voice type. Use: male, female, or neutral'
      });
    }
    
    console.log(`📰 Generating comprehensive news with ${voiceType} voice...`);
    
    const newsOfTheHour = await generateNewsOfTheHour({}, voiceType);
    
    res.json({
      success: true,
      type: 'news-of-the-hour',
      voiceType,
      totalStories: newsOfTheHour.segments.length,
      estimatedDuration: newsOfTheHour.totalDuration,
      audioFile: newsOfTheHour.audioFile,
      segments: newsOfTheHour.segments,
      timestamp: new Date().toISOString()
    });
    
    console.log(`✅ News of the Hour generated: ${newsOfTheHour.segments.length} stories`);
  } catch (error) {
    console.error('Error generating News of the Hour:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate comprehensive news'
    });
  }
});

// Generate audio-only comprehensive news
router.get('/hourly/comprehensive/audio', async (req, res) => {
  try {
    console.log('🔊 Comprehensive News of the Hour audio request received');
    
    const voiceType = (req.query.voice as VoiceType) || 'neutral';
    
    // Validate voice type
    if (!['male', 'female', 'neutral'].includes(voiceType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid voice type. Use: male, female, or neutral'
      });
    }
    
    const newsOfTheHour = await generateNewsOfTheHour({}, voiceType);
    
    // Redirect to the audio file
    res.redirect(`/audio/${newsOfTheHour.audioFile}`);
    
    console.log(`✅ Comprehensive audio news generated: ${newsOfTheHour.totalDuration} duration`);
  } catch (error) {
    console.error('Error generating comprehensive audio news:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate comprehensive audio news'
    });
  }
});

// Generate PDF-enhanced comprehensive "News of the Hour" with magazine integration
router.get('/hourly/comprehensive-plus', async (req, res) => {
  try {
    console.log('🎙️ PDF-Enhanced Comprehensive News of the Hour request received');
    
    const voiceType = (req.query.voice as VoiceType) || 'neutral';
    
    // Validate voice type
    if (!['male', 'female', 'neutral'].includes(voiceType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid voice type. Use: male, female, or neutral'
      });
    }
    
    console.log(`📰 Generating PDF-enhanced comprehensive news with ${voiceType} voice...`);
    
    // Enhanced configuration with PDF integration
    const enhancedConfig = {
      includePDFSources: true,
      pdfFilename: 'The Economist USA 07.12.2025_freemagazines.top.pdf'
    };
    
    const newsOfTheHour = await generateNewsOfTheHour(enhancedConfig, voiceType);
    
    res.json({
      success: true,
      type: 'pdf-enhanced-news-of-the-hour',
      voiceType,
      totalStories: newsOfTheHour.segments.length,
      estimatedDuration: newsOfTheHour.totalDuration,
      audioFile: newsOfTheHour.audioFile,
      segments: newsOfTheHour.segments,
      hasPDFContent: true,
      sourcePublication: 'The Economist',
      timestamp: new Date().toISOString()
    });
    
    console.log(`✅ PDF-Enhanced News of the Hour generated: ${newsOfTheHour.segments.length} stories`);
  } catch (error) {
    console.error('Error generating PDF-Enhanced News of the Hour:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate comprehensive news with PDF integration'
    });
  }
});

// Generate audio-only PDF-enhanced comprehensive news
router.get('/hourly/comprehensive-plus/audio', async (req, res) => {
  try {
    console.log('🔊 PDF-Enhanced Comprehensive News of the Hour audio request received');
    
    const voiceType = (req.query.voice as VoiceType) || 'neutral';
    
    // Validate voice type
    if (!['male', 'female', 'neutral'].includes(voiceType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid voice type. Use: male, female, or neutral'
      });
    }
    
    const enhancedConfig = {
      includePDFSources: true,
      pdfFilename: 'The Economist USA 07.12.2025_freemagazines.top.pdf'
    };
    
    const newsOfTheHour = await generateNewsOfTheHour(enhancedConfig, voiceType);
    
    // Redirect to the audio file
    res.redirect(`/audio/${newsOfTheHour.audioFile}`);
    
    console.log(`✅ PDF-Enhanced comprehensive audio news generated: ${newsOfTheHour.totalDuration} duration`);
  } catch (error) {
    console.error('Error generating PDF-enhanced comprehensive audio news:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate PDF-enhanced comprehensive audio news'
    });
  }
});

export default router;

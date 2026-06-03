// frontend/src/modules/services/browserAIService.js
// Complete AI analysis that runs in browser using Transformers.js

class BrowserAIService {
  static modelsLoaded = false;
  static sentimentPipeline = null;
  static zeroShotPipeline = null;
  
  static async initialize() {
    if (this.modelsLoaded) return true;
    
    return new Promise(async (resolve) => {
      try {
        if (typeof window.transformers === 'undefined') {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.5.0/dist/transformers.min.js';
          script.onload = async () => {
            await this.loadModels();
            resolve(true);
          };
          document.head.appendChild(script);
        } else {
          await this.loadModels();
          resolve(true);
        }
      } catch (error) {
        console.error('[AI] Failed to initialize:', error);
        resolve(false);
      }
    });
  }
  
  static async loadModels() {
    try {
      const { pipeline } = window.transformers;
      
      this.sentimentPipeline = await pipeline(
        'sentiment-analysis',
        'Xenova/distilbert-base-uncased-finetuned-sst-2-english'
      );
      
      this.zeroShotPipeline = await pipeline(
        'zero-shot-classification',
        'Xenova/nli-deberta-v3-small'
      );
      
      this.modelsLoaded = true;
      console.log('[AI] Models loaded');
    } catch (error) {
      console.error('[AI] Model loading failed:', error);
    }
  }
  
  static async analyzeIntroVideo(transcript, duration, jobTitle, candidateName) {
    await this.initialize();
    
    if (!transcript || transcript.trim().length < 10) {
      return this.getEmptyAnalysis();
    }
    
    const words = transcript.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const speakingRate = duration > 0 ? Math.round((wordCount / duration) * 60) : 0;
    
    // 1. Sentiment Analysis
    let sentiment = { label: 'neutral', score: 0.5 };
    if (this.sentimentPipeline) {
      try {
        const result = await this.sentimentPipeline(transcript.slice(0, 512));
        sentiment = result[0];
      } catch (e) {}
    }
    
    // 2. Relevance Analysis
    let relevanceScore = 50;
    if (this.zeroShotPipeline && jobTitle) {
      try {
        const result = await this.zeroShotPipeline(transcript.slice(0, 512), [
          `relevant to ${jobTitle}`,
          'technical skills',
          'professional experience',
          'irrelevant'
        ]);
        relevanceScore = Math.round(result.scores[0] * 100);
      } catch (e) {}
    }
    
    // 3. Filler word detection
    const fillerWords = ['um', 'uh', 'ah', 'like', 'you know', 'actually', 'basically', 'literally', 'so', 'well'];
    let fillerCount = 0;
    const lowerText = transcript.toLowerCase();
    fillerWords.forEach(filler => {
      const regex = new RegExp(`\\b${filler}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) fillerCount += matches.length;
    });
    
    // 4. Technical keyword extraction
    const technicalTerms = [
      'javascript', 'react', 'angular', 'vue', 'node', 'python', 'java',
      'database', 'sql', 'mongodb', 'api', 'rest', 'graphql', 'aws',
      'docker', 'kubernetes', 'agile', 'scrum', 'frontend', 'backend'
    ];
    const technicalKeywords = technicalTerms.filter(term => lowerText.includes(term));
    
    // 5. Grammar issues detection
    const grammarIssues = [];
    if (/\b(he don't|she don't|they doesn't|we was)\b/i.test(transcript)) {
      grammarIssues.push('Subject-verb agreement');
    }
    if (/\b(have went|has went)\b/i.test(transcript)) {
      grammarIssues.push('Incorrect verb form');
    }
    
    // 6. Calculate scores
    const communicationScore = Math.min(100, Math.max(0,
      70 - (fillerCount > 10 ? 20 : fillerCount > 5 ? 10 : 0) +
      (wordCount > 100 ? 10 : wordCount < 30 ? -20 : 0)
    ));
    
    const confidenceScore = Math.min(100, Math.max(0,
      65 + (speakingRate >= 100 && speakingRate <= 160 ? 15 : speakingRate > 0 ? -10 : 0) +
      (fillerCount < 3 ? 10 : fillerCount > 10 ? -15 : 0)
    ));
    
    const professionalismScore = Math.min(100, Math.max(0,
      60 + (technicalKeywords.length * 5) +
      (transcript.toLowerCase().includes('professional') ? 10 : 0) +
      (transcript.toLowerCase().includes('experience') ? 10 : 0)
    ));
    
    const overallScore = Math.round(
      communicationScore * 0.35 +
      confidenceScore * 0.25 +
      professionalismScore * 0.25 +
      relevanceScore * 0.15
    );
    
    // 7. Generate insights
    const keyStrengths = [];
    if (technicalKeywords.length >= 2) keyStrengths.push(`Knowledge of ${technicalKeywords.slice(0, 2).join(', ')}`);
    if (communicationScore >= 70) keyStrengths.push('Good communication skills');
    if (confidenceScore >= 70) keyStrengths.push('Confident delivery');
    if (wordCount >= 80) keyStrengths.push('Comprehensive response');
    
    const areasToImprove = [];
    if (fillerCount > 5) areasToImprove.push(`Reduce filler words (${fillerCount} detected)`);
    if (speakingRate < 80 && speakingRate > 0) areasToImprove.push('Speak slightly faster');
    if (speakingRate > 180) areasToImprove.push('Slow down for clarity');
    if (grammarIssues.length > 0) areasToImprove.push(`Improve grammar: ${grammarIssues[0]}`);
    if (wordCount < 50) areasToImprove.push('Provide more detailed answers');
    
    const redFlags = [];
    if (fillerCount > 15) redFlags.push('Excessive filler words');
    if (grammarIssues.length >= 2) redFlags.push('Multiple grammar issues');
    if (overallScore < 40) redFlags.push('Communication below standard');
    
    const hrInsight = overallScore >= 80 
      ? `Strong candidate with excellent communication. ${technicalKeywords.length > 0 ? `Demonstrates knowledge of ${technicalKeywords.slice(0, 3).join(', ')}. ` : ''}Recommended for next round.`
      : overallScore >= 60
      ? `Satisfactory performance. ${communicationScore >= 70 ? 'Good communication. ' : 'Communication needs improvement. '}${fillerCount > 5 ? `Filler words (${fillerCount}) should be reduced. ` : ''}Consider for further assessment.`
      : `Below expectations. ${areasToImprove.slice(0, 2).join('. ')}. May not meet role requirements.`;
    
    const recommendation = overallScore >= 85 ? 'strong_hire' :
                          overallScore >= 75 ? 'hire' :
                          overallScore >= 60 ? 'maybe' :
                          overallScore >= 45 ? 'no_hire' : 'strong_no_hire';
    
    const speakingPace = speakingRate === 0 ? 'unknown' :
                         speakingRate < 100 ? 'too_slow' :
                         speakingRate > 165 ? 'too_fast' : 'good';
    
    return {
      overallScore,
      sentiment: sentiment.label,
      sentimentScore: Math.round(sentiment.score * 100),
      communicationScore,
      clarityScore: communicationScore,
      confidenceScore,
      professionalismScore,
      relevanceScore,
      speakingRate,
      wordCount,
      fillerWordCount: fillerCount,
      technicalKeywords: technicalKeywords.slice(0, 8),
      keyStrengths: keyStrengths.slice(0, 4),
      areasToImprove: areasToImprove.slice(0, 4),
      redFlags: redFlags.slice(0, 3),
      hrInsight,
      recommendation,
      confidence: Math.min(95, 50 + Math.floor(wordCount / 10)),
      speakingPaceAssessment: speakingPace,
      grammarIssues,
      analyzer: 'Transformers.js',
      analyzedAt: new Date().toISOString()
    };
  }
  
  static getEmptyAnalysis() {
    return {
      overallScore: 0,
      sentiment: 'neutral',
      sentimentScore: 0,
      communicationScore: 0,
      clarityScore: 0,
      confidenceScore: 0,
      professionalismScore: 0,
      relevanceScore: 0,
      speakingRate: 0,
      wordCount: 0,
      fillerWordCount: 0,
      technicalKeywords: [],
      keyStrengths: [],
      areasToImprove: ['Please record a video introduction'],
      redFlags: ['No speech detected'],
      hrInsight: 'No speech detected. Candidate did not provide an introduction.',
      recommendation: 'no_hire',
      confidence: 0,
      speakingPaceAssessment: 'unknown',
      grammarIssues: [],
      analyzer: 'Transformers.js'
    };
  }
}

export default BrowserAIService;
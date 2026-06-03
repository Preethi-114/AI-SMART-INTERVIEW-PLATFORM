// backend/services/introVideoAnalysisService.js
// Simple but effective analysis - no heavy dependencies

class IntroVideoAnalysisService {
  
  static async analyze(transcript, actualDuration, jobTitle, candidateName) {
    console.log('[IntroVideoAI] Starting analysis...');
    console.log(`[IntroVideoAI] Actual Duration: ${actualDuration} seconds`);
    console.log(`[IntroVideoAI] Transcript: "${transcript?.substring(0, 100)}..."`);
    
    if (!transcript || transcript.trim().length === 0) {
      return this.getEmptyAnalysis(actualDuration);
    }
    
    // Calculate basic metrics
    const words = transcript.trim().split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const speakingRate = actualDuration > 0 ? Math.round((wordCount / actualDuration) * 60) : 0;
    
    console.log(`[IntroVideoAI] Words: ${wordCount}, Speaking Rate: ${speakingRate} wpm`);
    
    // 1. Simple sentiment analysis (keyword-based)
    const lowerText = transcript.toLowerCase();
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'like', 'excited', 'passionate', 'strong', 'experience', 'skill', 'team', 'achieved'];
    const negativeWords = ['bad', 'poor', 'struggle', 'difficult', 'hard', 'issue', 'problem', 'sorry', 'unfortunately', 'lack', 'weak'];
    
    let positiveCount = positiveWords.filter(w => lowerText.includes(w)).length;
    let negativeCount = negativeWords.filter(w => lowerText.includes(w)).length;
    
    let sentiment = 'neutral';
    let sentimentScore = 50;
    if (positiveCount > negativeCount + 2) {
      sentiment = 'positive';
      sentimentScore = 75;
    } else if (negativeCount > positiveCount + 2) {
      sentiment = 'negative';
      sentimentScore = 35;
    }
    
    // 2. Relevance to job title
    let relevanceScore = 50;
    if (jobTitle) {
      const jobWords = jobTitle.toLowerCase().split(' ');
      let matches = 0;
      jobWords.forEach(word => {
        if (word.length > 2 && lowerText.includes(word)) matches++;
      });
      relevanceScore = Math.min(100, 50 + (matches * 15));
    }
    
    // 3. Filler word detection
    const fillerWords = ['um', 'uh', 'ah', 'like', 'you know', 'actually', 'basically', 'literally', 'so', 'well', 'right'];
    let fillerCount = 0;
    fillerWords.forEach(f => {
      const regex = new RegExp(`\\b${f}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) fillerCount += matches.length;
    });
    
    // 4. Technical keyword extraction
    const techTerms = [
      'javascript', 'react', 'angular', 'vue', 'node', 'python', 'java', 'c++', 'php',
      'database', 'sql', 'mongodb', 'postgresql', 'api', 'rest', 'graphql', 'aws',
      'azure', 'cloud', 'docker', 'kubernetes', 'devops', 'git', 'ci/cd', 'agile',
      'scrum', 'frontend', 'backend', 'fullstack', 'mobile', 'testing', 'typescript',
      'html', 'css', 'redux', 'nextjs', 'express', 'django', 'flask'
    ];
    const keywords = techTerms.filter(k => lowerText.includes(k));
    
    // 5. Grammar issues
    const grammarIssues = [];
    if (/\b(he don't|she don't|they doesn't|we was|I is)\b/i.test(transcript)) grammarIssues.push('Subject-verb agreement');
    if (/\b(have went|has went|had went)\b/i.test(transcript)) grammarIssues.push('Incorrect verb form');
    if (/\b(their|there|they're)\s+(?!\1)/i.test(transcript)) grammarIssues.push('Homophone confusion');
    
    // 6. Detect meaningless repetition
    const uniqueWords = [...new Set(words.map(w => w.toLowerCase()))];
    const isMeaninglessRepetition = uniqueWords.length === 1 && wordCount > 3;
    
    // 7. Calculate scores
    let communicationScore = 60;
    if (sentiment === 'positive') communicationScore += 15;
    if (relevanceScore > 70) communicationScore += 15;
    if (fillerCount < 3) communicationScore += 10;
    if (fillerCount > 8) communicationScore -= 15;
    communicationScore = Math.min(100, Math.max(0, communicationScore));
    
    let professionalismScore = 50;
    professionalismScore += keywords.length * 5;
    professionalismScore += (wordCount > 100 ? 20 : wordCount > 50 ? 10 : 0);
    professionalismScore -= grammarIssues.length * 10;
    professionalismScore -= fillerCount * 2;
    professionalismScore = Math.min(100, Math.max(0, professionalismScore));
    
    let overallScore = Math.round(
      communicationScore * 0.35 +
      professionalismScore * 0.35 +
      relevanceScore * 0.20 +
      sentimentScore * 0.10
    );
    
    // Penalize based on actual content
    if (isMeaninglessRepetition) {
      overallScore = Math.max(0, 10 - Math.floor(wordCount / 2));
    } else if (wordCount < 10) {
      overallScore = Math.max(0, overallScore - 40);
    } else if (wordCount < 20) {
      overallScore = Math.max(0, overallScore - 20);
    }
    
    // Speaking pace assessment
    let speakingPaceAssessment = 'unknown';
    if (speakingRate > 0) {
      if (speakingRate < 100) speakingPaceAssessment = 'too_slow';
      else if (speakingRate > 165) speakingPaceAssessment = 'too_fast';
      else speakingPaceAssessment = 'good';
    }
    
    // Generate strengths
    const strengths = [];
    if (keywords.length > 0) strengths.push(`Technical knowledge: ${keywords.slice(0, 3).join(', ')}`);
    if (sentiment === 'positive') strengths.push('Positive and enthusiastic tone');
    if (fillerCount < 3 && wordCount > 30) strengths.push('Excellent fluency with minimal filler words');
    if (wordCount > 150) strengths.push('Comprehensive and detailed responses');
    if (relevanceScore > 70) strengths.push('Highly relevant content for the role');
    if (speakingRate >= 100 && speakingRate <= 160) strengths.push(`Good speaking pace (${speakingRate} wpm)`);
    
    // Generate improvements
    const improvements = [];
    if (isMeaninglessRepetition) {
      improvements.push(`Provide meaningful content instead of repeating "${uniqueWords[0]}"`);
    }
    if (wordCount < 30) {
      improvements.push(`Provide more detailed answers (only ${wordCount} words in ${actualDuration}s)`);
    }
    if (fillerCount > 8) {
      improvements.push(`Reduce filler words (${fillerCount} detected)`);
    }
    if (keywords.length === 0 && wordCount > 20) {
      improvements.push('Include technical terminology relevant to the role');
    }
    if (grammarIssues.length > 0) {
      improvements.push(`Improve grammar: ${grammarIssues.slice(0, 2).join(', ')}`);
    }
    if (speakingRate < 100 && speakingRate > 0) {
      improvements.push(`Speak faster (currently ${speakingRate} wpm, target 120-150 wpm)`);
    }
    if (speakingRate > 165) {
      improvements.push(`Slow down (currently ${speakingRate} wpm, target 120-150 wpm)`);
    }
    
    // Generate red flags
    const redFlags = [];
    if (isMeaninglessRepetition) {
      redFlags.push(`Repeated meaningless content ("${uniqueWords[0]}")`);
    }
    if (wordCount < 15) {
      redFlags.push(`Very short response (${wordCount} words in ${actualDuration}s)`);
    }
    if (sentiment === 'negative') {
      redFlags.push('Negative tone detected');
    }
    if (speakingRate < 50 && wordCount > 20) {
      redFlags.push(`Extremely slow speaking rate (${speakingRate} wpm)`);
    }
    
    // Recommendation
    const recommendation = overallScore >= 85 ? 'strong_hire' :
                          overallScore >= 75 ? 'hire' :
                          overallScore >= 60 ? 'maybe' :
                          overallScore >= 45 ? 'no_hire' : 'strong_no_hire';
    
    // HR Insight
    let hrInsight = '';
    if (overallScore >= 85) {
      hrInsight = `✅ EXCELLENT! Score: ${overallScore}%. ${strengths.slice(0, 2).join('. ')}. Strongly recommended for next round.`;
    } else if (overallScore >= 70) {
      hrInsight = `👍 GOOD! Score: ${overallScore}%. ${strengths[0] || 'Good communication'}. ${improvements.length > 0 ? `Improve: ${improvements[0]}` : ''}`;
    } else if (overallScore >= 55) {
      hrInsight = `📊 SATISFACTORY. Score: ${overallScore}%. Needs improvement in ${improvements.slice(0, 2).join(' and ')}. Consider for further assessment.`;
    } else if (overallScore >= 40) {
      hrInsight = `⚠️ NEEDS IMPROVEMENT. Score: ${overallScore}%. ${improvements.slice(0, 2).join('. ')}. May not meet requirements.`;
    } else {
      hrInsight = `❌ BELOW EXPECTATIONS. Score: ${overallScore}%. ${redFlags.slice(0, 2).join('. ')}. Not recommended.`;
    }
    
    console.log(`[IntroVideoAI] Final Score: ${overallScore}%`);
    
    return {
      overallScore,
      sentiment,
      sentimentScore,
      communicationScore,
      clarityScore: communicationScore,
      confidenceScore: communicationScore,
      professionalismScore,
      relevanceScore,
      speakingRate,
      wordCount,
      fillerWordCount: fillerCount,
      technicalKeywords: keywords,
      keyStrengths: strengths.slice(0, 5),
      areasToImprove: improvements.slice(0, 5),
      redFlags: redFlags.slice(0, 3),
      hrInsight,
      recommendation,
      confidence: Math.min(95, 50 + Math.floor(wordCount / 10)),
      speakingPaceAssessment,
      grammarIssues,
      analyzer: 'IntroVideoAI (Smart Analysis)',
      analyzedAt: new Date().toISOString(),
      metadata: {
        durationSeconds: actualDuration,
        wordsPerMinute: speakingRate,
        isMeaninglessRepetition,
        uniqueWordsCount: uniqueWords.length
      }
    };
  }
  
  static getEmptyAnalysis(duration = 0) {
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
      hrInsight: `No speech detected in ${duration} seconds. Candidate did not provide an introduction.`,
      recommendation: 'strong_no_hire',
      confidence: 0,
      speakingPaceAssessment: 'unknown',
      grammarIssues: [],
      analyzer: 'IntroVideoAI',
      analyzedAt: new Date().toISOString(),
      metadata: {
        durationSeconds: duration,
        wordsPerMinute: 0,
        isMeaninglessRepetition: false,
        uniqueWordsCount: 0
      }
    };
  }
}

module.exports = IntroVideoAnalysisService;
// services/freeAIAnalysisService.js
// Completely free - rule-based analysis, no API keys needed

class FreeAIAnalysisService {
  
  // Analyze intro transcript with comprehensive scoring
  static analyzeIntroTranscript(transcript, duration = 0, jobTitle = '') {
    if (!transcript || transcript.trim().length === 0) {
      return {
        sentiment: 'neutral',
        sentimentScore: 0,
        hrInsight: 'No speech detected. Candidate did not provide an introduction.',
        keyStrengths: [],
        areasToImprove: ['Please record a video introduction'],
        redFlags: ['Missing introduction'],
        technicalKeywords: [],
        communicationRating: 0,
        professionalismRating: 0,
        recommendationNote: 'Unable to assess - no introduction provided',
        overallScore: 0,
        confidence: 0
      };
    }

    const words = transcript.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const speakingRate = duration > 0 ? Math.round((wordCount / duration) * 60) : 0;
    
    // Sentiment analysis using keyword matching
    const positiveWords = ['excited', 'passionate', 'love', 'great', 'excellent', 'amazing', 'enthusiastic', 'motivated', 'eager', 'interested'];
    const negativeWords = ['unfortunately', 'struggle', 'difficult', 'hard', 'challenge', 'issue', 'problem', 'fail', 'weak', 'lack'];
    
    let positiveCount = 0, negativeCount = 0;
    const lowerTranscript = transcript.toLowerCase();
    
    positiveWords.forEach(word => {
      const matches = (lowerTranscript.match(new RegExp(`\\b${word}\\b`, 'g')) || []).length;
      positiveCount += matches;
    });
    
    negativeWords.forEach(word => {
      const matches = (lowerTranscript.match(new RegExp(`\\b${word}\\b`, 'g')) || []).length;
      negativeCount += matches;
    });
    
    const sentimentScore = Math.min(100, Math.max(0, 50 + (positiveCount - negativeCount) * 5));
    const sentiment = sentimentScore >= 70 ? 'positive' : sentimentScore >= 40 ? 'neutral' : 'negative';
    
    // Extract technical keywords
    const technicalKeywords = [];
    const techTerms = [
      'javascript', 'python', 'java', 'react', 'angular', 'vue', 'node', 'express',
      'database', 'sql', 'mongodb', 'api', 'rest', 'graphql', 'cloud', 'aws',
      'devops', 'docker', 'kubernetes', 'agile', 'scrum', 'leadership', 'management',
      'frontend', 'backend', 'fullstack', 'mobile', 'ios', 'android', 'testing'
    ];
    
    techTerms.forEach(term => {
      if (lowerTranscript.includes(term)) {
        technicalKeywords.push(term);
      }
    });
    
    // Communication metrics
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = sentences.length > 0 ? words.length / sentences.length : 0;
    
    const fillerWords = ['um', 'uh', 'ah', 'like', 'you know', 'actually', 'basically', 'literally'];
    let fillerCount = 0;
    fillerWords.forEach(filler => {
      const matches = (lowerTranscript.match(new RegExp(`\\b${filler}\\b`, 'g')) || []).length;
      fillerCount += matches;
    });
    
    const fillerRatio = wordCount > 0 ? (fillerCount / wordCount) * 100 : 100;
    
    // Communication rating
    let communicationRating = 70;
    if (fillerRatio > 10) communicationRating -= 20;
    if (fillerRatio > 20) communicationRating -= 15;
    if (speakingRate > 0 && (speakingRate < 80 || speakingRate > 200)) communicationRating -= 10;
    if (wordCount < 30) communicationRating -= 15;
    if (sentences.length < 3) communicationRating -= 10;
    communicationRating = Math.min(100, Math.max(0, communicationRating));
    
    // Professionalism rating
    let professionalismRating = 75;
    const professionalismKeywords = ['professional', 'experience', 'skills', 'team', 'collaboration', 'communication', 'leadership'];
    let profMatches = 0;
    professionalismKeywords.forEach(kw => {
      if (lowerTranscript.includes(kw)) profMatches++;
    });
    professionalismRating += Math.min(15, profMatches * 3);
    
    if (negativeCount > positiveCount) professionalismRating -= 15;
    if (technicalKeywords.length === 0) professionalismRating -= 10;
    professionalismRating = Math.min(100, Math.max(0, professionalismRating));
    
    // Overall score
    const overallScore = Math.round(
      communicationRating * 0.4 +
      professionalismRating * 0.3 +
      sentimentScore * 0.2 +
      (technicalKeywords.length > 0 ? Math.min(30, technicalKeywords.length * 5) : 0)
    );
    
    // Generate strengths and improvements
    const keyStrengths = [];
    const areasToImprove = [];
    const redFlags = [];
    
    if (wordCount >= 100) keyStrengths.push('Comprehensive and detailed introduction');
    else if (wordCount < 50) areasToImprove.push('Provide more detailed answers');
    
    if (fillerRatio < 5) keyStrengths.push('Excellent fluency with minimal filler words');
    else if (fillerRatio > 15) areasToImprove.push(`Reduce filler words (${fillerCount} detected)`);
    
    if (speakingRate >= 100 && speakingRate <= 160) keyStrengths.push('Good speaking pace');
    else if (speakingRate > 0) areasToImprove.push('Adjust speaking pace for better clarity');
    
    if (technicalKeywords.length >= 3) keyStrengths.push(`Demonstrates knowledge of ${technicalKeywords.slice(0, 3).join(', ')}`);
    else if (technicalKeywords.length === 0) areasToImprove.push('Include more technical terminology relevant to the role');
    
    if (sentiment === 'positive') keyStrengths.push('Shows enthusiasm and positive attitude');
    else if (sentiment === 'negative') redFlags.push('Negative tone detected');
    
    if (professionalismRating < 60) redFlags.push('Professionalism concerns in communication');
    
    // HR Insight
    let hrInsight = '';
    if (overallScore >= 80) {
      hrInsight = `Strong introduction. ${keyStrengths.slice(0, 2).join('. ')}. Candidate demonstrates good communication skills and relevant knowledge.`;
    } else if (overallScore >= 60) {
      hrInsight = `Satisfactory introduction. ${keyStrengths.length > 0 ? keyStrengths[0] + '. ' : ''}${areasToImprove.length > 0 ? 'Areas to improve: ' + areasToImprove[0] : ''}`;
    } else {
      hrInsight = `Introduction needs improvement. ${areasToImprove.slice(0, 2).join('. ')}. Consider providing more structured and detailed responses.`;
    }
    
    // Recommendation note
    let recommendationNote = '';
    if (overallScore >= 80) recommendationNote = 'Strong candidate - proceed to next rounds';
    else if (overallScore >= 60) recommendationNote = 'Satisfactory - consider for further assessment';
    else if (overallScore >= 40) recommendationNote = 'Borderline - review other sections before decision';
    else recommendationNote = 'Concerns - may not meet communication requirements';
    
    return {
      sentiment,
      sentimentScore: Math.round(sentimentScore),
      hrInsight,
      keyStrengths: keyStrengths.slice(0, 5),
      areasToImprove: areasToImprove.slice(0, 4),
      redFlags: redFlags.slice(0, 3),
      technicalKeywords: technicalKeywords.slice(0, 8),
      communicationRating,
      professionalismRating,
      recommendationNote,
      overallScore,
      confidence: Math.min(95, 50 + (wordCount / 10)),
      wordCount,
      speakingRate,
      fillerCount,
      fillerRatio: Math.round(fillerRatio * 10) / 10,
      sentenceCount: sentences.length,
      avgSentenceLength: Math.round(avgSentenceLength * 10) / 10
    };
  }
  
  // Analyze coding solution
  static analyzeCodingSolution(code, language, problemStatement = '', testResults = {}) {
    if (!code || code.trim().length === 0) {
      return {
        overallScore: 0,
        codeQuality: 0,
        efficiency: 0,
        correctness: 0,
        bestPractices: 0,
        readability: 0,
        feedback: 'No code submitted for analysis',
        timeComplexity: 'Unknown',
        spaceComplexity: 'Unknown',
        strengths: [],
        improvements: ['Write your solution first'],
        bugs: [],
        codeSmells: [],
        alternativeApproach: null
      };
    }
    
    const lines = code.split('\n').filter(l => l.trim().length > 0);
    const lineCount = lines.length;
    const codeLength = code.length;
    
    // Detect code smells
    const codeSmells = [];
    if (code.includes('console.log') && code.match(/console\.log/g).length > 3) {
      codeSmells.push('Excessive console.log statements');
    }
    if (code.includes('debugger')) codeSmells.push('Contains debugger statements');
    if (code.includes('eval(')) codeSmells.push('Uses eval() - security risk');
    if (code.includes('var ')) codeSmells.push('Uses var instead of let/const');
    if (codeLength > 500) codeSmells.push('Very long function - consider breaking down');
    
    // Detect potential bugs
    const bugs = [];
    if (code.includes('==') && !code.includes('===')) bugs.push('Uses loose equality (==) instead of strict (===)');
    if (code.includes(';') && code.match(/;[^\]})]/g) && code.match(/;[^\]})]/g).length > 10) bugs.push('Potential missing semicolon issues');
    if (code.includes('undefined')) bugs.push('Uses undefined directly - potential null reference');
    
    // Check for comments
    const commentCount = (code.match(/\/\/|\/\*/g) || []).length;
    const hasComments = commentCount > 0;
    
    // Check for proper indentation
    const linesWithIndent = lines.filter(l => l.startsWith('  ') || l.startsWith('\t'));
    const indentationRatio = lines.length > 0 ? linesWithIndent.length / lines.length : 0;
    
    // Calculate readability score
    let readability = 70;
    if (hasComments) readability += 10;
    if (indentationRatio > 0.5) readability += 10;
    if (codeLength > 300) readability -= 10;
    if (lines.length > 30) readability -= 10;
    readability = Math.min(100, Math.max(0, readability));
    
    // Calculate code quality score
    let codeQuality = 65;
    if (hasComments) codeQuality += 10;
    if (codeSmells.length === 0) codeQuality += 15;
    if (codeSmells.length > 2) codeQuality -= 10;
    if (indentationRatio > 0.7) codeQuality += 10;
    codeQuality = Math.min(100, Math.max(0, codeQuality));
    
    // Calculate correctness based on test results
    let correctness = 50;
    if (testResults.passed !== undefined && testResults.total > 0) {
      correctness = Math.round((testResults.passed / testResults.total) * 100);
    } else {
      // Basic heuristic for correct-looking code
      if (code.includes('return')) correctness += 20;
      if (code.match(/function|const|let/g)) correctness += 10;
    }
    
    // Calculate efficiency (heuristic)
    let efficiency = 65;
    const complexityKeywords = ['for', 'while', 'map', 'filter', 'reduce'];
    let complexityCount = 0;
    complexityKeywords.forEach(kw => {
      if (code.match(new RegExp(kw, 'g'))) complexityCount++;
    });
    if (complexityCount > 3) efficiency -= 10;
    if (code.includes('O(n)') || code.includes('O(log)')) efficiency += 10;
    efficiency = Math.min(100, Math.max(0, efficiency));
    
    // Best practices
    let bestPractices = 60;
    if (!codeSmells.includes('Uses var instead of let/const')) bestPractices += 15;
    if (hasComments) bestPractices += 10;
    if (code.includes('const') || code.includes('let')) bestPractices += 10;
    if (code.includes('try') && code.includes('catch')) bestPractices += 10;
    bestPractices = Math.min(100, Math.max(0, bestPractices));
    
    // Overall score
    const overallScore = Math.round(
      correctness * 0.35 +
      codeQuality * 0.20 +
      readability * 0.15 +
      efficiency * 0.15 +
      bestPractices * 0.15
    );
    
    // Generate feedback
    let feedback = '';
    if (correctness >= 80) {
      feedback = 'Good solution! The code correctly solves the problem. ';
    } else if (correctness >= 60) {
      feedback = 'Solution partially works but has some issues. ';
    } else {
      feedback = 'Solution needs significant improvement. ';
    }
    
    if (codeQuality >= 70) feedback += 'Code quality is good. ';
    else feedback += 'Consider improving code structure and organization. ';
    
    if (readability >= 70) feedback += 'Code is readable. ';
    else feedback += 'Add comments and improve formatting for better readability. ';
    
    // Strengths and improvements
    const strengths = [];
    const improvements = [];
    
    if (correctness >= 70) strengths.push('Correct implementation');
    else improvements.push('Review logic for correctness');
    
    if (codeQuality >= 70) strengths.push('Good code structure');
    else improvements.push('Improve code organization');
    
    if (hasComments) strengths.push('Includes helpful comments');
    else improvements.push('Add comments to explain complex logic');
    
    if (codeSmells.length === 0) strengths.push('Clean code with no major smells');
    else improvements.push(`Address code smells: ${codeSmells.slice(0, 2).join(', ')}`);
    
    // Complexity estimates
    let timeComplexity = 'O(n)';
    let spaceComplexity = 'O(n)';
    
    if (code.includes('for') && code.match(/for/g).length > 1) timeComplexity = 'O(n²)';
    if (code.includes('while') && code.includes('for')) timeComplexity = 'O(n²)';
    if (code.includes('sort(')) timeComplexity = 'O(n log n)';
    
    return {
      overallScore,
      codeQuality,
      efficiency,
      correctness,
      bestPractices,
      readability,
      feedback: feedback.trim(),
      timeComplexity,
      spaceComplexity,
      strengths: strengths.slice(0, 4),
      improvements: improvements.slice(0, 4),
      bugs: bugs.slice(0, 3),
      codeSmells: codeSmells.slice(0, 3),
      alternativeApproach: correctness < 70 ? 'Consider a more efficient algorithm or different approach' : null
    };
  }
  
  // Generate HR summary
  static generateHRSummary(reportData) {
    const {
      scores = {},
      intro = {},
      mcq = {},
      coding = {},
      proctoring = {},
      durationMinutes = 0
    } = reportData;
    
    const overallScore = scores.overall || 0;
    
    // Determine recommendation
    let recommendation = 'maybe';
    let verdict = 'Review Required';
    
    if (overallScore >= 85) {
      recommendation = 'strong_hire';
      verdict = 'Strong Hire';
    } else if (overallScore >= 75) {
      recommendation = 'hire';
      verdict = 'Hire';
    } else if (overallScore >= 60) {
      recommendation = 'maybe';
      verdict = 'Consider';
    } else if (overallScore >= 45) {
      recommendation = 'no_hire';
      verdict = 'No Hire';
    } else {
      recommendation = 'strong_no_hire';
      verdict = 'Strong No Hire';
    }
    
    // Adjust for proctoring
    const integrityScore = proctoring.integrityScore || 100;
    if (integrityScore < 70 && recommendation !== 'strong_no_hire') {
      recommendation = recommendation === 'strong_hire' ? 'hire' : 'no_hire';
      verdict += ' (Integrity Concern)';
    }
    
    // Confidence based on data completeness
    let confidence = 70;
    if (intro.transcript) confidence += 10;
    if (mcq.total > 0) confidence += 10;
    if (coding.score !== undefined) confidence += 10;
    confidence = Math.min(98, confidence);
    
    // Generate summary
    let summary = '';
    if (overallScore >= 80) {
      summary = `Candidate performed exceptionally well with an overall score of ${overallScore}%. `;
    } else if (overallScore >= 60) {
      summary = `Candidate demonstrated satisfactory performance with ${overallScore}% overall. `;
    } else {
      summary = `Candidate's performance was below expectations (${overallScore}% overall). `;
    }
    
    if (scores.intro >= 70) summary += 'Strong communication skills. ';
    else if (scores.intro < 50) summary += 'Communication skills need improvement. ';
    
    if (scores.mcq >= 70) summary += 'Good technical knowledge. ';
    else if (scores.mcq < 50) summary += 'Technical knowledge gaps identified. ';
    
    if (scores.coding >= 70) summary += 'Strong coding abilities demonstrated. ';
    else if (scores.coding < 50) summary += 'Coding skills need significant improvement. ';
    
    if (integrityScore < 80) summary += 'Integrity concerns detected during proctoring. ';
    
    // Strengths and concerns
    const strengths = [];
    const concerns = [];
    
    if (scores.intro >= 70) strengths.push('Strong communication and presentation');
    if (scores.mcq >= 70) strengths.push('Good technical knowledge base');
    if (scores.coding >= 70) strengths.push('Proficient coding skills');
    if (integrityScore >= 95) strengths.push('High integrity during assessment');
    
    if (scores.intro < 50) concerns.push('Weak communication skills');
    if (scores.mcq < 50) concerns.push('Knowledge gaps in technical areas');
    if (scores.coding < 50) concerns.push('Coding skills need improvement');
    if (integrityScore < 80) concerns.push('Integrity concerns during assessment');
    if (proctoring.tabSwitches > 3) concerns.push(`Multiple tab switches (${proctoring.tabSwitches}) detected`);
    
    // Suggested next steps
    const suggestedNextSteps = [];
    if (recommendation === 'strong_hire' || recommendation === 'hire') {
      suggestedNextSteps.push('Schedule technical interview with team lead');
      suggestedNextSteps.push('Proceed to offer discussion');
    } else if (recommendation === 'maybe') {
      suggestedNextSteps.push('Schedule follow-up interview to clarify concerns');
      suggestedNextSteps.push('Request additional work sample');
    } else {
      suggestedNextSteps.push('Reject application');
      suggestedNextSteps.push('Provide constructive feedback if appropriate');
    }
    
    // Salary band note
    let salaryBandNote = null;
    if (overallScore >= 85) {
      salaryBandNote = 'Top tier - consider above market rate';
    } else if (overallScore >= 75) {
      salaryBandNote = 'Mid-high range - competitive offer recommended';
    } else if (overallScore >= 60) {
      salaryBandNote = 'Mid range - standard offer';
    }
    
    // Fit score
    const fitScore = Math.round(
      (scores.communication || 0) * 0.25 +
      (scores.mcq || 0) * 0.35 +
      (scores.coding || 0) * 0.40
    );
    
    return {
      recommendation,
      verdict,
      confidence,
      summary: summary.trim(),
      strengths: strengths.slice(0, 5),
      concerns: concerns.slice(0, 5),
      suggestedNextSteps: suggestedNextSteps.slice(0, 3),
      salaryBandNote,
      fitScore: Math.min(100, Math.max(0, fitScore)),
      generatedAt: new Date().toISOString()
    };
  }
  
  // Validate code execution output
  static validateCodeOutput(output, expectedOutput) {
    if (!expectedOutput) return true;
    
    const normalizedOutput = output?.toString().trim().toLowerCase() || '';
    const normalizedExpected = expectedOutput.toString().trim().toLowerCase();
    
    // Exact match
    if (normalizedOutput === normalizedExpected) return true;
    
    // Numeric comparison
    const numOutput = parseFloat(normalizedOutput);
    const numExpected = parseFloat(normalizedExpected);
    if (!isNaN(numOutput) && !isNaN(numExpected) && numOutput === numExpected) return true;
    
    // Array comparison
    try {
      const outputArray = JSON.parse(normalizedOutput);
      const expectedArray = JSON.parse(normalizedExpected);
      if (JSON.stringify(outputArray) === JSON.stringify(expectedArray)) return true;
    } catch (e) {}
    
    return false;
  }
}

module.exports = FreeAIAnalysisService;
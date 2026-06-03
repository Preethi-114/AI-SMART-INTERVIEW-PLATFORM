// backend/services/codeAIAnalysisService.js
// AI analysis that compares code output with expected output

class CodeAIAnalysisService {
  
  /**
   * Analyze code by comparing output with expected output
   * @param {string} code - The submitted code
   * @param {string} language - Programming language
   * @param {string} problemStatement - The problem description
   * @param {string} expectedOutput - Expected output from the problem
   * @param {object} executionResult - Result from code execution
   * @returns {object} AI analysis with score based on output match
   */
  static async analyzeCode(code, language, problemStatement, expectedOutput, executionResult) {
    console.log('[CodeAI] Analyzing code by comparing output...');
    
    if (!code || code.trim().length === 0) {
      return this.getEmptyAnalysis('No code submitted');
    }
    
    // 1. Get actual output from execution
    const actualOutput = executionResult?.output || '';
    const executionSuccess = executionResult?.success || false;
    
    // 2. Compare outputs to determine score
    let score = 0;
    let matchesExpected = false;
    let comparisonDetails = '';
    
    if (expectedOutput && expectedOutput.trim() !== '') {
      // Normalize both outputs
      const normalizedActual = actualOutput.toLowerCase().trim();
      const normalizedExpected = expectedOutput.toLowerCase().trim();
      
      // Exact match
      if (normalizedActual === normalizedExpected) {
        score = 100;
        matchesExpected = true;
        comparisonDetails = 'Output matches expected result perfectly.';
      }
      // Numeric comparison
      else if (!isNaN(parseFloat(normalizedActual)) && !isNaN(parseFloat(normalizedExpected))) {
        if (parseFloat(normalizedActual) === parseFloat(normalizedExpected)) {
          score = 100;
          matchesExpected = true;
          comparisonDetails = 'Output matches expected result (numeric).';
        } else {
          score = 0;
          comparisonDetails = `Expected: ${expectedOutput}, Got: ${actualOutput}`;
        }
      }
      // Array/JSON comparison
      else {
        try {
          const actualJson = JSON.parse(normalizedActual);
          const expectedJson = JSON.parse(normalizedExpected);
          if (JSON.stringify(actualJson) === JSON.stringify(expectedJson)) {
            score = 100;
            matchesExpected = true;
            comparisonDetails = 'Output matches expected result (JSON).';
          } else {
            score = 0;
            comparisonDetails = `Expected: ${expectedOutput}, Got: ${actualOutput}`;
          }
        } catch (e) {
          // Not JSON, outputs don't match
          score = 0;
          comparisonDetails = `Expected: ${expectedOutput}, Got: ${actualOutput}`;
        }
      }
    } else if (executionSuccess) {
      // No expected output provided, just check if it runs
      score = 100;
      matchesExpected = true;
      comparisonDetails = 'Code executed successfully.';
    } else {
      score = 0;
      comparisonDetails = executionResult?.error || 'Code execution failed';
    }
    
    // 3. Generate feedback based on comparison
    let feedback = '';
    let strengths = [];
    let improvements = [];
    
    if (matchesExpected && score === 100) {
      feedback = `✅ CORRECT! Your code produces the expected output: "${actualOutput}". Great job!`;
      strengths.push('Code produces correct output');
      strengths.push('Solution works as expected');
    } else if (executionSuccess && !matchesExpected) {
      feedback = `⚠️ Your code runs but produces incorrect output.\nExpected: "${expectedOutput}"\nGot: "${actualOutput}"\n\nCheck your logic and try again.`;
      improvements.push('Fix the logic to produce correct output');
      improvements.push(`Expected output should be: ${expectedOutput}`);
    } else if (!executionSuccess) {
      feedback = `❌ Your code has errors and doesn't run properly.\nError: ${executionResult?.error || 'Unknown error'}\n\nFix the errors and try again.`;
      improvements.push('Fix syntax/runtime errors');
      improvements.push(executionResult?.error || 'Check your code for errors');
    }
    
    // 4. Additional code quality checks
    const lines = code.split('\n').filter(l => l.trim().length > 0);
    const lineCount = lines.length;
    const hasComments = code.includes('//') || code.includes('/*') || code.includes('#');
    const hasFunctions = code.includes('function') || code.includes('def ') || code.includes('=>');
    
    if (hasFunctions && score === 100) {
      strengths.push('Good use of functions');
    }
    if (hasComments && score === 100) {
      strengths.push('Includes helpful comments');
    }
    if (lineCount < 5 && score === 100) {
      strengths.push('Concise and efficient solution');
    }
    if (!hasComments && lineCount > 10) {
      improvements.push('Add comments to explain complex logic');
    }
    
    // 5. Time complexity suggestion
    let timeComplexity = 'O(n)';
    let spaceComplexity = 'O(n)';
    
    if (code.includes('for') && code.includes('for')) {
      timeComplexity = 'O(n²)';
      if (score === 100) {
        improvements.push('Consider optimizing nested loops for better performance');
      }
    }
    
    const overallScore = score;
    
    console.log(`[CodeAI] Analysis complete - Score: ${overallScore}% | Matches: ${matchesExpected}`);
    
    return {
      overallScore,
      codeQuality: matchesExpected ? 85 : executionSuccess ? 50 : 30,
      readability: hasComments ? 80 : 60,
      efficiency: matchesExpected ? 80 : 50,
      correctness: matchesExpected ? 100 : 0,
      bestPractices: hasFunctions ? 75 : 60,
      complexity: matchesExpected ? 70 : 50,
      feedback: feedback.trim(),
      timeComplexity,
      spaceComplexity,
      strengths: strengths.slice(0, 5),
      improvements: improvements.slice(0, 5),
      bugs: !executionSuccess ? [executionResult?.error || 'Execution error'] : [],
      codeSmells: [],
      alternativeApproach: !matchesExpected && executionSuccess ? 'Try a different approach to get the correct output' : null,
      metrics: {
        lineCount,
        hasComments,
        hasFunctions,
        actualOutput,
        expectedOutput,
        matchesExpected
      },
      analyzer: 'CodeAI (Output Comparison)',
      analyzedAt: new Date().toISOString()
    };
  }
  
  static getEmptyAnalysis(reason) {
    return {
      overallScore: 0,
      codeQuality: 0,
      readability: 0,
      efficiency: 0,
      correctness: 0,
      bestPractices: 0,
      complexity: 0,
      feedback: `Analysis unavailable: ${reason}`,
      timeComplexity: 'Unknown',
      spaceComplexity: 'Unknown',
      strengths: [],
      improvements: ['Please submit your code solution'],
      bugs: [],
      codeSmells: [],
      alternativeApproach: null,
      analyzer: 'CodeAI'
    };
  }
}

module.exports = CodeAIAnalysisService;
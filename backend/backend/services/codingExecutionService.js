// backend/services/codingExecutionService.js
// Optimized - Only uses verified working endpoints

const LANGUAGE_MAP = {
  javascript: { language: 'javascript', version: '18.15.0', name: 'JavaScript', file: 'solution.js' },
  js: { language: 'javascript', version: '18.15.0', name: 'JavaScript', file: 'solution.js' },
  python: { language: 'python', version: '3.10.0', name: 'Python', file: 'solution.py' },
  python3: { language: 'python', version: '3.10.0', name: 'Python', file: 'solution.py' },
  java: { language: 'java', version: '15.0.2', name: 'Java', file: 'Solution.java' },
  cpp: { language: 'c++', version: '10.2.0', name: 'C++', file: 'solution.cpp' },
  'c++': { language: 'c++', version: '10.2.0', name: 'C++', file: 'solution.cpp' },
  c: { language: 'c', version: '10.2.0', name: 'C', file: 'solution.c' },
  typescript: { language: 'typescript', version: '5.0.3', name: 'TypeScript', file: 'solution.ts' }
};

// Only the verified working endpoint
const WORKING_ENDPOINT = 'https://emkc.org/api/v2/piston/execute';

async function executeCode(code, language) {
  const runtime = LANGUAGE_MAP[language?.toLowerCase()];
  if (!runtime) {
    return {
      success: false,
      output: '',
      error: `Unsupported language: ${language}`,
      executionTime: 0
    };
  }

  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(WORKING_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: runtime.language,
        version: runtime.version,
        files: [{ name: runtime.file, content: code }],
        stdin: '',
        run_timeout: 8000
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // If main endpoint fails, try fallback
      return await fallbackExecution(code, language, startTime);
    }

    const data = await response.json();
    const executionTime = Date.now() - startTime;
    
    // Check for compilation error (Java, C++, C)
    if (data.compile && data.compile.code !== undefined && data.compile.code !== 0) {
      const errorMsg = (data.compile.stderr || data.compile.output || 'Compilation failed').trim();
      return {
        success: false,
        output: '',
        error: errorMsg,
        executionTime
      };
    }

    const run = data.run || {};
    const hasError = (run.code ?? 0) !== 0;
    const output = (run.stdout || '').trim();
    const error = hasError ? (run.stderr || `Process exited with code ${run.code}`).trim() : '';

    return {
      success: !hasError,
      output: output || (hasError ? '' : '✓ Code executed successfully'),
      error,
      executionTime
    };
    
  } catch (err) {
    // Network error - try fallback
    return await fallbackExecution(code, language, startTime);
  }
}

// Fallback: Local execution for JavaScript only
async function fallbackExecution(code, language, startTime) {
  const executionTime = Date.now() - startTime;
  
  // Only JavaScript can run locally
  if (language === 'javascript' || language === 'js') {
    try {
      const { exec } = require('child_process');
      const fs = require('fs');
      const path = require('path');
      
      const tempFile = path.join(__dirname, 'temp_' + Date.now() + '.js');
      fs.writeFileSync(tempFile, code);
      
      const result = await new Promise((resolve) => {
        exec(`node ${tempFile}`, { timeout: 5000 }, (error, stdout, stderr) => {
          // Clean up temp file
          try { fs.unlinkSync(tempFile); } catch(e) {}
          resolve({
            success: !error,
            output: stdout.trim(),
            error: stderr || error?.message || ''
          });
        });
      });
      
      return {
        success: result.success,
        output: result.output || (result.success ? '✓ Code executed successfully' : ''),
        error: result.error,
        executionTime
      };
    } catch (err) {
      return {
        success: false,
        output: '',
        error: `Execution failed: ${err.message}`,
        executionTime
      };
    }
  }
  
  // For other languages when main endpoint fails
  return {
    success: false,
    output: '',
    error: `Unable to execute ${language}. Please try again or use JavaScript.`,
    executionTime
  };
}

// Quick syntax validation
function validateCode(code, language) {
  if (!code || code.trim().length === 0) {
    return { valid: false, error: 'No code provided' };
  }
  
  if (language === 'javascript' || language === 'js') {
    try {
      new Function(code);
      return { valid: true, error: null };
    } catch (err) {
      return { valid: false, error: `Syntax error: ${err.message}` };
    }
  }
  
  return { valid: true, error: null };
}

module.exports = { executeCode, validateCode };
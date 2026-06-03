const Interview = require('../../models/Interview');
const InterviewResponse = require('../../models/InterviewResponse');
const Question = require('../../models/Question');
const CodingChallenge = require('../../models/CodingChallenge');
const User = require('../../models/User');

// Get all interviews for candidate
exports.getMyInterviews = async (req, res) => {
  try {
    const candidateId = req.user.id;
    
    // Find all interviews where this candidate is included
    const interviews = await Interview.find({
      'candidates.candidateId': candidateId
    }).populate('mcqQuestions codingChallenges');
    
    // Separate into upcoming and completed
    const now = new Date();
    const upcoming = [];
    const completed = [];
    
    interviews.forEach(interview => {
      const candidateData = interview.candidates.find(
        c => c.candidateId.toString() === candidateId.toString()
      );
      
      const interviewData = {
        id: interview._id,
        title: interview.title,
        company: interview.company,
        department: interview.department,
        scheduledTime: interview.scheduledTime,
        time: interview.scheduledTime,
        duration: interview.duration,
        rounds: interview.rounds,
        status: candidateData.status,
        canStart: now >= interview.scheduledTime && 
                  now <= new Date(interview.scheduledTime.getTime() + interview.duration * 60000) &&
                  candidateData.status === 'confirmed'
      };
      
      if (candidateData.status === 'completed') {
        completed.push(interviewData);
      } else {
        upcoming.push(interviewData);
      }
    });
    
    res.json({
      success: true,
      data: {
        all: interviews,
        upcoming,
        completed
      }
    });
  } catch (error) {
    console.error('Error fetching interviews:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get specific interview details
exports.getInterviewDetails = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const candidateId = req.user.id;
    
    const interview = await Interview.findById(interviewId)
      .populate('mcqQuestions')
      .populate('codingChallenges');
    
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }
    
    // Check if candidate is part of this interview
    const candidateInInterview = interview.candidates.find(
      c => c.candidateId.toString() === candidateId.toString()
    );
    
    if (!candidateInInterview) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    res.json({
      success: true,
      data: interview
    });
  } catch (error) {
    console.error('Error fetching interview details:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get questions for a specific round
exports.getQuestions = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { roundType } = req.query;
    
    const interview = await Interview.findById(interviewId);
    
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }
    
    let questions = [];
    
    if (roundType === 'mcq') {
      questions = await Question.find({
        _id: { $in: interview.mcqQuestions },
        type: 'MCQ'
      }).select('-correctAnswer -options.isCorrect'); // Hide correct answers
    }
    
    res.json({
      success: true,
      data: questions
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get coding challenges
exports.getCodingChallenges = async (req, res) => {
  try {
    const { interviewId } = req.params;
    
    const interview = await Interview.findById(interviewId);
    
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }
    
    const challenges = await CodingChallenge.find({
      _id: { $in: interview.codingChallenges }
    }).select('-solution'); // Hide solutions
    
    res.json({
      success: true,
      data: challenges
    });
  } catch (error) {
    console.error('Error fetching coding challenges:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Start interview (create response record)
exports.startInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const candidateId = req.user.id;
    
    // Check if response already exists
    let response = await InterviewResponse.findOne({
      interviewId,
      candidateId
    });
    
    if (!response) {
      // Create new response
      response = new InterviewResponse({
        interviewId,
        candidateId,
        startedAt: new Date(),
        timeline: [{
          event: 'interview_started',
          timestamp: new Date()
        }]
      });
      await response.save();
      
      // Update interview candidate status
      await Interview.updateOne(
        { 
          _id: interviewId,
          'candidates.candidateId': candidateId
        },
        { 
          $set: { 'candidates.$.status': 'in-progress' },
          $set: { 'candidates.$.joinedAt': new Date() }
        }
      );
    }
    
    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error starting interview:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Save MCQ answers
exports.saveMCQAnswers = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const candidateId = req.user.id;
    const { answers } = req.body;
    
    const response = await InterviewResponse.findOne({
      interviewId,
      candidateId
    });
    
    if (!response) {
      return res.status(404).json({ success: false, message: 'Interview response not found' });
    }
    
    // Process and save answers
    const mcqAnswers = [];
    let correctCount = 0;
    
    for (const answer of answers) {
      const question = await Question.findById(answer.questionId);
      const isCorrect = question.correctAnswer === answer.selectedOption.toString();
      
      mcqAnswers.push({
        questionId: answer.questionId,
        selectedOption: answer.selectedOption,
        isCorrect,
        timeSpent: answer.timeSpent,
        score: isCorrect ? question.points : 0
      });
      
      if (isCorrect) correctCount++;
    }
    
    response.mcqAnswers = mcqAnswers;
    response.timeline.push({
      event: 'mcq_completed',
      timestamp: new Date(),
      details: { correctCount, totalCount: answers.length }
    });
    
    // Calculate MCQ score
    const totalPoints = mcqAnswers.reduce((sum, a) => sum + a.score, 0);
    const maxPoints = mcqAnswers.length * 10; // Assuming max 10 points per question
    response.performanceStats.mcqScore = Math.round((totalPoints / maxPoints) * 100);
    
    await response.save();
    
    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error saving MCQ answers:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Upload intro video
exports.uploadIntroVideo = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const candidateId = req.user.id;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No video file uploaded' });
    }
    
    const response = await InterviewResponse.findOne({
      interviewId,
      candidateId
    });
    
    if (!response) {
      return res.status(404).json({ success: false, message: 'Interview response not found' });
    }
    
    // Save video URL (you'd upload to cloud storage and save URL)
    const videoUrl = `/uploads/intro-videos/${req.file.filename}`;
    
    response.introVideo = {
      url: videoUrl,
      duration: req.body.duration || 0,
      uploadedAt: new Date()
    };
    
    response.timeline.push({
      event: 'intro_video_uploaded',
      timestamp: new Date()
    });
    
    await response.save();
    
    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error uploading intro video:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Save coding progress
exports.saveCodingProgress = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const candidateId = req.user.id;
    const { challengeId, code, language, results } = req.body;
    
    const response = await InterviewResponse.findOne({
      interviewId,
      candidateId
    });
    
    if (!response) {
      return res.status(404).json({ success: false, message: 'Interview response not found' });
    }
    
    // Find or create coding response
    let codingResponse = response.codingResponses.find(
      c => c.challengeId.toString() === challengeId
    );
    
    if (!codingResponse) {
      codingResponse = {
        challengeId,
        code,
        language,
        testResults: results,
        submittedAt: new Date()
      };
      response.codingResponses.push(codingResponse);
    } else {
      codingResponse.code = code;
      codingResponse.testResults = results;
      codingResponse.submittedAt = new Date();
    }
    
    // Calculate coding score
    const passedTests = results.filter(r => r.status === 'passed').length;
    const totalTests = results.length;
    codingResponse.score = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
    
    response.timeline.push({
      event: 'coding_progress_saved',
      timestamp: new Date(),
      details: { challengeId, passedTests, totalTests }
    });
    
    await response.save();
    
    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error saving coding progress:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Save AI metrics
exports.saveAIMetrics = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const candidateId = req.user.id;
    const { metrics } = req.body;
    
    const response = await InterviewResponse.findOne({
      interviewId,
      candidateId
    });
    
    if (!response) {
      return res.status(404).json({ success: false, message: 'Interview response not found' });
    }
    
    response.aiMetrics.push({
      timestamp: new Date(),
      ...metrics
    });
    
    await response.save();
    
    res.json({
      success: true,
      message: 'Metrics saved'
    });
  } catch (error) {
    console.error('Error saving AI metrics:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Submit interview
exports.submitInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const candidateId = req.user.id;
    const { mcqAnswers, codingCode, introVideoUrl, scores, aiMetrics, performanceStats } = req.body;
    
    let response = await InterviewResponse.findOne({
      interviewId,
      candidateId
    });
    
    if (!response) {
      response = new InterviewResponse({
        interviewId,
        candidateId,
        startedAt: new Date()
      });
    }
    
    // Update response with final data
    response.mcqAnswers = mcqAnswers || response.mcqAnswers;
    if (introVideoUrl) {
      response.introVideo = {
        url: introVideoUrl,
        uploadedAt: new Date()
      };
    }
    
    response.performanceStats = {
      ...response.performanceStats,
      ...performanceStats
    };
    
    response.status = 'completed';
    response.completedAt = new Date();
    
    response.timeline.push({
      event: 'interview_completed',
      timestamp: new Date()
    });
    
    await response.save();
    
    // Update interview candidate status
    await Interview.updateOne(
      { 
        _id: interviewId,
        'candidates.candidateId': candidateId
      },
      { 
        $set: { 'candidates.$.status': 'completed' },
        $set: { 'candidates.$.completedAt': new Date() }
      }
    );
    
    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error submitting interview:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get interview report
exports.getInterviewReport = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const candidateId = req.user.id;
    
    const response = await InterviewResponse.findOne({
      interviewId,
      candidateId
    }).populate('interviewId')
      .populate('mcqAnswers.questionId')
      .populate('codingResponses.challengeId');
    
    if (!response) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }
    
    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
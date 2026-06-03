// backend/controllers/hrReportsController.js
// Complete working version

const InterviewResponse = require('../models/InterviewResponse');
const Interview = require('../models/Interview');
const Profile = require('../models/Profile');
const User = require('../models/User');
const Question = require('../models/Question');

/**
 * Get all interview responses for HR dashboard
 */
exports.getAllInterviewResponses = async (req, res) => {
  try {
    console.log('[HR Reports] Getting all interview responses...');
    
    // Get all completed interview responses
    const responses = await InterviewResponse.find({ status: 'completed' })
      .sort({ completedAt: -1 })
      .lean();
    
    console.log(`[HR Reports] Found ${responses.length} completed responses`);
    
    // Format the data for frontend
    const formattedReports = await Promise.all(responses.map(async (response) => {
      try {
        // Get candidate profile
        let candidateName = 'Candidate';
        let candidateEmail = '';
        
        if (response.candidateId) {
          const profile = await Profile.findOne({ user: response.candidateId }).lean();
          if (profile?.personal) {
            candidateName = `${profile.personal.firstName || ''} ${profile.personal.lastName || ''}`.trim() || 'Candidate';
            candidateEmail = profile.personal.email || '';
          }
          
          // Try to get user if profile doesn't have email
          if (!candidateEmail) {
            const user = await User.findById(response.candidateId).lean();
            if (user) {
              candidateEmail = user.email || '';
              if (!candidateName || candidateName === 'Candidate') {
                candidateName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Candidate';
              }
            }
          }
        }
        
        // Get interview details
        let position = 'Not specified';
        if (response.interviewId) {
          const interview = await Interview.findById(response.interviewId).lean();
          if (interview) {
            position = interview.jobTitle || interview.interviewTitle || 'Not specified';
          }
        }
        
        return {
          id: response._id,
          interviewId: response.interviewId,
          candidateId: response.candidateId,
          candidateName: candidateName,
          email: candidateEmail,
          position: position,
          status: response.status,
          completedAt: response.completedAt,
          scores: {
            overall: response.performanceStats?.overallScore || 0,
            intro: response.performanceStats?.introScore || 0,
            communication: response.performanceStats?.communicationScore || 0,
            mcq: response.performanceStats?.mcqScore || 0,
            coding: response.performanceStats?.codingScore || 0,
            integrity: response.proctoring?.integrityScore || 100
          },
          proctoring: {
            integrityScore: response.proctoring?.integrityScore || 100,
            tabSwitches: response.proctoring?.tabSwitches || 0,
            copyPasteEvents: response.proctoring?.copyPasteEvents || 0
          }
        };
      } catch (err) {
        console.error(`[HR Reports] Error formatting response ${response._id}:`, err);
        return null;
      }
    }));
    
    // Filter out any null values from failed formatting
    const validReports = formattedReports.filter(r => r !== null);
    
    res.json({
      success: true,
      data: validReports,
      count: validReports.length
    });
    
  } catch (err) {
    console.error('[HR Reports] Error in getAllInterviewResponses:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message || 'Failed to fetch interview responses'
    });
  }
};

/**
 * Get single interview report with all details
 */
exports.getInterviewReport = async (req, res) => {
  try {
    const { interviewId, candidateId } = req.params;
    
    console.log(`[HR Reports] Getting report for interview ${interviewId}, candidate ${candidateId}`);
    
    // Find the response
    const response = await InterviewResponse.findOne({
      interviewId,
      candidateId
    }).lean();
    
    if (!response) {
      return res.status(404).json({ 
        success: false, 
        message: 'Report not found' 
      });
    }
    
    // Get candidate details
    let candidateName = 'Candidate';
    let candidateEmail = '';
    
    const profile = await Profile.findOne({ user: candidateId }).lean();
    if (profile?.personal) {
      candidateName = `${profile.personal.firstName || ''} ${profile.personal.lastName || ''}`.trim() || 'Candidate';
      candidateEmail = profile.personal.email || '';
    }
    
    if (!candidateEmail) {
      const user = await User.findById(candidateId).lean();
      if (user) {
        candidateEmail = user.email || '';
        if (!candidateName || candidateName === 'Candidate') {
          candidateName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Candidate';
        }
      }
    }
    
    // Get interview details
    let position = 'Not specified';
    const interview = await Interview.findById(interviewId).lean();
    if (interview) {
      position = interview.jobTitle || interview.interviewTitle || 'Not specified';
    }
    
    // Get MCQ questions with details
    const mcqAnswersWithDetails = await Promise.all(
      (response.mcqAnswers || []).map(async (answer) => {
        try {
          const question = await Question.findById(answer.questionId).lean();
          return {
            ...answer,
            options: question?.options || [],
            category: question?.category,
            difficulty: question?.difficulty
          };
        } catch (err) {
          return answer;
        }
      })
    );
    
    // Prepare the full report
    const report = {
      candidate: {
        id: candidateId,
        name: candidateName,
        email: candidateEmail,
        position: position
      },
      selectionStatus: response.feedback?.selectionStatus || 'pending',
      status: response.status,
      startedAt: response.startedAt,
      completedAt: response.completedAt,
      durationMinutes: response.completedAt && response.startedAt
        ? Math.round((new Date(response.completedAt) - new Date(response.startedAt)) / 60000)
        : null,
      scores: {
        overall: response.performanceStats?.overallScore || 0,
        intro: response.performanceStats?.introScore || 0,
        communication: response.performanceStats?.communicationScore || 0,
        mcq: response.performanceStats?.mcqScore || 0,
        coding: response.performanceStats?.codingScore || 0,
        integrity: response.proctoring?.integrityScore || 100
      },
      intro: {
        videoUrl: response.introVideo?.url,
        duration: response.introVideo?.duration,
        transcript: response.introVideo?.transcript,
        aiAnalysis: response.introVideo?.aiAnalysis || null
      },
      mcq: {
        score: response.mcqStats?.percentageScore || 0,
        correct: response.mcqStats?.correctAnswers || 0,
        total: response.mcqStats?.totalQuestions || 0,
        timeSpent: response.mcqStats?.timeSpent || 0,
        answers: mcqAnswersWithDetails
      },
      coding: {
        score: response.performanceStats?.codingScore || 0,
        stats: response.codingStats || {
          challengesCompleted: 0,
          averageScore: 0,
          totalTimeSpent: 0
        },
        solutions: response.codingResponses || []
      },
      proctoring: {
        integrityScore: response.proctoring?.integrityScore || 100,
        tabSwitches: response.proctoring?.tabSwitches || 0,
        copyPasteEvents: response.proctoring?.copyPasteEvents || 0,
        screenResizes: response.proctoring?.screenResizes || 0,
        violations: response.proctoring?.violations || []
      },
      timeline: response.timeline || [],
      roundsCompleted: response.performanceStats?.roundsCompleted || {
        intro: false,
        mcq: false,
        coding: false
      }
    };
    
    res.json({
      success: true,
      data: report
    });
    
  } catch (err) {
    console.error('[HR Reports] Error in getInterviewReport:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message || 'Failed to fetch interview report'
    });
  }
};

/**
 * Update candidate selection status
 */
exports.updateCandidateSelection = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    
    if (!['shortlisted', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status. Must be shortlisted, rejected, or pending' 
      });
    }
    
    const response = await InterviewResponse.findById(id);
    if (!response) {
      return res.status(404).json({ 
        success: false, 
        message: 'Response not found' 
      });
    }
    
    if (!response.feedback) response.feedback = {};
    response.feedback.selectionStatus = status;
    response.feedback.selectionNote = note || '';
    response.feedback.selectionUpdatedAt = new Date();
    response.feedback.selectionUpdatedBy = req.user?._id;
    
    await response.save();
    
    res.json({
      success: true,
      message: `Candidate ${status === 'shortlisted' ? 'shortlisted' : status === 'rejected' ? 'rejected' : 'marked as pending'} successfully`
    });
    
  } catch (err) {
    console.error('[HR Reports] Error in updateCandidateSelection:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message || 'Failed to update selection status'
    });
  }
};

/**
 * Bulk update selection status
 */
exports.bulkUpdateSelection = async (req, res) => {
  try {
    const { ids, action } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No candidate IDs provided' 
      });
    }
    
    const status = action === 'shortlist' ? 'shortlisted' : 'rejected';
    
    const result = await InterviewResponse.updateMany(
      { _id: { $in: ids } },
      { 
        $set: { 
          'feedback.selectionStatus': status,
          'feedback.selectionUpdatedAt': new Date(),
          'feedback.selectionUpdatedBy': req.user?._id
        } 
      }
    );
    
    res.json({
      success: true,
      message: `${result.modifiedCount} candidate(s) ${status}`,
      updatedCount: result.modifiedCount
    });
    
  } catch (err) {
    console.error('[HR Reports] Error in bulkUpdateSelection:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message || 'Failed to update selections'
    });
  }
};

/**
 * Get report statistics
 */
exports.getReportStats = async (req, res) => {
  try {
    const total = await InterviewResponse.countDocuments();
    const completed = await InterviewResponse.countDocuments({ status: 'completed' });
    const inProgress = await InterviewResponse.countDocuments({ status: 'in-progress' });
    const pending = await InterviewResponse.countDocuments({ status: 'pending' });
    
    // Calculate average scores from completed interviews
    const completedResponses = await InterviewResponse.find({ status: 'completed' })
      .select('performanceStats proctoring')
      .lean();
    
    let totalOverall = 0;
    let totalIntro = 0;
    let totalMcq = 0;
    let totalCoding = 0;
    let highPerformers = 0;
    let integrityFlags = 0;
    
    completedResponses.forEach(r => {
      const overall = r.performanceStats?.overallScore || 0;
      totalOverall += overall;
      totalIntro += r.performanceStats?.introScore || 0;
      totalMcq += r.performanceStats?.mcqScore || 0;
      totalCoding += r.performanceStats?.codingScore || 0;
      
      if (overall >= 80) highPerformers++;
      if ((r.proctoring?.integrityScore || 100) < 80) integrityFlags++;
    });
    
    const count = completedResponses.length || 1;
    
    res.json({
      success: true,
      data: {
        total,
        completed,
        inProgress,
        pending,
        avgScore: Math.round(totalOverall / count),
        avgIntro: Math.round(totalIntro / count),
        avgMcq: Math.round(totalMcq / count),
        avgCoding: Math.round(totalCoding / count),
        highPerformers,
        integrityFlags
      }
    });
    
  } catch (err) {
    console.error('[HR Reports] Error in getReportStats:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message || 'Failed to fetch statistics'
    });
  }
};
const Interview = require('../models/Interview');
const Profile = require('../models/Profile');
const User = require('../models/User');

// @desc    Schedule new interview
// @route   POST /api/interviews/schedule
// @access  Private (HR only)
exports.scheduleInterview = async (req, res) => {
  try {
    const {
      interviewTitle,
      interviewType,
      jobTitle,
      department,
      interviewDate,
      startTime,
      timezone,
      rounds,
      roundSettings,
      selectedCandidates,
      sendEmail,
      sendSMS,
      customMessage
    } = req.body;

    // Validation
    if (!selectedCandidates || selectedCandidates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one candidate'
      });
    }

    // Calculate total duration
    const totalDuration = rounds.reduce((total, round) => {
      return total + (roundSettings[round]?.duration || 0);
    }, 0);

    // Get candidate details from database
    const candidatesData = await Promise.all(selectedCandidates.map(async (candidate) => {
      let profile = null;
      
      // Try to find by ID first
      if (candidate.id) {
        profile = await Profile.findById(candidate.id);
      }
      
      // If not found, try by email
      if (!profile && candidate.email) {
        profile = await Profile.findOne({ 'personal.email': candidate.email });
      }

      return {
        candidateId: profile?._id || candidate.id,
        name: candidate.name || (profile ? `${profile.personal?.firstName || ''} ${profile.personal?.lastName || ''}`.trim() : 'Unknown'),
        email: candidate.email || profile?.personal?.email,
        phone: candidate.phone || profile?.personal?.phone,
        type: candidate.type || 'candidate',
        status: 'pending',
        invitationSent: false
      };
    }));

    // Check for conflicts (optional - you can implement this)
    // const conflicts = await checkConflicts(interviewDate, startTime, candidatesData);
    // if (conflicts.length > 0) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Some candidates have scheduling conflicts',
    //     conflicts
    //   });
    // }

    // Create interview
    const interview = new Interview({
      interviewTitle,
      interviewType,
      jobTitle,
      department,
      interviewDate: new Date(interviewDate),
      startTime,
      totalDuration,
      timezone,
      rounds,
      roundSettings,
      selectedCandidates: candidatesData,
      sendEmail: sendEmail || false,
      sendSMS: sendSMS || false,
      customMessage,
      createdBy: req.user.id,
      createdByName: req.user.firstName + ' ' + req.user.lastName,
      status: 'scheduled'
    });

    // Generate unique interview links for each candidate
    interview.generateInterviewLinks();

    await interview.save();

    // Mark invitations as sent (just for record, no actual email sent)
    interview.selectedCandidates.forEach(c => {
      c.invitationSent = true;
      c.invitationSentAt = new Date();
    });
    await interview.save();

    res.status(201).json({
      success: true,
      message: 'Interview scheduled successfully',
      data: interview
    });

  } catch (error) {
    console.error('Schedule interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while scheduling interview',
      error: error.message
    });
  }
};

// @desc    Get all scheduled interviews
// @route   GET /api/interviews
// @access  Private (HR only)
exports.getAllInterviews = async (req, res) => {
  try {
    const {
      status,
      search,
      fromDate,
      toDate,
      type,
      page = 1,
      limit = 10
    } = req.query;

    let query = {};

    query.createdBy= req.user.id;

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Filter by type
    if (type && type !== 'all') {
      query.interviewType = type;
    }

    // Search in title, job title, candidate names
    if (search) {
      query.$or = [
        { interviewTitle: { $regex: search, $options: 'i' } },
        { jobTitle: { $regex: search, $options: 'i' } },
        { 'selectedCandidates.name': { $regex: search, $options: 'i' } }
      ];
    }

    // Date range filter
    if (fromDate || toDate) {
      query.interviewDate = {};
      if (fromDate) query.interviewDate.$gte = new Date(fromDate);
      if (toDate) query.interviewDate.$lte = new Date(toDate);
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Interview.countDocuments(query);

    const interviews = await Interview.find(query)
      .sort({ interviewDate: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'firstName lastName email');

    // Add statistics for each interview
    const interviewsWithStats = interviews.map(interview => {
      interview.calculateResults();
      return interview;
    });

    res.json({
      success: true,
      data: interviewsWithStats,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get interviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching interviews'
    });
  }
};

// @desc    Get single interview by ID
// @route   GET /api/interviews/:id
// @access  Private (HR only)
exports.getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email')
      .populate('selectedCandidates.candidateId', 'personal professional skills education');

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Calculate results
    interview.calculateResults();

    // Enhance candidate data with profile info
    const enhancedCandidates = interview.selectedCandidates.map(candidate => {
      const profile = candidate.candidateId;
      return {
        ...candidate.toObject(),
        profileDetails: profile ? {
          skills: profile.skills,
          education: profile.education,
          experience: profile.professional?.experience,
          profilePhoto: profile.personal?.profilePhoto
        } : null
      };
    });

    const interviewData = {
      ...interview.toObject(),
      selectedCandidates: enhancedCandidates
    };

    res.json({
      success: true,
      data: interviewData
    });

  } catch (error) {
    console.error('Get interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching interview'
    });
  }
};

// @desc    Update interview
// @route   PUT /api/interviews/:id
// @access  Private (HR only)
exports.updateInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Only allow updates if interview is scheduled
    if (interview.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update interview that is already in progress or completed'
      });
    }

    const updateData = { ...req.body, updatedAt: Date.now() };
    
    // Recalculate total duration if rounds changed
    if (req.body.rounds || req.body.roundSettings) {
      const rounds = req.body.rounds || interview.rounds;
      const roundSettings = req.body.roundSettings || interview.roundSettings;
      
      updateData.totalDuration = rounds.reduce((total, round) => {
        return total + (roundSettings[round]?.duration || 0);
      }, 0);
    }

    const updatedInterview = await Interview.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Interview updated successfully',
      data: updatedInterview
    });

  } catch (error) {
    console.error('Update interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating interview'
    });
  }
};

// @desc    Update interview status
// @route   PATCH /api/interviews/:id/status
// @access  Private (HR only)
exports.updateInterviewStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const validStatuses = ['scheduled', 'in-progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }

    const interview = await Interview.findByIdAndUpdate(
      id,
      { status, updatedAt: Date.now() },
      { new: true }
    );

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    res.json({
      success: true,
      message: 'Interview status updated successfully',
      data: interview
    });

  } catch (error) {
    console.error('Update interview status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating interview status'
    });
  }
};

// @desc    Cancel interview
// @route   POST /api/interviews/:id/cancel
// @access  Private (HR only)
exports.cancelInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const interview = await Interview.findByIdAndUpdate(
      id,
      { 
        status: 'cancelled',
        'selectedCandidates.$[].status': 'cancelled',
        cancellationReason: reason,
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    res.json({
      success: true,
      message: 'Interview cancelled successfully',
      data: interview
    });

  } catch (error) {
    console.error('Cancel interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling interview'
    });
  }
};

// @desc    Resend invitations (just updates the flag, no actual email)
// @route   POST /api/interviews/:id/resend
// @access  Private (HR only)
exports.resendInvitations = async (req, res) => {
  try {
    const { id } = req.params;
    const { candidateIds } = req.body;

    const interview = await Interview.findById(id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Update selected candidates or all
    if (candidateIds && candidateIds.length > 0) {
      interview.selectedCandidates.forEach(candidate => {
        if (candidateIds.includes(candidate._id.toString())) {
          candidate.invitationSent = true;
          candidate.invitationSentAt = new Date();
        }
      });
    } else {
      interview.selectedCandidates.forEach(candidate => {
        candidate.invitationSent = true;
        candidate.invitationSentAt = new Date();
      });
    }

    await interview.save();

    res.json({
      success: true,
      message: `Invitations marked as sent for ${candidateIds?.length || interview.selectedCandidates.length} candidates`,
      data: interview
    });

  } catch (error) {
    console.error('Resend invitations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while resending invitations'
    });
  }
};

// @desc    Delete interview
// @route   DELETE /api/interviews/:id
// @access  Private (HR only)
exports.deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Only allow deletion if interview is scheduled or cancelled
    if (interview.status === 'in-progress' || interview.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete interview that is in progress or completed'
      });
    }

    await interview.deleteOne();

    res.json({
      success: true,
      message: 'Interview deleted successfully'
    });

  } catch (error) {
    console.error('Delete interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting interview'
    });
  }
};

// @desc    Get interview statistics for dashboard
// @route   GET /api/interviews/stats/dashboard
// @access  Private (HR only)
exports.getInterviewStats = async (req, res) => {
  try {
    userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get counts
    const totalInterviews = await Interview.countDocuments({createdBy: userId});
    const scheduledToday = await Interview.countDocuments({
      createdBy: userId, 
      interviewDate: {
        $gte: today,
        $lt: tomorrow
      },
      status: 'scheduled'
    });
    
    const upcoming = await Interview.countDocuments({
      createdBy: userId, 
      interviewDate: { $gt: tomorrow },
      status: 'scheduled'
    });

    const completed = await Interview.countDocuments({ 
      createdBy: userId, status: 'completed' });
    const cancelled = await Interview.countDocuments({ createdBy: userId, status: 'cancelled' });

    // Get candidate statistics
    const allInterviews = await Interview.find({createdBy: userId});
    let totalCandidates = 0;
    let confirmedCandidates = 0;
    let completedCandidates = 0;

    allInterviews.forEach(interview => {
      totalCandidates += interview.selectedCandidates.length;
      confirmedCandidates += interview.selectedCandidates.filter(c => c.status === 'confirmed').length;
      completedCandidates += interview.selectedCandidates.filter(c => c.status === 'completed').length;
    });

    res.json({
      success: true,
      data: {
        interviews: {
          total: totalInterviews,
          scheduledToday,
          upcoming,
          completed,
          cancelled
        },
        candidates: {
          total: totalCandidates,
          confirmed: confirmedCandidates,
          completed: completedCandidates,
          pending: totalCandidates - confirmedCandidates - completedCandidates
        }
      }
    });

  } catch (error) {
    console.error('Get interview stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics'
    });
  }
};

// @desc    Get upcoming interviews
// @route   GET /api/interviews/upcoming
// @access  Private (HR only)
exports.getUpcomingInterviews = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const interviews = await Interview.find({
      interviewDate: { $gte: today },
      status: 'scheduled'
    })
      .sort({ interviewDate: 1, startTime: 1 })
      .limit(parseInt(limit))
      .select('interviewTitle jobTitle interviewDate startTime selectedCandidates');

    // Add candidate count
    const upcomingInterviews = interviews.map(interview => ({
      id: interview._id,
      title: interview.interviewTitle,
      jobTitle: interview.jobTitle,
      date: interview.interviewDate,
      time: interview.startTime,
      candidateCount: interview.selectedCandidates.length
    }));

    res.json({
      success: true,
      data: upcomingInterviews
    });

  } catch (error) {
    console.error('Get upcoming interviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching upcoming interviews'
    });
  }
};

// @desc    Get past interviews
// @route   GET /api/interviews/past
// @access  Private (HR only)
exports.getPastInterviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Interview.countDocuments({
      interviewDate: { $lt: today },
      createdBy: userId,
    });

    const interviews = await Interview.find({
      interviewDate: { $lt: today },
      createdBy: userId
    })
      .sort({ interviewDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('interviewTitle jobTitle interviewDate status selectedCandidates results');

    const pastInterviews = interviews.map(interview => {
      interview.calculateResults();
      return {
        id: interview._id,
        title: interview.interviewTitle,
        jobTitle: interview.jobTitle,
        date: interview.interviewDate,
        status: interview.status,
        totalCandidates: interview.selectedCandidates.length,
        completed: interview.results?.completed || 0,
        averageScore: interview.results?.averageScore || 0
      };
    });

    res.json({
      success: true,
      data: pastInterviews,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get past interviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching past interviews'
    });
  }
};

// @desc    Clone interview
// @route   POST /api/interviews/:id/clone
// @access  Private (HR only)
exports.cloneInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const modifications = req.body;

    const sourceInterview = await Interview.findById(id);

    if (!sourceInterview) {
      return res.status(404).json({
        success: false,
        message: 'Source interview not found'
      });
    }

    // Create clone data
    const cloneData = {
      ...sourceInterview.toObject(),
      _id: undefined,
      createdAt: undefined,
      updatedAt: undefined,
      status: 'scheduled',
      selectedCandidates: sourceInterview.selectedCandidates.map(c => ({
        ...c.toObject(),
        _id: undefined,
        status: 'pending',
        invitationSent: false,
        invitationSentAt: undefined,
        responseAt: undefined,
        feedback: undefined,
        interviewLink: undefined
      })),
      results: undefined,
      ...modifications,
      interviewTitle: modifications.interviewTitle || `${sourceInterview.interviewTitle} (Copy)`,
      createdBy: req.user.id,
      createdByName: req.user.firstName + ' ' + req.user.lastName
    };

    const clonedInterview = new Interview(cloneData);
    clonedInterview.generateInterviewLinks();
    await clonedInterview.save();

    res.status(201).json({
      success: true,
      message: 'Interview cloned successfully',
      data: clonedInterview
    });

  } catch (error) {
    console.error('Clone interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cloning interview'
    });
  }
};
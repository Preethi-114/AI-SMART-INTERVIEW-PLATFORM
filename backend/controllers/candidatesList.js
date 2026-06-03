const Profile = require("../models/Profile");
const User = require("../models/User");

// @desc    Get all candidates (for HR)
// @route   GET /api/hr/candidates
// @access  Private (HR only)
exports.getAllCandidates = async (req, res) => {
  try {
    const {
      search,
      status,
      experience,
      skills,
      sortBy = 'relevance',
      page = 1,
      limit = 20
    } = req.query;

    // Build query
    let query = {};

    // Only get candidates (users with role 'candidate')
    const candidateUsers = await User.find({ role: 'candidate' }).select('_id');
    const candidateIds = candidateUsers.map(u => u._id);
    query.user = { $in: candidateIds };

    // Search filter
    if (search) {
      query.$or = [
        { 'personal.firstName': { $regex: search, $options: 'i' } },
        { 'personal.lastName': { $regex: search, $options: 'i' } },
        { 'personal.email': { $regex: search, $options: 'i' } },
        { 'professional.title': { $regex: search, $options: 'i' } },
        { 'professional.candidateId': { $regex: search, $options: 'i' } },
        { 'skills.name': { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter
    if (status && status !== 'all') {
      if (status === 'active') {
        query['professional.status'] = 'Active';
      } else if (status === 'inactive') {
        query['professional.status'] = { $ne: 'Active' };
      } else if (status === 'interviewing') {
        query['interviews.0'] = { $exists: true };
      } else if (status === 'offered') {
        query.offers = { $gt: 0 };
      }
    }

    // Experience filter
    if (experience && experience !== 'all') {
      const expYears = {};
      if (experience === 'fresher') expYears.$lt = 1;
      else if (experience === 'junior') { expYears.$gte = 1; expYears.$lt = 3; }
      else if (experience === 'mid') { expYears.$gte = 3; expYears.$lt = 6; }
      else if (experience === 'senior') { expYears.$gte = 6; expYears.$lt = 10; }
      else if (experience === 'lead') expYears.$gte = 10;
      
      if (Object.keys(expYears).length) {
        query['professional.experienceYears'] = expYears;
      }
    }

    // Skills filter
    if (skills) {
      const skillsArray = skills.split(',');
      query['skills.name'] = { $in: skillsArray };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const queryLimit = parseInt(limit);

    // Get candidates
    let candidates = await Profile.find(query)
      .populate('user', 'firstName lastName email role')
      .skip(skip)
      .limit(queryLimit)
      .lean();

    // Get total count for pagination
    const total = await Profile.countDocuments(query);

    // Transform data and calculate match scores
    candidates = candidates.map(profile => {
      // Calculate profile completion
      const completion = calculateProfileCompletion(profile);
      
      // Calculate match score
      const matchScore = calculateMatchScore(profile);
      
      // Add full name
      const fullName = `${profile.personal?.firstName || ''} ${profile.personal?.lastName || ''}`.trim();
      
      // Get top skills (sorted by level)
      const topSkills = profile.skills
        ?.sort((a, b) => {
          const levelWeight = { 'Expert': 4, 'Advanced': 3, 'Intermediate': 2, 'Beginner': 1 };
          return (levelWeight[b.level] || 0) - (levelWeight[a.level] || 0);
        })
        .slice(0, 3)
        .map(s => s.name) || [];

      // Add profile photo URL
      let profilePhoto = profile.personal?.profilePhoto;
      if (profilePhoto && profilePhoto.startsWith('/')) {
        profilePhoto = `${req.protocol}://${req.get('host')}${profilePhoto}`;
      } else if (!profilePhoto) {
        profilePhoto = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || 'User')}&background=667eea&color=fff&size=256`;
      }

      // Parse experience string to years
      let experienceYears = 0;
      if (profile.professional?.experience) {
        const expMatch = profile.professional.experience.match(/\d+/);
        experienceYears = expMatch ? parseInt(expMatch[0]) : 0;
      }

      return {
        id: profile._id,
        personal: {
          fullName,
          firstName: profile.personal?.firstName || '',
          lastName: profile.personal?.lastName || '',
          email: profile.personal?.email || '',
          phone: profile.personal?.phone || '',
          dateOfBirth: profile.personal?.dateOfBirth || '',
          gender: profile.personal?.gender || '',
          address: profile.personal?.address || '',
          nationality: profile.personal?.nationality || 'Indian',
          profilePhoto,
          summary: profile.personal?.summary || ''
        },
        professional: {
          title: profile.professional?.title || '',
          currentCompany: profile.professional?.currentCompany || '',
          experienceLevel: profile.professional?.experienceLevel || '',
          experience: profile.professional?.experience || '',
          industry: profile.professional?.industry || '',
          department: profile.professional?.department || '',
          employmentType: profile.professional?.employmentType || '',
          currentSalary: profile.professional?.currentSalary || '',
          expectedSalary: profile.professional?.expectedSalary || '',
          noticePeriod: profile.professional?.noticePeriod || '',
          availability: profile.professional?.availability || '',
          candidateId: profile.professional?.candidateId || `CAND${profile._id.toString().slice(-6)}`,
          status: profile.professional?.status || 'Active',
          matchScore,
          topSkills,
          achievements: profile.professional?.achievements || []
        },
        education: profile.education || [],
        skills: profile.skills || [],
        resume: profile.resume || null,
        assessments: profile.assessments || {},
        interviews: profile.interviews || [],
        profileCompletion: completion,
        lastActive: profile.updatedAt || profile.createdAt || new Date(),
        appliedJobs: profile.appliedJobs || 0,
        interviews: profile.interviews?.length || 0,
        offers: profile.offers || 0,
        sourcedFrom: profile.sourcedFrom || 'Platform',
        tags: profile.tags || [],
        notes: profile.notes || [],
        experienceYears
      };
    });

    // Sort candidates
    if (sortBy === 'match') {
      candidates.sort((a, b) => b.professional.matchScore - a.professional.matchScore);
    } else if (sortBy === 'newest') {
      candidates.sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive));
    } else if (sortBy === 'oldest') {
      candidates.sort((a, b) => new Date(a.lastActive) - new Date(b.lastActive));
    } else if (sortBy === 'name') {
      candidates.sort((a, b) => a.personal.fullName.localeCompare(b.personal.fullName));
    } else if (sortBy === 'experience') {
      candidates.sort((a, b) => b.experienceYears - a.experienceYears);
    } else {
      // Default: sort by match score (relevance)
      candidates.sort((a, b) => b.professional.matchScore - a.professional.matchScore);
    }

    res.json({
      success: true,
      data: candidates,
      total,
      page: parseInt(page),
      limit: queryLimit,
      totalPages: Math.ceil(total / queryLimit)
    });

  } catch (error) {
    console.error('Get candidates error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching candidates'
    });
  }
};

// @desc    Get single candidate profile by ID
// @route   GET /api/hr/candidates/:id
// @access  Private (HR only)
exports.getCandidateById = async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id)
      .populate('user', 'firstName lastName email role')
      .lean();

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    // Check if user is candidate
    const user = await User.findById(profile.user);
    if (!user || user.role !== 'candidate') {
      return res.status(400).json({
        success: false,
        message: 'Profile is not a candidate'
      });
    }

    // Transform data
    const fullName = `${profile.personal?.firstName || ''} ${profile.personal?.lastName || ''}`.trim();
    
    let profilePhoto = profile.personal?.profilePhoto;
    if (profilePhoto && profilePhoto.startsWith('/')) {
      profilePhoto = `${req.protocol}://${req.get('host')}${profilePhoto}`;
    } else if (!profilePhoto) {
      profilePhoto = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || 'User')}&background=667eea&color=fff&size=256`;
    }

    // Format resume URL
    if (profile.resume?.publicUrl && profile.resume.publicUrl.startsWith('/')) {
      profile.resume.fullUrl = `${req.protocol}://${req.get('host')}${profile.resume.publicUrl}`;
    }

    // Get top skills
    const topSkills = profile.skills
      ?.sort((a, b) => {
        const levelWeight = { 'Expert': 4, 'Advanced': 3, 'Intermediate': 2, 'Beginner': 1 };
        return (levelWeight[b.level] || 0) - (levelWeight[a.level] || 0);
      })
      .slice(0, 3)
      .map(s => s.name) || [];

    const transformedProfile = {
      id: profile._id,
      personal: {
        fullName,
        firstName: profile.personal?.firstName || '',
        lastName: profile.personal?.lastName || '',
        email: profile.personal?.email || '',
        phone: profile.personal?.phone || '',
        dateOfBirth: profile.personal?.dateOfBirth || '',
        gender: profile.personal?.gender || '',
        address: profile.personal?.address || '',
        nationality: profile.personal?.nationality || 'Indian',
        profilePhoto,
        summary: profile.personal?.summary || ''
      },
      professional: {
        title: profile.professional?.title || '',
        currentCompany: profile.professional?.currentCompany || '',
        experienceLevel: profile.professional?.experienceLevel || '',
        experience: profile.professional?.experience || '',
        industry: profile.professional?.industry || '',
        department: profile.professional?.department || '',
        employmentType: profile.professional?.employmentType || '',
        currentSalary: profile.professional?.currentSalary || '',
        expectedSalary: profile.professional?.expectedSalary || '',
        noticePeriod: profile.professional?.noticePeriod || '',
        availability: profile.professional?.availability || '',
        candidateId: profile.professional?.candidateId || `CAND${profile._id.toString().slice(-6)}`,
        status: profile.professional?.status || 'Active',
        matchScore: calculateMatchScore(profile),
        topSkills,
        achievements: profile.professional?.achievements || []
      },
      education: profile.education || [],
      skills: profile.skills || [],
      resume: profile.resume || null,
      assessments: profile.assessments || {},
      interviews: profile.interviews || [],
      profileCompletion: calculateProfileCompletion(profile),
      lastActive: profile.updatedAt || profile.createdAt || new Date(),
      appliedJobs: profile.appliedJobs || 0,
      interviews: profile.interviews?.length || 0,
      offers: profile.offers || 0,
      sourcedFrom: profile.sourcedFrom || 'Platform',
      tags: profile.tags || [],
      notes: profile.notes || []
    };

    res.json({
      success: true,
      data: transformedProfile
    });

  } catch (error) {
    console.error('Get candidate error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching candidate'
    });
  }
};

// @desc    Update candidate status
// @route   PATCH /api/hr/candidates/:id/status
// @access  Private (HR only)
exports.updateCandidateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const validStatuses = ['Active', 'Inactive', 'Interviewing', 'Hired', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const profile = await Profile.findByIdAndUpdate(
      id,
      { 'professional.status': status },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    res.json({
      success: true,
      message: 'Status updated successfully',
      data: { status }
    });

  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating status'
    });
  }
};

// @desc    Shortlist candidate
// @route   POST /api/hr/candidates/:id/shortlist
// @access  Private (HR only)
exports.shortlistCandidate = async (req, res) => {
  try {
    const { id } = req.params;

    const profile = await Profile.findByIdAndUpdate(
      id,
      { 
        $set: { 'professional.status': 'Shortlisted' },
        $push: { 
          tags: 'Shortlisted',
          notes: {
            author: req.user.firstName + ' ' + req.user.lastName,
            date: new Date(),
            content: 'Candidate shortlisted by HR'
          }
        }
      },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    res.json({
      success: true,
      message: 'Candidate shortlisted successfully'
    });

  } catch (error) {
    console.error('Shortlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while shortlisting candidate'
    });
  }
};

// @desc    Reject candidate
// @route   POST /api/hr/candidates/:id/reject
// @access  Private (HR only)
exports.rejectCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const profile = await Profile.findByIdAndUpdate(
      id,
      { 
        $set: { 'professional.status': 'Rejected' },
        $push: { 
          tags: 'Rejected',
          notes: {
            author: req.user.firstName + ' ' + req.user.lastName,
            date: new Date(),
            content: `Candidate rejected: ${reason || 'No reason provided'}`
          }
        }
      },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    res.json({
      success: true,
      message: 'Candidate rejected successfully'
    });

  } catch (error) {
    console.error('Reject error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while rejecting candidate'
    });
  }
};

// @desc    Add note to candidate
// @route   POST /api/hr/candidates/:id/notes
// @access  Private (HR only)
exports.addCandidateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    if (!note) {
      return res.status(400).json({
        success: false,
        message: 'Note content is required'
      });
    }

    const profile = await Profile.findByIdAndUpdate(
      id,
      {
        $push: {
          notes: {
            author: req.user.firstName + ' ' + req.user.lastName,
            date: new Date(),
            content: note
          }
        }
      },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    res.json({
      success: true,
      message: 'Note added successfully',
      data: profile.notes[profile.notes.length - 1]
    });

  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding note'
    });
  }
};

// @desc    Schedule interview
// @route   POST /api/hr/candidates/:id/interviews
// @access  Private (HR only)
exports.scheduleInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, date, interviewer, duration, notes } = req.body;

    if (!type || !date || !interviewer) {
      return res.status(400).json({
        success: false,
        message: 'Interview type, date, and interviewer are required'
      });
    }

    const interview = {
      id: Date.now().toString(),
      type,
      date: new Date(date),
      interviewer,
      duration: duration || 60,
      status: 'Scheduled',
      notes: notes || '',
      createdBy: req.user.firstName + ' ' + req.user.lastName,
      createdAt: new Date()
    };

    const profile = await Profile.findByIdAndUpdate(
      id,
      {
        $push: { interviews: interview }
      },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    res.json({
      success: true,
      message: 'Interview scheduled successfully',
      data: interview
    });

  } catch (error) {
    console.error('Schedule interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while scheduling interview'
    });
  }
};

// @desc    Download candidate resume
// @route   GET /api/hr/candidates/:id/resume
// @access  Private (HR only)
exports.downloadResume = async (req, res) => {
  try {
    const { id } = req.params;

    const profile = await Profile.findById(id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    if (!profile.resume || !profile.resume.publicUrl) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // If resume is stored locally
    if (profile.resume.publicUrl.startsWith('/')) {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(__dirname, '..', profile.resume.publicUrl);
      
      if (fs.existsSync(filePath)) {
        return res.download(filePath, profile.resume.fileName || 'resume.pdf');
      } else {
        return res.status(404).json({
          success: false,
          message: 'Resume file not found'
        });
      }
    } else {
      // If resume is stored on cloud (S3, etc.), redirect to URL
      return res.redirect(profile.resume.publicUrl);
    }

  } catch (error) {
    console.error('Download resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while downloading resume'
    });
  }
};

// @desc    Export candidates (CSV)
// @route   GET /api/hr/candidates/export
// @access  Private (HR only)
exports.exportCandidates = async (req, res) => {
  try {
    const {
      search,
      status,
      skills
    } = req.query;

    // Build query (similar to getAllCandidates but without pagination)
    let query = {};

    const candidateUsers = await User.find({ role: 'candidate' }).select('_id');
    const candidateIds = candidateUsers.map(u => u._id);
    query.user = { $in: candidateIds };

    if (search) {
      query.$or = [
        { 'personal.firstName': { $regex: search, $options: 'i' } },
        { 'personal.lastName': { $regex: search, $options: 'i' } },
        { 'personal.email': { $regex: search, $options: 'i' } },
        { 'professional.title': { $regex: search, $options: 'i' } }
      ];
    }

    if (status && status !== 'all') {
      query['professional.status'] = status === 'active' ? 'Active' : status;
    }

    if (skills) {
      const skillsArray = skills.split(',');
      query['skills.name'] = { $in: skillsArray };
    }

    const candidates = await Profile.find(query)
      .populate('user', 'firstName lastName email')
      .lean();

    // Generate CSV
    const createCsvStringifier = require('csv-writer').createObjectCsvStringifier;
    
    const csvStringifier = createCsvStringifier({
      header: [
        { id: 'name', title: 'Name' },
        { id: 'email', title: 'Email' },
        { id: 'phone', title: 'Phone' },
        { id: 'title', title: 'Current Title' },
        { id: 'company', title: 'Current Company' },
        { id: 'experience', title: 'Experience' },
        { id: 'noticePeriod', title: 'Notice Period' },
        { id: 'status', title: 'Status' },
        { id: 'skills', title: 'Skills' },
        { id: 'matchScore', title: 'Match Score' },
        { id: 'lastActive', title: 'Last Active' }
      ]
    });

    const records = candidates.map(profile => {
      const fullName = `${profile.personal?.firstName || ''} ${profile.personal?.lastName || ''}`.trim();
      const skillsList = profile.skills?.map(s => s.name).join(', ') || '';
      
      return {
        name: fullName,
        email: profile.personal?.email || '',
        phone: profile.personal?.phone || '',
        title: profile.professional?.title || '',
        company: profile.professional?.currentCompany || '',
        experience: profile.professional?.experience || '',
        noticePeriod: profile.professional?.noticePeriod || '',
        status: profile.professional?.status || '',
        skills: skillsList,
        matchScore: calculateMatchScore(profile),
        lastActive: profile.updatedAt ? new Date(profile.updatedAt).toISOString().split('T')[0] : ''
      };
    });

    const csvString = csvStringifier.stringifyRecords(records);
    const headerString = csvStringifier.getHeaderString();

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=candidates_export_${new Date().toISOString().split('T')[0]}.csv`);
    
    res.send(headerString + csvString);

  } catch (error) {
    console.error('Export candidates error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while exporting candidates'
    });
  }
};

// Helper function to calculate profile completion
const calculateProfileCompletion = (profile) => {
  let total = 0;
  let completed = 0;

  // Personal info (30%)
  const personalFields = ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'address'];
  personalFields.forEach(field => {
    total += 5;
    if (profile.personal?.[field]) completed += 5;
  });

  // Professional info (30%)
  const professionalFields = ['title', 'currentCompany', 'experience', 'industry', 'noticePeriod'];
  professionalFields.forEach(field => {
    total += 6;
    if (profile.professional?.[field]) completed += 6;
  });

  // Skills (20%)
  total += 20;
  if (profile.skills && profile.skills.length > 0) {
    completed += Math.min(profile.skills.length * 4, 20);
  }

  // Education (10%)
  total += 10;
  if (profile.education && profile.education.length > 0) {
    completed += 10;
  }

  // Resume (10%)
  total += 10;
  if (profile.resume && profile.resume.publicUrl) {
    completed += 10;
  }

  return Math.round((completed / total) * 100);
};

// Helper function to calculate match score
const calculateMatchScore = (profile) => {
  let score = 70; // Base score
  
  // Add points for skills
  if (profile.skills && profile.skills.length > 0) {
    // Higher level skills give more points
    profile.skills.forEach(skill => {
      if (skill.level === 'Expert') score += 3;
      else if (skill.level === 'Advanced') score += 2;
      else if (skill.level === 'Intermediate') score += 1;
    });
  }
  
  // Add points for experience
  if (profile.professional?.experience) {
    const exp = parseInt(profile.professional.experience) || 0;
    score += Math.min(exp, 10);
  }
  
  // Add points for education
  if (profile.education && profile.education.length > 0) {
    score += 5;
  }

  // Add points for resume
  if (profile.resume && profile.resume.publicUrl) {
    score += 5;
  }
  
  return Math.min(score, 100);
};
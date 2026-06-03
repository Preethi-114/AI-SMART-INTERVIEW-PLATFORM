const Question = require('../models/Question');
const Role = require('../models/Role');

// @desc    Create new question
// @route   POST /api/questions
// @access  Private
exports.createQuestion = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      points,
      timeLimit,
      isActive,
      roles,
      correctAnswer,
      options,
      optionType
    } = req.body;

    // Validate roles exist
    if (!roles || roles.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one role is required'
      });
    }

    // Check if all role IDs are valid
    const validRoles = await Role.find({ _id: { $in: roles }, isActive: true });
    if (validRoles.length !== roles.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more roles are invalid or inactive'
      });
    }

    // Validation for MCQ
    if (type === 'MCQ') {
      const validOptions = options.filter(opt => opt.text && opt.text.trim());
      if (validOptions.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'At least 2 options are required for MCQ'
        });
      }

      const correctOptions = validOptions.filter(opt => opt.isCorrect);
      if (correctOptions.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'At least one correct answer is required for MCQ'
        });
      }

      if (optionType === 'single' && correctOptions.length > 1) {
        return res.status(400).json({
          success: false,
          message: 'Single answer type can only have one correct option'
        });
      }
    }

    // Validation for non-MCQ
    if (type !== 'MCQ' && !correctAnswer) {
      return res.status(400).json({
        success: false,
        message: 'Correct answer is required'
      });
    }

    // Create question
    const question = await Question.create({
      title,
      description,
      type,
      points,
      timeLimit,
      isActive: isActive !== undefined ? isActive : true,
      roles,
      correctAnswer,
      options: type === 'MCQ' ? options : [],
      optionType: type === 'MCQ' ? optionType : 'single',
      createdBy: req.user.id
    });

    // Populate roles for response
    await question.populate('roles', 'name description');

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      data: question
    });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating question',
      error: error.message
    });
  }
};

// @desc    Get all questions with filters
// @route   GET /api/questions
// @access  Private
exports.getQuestions = async (req, res) => {
  try {
    const {
      search,
      type,
      role,
      status,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    let filter = {};

    filter.createdBy= req.user.id;

    // Search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Type filter
    if (type) {
      filter.type = type;
    }

    // Role filter - using ObjectId
    if (role) {
      filter.roles = { $in: [role] };
    }

    // Status filter
    if (status) {
      filter.isActive = status === 'active';
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with role population
    const questions = await Question.find(filter)
      .populate('roles', 'name description')
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // Get total count
    const total = await Question.countDocuments(filter);

    // Get statistics
    const stats = {
      total: await Question.countDocuments({createdBy: req.user.id}),
      active: await Question.countDocuments({createdBy: req.user.id, isActive: true }),
      mcq: await Question.countDocuments({ createdBy: req.user.id, type: 'MCQ' }),
      trueFalse: await Question.countDocuments({createdBy: req.user.id, type: 'True/False' }),
      shortAnswer: await Question.countDocuments({ createdBy: req.user.id, type: 'Short-Answer' }),
      coding: await Question.countDocuments({ createdBy: req.user.id, type: 'Coding' })
    };

    res.json({
      success: true,
      data: questions,
      stats,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching questions',
      error: error.message
    });
  }
};

// @desc    Get single question by ID
// @route   GET /api/questions/:id
// @access  Private
exports.getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('roles', 'name description')
      .populate('createdBy', 'name email');

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    res.json({
      success: true,
      data: question
    });
  } catch (error) {
    console.error('Get question by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching question',
      error: error.message
    });
  }
};

// @desc    Get questions by role
// @route   GET /api/questions/by-role/:roleId
// @access  Private
exports.getQuestionsByRole = async (req, res) => {
  try {
    const { roleId } = req.params;
    const { type, page = 1, limit = 20 } = req.query;

    // Check if role exists
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    // Build filter
    let filter = { roles: { $in: [roleId] }, isActive: true };
    
    if (type) {
      filter.type = type;
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const questions = await Question.find(filter)
      .populate('roles', 'name')
      .skip(skip)
      .limit(limitNum);

    const total = await Question.countDocuments(filter);

    res.json({
      success: true,
      data: questions,
      role: {
        id: role._id,
        name: role.name
      },
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get questions by role error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching questions by role',
      error: error.message
    });
  }
};

// @desc    Update question
// @route   PUT /api/questions/:id
// @access  Private
exports.updateQuestion = async (req, res) => {
  try {
    let question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check ownership or admin (you can uncomment based on your auth logic)
    // if (question.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Not authorized to update this question'
    //   });
    // }

    const {
      title,
      description,
      type,
      points,
      timeLimit,
      isActive,
      roles,
      correctAnswer,
      options,
      optionType
    } = req.body;

    // Validate roles if provided
    if (roles && roles.length > 0) {
      const validRoles = await Role.find({ _id: { $in: roles }, isActive: true });
      if (validRoles.length !== roles.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more roles are invalid or inactive'
        });
      }
    }

    // Validation for MCQ
    if (type === 'MCQ' && options) {
      const validOptions = options.filter(opt => opt.text && opt.text.trim());
      if (validOptions.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'At least 2 options are required for MCQ'
        });
      }

      const correctOptions = validOptions.filter(opt => opt.isCorrect);
      if (correctOptions.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'At least one correct answer is required for MCQ'
        });
      }

      if (optionType === 'single' && correctOptions.length > 1) {
        return res.status(400).json({
          success: false,
          message: 'Single answer type can only have one correct option'
        });
      }
    }

    // Validation for non-MCQ
    if (type !== 'MCQ' && correctAnswer !== undefined && !correctAnswer) {
      return res.status(400).json({
        success: false,
        message: 'Correct answer cannot be empty'
      });
    }

    // Update question
    question = await Question.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        type,
        points,
        timeLimit,
        isActive,
        roles,
        correctAnswer,
        options: type === 'MCQ' ? options : [],
        optionType: type === 'MCQ' ? optionType : 'single'
      },
      { new: true, runValidators: true }
    ).populate('roles', 'name description');

    res.json({
      success: true,
      message: 'Question updated successfully',
      data: question
    });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating question',
      error: error.message
    });
  }
};

// @desc    Delete question
// @route   DELETE /api/questions/:id
// @access  Private
exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check ownership or admin (you can uncomment based on your auth logic)
    // if (question.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Not authorized to delete this question'
    //   });
    // }

    await question.deleteOne();

    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting question',
      error: error.message
    });
  }
};

// @desc    Toggle question status
// @route   PATCH /api/questions/:id/toggle-status
// @access  Private
exports.toggleQuestionStatus = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check ownership or admin (you can uncomment based on your auth logic)
    // if (question.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Not authorized to update this question'
    //   });
    // }

    question.isActive = !question.isActive;
    await question.save();

    res.json({
      success: true,
      message: `Question ${question.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        id: question._id,
        isActive: question.isActive
      }
    });
  } catch (error) {
    console.error('Toggle question status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling question status',
      error: error.message
    });
  }
};
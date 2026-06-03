const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header("Authorization")?.replace("Bearer ", "");
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No token provided. Access denied."
            });
        }
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key-here");
        
        // Find user
        const user = await User.findOne({ 
            _id: decoded.userId, 
            isActive: true 
        });
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found or account is inactive"
            });
        }
        
        // Add user and token to request
        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            });
        }
        
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token has expired"
            });
        }
        
        res.status(500).json({
            success: false,
            message: "Authentication failed",
            error: error.message
        });
    }
};

// Role-based authorization middleware
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated"
            });
        }
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Role '${req.user.role}' is not authorized to access this resource`
            });
        }
        
        next();
    };
};

module.exports = { auth, authorize };
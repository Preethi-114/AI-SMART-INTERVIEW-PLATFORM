// Load env
require("dotenv").config();


const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require('path');

const app = express();

// Static folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// CORS
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};
app.use(cors(corsOptions));
app.use(express.json());

// MongoDB
mongoose
  .connect(process.env.MONGO_URI) // ⚡ Use the correct env variable
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ Mongo Error", err));

// Request logger
app.use((req, res, next) => {
  // console.log(`📥 ${req.method} ${req.url}`);
  // console.log('🔑 Authorization header:', req.headers.authorization);
  next();
});

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/profile", require("./routes/profileRoutes"));
app.use('/api/candidate', require("./routes/candidateRoutes"));
app.use("/api/roles", require("./routes/roleRoutes"));
app.use('/api/questions', require("./routes/questionRoutes"));
app.use('/api/hr/candidates', require("./routes/candidatesListByHRRoutes"));
app.use('/api/hr/interviews', require("./routes/interviewRoutes"));
app.use("/api/hr/reports",require("./routes/hrReportsRoutes"));

app.use('/api/hr', require("./routes/hraccountRoutes"));
// app.use("/api/interview",require("./routes/interviewsListRoutes"));


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));



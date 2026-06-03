const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log("✅ MongoDB Connected");

  const hashed = await bcrypt.hash("admin123", 10);

  const user = await User.create({
    firstName: "Admin",
    lastName: "A",
    email: "admin@test.com",
    password: hashed,
    role: "admin",
    isActive: true,
    phone: "1234567890",
  });

  console.log("✅ User created:", user);
  process.exit();
}).catch(err => console.error(err));

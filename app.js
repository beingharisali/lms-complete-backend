require("dotenv").config();
require("express-async-errors");

// Check if required environment variables are set
if (!process.env.JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined.");
  process.exit(1);
}

// Validate JWT_LIFETIME and set default if not provided
if (!process.env.JWT_LIFETIME || process.env.JWT_LIFETIME.trim() === "") {
  console.log("JWT_LIFETIME not set, using default: 30d");
  process.env.JWT_LIFETIME = "30d";
}

console.log("JWT_LIFETIME:", process.env.JWT_LIFETIME);

// extra security packages
const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");

const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");

// DB + middleware
const connectDB = require("./db/connect");
const authenticateUser = require("./middleware/authentication");

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
const teachersUploadsDir = path.join(__dirname, "uploads/teachers");
const staffUploadsDir = path.join(__dirname, "uploads/staff");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(teachersUploadsDir)) {
  fs.mkdirSync(teachersUploadsDir, { recursive: true });
}
if (!fs.existsSync(staffUploadsDir)) {
  fs.mkdirSync(staffUploadsDir, { recursive: true });
}

// routers
const authRouter = require("./routes/auth");
const studentsRouter = require("./routes/students");
const teachersRouter = require("./routes/teachers");
const staffRouter = require("./routes/staff");
const visitorsRouter = require("./routes/visitors");
const assignmentRoutes = require("./routes/assignmentRoutes");
const quizRoutes = require("./routes/quizRoutes"); // ✅ add quiz routes

// error handler
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  })
);

// Serve static files (uploaded files)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(express.json());
app.use(helmet());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://learning-management-system-one-ruby.vercel.app",
    ],
    credentials: true,
  })
);
app.use(xss());

// Test route
app.get("/", (req, res) => {
  res.send('<h1>LMS API</h1><a href="/api-docs">Documentation</a>');
});

// routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/students", studentsRouter);
app.use("/api/v1/teachers", teachersRouter);
app.use("/api/v1/staff", staffRouter);
app.use("/api/v1/visitors", visitorsRouter);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/v1/quizzes", quizRoutes); // ✅ mount quizzes API

// middleware
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`✅ Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();

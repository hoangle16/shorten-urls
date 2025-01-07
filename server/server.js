require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const compression = require("compression");

const cors = require("cors");
const morgan = require("morgan");
const dayjs = require("dayjs");
const fs = require("fs");
const rfs = require("rotating-file-stream");
const path = require("path");
const cookieParser = require("cookie-parser");

// TODO:
// require("./config/cron");

const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const linkRoutes = require("./routes/linkRoutes");
const domainRoutes = require("./routes/domainRoutes");
const linkStatRoutes = require("./routes/linkStatRoutes");
const adminRoutes = require("./routes/adminRoutes");
const errorHandler = require("./middlewares/errorHandler");
const dataNormalization = require("./middlewares/dataNormalization");

const app = express();

const PORT = process.env.PORT || 5000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs
});

// logs
const logDirectory = path.join(__dirname, "logs");
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

morgan.token("timestamp", () => dayjs().format("YYYY-MM-DD HH:mm:ss"));

const logFormat =
  ":timestamp | IP: :remote-addr | :method :url | Status: :status | Response Time: :response-time ms | Size: :res[content-length] bytes";

const accessLogStream = rfs.createStream("access.log", {
  interval: "1d",
  path: logDirectory,
});

app.use(morgan(logFormat, { stream: accessLogStream }));
app.use(morgan("dev"));

// Middlewares
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(helmet());
app.use(limiter);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

app.use(express.static(path.join(__dirname, "../client/dist")));

// Connect database
connectDB();

app.use(dataNormalization);
// Routes

app.use("/api", authRoutes);

app.use("/api", userRoutes);
app.use("/api", domainRoutes);
app.use("/api", linkStatRoutes);
app.use("/api", adminRoutes);
app.use("/", linkRoutes);

app.use(errorHandler);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});

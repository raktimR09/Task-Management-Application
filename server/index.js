import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import dbConnection from "./utils/index.js";
import { errorHandler, routeNotFound } from "./middlewares/errorMiddlewares.js";
import routes from "./routes/index.js";

// Load env variables
dotenv.config();

// Connect to MongoDB
dbConnection();

const PORT = process.env.PORT || 5000;
const app = express();

// Enable CORS for frontend
app.use(
  cors({
    origin: "http://localhost:3000", // Replace with your frontend URL in production
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    credentials: true,
  })
);

// Middleware for parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// Setup __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API routes
app.use("/api", routes);

// Serve React build files (for production)
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client", "build")));
  app.get("*", (req, res) =>
    res.sendFile(path.join(__dirname, "client", "build", "index.html"))
  );
}

// Error handling
app.use(routeNotFound);
app.use(errorHandler);

// Start the server
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

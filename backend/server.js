import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import resumeRoutes from "./routes/resumeRoutes.js";
import studentRoutes from "./routes/StudentRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/resume", resumeRoutes);
app.use("/students", studentRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/notifications", notificationRoutes);

mongoose.connect(process.env.MONGO_URI)
.then(()=> console.log("MongoDB Connected"))
.catch(err=> console.log(err));

app.listen(5000, ()=> console.log("Server running on port 5000"));

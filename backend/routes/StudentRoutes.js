import express from "express";
import {
  registerStudent,
  getMatchedJobs
} from "../controllers/StudentController.js";

const router = express.Router();

console.log("StudentRoutes loaded");

router.post("/register", registerStudent);
router.get("/:id/jobs", getMatchedJobs);

console.log("Student routes configured: POST /register, GET /:id/jobs");

export default router;

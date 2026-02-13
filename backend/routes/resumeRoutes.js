import express from "express";
import { upload } from "../middleware/uploadMiddleware.js";
import fs from "fs/promises";
import { analyzeResume, generateLearningRoadmap } from "../utils/geminiAnalyzer.js";
import Student from "../models/Student.js";
import { extractPDFText } from "../utils/extractResumeText.js";

const router = express.Router();

router.post("/analyze", upload.single("resume"), async (req, res) => {
  try {
    const { studentId, resumeText: rawText } = req.body;
    let resumeText = rawText;
    let resumeUrl = null;

    if (req.file) {
      console.log("📄 Processing resume:", req.file.originalname);
      resumeUrl = req.file.path;
      resumeText = await extractPDFText(req.file.path);
    }

    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({ error: "No resume text provided" });
    }

    console.log("✅ Extracted text length:", resumeText.length);
    console.log("📝 First 200 chars:", resumeText.slice(0, 200));

    const analysis = await analyzeResume(resumeText);
    const simpleResult = getSimpleMatch(resumeText, analysis.skills || []);

    if (studentId) {
      await Student.findByIdAndUpdate(
        studentId,
        {
          resumeUrl,
          resumeText,
          resumeSkills: analysis.skills || []
        },
        { new: true }
      );
    }

    console.log("🎯 Analysis complete:", {
      skills: analysis.skills?.length || 0,
      score: analysis.score,
      matchScore: simpleResult.matchScore
    });

    res.json({
      ...analysis,
      matchScore: simpleResult.matchScore,
      missingSkills: simpleResult.missingSkills
    });

  } catch (err) {
    console.error("❌ RESUME ANALYZE ERROR:", err);

    res.status(200).json({
      skills: [],
      strengths: [],
      weaknesses: ["Could not parse resume - " + err.message],
      suggested_roles: [],
      score: 0,
      matchScore: 0,
      missingSkills: ["Unable to detect skills from resume"]
    });
  }
});

const COMMON_JOB_SKILLS = [
  "javascript",
  "react",
  "node",
  "mongodb",
  "sql",
  "python",
  "git",
  "java",
  "c++",
  "html",
  "css",
  "express",
  "django",
  "flask",
  "docker",
  "kubernetes",
  "aws",
  "machine learning",
  "ml",
  "ai",
  "typescript",
  "angular",
  "vue"
];

const getSimpleMatch = (text, extractedSkills = []) => {
  // Use AI-extracted skills if available
  const userSkills = extractedSkills.length > 0 
    ? extractedSkills.map(s => s.toLowerCase())
    : [];

  if (userSkills.length === 0) {
    return {
      matchScore: 0,
      missingSkills: ["No skills detected in resume"]
    };
  }

  // Count how many common job skills the user has
  const matchedCount = COMMON_JOB_SKILLS.filter(jobSkill =>
    userSkills.some(userSkill => 
      userSkill.includes(jobSkill) || jobSkill.includes(userSkill)
    )
  ).length;

  // Find missing high-value skills
  const topSkills = ["javascript", "python", "react", "node", "sql", "git"];
  const missingSkills = topSkills
    .filter(skill => !userSkills.some(us => us.includes(skill)))
    .map(s => s.charAt(0).toUpperCase() + s.slice(1));

  const matchScore = Math.min(
    Math.round((userSkills.length / 8) * 100),
    100
  );

  return { matchScore, missingSkills };
};

// Detailed analysis endpoint
router.post("/detailed-analysis", async (req, res) => {
  try {
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ error: "studentId is required" });
    }

    // Get student with saved resume
    const student = await Student.findById(studentId);
    if (!student || !student.resumeText) {
      return res.status(404).json({ error: "No saved resume found. Please save your resume first." });
    }

    // Re-analyze to get skills
    const analysis = await analyzeResume(student.resumeText);
    const userSkills = (analysis.skills || []).map(s => s.toLowerCase());

    if (userSkills.length === 0) {
      return res.json({
        userSkills: [],
        jobAnalysis: [],
        learningRoadmap: {
          intro: "No skills detected in your resume. Please update your resume with your technical skills.",
          skills: []
        }
      });
    }

    // Get all jobs
    const Job = (await import("../models/Job.js")).default;
    const jobs = await Job.find().limit(20);

    // Analyze each job
    const jobAnalysis = jobs.map(job => {
      const jobSkills = job.skills && Array.isArray(job.skills) ? job.skills : [];
      const jobText = (job.title + " " + job.domain).toLowerCase();
      
      let matchCount = 0;
      const missingSkills = [];

      // Check job skills
      jobSkills.forEach(jobSkill => {
        const jobSkillLower = jobSkill.toLowerCase();
        const hasSkill = userSkills.some(userSkill => 
          userSkill.includes(jobSkillLower) || jobSkillLower.includes(userSkill)
        );
        
        if (hasSkill) {
          matchCount++;
        } else {
          missingSkills.push(jobSkill);
        }
      });

      // Check text matches
      userSkills.forEach(skill => {
        if (jobText.includes(skill)) {
          matchCount++;
        }
      });

      const score = jobSkills.length > 0 
        ? Math.min(Math.round((matchCount / jobSkills.length) * 100), 100)
        : Math.min(matchCount * 20, 100);

      return {
        title: job.title,
        company: job.company || "Not mentioned",
        domain: job.domain,
        applyLink: job.applyLink,
        score,
        missingSkills: missingSkills.slice(0, 5) // Top 5 missing skills
      };
    }).sort((a, b) => b.score - a.score);

    // Find most common missing skills across all jobs
    const allMissingSkills = {};
    jobAnalysis.forEach(job => {
      job.missingSkills.forEach(skill => {
        const skillLower = skill.toLowerCase();
        allMissingSkills[skillLower] = (allMissingSkills[skillLower] || 0) + 1;
      });
    });

    // Sort by frequency
    const topMissingSkills = Object.entries(allMissingSkills)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([skill]) => skill);

    // Get unique job domains
    const jobDomains = [...new Set(jobAnalysis.map(j => j.domain))];

    // Generate learning roadmap using Gemini
    console.log("🤖 Generating personalized roadmap...");
    console.log("📊 User Skills:", analysis.skills);
    console.log("🎯 Top Missing Skills (" + topMissingSkills.length + "):", topMissingSkills);
    console.log("💼 Job Domains:", jobDomains);

    const learningRoadmap = await generateLearningRoadmap(
      analysis.skills || [],
      topMissingSkills.length > 0 ? topMissingSkills : ["No specific skills identified - analyze job market"],
      jobDomains.length > 0 ? jobDomains : ["Software Development"]
    );

    res.json({
      userSkills: analysis.skills,
      jobAnalysis,
      bestMatch: jobAnalysis[0] || null,
      learningRoadmap
    });

  } catch (err) {
    console.error("❌ DETAILED ANALYSIS ERROR:", err);
    res.status(500).json({ error: "Analysis failed", message: err.message });
  }
});

export default router;

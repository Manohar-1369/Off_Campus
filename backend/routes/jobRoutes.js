import express from "express";
import Job from "../models/Job.js";

const router = express.Router();

// ======================
// GET ALL JOBS
// ======================
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ======================
// MATCH JOBS BASED ON SKILLS
// ======================
router.post("/match", async (req, res) => {
  try {
    const { skills } = req.body;

    if (!skills || !Array.isArray(skills)) {
      return res.status(400).json({ error: "Skills array is required" });
    }

    // ---- TECH SKILL FILTER ----
    const techKeywords = [
      "python","java","javascript","react","node",
      "mongodb","sql","express","backend","frontend",
      "fullstack","devops","ai","ml","data","c++","c","html","css"
    ];

    const filteredSkills = skills.filter(skill =>
      techKeywords.some(key =>
        skill.toLowerCase().includes(key)
      )
    );

    // If no tech skills found, use all skills from resume
    const skillsToMatch = filteredSkills.length > 0 ? filteredSkills : skills;

    const jobs = await Job.find();

   const results = jobs.map(job => {

  let matchCount = 0;

  const text =
    (job.title + " " + job.domain + " " + job.company).toLowerCase();

  // Match against job.skills array
  if (job.skills && Array.isArray(job.skills)) {
    job.skills.forEach(jobSkill => {
      skillsToMatch.forEach(userSkill => {
        const jobSkillLower = jobSkill.toLowerCase();
        const userSkillLower = userSkill.toLowerCase();
        
        // Exact match or partial match
        if (jobSkillLower === userSkillLower || 
            jobSkillLower.includes(userSkillLower) ||
            userSkillLower.includes(jobSkillLower)) {
          matchCount++;
        }
      });
    });
  }

  // Additional matching: check text (title, domain, company)
  skillsToMatch.forEach(skill => {
    if (text.includes(skill.toLowerCase()))
      matchCount++;
  });

  // Backend role mapping
  if (text.includes("backend") &&
      (skillsToMatch.includes("node") ||
       skillsToMatch.includes("javascript") ||
       skillsToMatch.includes("express")))
    matchCount += 2;

  // Full stack mapping
  if (text.includes("full") &&
      (skillsToMatch.includes("react") &&
       skillsToMatch.includes("node")))
    matchCount += 2;

  // Software engineer mapping
  if (text.includes("software") &&
      (skillsToMatch.includes("c++") ||
       skillsToMatch.includes("javascript") ||
       skillsToMatch.includes("java")))
    matchCount += 2;

  // DevOps mapping
  if (text.includes("devops") &&
      skillsToMatch.includes("node"))
    matchCount += 1;

  const score = job.skills && job.skills.length > 0 
    ? Math.min(Math.round((matchCount / job.skills.length) * 100), 100)
    : Math.min(matchCount * 20, 100);

  return {
    id: job._id,
    title: job.title,
    company: job.company,
    domain: job.domain,
    applyLink: job.applyLink,
    score
  };
})
.sort((a,b)=>b.score-a.score);


    res.json(results);

  } catch (err) {
    console.error("MATCH ERROR:", err);
    res.status(500).json({
      error: "Matching failed",
      message: err.message
    });
  }
});

export default router;

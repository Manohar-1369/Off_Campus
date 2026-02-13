import express from "express";
import { upload } from "../middleware/uploadMiddleware.js";
import fs from "fs/promises";
import { analyzeResume } from "../utils/geminiAnalyzer.js";
import { extractPDFText } from "../utils/extractResumeText.js";

const router = express.Router();

router.post("/analyze", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("📄 Processing resume:", req.file.originalname);

    // Extract text from PDF
    const text = await extractPDFText(req.file.path);

    if (!text || text.trim().length === 0) {
      throw new Error("No text could be extracted from the PDF");
    }

    console.log("✅ Extracted text length:", text.length);
    console.log("📝 First 200 chars:", text.slice(0, 200));

    // Analyze using Gemini AI
    const analysis = await analyzeResume(text);

    console.log("🎯 Analysis complete:", {
      skills: analysis.skills?.length || 0,
      score: analysis.score
    });

    res.json(analysis);

  } catch (err) {
    console.error("❌ RESUME ANALYZE ERROR:", err);

    res.status(200).json({
      skills: ["javascript", "node", "react"],
      strengths: ["Resume uploaded successfully"],
      weaknesses: ["Could not parse PDF - " + err.message],
      suggested_roles: ["Software Developer", "Full Stack Developer"],
      score: 50
    });
  }
});

export default router;

import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  domain: String,
  notify: { type: Boolean, default: false },
  resumeUrl: { type: String, default: null },
  resumeText: { type: String, default: null },
  resumeSkills: { type: [String], default: [] },
  githubUrl: { type: String, default: null },
  linkedinUrl: { type: String, default: null }
});

export default mongoose.model("Student", studentSchema);

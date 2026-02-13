import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  title: String,
  company: String,
  applyLink: String,
  domain: String,
  skills: [String],
  source: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Job", jobSchema);

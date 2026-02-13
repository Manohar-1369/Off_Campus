import Student from "../models/Student.js";
import Job from "../models/Job.js";

export const registerStudent = async (req, res) => {
  console.log("registerStudent called with body:", req.body);
  const { name, email, domain } = req.body;

  let student = await Student.findOne({ email });
  if (student) {
    return res.json(student);
  }

  student = await Student.create({ name, email, domain });
  res.json(student);
};

export const getMatchedJobs = async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).json({ msg: "Student not found" });

  const jobs = await Job.find({ domain: student.domain });
  if (jobs.length > 0) {
    return res.json(jobs);
  }

  // Fallback: show all jobs if domain has no matches
  const allJobs = await Job.find();
  return res.json(allJobs);
};

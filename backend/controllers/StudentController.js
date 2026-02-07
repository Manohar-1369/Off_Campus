const Student = require("../models/Student");
const Job = require("../models/Job");

exports.registerStudent = async (req, res) => {
  console.log("registerStudent called with body:", req.body);
  const { name, email, domain } = req.body;

  let student = await Student.findOne({ email });
  if (student) {
    return res.json(student);
  }

  student = await Student.create({ name, email, domain });
  res.json(student);
};

exports.getMatchedJobs = async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).json({ msg: "Student not found" });

  const jobs = await Job.find({ domain: student.domain });
  res.json(jobs);
};

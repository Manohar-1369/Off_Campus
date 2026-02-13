import Student from "../models/Student.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret123";

// SIGNUP
export const register = async (req, res) => {
  try {
    const { name, email, password, domain, githubUrl, linkedinUrl } = req.body;

    const existing = await Student.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = new Student({
      name,
      email,
      password: hashedPassword,
      domain,
      githubUrl,
      linkedinUrl
    });

    await student.save();

    res.json({
      message: "User registered successfully",
      studentId: student._id
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ id: student._id }, JWT_SECRET);

    res.json({
      token,
      studentId: student._id,
      name: student.name,
      domain: student.domain,
      notify: student.notify,
      resumeUrl: student.resumeUrl,
      resumeSkills: student.resumeSkills || []
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

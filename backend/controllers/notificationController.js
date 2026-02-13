import Student from "../models/Student.js";
import { sendJobAlert } from "../utils/mailer.js";

export const enableNotifications = async (req, res) => {
  try {
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ message: "studentId is required" });
    }

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    student.notify = true;
    await student.save();

    const testJob = {
      title: "Test Notification",
      company: "OffCampus System",
      domain: student.domain,
      applyLink: "https://example.com"
    };

    const emailSent = await sendJobAlert(student.email, testJob);

    res.json({
      message: "Notifications enabled successfully",
      notify: true,
      emailSent
    });
  } catch (error) {
    console.error("Error enabling notifications:", error);
    res.status(500).json({
      message: "Failed to enable notifications",
      error: error.message
    });
  }
};

export const disableNotifications = async (req, res) => {
  try {
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ message: "studentId is required" });
    }

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    student.notify = false;
    await student.save();

    res.json({
      message: "Notifications disabled successfully",
      notify: false
    });
  } catch (error) {
    console.error("Error disabling notifications:", error);
    res.status(500).json({
      message: "Failed to disable notifications",
      error: error.message
    });
  }
};

export const getNotificationStatus = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({ notify: student.notify });
  } catch (error) {
    console.error("Error getting notification status:", error);
    res.status(500).json({
      message: "Failed to get notification status",
      error: error.message
    });
  }
};

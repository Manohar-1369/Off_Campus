const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendJobAlert = async (studentEmail, job) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: studentEmail,
    subject: `New ${job.domain} Opportunity`,
    text: `
Hi,

A new ${job.domain} opportunity matches your interest.

Title: ${job.title}
Company: ${job.company}
Apply here: ${job.applyLink}

– OffCampus Alert System
    `
  });
};

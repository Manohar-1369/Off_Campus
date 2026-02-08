const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendJobAlert = async (to, job) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: `New ${job.domain} Opportunity`,
    text: `
New opportunity that matches your interest!

Title: ${job.title}
Company: ${job.company}
Apply here: ${job.applyLink}

– OffCampus Alert System
    `
  });
};

import pkg from "nodemailer";
const { createTransport } = pkg;

let transporter = null;
let initAttempted = false;

// Lazy initialization - create transporter only when needed
function getTransporter() {
  if (transporter) return transporter;
  if (initAttempted) return null; // Don't retry if already failed

  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    console.warn("⚠️ Email credentials not configured in .env file");
    initAttempted = true;
    return null;
  }

  try {
    transporter = createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });
    
    console.log("✅ Email transporter configured for:", emailUser);
    initAttempted = true;
    return transporter;
  } catch (error) {
    console.error("⚠️ Email transporter setup failed:", error.message);
    initAttempted = true;
    return null;
  }
}

export const sendJobAlert = async (to, job) => {
  const emailTransporter = getTransporter();

  if (!emailTransporter) {
    console.warn("⚠️ Email not sent - transporter not available");
    return false; // Return false to indicate failure
  }

  try {
    await emailTransporter.sendMail({
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
    console.log("✅ Email sent successfully to:", to);
    return true; // Return true to indicate success
  } catch (error) {
    console.error("⚠️ Failed to send email to", to, ":", error.message);
    return false; // Return false to indicate failure
  }
};

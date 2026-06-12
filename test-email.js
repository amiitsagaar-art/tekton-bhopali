const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const path = require("path");

// Load .env variables
dotenv.config({ path: path.join(__dirname, ".env") });

async function main() {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  console.log("Using credentials:");
  console.log("EMAIL_USER:", emailUser);
  console.log("EMAIL_PASS:", emailPass ? "********" : "NOT_SET");

  if (!emailUser || !emailPass) {
    console.error("Error: EMAIL_USER and EMAIL_PASS must be set in your .env file!");
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  const mailOptions = {
    from: `"Tekton Test" <${emailUser}>`,
    to: emailUser, // Send to self for testing
    subject: "Tekton Email SMTP Connection Test",
    text: "If you receive this, your Gmail SMTP transport is working perfectly!",
  };

  try {
    console.log("Attempting to send email...");
    const info = await transporter.sendMail(mailOptions);
    console.log("Success! Email sent successfully:");
    console.log("MessageID:", info.messageId);
    console.log("Response:", info.response);
  } catch (error) {
    console.error("Email sending failed with error:");
    console.error(error);
  }
}

main();

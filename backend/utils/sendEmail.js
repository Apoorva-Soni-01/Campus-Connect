const nodemailer = require('nodemailer');

// Configure via env vars. Works with Gmail (use an App Password), Mailtrap,
// Resend SMTP, or any standard SMTP provider.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'CampusConnect <no-reply@campusconnect.local>',
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;

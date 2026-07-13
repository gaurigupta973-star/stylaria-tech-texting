// api/contact.js
// Contact form endpoint — the website's fetch("/api/contact") call lands here.
// Emails the submission to your inbox using Gmail SMTP (via nodemailer).

const nodemailer = require("nodemailer");

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";
const TO_EMAIL = process.env.CONTACT_TO_EMAIL || "info@stylariatech.com";
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

module.exports = async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ detail: "Method not allowed" });

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  body = body || {};

  const first_name = String(body.first_name || "").trim();
  const last_name = String(body.last_name || "").trim();
  const email = String(body.email || "").trim();
  const subject = String(body.subject || "").trim();
  const message = String(body.message || "").trim();

  if (!first_name || !last_name || !email || !subject || !message) {
    return res.status(400).json({ detail: "All fields are required." });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ detail: "That email address doesn't look right." });
  }
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    return res.status(500).json({ detail: "Server email is not configured yet." });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    await transporter.sendMail({
      from: '"Stylaria Website" <' + process.env.GMAIL_USER + ">",
      to: TO_EMAIL,
      replyTo: email,
      subject: "New enquiry: " + subject,
      text:
        "Name: " + first_name + " " + last_name + "\n" +
        "Email: " + email + "\n" +
        "Subject: " + subject + "\n\n" +
        message
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ detail: "Could not send your message — please try WhatsApp instead." });
  }
};

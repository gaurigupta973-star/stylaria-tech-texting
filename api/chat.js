// api/chat.js
// NOVA chat endpoint — the website's fetch("/api/chat") call lands here.
// Talks to xAI's Grok API (OpenAI-compatible endpoint) and returns
// { reply, action } exactly how the frontend (combined-footer-js.js) expects.

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";
// ^ In production, set ALLOWED_ORIGIN to your real site, e.g.
//   https://stylariatech.com  — "*" is fine for testing only.

const SYSTEM_PROMPT = `
You are NOVA, the friendly AI guide embedded on the Stylaria Tech website
(an Australian digital marketing & AI automation agency).

Company facts you can use:
- Name: Stylaria Tech
- Founder: Aryan Dwivedi
- Phone: +61 466 904 543
- Email: info@stylariatech.com
- Address: 85/433 Brisbane Road, Coombabah, QLD 4216, Australia
- Stylaria has scaled 100+ brands in 10+ years, with 9 five-star Google reviews.
- Services: digital marketing, AI automation, web design, branding.
- No lock-in contracts, transparent pricing.

Rules:
- Keep replies short — 2 to 4 sentences. This is a chat widget, not an essay.
- Warm, confident, conversational tone. You may use one emoji occasionally, not every message.
- If the visitor wants to book a consultation, get a quote, or talk to a human,
  encourage them warmly and mention the contact form or WhatsApp button.
- If you don't know something specific (exact pricing, timelines, contracts in
  progress), say a team member will confirm the details, and suggest booking a
  free consultation instead of guessing.
- Never invent facts about Stylaria that are not listed above.
`.trim();

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

// Very small heuristic — no extra AI call needed — that decides whether the
// frontend should nudge the visitor toward the contact form or a section.
function detectAction(userMessage, replyText) {
  const text = (userMessage + " " + replyText).toLowerCase();
  if (/\b(book|consult|quote|pricing|price|talk to (a )?human|contact|call me|email me)\b/.test(text)) {
    return "contact";
  }
  if (/\bportfolio|our work|case stud/.test(text)) return "nav:portfolio";
  if (/\breview|testimonial/.test(text)) return "nav:reviews";
  if (/\bfaq|question/.test(text)) return "nav:faq";
  return null;
}

module.exports = async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ detail: "Method not allowed" });

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  const message = (body && body.message ? String(body.message) : "").trim();
  if (!message) return res.status(400).json({ detail: "Message is required" });
  if (!process.env.XAI_API_KEY) {
    return res.status(500).json({ detail: "Server is missing XAI_API_KEY." });
  }

  try {
    // xAI's API is OpenAI-compatible — same request/response shape, different
    // base URL, header, and model name.
    const apiRes = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "authorization": "Bearer " + process.env.XAI_API_KEY
      },
      body: JSON.stringify({
        model: "grok-4.3",
        max_tokens: 300,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: message.slice(0, 2000) }
        ]
      })
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      console.error("xAI API error:", apiRes.status, errText);
      return res.status(502).json({ detail: "NOVA is having trouble thinking right now — please try again." });
    }

    const data = await apiRes.json();
    const reply =
      (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content || "").trim() ||
      "Sorry, I didn't quite catch that — could you rephrase?";

    return res.status(200).json({ reply: reply, action: detectAction(message, reply) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ detail: "Something went wrong on our end." });
  }
};

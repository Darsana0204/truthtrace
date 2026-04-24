const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateExplanation(status, truthScore) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-lite",
    });

    const prompt = `
You are TruthTrace AI, a professional digital asset protection system.

Analyze this uploaded media:

Status: ${status}
Truth Score: ${truthScore}/100

Instructions:
- If status is duplicate → High Risk
- If status is near-duplicate → Medium Risk
- If status is unique → Low Risk

Explain:
1. Why this content is classified this way
2. Risk level
3. Recommended action for admin

Keep the response:
- short
- professional
- technical
- suitable for enterprise sports media protection
- perfect for a hackathon demo
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;

} catch (error) {
    console.error("Gemini Full Error:", error);

    // Smart fallback based on status
    if (status === "duplicate") {
      return "This content matches an existing verified media fingerprint. Risk Level: High. Recommended Action: Flag immediately and review for unauthorized redistribution or copyright misuse.";
    }

    if (status === "near-duplicate") {
      return "This content shows strong similarity to previously uploaded media and may be a modified or reused version. Risk Level: Medium. Recommended Action: Review manually and monitor for potential misuse.";
    }

    return "This content appears original with no strong similarity matches found. Risk Level: Low. Recommended Action: Approve ownership and generate digital ownership certificate.";
  }
}

module.exports = { generateExplanation };
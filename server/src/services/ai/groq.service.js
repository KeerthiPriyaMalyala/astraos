const Groq = require("groq-sdk");

// =====================================================
// GROQ CLIENT
// =====================================================

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// =====================================================
// ANALYZE COMPLAINT USING GROQ
// =====================================================

const analyzeComplaint = async ({
  title,
  description,
  category,
  location,
}) => {
  // =====================================================
  // VALIDATION
  // =====================================================

  if (!title || !description) {
    throw new Error(
      "Title and description are required for AI analysis"
    );
  }

  // =====================================================
  // AI PROMPT
  // =====================================================

  const prompt = `
You are AstraOS, an AI civic governance assistant.

Analyze the following citizen complaint.

Title:
${title}

Description:
${description}

Citizen Category:
${category || "Not provided"}

Location:
${JSON.stringify(location || {})}

Return ONLY valid JSON.

The JSON must contain exactly these fields:

{
  "category": "ROAD | WATER | ELECTRICITY | TRAFFIC | GARBAGE | ENVIRONMENT | ANIMALS | INFRASTRUCTURE | CONSTRUCTION | EMERGENCY",
  "department": "recommended government department",
  "summary": "short summary",
  "severity": 1,
  "confidence": 0.0,
  "suggestedAction": "recommended action"
}

Rules:

- severity must be an integer from 1 to 10
- confidence must be a number between 0 and 1
- Choose the most appropriate civic category
- Choose the most appropriate government department
- Consider public safety
- Consider nearby sensitive locations such as schools, hospitals and public places
- Consider the seriousness and urgency of the issue
- suggestedAction should be practical and concise
- summary should be short and clear
- Do not include markdown
- Do not include explanations outside JSON
- Return ONLY the JSON object
`;

  // =====================================================
  // CALL GROQ
  // =====================================================

  const completion =
    await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",

      messages: [
        {
          role: "system",
          content:
            "You are a civic infrastructure analysis AI. Always return valid JSON and never return markdown.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],

      temperature: 0.2,
    });

  // =====================================================
  // GET AI RESPONSE
  // =====================================================

  const content =
    completion.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error(
      "AI returned an empty response"
    );
  }

  // =====================================================
  // PARSE JSON
  // =====================================================

  let parsed;

  try {
    parsed = JSON.parse(content);
  } catch (error) {
    console.error(
      "[AstraOS AI] Invalid JSON returned by Groq:"
    );

    console.error(content);

    throw new Error(
      "AI returned invalid JSON"
    );
  }

  // =====================================================
  // BASIC AI RESULT VALIDATION
  // =====================================================

  const severity = Number(parsed.severity);
  const confidence = Number(parsed.confidence);

  if (
    !Number.isInteger(severity) ||
    severity < 1 ||
    severity > 10
  ) {
    throw new Error(
      "AI returned invalid severity value"
    );
  }

  if (
    Number.isNaN(confidence) ||
    confidence < 0 ||
    confidence > 1
  ) {
    throw new Error(
      "AI returned invalid confidence value"
    );
  }

  // =====================================================
  // RETURN NORMALIZED RESULT
  // =====================================================

  return {
    category: parsed.category || "",

    department: parsed.department || "",

    summary: parsed.summary || "",

    severity,

    confidence,

    suggestedAction:
      parsed.suggestedAction || "",

    model: "groq",
  };
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  analyzeComplaint,
};
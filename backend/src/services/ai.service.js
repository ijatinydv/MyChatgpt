const { GoogleGenAI } = require("@google/genai");

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({});

function parseRetryAfterSeconds(error) {
  const retryInfo = error?.details?.find(
    (detail) => detail?.["@type"] === "type.googleapis.com/google.rpc.RetryInfo"
  );

  const retryDelay = retryInfo?.retryDelay;
  if (typeof retryDelay === "string") {
    const match = retryDelay.match(/(\d+(?:\.\d+)?)s/);
    if (match) {
      return Math.ceil(Number(match[1]));
    }
  }

  const messageRetryMatch = error?.message?.match(/retry in (\d+(?:\.\d+)?)s/i);
  if (messageRetryMatch) {
    return Math.ceil(Number(messageRetryMatch[1]));
  }

  return 10;
}

function createRateLimitError(error) {
  const rateLimitError = new Error(
    "AI quota exceeded. Please retry after a short delay."
  );
  rateLimitError.statusCode = 429;
  rateLimitError.isRateLimitError = true;
  rateLimitError.retryAfterSeconds = parseRetryAfterSeconds(error);
  return rateLimitError;
}

function isRateLimitError(error) {
  if (error?.status === 429 || error?.statusCode === 429 || error?.code === 429) {
    return true;
  }

  const message = `${error?.message || ""}`.toLowerCase();
  return (
    message.includes('"code":429') ||
    message.includes("resource_exhausted") ||
    message.includes("quota exceeded")
  );
}

async function generateResponse(content) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: content,
      config: {
          temperature: 0.7, // (0-2) more value more creative answer will the model give
        systemInstruction: `
            <persona>
  <name>system paad denge</name>
  <summary>
    You are "system paad denge" — a friendly, helpful AI with a playful, cheeky personality.
    Always prioritize being useful, accurate, and safe. Use humor lightly to make interactions enjoyable,
    but never at the cost of clarity, respect, or user privacy.
  </summary>

  <tone>
    Playful, warm, conversational, slightly cheeky but professional when necessary.
    Use short jokes, light metaphors, or mild slang occasionally. Match the user's tone: be more formal if the user is formal.
  </tone>

  <guidelines>
    1. Be helpful above all: provide clear, correct, and actionable answers.
    2. When asked for facts or time-sensitive info, state confidence level and cite sources if available.
    3. Keep replies concise by default; expand when user asks for more detail.
    4. Ask clarifying questions only when strictly necessary — prefer to make a best-effort answer when possible.
    5. Respect privacy and safety: never request or reveal private personal data, medical/legal prescriptions, or safety-hazard instructions.
    6. When refusing or limiting content, explain briefly why and offer safe alternatives.
    7. Use friendly micro-phrases like "Nice! 😄", "Gotcha — let’s do it!", or "On it!" sparingly to reinforce playfulness.
  </guidelines>

  <formatting>
    - Use short paragraphs and bullet lists for steps.
    - When giving code, wrap it in proper code blocks and include short explanations.
    - When giving examples, label them clearly (Example 1, Example 2).
    - Use emojis lightly to support tone, but avoid them in professional/legal/medical contexts.
  </formatting>

  <error-handling>
    If you don't know something, say "I don't know" or "I might be wrong" and either:
      • Offer to look it up if allowed, or
      • Provide the best-guess reasoning and clearly mark it as an estimate.
  </error-handling>

  <safety>
    - Do not produce hateful, violent, illegal, or sexually explicit content.
    - Avoid making medical, legal, or financial claims without clear disclaimers and encourage consulting qualified professionals.
  </safety>

  <closing-style>
      End helpful responses with a quick prompt inviting follow-up, e.g.:
      "Want me to expand on any step?" or "Shall I show an example?"
 </persona>
 `,
      }
    });
    return response.text;
  } catch (error) {
    if (isRateLimitError(error)) {
      throw createRateLimitError(error);
    }
    throw error;
  }
}

async function generateVector(content) {
  try {
    const response = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: content,
      config: {
        outputDimensionality: 768,
      },
    });
    return response.embeddings[0].values;
  } catch (error) {
    if (isRateLimitError(error)) {
      throw createRateLimitError(error);
    }
    throw error;
  }
}

module.exports = { generateResponse, generateVector };

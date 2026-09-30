const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Validates if an image matches a specific context (User Complaint or Worker Completion)
 */
async function validateImage(imageBase64, description, mode = 'user') {
  try {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is missing in backend .env");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let prompt = "";
    if (mode === 'user') {
      prompt = `CRITICAL TASK: Analyze this image and text for a waste management complaint.
      User says: "${description}".
      
      RULES:
      1. Is the TEXT describing a valid sanitation/waste issue? (isTextValid)
      2. Does the PHOTO show actual waste, garbage, dirty water, or an overflowing bin? (isImageValid)
      3. Both must be true for the overall complaint to be valid.
      
      Respond ONLY with this JSON:
      {
        "isTextValid": true/false,
        "isImageValid": true/false,
        "isValid": true/false,
        "reason": "Detailed reason"
      }`;
    } else {
      prompt = `CRITICAL TASK: Verify if a sanitation worker has actually cleaned the area.
      Task was: "${description}".
      
      RULES:
      1. Does the photo show a CLEANED area, EMPTY bin, or fixed issue?
      2. If the area still looks dirty or the bin is still full, mark as INVALID.
      
      Respond ONLY with this JSON:
      {
        "isValid": true/false,
        "reason": "Detailed reason why the work is accepted or rejected",
        "confidence": 0-100
      }`;
    }

    const result = await model.generateContent([
      {
        inlineData: {
          data: imageBase64,
          mimeType: "image/jpeg",
        },
      },
      prompt,
    ]);

    const responseText = result.response.text();
    console.log("🤖 Gemini Raw Response:", responseText);

    const jsonMatch = responseText.match(/\{.*\}/s);
    if (!jsonMatch) throw new Error("AI did not return valid JSON");
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("❌ AI VALIDATION CRITICAL ERROR:", error.message);
    // Change fallback to false so we can see why it's failing
    return { 
        isValid: false, 
        reason: `AI Validation Error: ${error.message}. Please ensure API key is valid and image is clear.`, 
        confidence: 0 
    };
  }
}

module.exports = { validateImage };

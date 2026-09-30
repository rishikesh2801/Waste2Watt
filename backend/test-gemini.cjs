const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGemini() {
    try {
        const apiKey = "AIzaSyCfVFa9RV9hqX13YoyooYDOobFSQBzVtgA"; // User's key
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const result = await model.generateContent("Say hello world");
        console.log("SUCCESS:", result.response.text());
    } catch (err) {
        console.error("ERROR TESTING GEMINI:", err.message);
        if (err.status) console.error("Status:", err.status);
    }
}

testGemini();

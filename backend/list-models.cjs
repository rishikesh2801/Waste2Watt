const { GoogleGenerativeAI } = require("@google/generative-ai");
async function listModels() {
    try {
        const apiKey = "AIzaSyCfVFa9RV9hqX13YoyooYDOobFSQBzVtgA"; // User's key
        const genAI = new GoogleGenerativeAI(apiKey);
        
        // Wait, SDK doesn't expose listModels natively easily, let's just fetch it
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        console.log(data.models.map(m => m.name).join("\n"));
    } catch (err) {
        console.error(err);
    }
}
listModels();

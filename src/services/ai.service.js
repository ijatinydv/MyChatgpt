const { GoogleGenAI } =  require("@google/genai");

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({});

async function generateResponse(content) {
    const response = await ai.models.generateContent({
        model:"gemini-2.0-flash",
        contents:content
    });
    return response.text
}

async function generateVector(content) {
    const response = await ai.models.embedContent({
        model:'gemini-embedding-001',
        contents:content,
        config:{
            temperature:0.7,   // (0-2) more value more creative answer will the model give
            systemInstruction:``
        }
    })
    return response.embeddings[0].values
}


module.exports = {generateResponse,generateVector}
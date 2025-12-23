import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export const chatWithGemini = async (history, userMessage, context) => {
    try {
        // Construct prompt with context
        const systemPrompt = `
    You are a helpful, encouraging teaching assistant for a 6th-grade student.
    Your name is "Learning Companion".
    The student is currently working on: "${context.activity}".
    The content they are reading is from "${context.book}".
    
    Guidelines:
    - Keep responses concise (under 50 words usually).
    - Be encouraging and positive.
    - Don't give the direct answer; guide them to find it.
    - Use simple language suitable for an 11-12 year old.
    - If they ask about the text, use the provided chapter content to answer.
    
    Current Context:
    ${context.data || "No specific data provided."}
    `;

        // Convert chat history to Gemini format if needed (for now we just send the new message with context)
        // For a simple stateless chat, we can just prompt. For history, we'd use chat sessions.

        const result = await model.generateContent([systemPrompt, ...history.map(m => `${m.role}: ${m.text}`), `user: ${userMessage}`]);
        const response = await result.response;
        return response.text();

    } catch (error) {
        console.error("Gemini Error:", error);
        return "I'm having a little trouble thinking right now. Can you ask that again?";
    }
};

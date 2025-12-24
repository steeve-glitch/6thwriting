import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Activity-specific guidance for the AI
const getActivityGuidance = (activity) => {
    switch (activity) {
        case 'PEEL Paragraph Writing':
            return `
    The student is writing a PEEL paragraph (Point, Evidence, Explanation, Link).
    Help them:
    - Point: Craft a clear topic sentence that makes an argument
    - Evidence: Choose the most relevant quote that supports their point
    - Explanation: Connect the evidence to their point - what does it show?
    - Link: Wrap up their argument and connect back to the main idea

    Don't write it for them - ask guiding questions like:
    - "What's the main idea you want to prove?"
    - "How does this quote support what you're saying?"
    - "Can you explain what this evidence shows about the character?"
    `;

        case 'Sentence Expansion':
            return `
    The student is expanding a simple "kernel" sentence by adding details.
    Help them add:
    - When: Time or sequence (e.g., "In the morning...", "Suddenly...")
    - How: Manner or emotion (e.g., "nervously", "with determination")
    - Where: Location or direction (e.g., "through the hallway", "across the room")
    - Why: Purpose or reason (e.g., "to escape", "hoping to...")

    Encourage descriptive language while keeping it natural. Ask:
    - "How was the character feeling when this happened?"
    - "Can you picture where this is taking place?"
    - "What details would help the reader see this scene?"
    `;

        case 'Close Reading':
            return `
    The student is doing close reading with categorized highlighting.
    Categories: Character Traits, Setting, Figurative Language, Theme, Conflict

    Help them:
    - Identify important passages that reveal meaning
    - Explain WHY a passage is significant
    - Connect evidence to larger themes

    Ask guiding questions like:
    - "What does this word choice tell us about the character?"
    - "Why do you think the author included this detail?"
    - "How does this connect to the bigger message of the story?"
    `;

        case 'Sentence Building':
            return `
    The student is reconstructing a sentence from the text using word tiles.
    Help them think about:
    - Word order and sentence structure
    - Which words are essential vs. optional
    - How the sentence flows naturally

    If they're stuck, give hints about grammar patterns without giving away the answer.
    `;

        default:
            return '';
    }
};

export const chatWithGemini = async (history, userMessage, context) => {
    try {
        // Construct prompt with context
        const studentName = context.studentName || "student";
        const activityGuidance = getActivityGuidance(context.activity);

        const systemPrompt = `
    You are a helpful, encouraging teaching assistant for a 6th-grade student named ${studentName}.
    Your name is "Learning Companion".
    Address ${studentName} by name occasionally to make the interaction personal and friendly.
    The student is currently working on: "${context.activity}".
    The content they are reading is from "${context.book}".

    Guidelines:
    - Keep responses concise (under 50 words usually, unless giving detailed writing feedback).
    - Be encouraging and positive - celebrate effort and progress.
    - Don't give the direct answer; guide them to find it through questions.
    - Use simple language suitable for an 11-12 year old.
    - Focus on the PROCESS of thinking, not just the answer.
    - When giving writing feedback, be specific about what works and what could improve.
    ${activityGuidance}

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

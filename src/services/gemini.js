import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Structured rubrics for each activity type
const RUBRICS = {
    peel: {
        criteria: [
            {
                name: 'Point',
                levels: {
                    excellent: 'Makes a clear, specific argument that can be proven with evidence',
                    good: 'States an idea but could be more specific or arguable',
                    developing: 'Too vague or restates the question without taking a position'
                }
            },
            {
                name: 'Evidence',
                levels: {
                    excellent: 'Uses a relevant quote with correct quotation marks that directly supports the point',
                    good: 'Uses a quote but connection to point is unclear',
                    developing: 'Missing quote or uses irrelevant evidence'
                }
            },
            {
                name: 'Explanation',
                levels: {
                    excellent: 'Clearly explains how the evidence proves the point, analyzing specific words/phrases',
                    good: 'Explains the evidence but doesn\'t connect it fully to the point',
                    developing: 'Retells what happened without analysis'
                }
            },
            {
                name: 'Link',
                levels: {
                    excellent: 'Returns to the main argument and shows its significance to the bigger picture',
                    good: 'Wraps up but doesn\'t fully connect back to the main idea',
                    developing: 'Missing or just repeats the point'
                }
            }
        ]
    },
    expansion: {
        criteria: [
            {
                name: 'Descriptive Details',
                levels: {
                    excellent: 'Uses vivid sensory words that help the reader picture the scene',
                    good: 'Adds some details but could be more specific',
                    developing: 'Details are generic or missing'
                }
            },
            {
                name: 'Sentence Flow',
                levels: {
                    excellent: 'Reads naturally with smooth transitions between ideas',
                    good: 'Mostly flows but some parts feel choppy',
                    developing: 'Awkward phrasing that interrupts reading'
                }
            },
            {
                name: 'Author\'s Craft',
                levels: {
                    excellent: 'Uses techniques like strong verbs, sensory language, or figurative language',
                    good: 'Attempts one technique but could develop it further',
                    developing: 'Relies on simple, basic language'
                }
            }
        ]
    },
    reading: {
        criteria: [
            {
                name: 'Text Selection',
                levels: {
                    excellent: 'Chooses quotes that reveal important information about character, theme, or conflict',
                    good: 'Chooses relevant quotes but some are more surface-level',
                    developing: 'Quotes are too long or don\'t connect to a clear purpose'
                }
            },
            {
                name: 'Analysis',
                levels: {
                    excellent: 'Explains what the quote means AND why it matters to the story',
                    good: 'Explains what the quote means but not its significance',
                    developing: 'Restates or summarizes without interpretation'
                }
            },
            {
                name: 'Categorization',
                levels: {
                    excellent: 'Correctly identifies the type of evidence and explains the connection',
                    good: 'Correct category but explanation is brief',
                    developing: 'Misidentifies the category'
                }
            }
        ]
    }
};

// Activity-specific guidance for the AI
const getActivityGuidance = (activity) => {
    switch (activity) {
        case 'Write Your Paragraph':
        case 'PEEL Paragraph Writing':
            return `
    The student is writing a PEEL paragraph (Point, Evidence, Explanation, Link).

    RUBRIC FOR FEEDBACK:
    ${JSON.stringify(RUBRICS.peel.criteria, null, 2)}

    When giving feedback:
    1. Start with ONE specific thing they did well (be genuine and specific)
    2. Identify ONE area to improve using the rubric above
    3. Give a concrete suggestion or example of how to improve
    4. End with encouragement

    Use kid-friendly language. Instead of "your evidence lacks analysis" say "I'd love to hear more about WHY this quote is important."

    Ask guiding questions like:
    - "What's the main idea you want to prove?"
    - "How does this quote support what you're saying?"
    - "Can you explain what this evidence shows about the character?"
    `;

        case 'Add Details':
        case 'Sentence Expansion':
            return `
    The student is expanding a simple "kernel" sentence by adding details.

    RUBRIC FOR FEEDBACK:
    ${JSON.stringify(RUBRICS.expansion.criteria, null, 2)}

    When giving feedback:
    1. Celebrate a specific word choice or detail that works well
    2. Suggest ONE technique to try (sensory details, strong verbs, location, emotion)
    3. Show them a mini-example if helpful

    Categories for expansion:
    - When: Time or sequence (e.g., "In the morning...", "Suddenly...")
    - How: Manner or emotion (e.g., "nervously", "with determination")
    - Where: Location or direction (e.g., "through the hallway", "across the room")
    - Why: Purpose or reason (e.g., "to escape", "hoping to...")

    Ask questions like:
    - "How was the character feeling when this happened?"
    - "Can you picture where this is taking place?"
    - "What details would help the reader see this scene?"
    `;

        case 'Find the Clues':
        case 'Close Reading':
            return `
    The student is doing close reading with categorized highlighting.

    RUBRIC FOR FEEDBACK:
    ${JSON.stringify(RUBRICS.reading.criteria, null, 2)}

    Categories: Character Traits, Setting, Figurative Language, Theme, Conflict

    When giving feedback:
    1. Affirm their evidence selection if it's good
    2. Help them dig deeper into WHY this passage matters
    3. Connect their evidence to bigger ideas in the story

    Ask guiding questions like:
    - "What does this word choice tell us about the character?"
    - "Why do you think the author included this detail?"
    - "How does this connect to the bigger message of the story?"
    `;

        case 'Build the Sentence':
        case 'Sentence Building':
            return `
    The student is reconstructing a sentence from the text using word tiles.

    This activity helps students understand:
    - How authors structure sentences
    - The importance of word order for meaning
    - Grammar patterns they can use in their own writing

    Help them think about:
    - Which words usually come first in English sentences
    - Where punctuation belongs
    - How the sentence should flow when read aloud

    If they're stuck, give hints about grammar patterns without giving away the answer.
    Celebrate when they get it right by pointing out what they learned about sentence structure.
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

    CORE FEEDBACK PRINCIPLES:
    1. BE SPECIFIC: Instead of "good job," say "I love how you used the word 'nervously' - it really shows how the character feels!"
    2. ONE THING AT A TIME: Focus on ONE strength and ONE area to grow. Don't overwhelm with too many suggestions.
    3. SHOW, DON'T TELL: Give a brief example when suggesting improvements. "Try adding WHERE this happened, like 'through the dusty hallway'"
    4. ASK, DON'T LECTURE: Use questions to guide thinking. "What was the character feeling here?" instead of "You need to add emotions."
    5. CELEBRATE EFFORT: Acknowledge the work they put in, not just the result.

    RESPONSE FORMAT FOR WRITING FEEDBACK:
    - What's Working: [One specific, genuine compliment about their writing]
    - Try This: [One concrete suggestion with a mini-example if helpful]
    - Keep Going! [Brief encouragement]

    General Guidelines:
    - Keep responses concise (50-100 words for feedback, shorter for questions).
    - Use simple language suitable for an 11-12 year old.
    - Be warm and supportive like a favorite teacher.
    - Never write the answer for them - guide them to discover it.
    - Use emojis sparingly (1-2 max) to add warmth without being overwhelming.

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

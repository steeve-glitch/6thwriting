import React from 'react';
import ActivityLayout from './ActivityLayout';
import TextPanel from './TextPanel';
import SentenceBuilder from './SentenceBuilder';

const NumberTheStarsModule = ({ onBack }) => {
    const chapterContent = `
"I'll race you to the corner, Ellen!" Annemarie adjusted the thick leather pack on her back so that her schoolbooks balanced evenly. "Ready?"

"No," Ellen cried, laughing. "You know I can't beat you. My legs aren't as long. Can't we just walk, like civilized people?" She was a stocky ten-year-old, unlike lanky Annemarie.

"We have to practice for the athletic meet on Friday—I know I'm going to win the girls' race this week. I was second last week, but I've been practicing every day. Come on, Ellen!" Annemarie pleaded, eyeing the distance to the next corner of the Copenhagen street. "Please?"

Ellen hesitated, then nodded and shifted her own rucksack of books against her shoulders. "Oh, all right. Ready," she said.

"Go!" shouted Annemarie, and the two girls broke into a run, their long legs flying, their laughter echoing against the buildings.
  `;

    // Sentence to build: "Annemarie adjusted the thick leather pack on her back."
    // Distractors: "heavy", "school"
    const wordBank = [
        "Annemarie", "adjusted", "the", "thick",
        "leather", "pack", "on", "her", "back",
        "heavy", "quickly", "."
    ];

    return (
        <ActivityLayout
            onBack={onBack}
            accentColor="bg-sky-600"
            leftPanel={
                <TextPanel
                    title="Number the Stars"
                    chapter="Chapter 1: Why Are You Running?"
                    content={chapterContent.trim()}
                />
            }
            rightPanel={
                <div className="flex flex-col h-full gap-4">
                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Sentence Scramble</h2>
                        <p className="text-slate-600">
                            Reconstruct the sentence describing Annemarie's backpack using the exact words from the text.
                        </p>
                    </div>

                    <div className="flex-1 bg-slate-50 rounded-xl p-4 border border-slate-100 shadow-inner">
                        <SentenceBuilder initialWords={wordBank} />
                    </div>

                    <div className="p-4 bg-sky-50 rounded-xl border border-sky-100 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-sky-200 flex items-center justify-center text-xl">🤖</div>
                        <div>
                            <p className="text-sm text-sky-900 font-medium">Assistant Tip:</p>
                            <p className="text-sm text-sky-700">Look closely at the first paragraph. What kind of pack was it?</p>
                        </div>
                    </div>
                </div>
            }
        />
    );
};

export default NumberTheStarsModule;

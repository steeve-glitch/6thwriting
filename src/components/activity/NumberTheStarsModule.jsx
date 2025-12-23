import React, { useState } from 'react';
import ActivityLayout from './ActivityLayout';
import TextPanel from './TextPanel';
import SentenceBuilder from './SentenceBuilder';
import AiAssistant from '../AiAssistant';
import { PenTool, Move, Highlighter } from 'lucide-react';

const NumberTheStarsModule = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState('scramble'); // 'scramble' | 'reading'
    const [isAiOpen, setIsAiOpen] = useState(false);
    const [highlights, setHighlights] = useState([]);

    const chapterContent = `
"I'll race you to the corner, Ellen!" Annemarie adjusted the thick leather pack on her back so that her schoolbooks balanced evenly. "Ready?"

"No," Ellen cried, laughing. "You know I can't beat you. My legs aren't as long. Can't we just walk, like civilized people?" She was a stocky ten-year-old, unlike lanky Annemarie.

"We have to practice for the athletic meet on Friday—I know I'm going to win the girls' race this week. I was second last week, but I've been practicing every day. Come on, Ellen!" Annemarie pleaded, eyeing the distance to the next corner of the Copenhagen street. "Please?"

Ellen hesitated, then nodded and shifted her own rucksack of books against her shoulders. "Oh, all right. Ready," she said.

"Go!" shouted Annemarie, and the two girls broke into a run, their long legs flying, their laughter echoing against the buildings.
  `;

    // Sentence activity data
    const wordBank = [
        "Annemarie", "adjusted", "the", "thick",
        "leather", "pack", "on", "her", "back",
        "heavy", "quickly", "."
    ];

    const handleHighlight = ({ text }) => {
        // Toggle highlight
        setHighlights(prev => {
            const exists = prev.find(h => h.text === text);
            if (exists) {
                return prev.filter(h => h.text !== text);
            }
            return [...prev, { text, color: 'yellow' }]; // Default to yellow
        });
    };

    return (
        <>
            <ActivityLayout
                onBack={onBack}
                accentColor="bg-sky-600"
                leftPanel={
                    <TextPanel
                        title="Number the Stars"
                        chapter="Chapter 1: Why Are You Running?"
                        content={chapterContent.trim()}
                        highlights={highlights}
                        onHighlight={activeTab === 'reading' ? handleHighlight : undefined}
                    />
                }
                rightPanel={
                    <div className="flex flex-col h-full gap-6">
                        {/* Tab Switcher */}
                        <div className="flex p-1 bg-slate-100 rounded-xl">
                            <button
                                onClick={() => setActiveTab('scramble')}
                                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2
                            ${activeTab === 'scramble' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <Move className="w-4 h-4" /> Sentence Building
                            </button>
                            <button
                                onClick={() => setActiveTab('reading')}
                                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2
                            ${activeTab === 'reading' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <Highlighter className="w-4 h-4" /> Close Reading
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 flex flex-col">
                            {activeTab === 'scramble' ? (
                                <>
                                    <div className="mb-4">
                                        <h2 className="text-xl font-bold text-slate-800 mb-2">Sentence Scramble</h2>
                                        <p className="text-slate-600">
                                            Reconstruct the sentence describing Annemarie's backpack using the exact words from the text.
                                        </p>
                                    </div>

                                    <div className="flex-1 bg-slate-50 rounded-xl p-4 border border-slate-100 shadow-inner min-h-[400px]">
                                        <SentenceBuilder initialWords={wordBank} />
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-800 mb-2">Evidence Hunting</h2>
                                        <p className="text-slate-600">
                                            Highlight words or phrases that show differences between Annemarie and Ellen.
                                        </p>
                                    </div>

                                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                        <h4 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
                                            <PenTool className="w-4 h-4" /> Your Notes
                                        </h4>
                                        {highlights.length === 0 ? (
                                            <p className="text-sm text-yellow-600 italic">Select text in the left panel to highlight it.</p>
                                        ) : (
                                            <ul className="space-y-2">
                                                {highlights.map((h, i) => (
                                                    <li key={i} className="flex items-center gap-2 text-sm text-slate-700 bg-white p-2 rounded-lg border border-yellow-100">
                                                        <span className="w-2 h-2 rounded-full bg-yellow-400" />
                                                        "{h.text}"
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    <div className="bg-sky-50 p-4 rounded-xl border border-sky-100">
                                        <p className="text-sm text-sky-800">
                                            <strong>Tip:</strong> Look for physical descriptions like "stocky" or "lanky".
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                }
            />

            <AiAssistant
                isOpen={isAiOpen}
                onToggle={() => setIsAiOpen(!isAiOpen)}
                context={{
                    book: "Number the Stars",
                    activity: activeTab === 'scramble' ? "Sentence Building" : "Close Reading",
                    data: activeTab === 'scramble'
                        ? "Student is building a sentence about Annemarie's backpack."
                        : `Student is finding evidence about Annemarie and Ellen. Current notes: ${highlights.map(h => h.text).join(', ')}`
                }}
            />
        </>
    );
};

export default NumberTheStarsModule;

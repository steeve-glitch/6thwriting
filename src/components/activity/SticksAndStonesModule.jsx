import React, { useState } from 'react';
import ActivityLayout from './ActivityLayout';
import TextPanel from './TextPanel';
import SentenceBuilder from './SentenceBuilder';
import AiAssistant from '../AiAssistant';
import { PenTool, Move, Highlighter } from 'lucide-react';

const SticksAndStonesModule = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState('scramble'); // 'scramble' | 'reading'
    const [isAiOpen, setIsAiOpen] = useState(false);
    const [highlights, setHighlights] = useState([]);

    // Mock text for Sticks and Stones
    const chapterContent = `
  The hallway was crowded with students rushing to their next class. Noise bounced off the metal lockers—slamming doors, shouting voices, the squeak of sneakers on linoleum.
  
  Tom tried to make himself invisible. He hugged his books to his chest and kept his head down, weaving through the gaps in the crowd.
  "Hey, look out!" someone shouted, bumping into him hard.
  
  Tom stumbled, dropping his math book. He bent down to pick it up, his face burning.
  "Nice move, klutz," said a voice he recognized. It was Brent.
  
  Brent towered over him, a smirk on his face. "Learn to walk, why don't you?"
  Tom didn't answer. He just grabbed his book and hurried away, his heart pounding in his chest. Sticks and stones may break my bones, he thought, but words... words leave marks too. 
  `;

    // Sentence activity data
    const wordBank = [
        "Tom", "tried", "to", "make", "himself",
        "invisible", "weaving", "through", "the",
        "gaps", "in", "the", "crowd", "."
    ];

    const handleHighlight = ({ text }) => {
        setHighlights(prev => {
            const exists = prev.find(h => h.text === text);
            if (exists) return prev.filter(h => h.text !== text);
            return [...prev, { text, color: 'orange' }]; // Orange for this theme
        });
    };

    return (
        <>
            <ActivityLayout
                onBack={onBack}
                accentColor="bg-orange-600"
                leftPanel={
                    <TextPanel
                        title="Sticks and Stones"
                        chapter="Chapter 1: The Hallway"
                        content={chapterContent.trim()}
                        highlights={highlights}
                        onHighlight={activeTab === 'reading' ? handleHighlight : undefined}
                    />
                }
                rightPanel={
                    <div className="flex flex-col h-full gap-6">
                        <div className="flex p-1 bg-slate-100 rounded-xl">
                            <button
                                onClick={() => setActiveTab('scramble')}
                                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2
                            ${activeTab === 'scramble' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <Move className="w-4 h-4" /> Sentence Building
                            </button>
                            <button
                                onClick={() => setActiveTab('reading')}
                                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2
                            ${activeTab === 'reading' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <Highlighter className="w-4 h-4" /> Close Reading
                            </button>
                        </div>

                        <div className="flex-1 flex flex-col">
                            {activeTab === 'scramble' ? (
                                <>
                                    <div className="mb-4">
                                        <h2 className="text-xl font-bold text-slate-800 mb-2">Sentence Scramble</h2>
                                        <p className="text-slate-600">
                                            Reconstruct the sentence about Tom trying to avoid attention.
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
                                            Highlight words that show how Tom is feeling or what the environment is like.
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
                                                        <span className="w-2 h-2 rounded-full bg-orange-400" />
                                                        "{h.text}"
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                                        <p className="text-sm text-orange-800">
                                            <strong>Tip:</strong> Look for sensory details like sounds ("slamming", "squeak").
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
                    book: "Sticks and Stones",
                    activity: activeTab === 'scramble' ? "Sentence Building" : "Close Reading",
                    data: activeTab === 'scramble'
                        ? "Student is building a sentence about Tom hiding in the hallway."
                        : `Student is analyzing the hallway scene. Current notes: ${highlights.map(h => h.text).join(', ')}`
                }}
            />
        </>
    );
};

export default SticksAndStonesModule;

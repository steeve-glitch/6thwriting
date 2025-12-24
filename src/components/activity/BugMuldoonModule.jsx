import React, { useState } from 'react';
import ActivityLayout from './ActivityLayout';
import TextPanel from './TextPanel';
import SentenceBuilder from './SentenceBuilder';
import AiAssistant from '../AiAssistant';
import { PenTool, Move, Highlighter } from 'lucide-react';

const BugMuldoonModule = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState('scramble'); // 'scramble' | 'reading'
    const [isAiOpen, setIsAiOpen] = useState(false);
    const [highlights, setHighlights] = useState([]);

    // Mock text for Bug Muldoon
    const chapterContent = `
  I was sitting in my office, cleaning the fly-paper, when the door opened. It was a fly.
  
  "Is this the office of Bug Muldoon, Private Investigator?" he asked.
  "That's right," I said. "Come in and take a seat. Not on the fly-paper."
  
  He sat on the edge of the desk, rubbing his front legs together nervously. He was a bluebottle, and he looked worried.
  "I need your help, Muldoon," he said. "It's about Eddie the Earwig. He's missing."
  
  "Missing?" I asked. "Since when?"
  "Since yesterday," said the fly. "He went down to the compost heap to meet a contact, and he never came back."
  
  I leaned back in my chair. The Garden was a dangerous place, especially for a guy like Eddie.
  "I'll take the case," I said. "But my rates are steep. Two sugar cubes a day, plus expenses."
  `;

    // Sentence activity data - Simple sentence for 6th grade
    const wordBank = [
        "I", "was", "Sitting", "in", "my", "office",
        "cleaning", "the", "fly-paper", "when", "the",
        "door", "opened", "."
    ];

    const handleHighlight = ({ text }) => {
        setHighlights(prev => {
            const exists = prev.find(h => h.text === text);
            if (exists) return prev.filter(h => h.text !== text);
            return [...prev, { text, color: 'green' }]; // Green for garden theme
        });
    };

    return (
        <>
            <ActivityLayout
                onBack={onBack}
                accentColor="bg-green-600"
                leftPanel={
                    <TextPanel
                        title="Bug Muldoon"
                        chapter="Chapter 1: The Case of the Missing Earwig"
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
                            ${activeTab === 'scramble' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <Move className="w-4 h-4" /> Sentence Building
                            </button>
                            <button
                                onClick={() => setActiveTab('reading')}
                                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2
                            ${activeTab === 'reading' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
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
                                            Reconstruct the opening sentence of the mystery.
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
                                            Highlight clues about where Eddie went and what happened.
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
                                                        <span className="w-2 h-2 rounded-full bg-green-400" />
                                                        "{h.text}"
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                                        <p className="text-sm text-green-800">
                                            <strong>Tip:</strong> Pay attention to names and locations mentioned by the fly.
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
                    book: "Bug Muldoon",
                    activity: activeTab === 'scramble' ? "Sentence Building" : "Close Reading",
                    data: activeTab === 'scramble'
                        ? "Student is building the opening sentence of the detective story."
                        : `Student is finding clues about the missing earwig. Current notes: ${highlights.map(h => h.text).join(', ')}`
                }}
            />
        </>
    );
};

export default BugMuldoonModule;

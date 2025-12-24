import React, { useState } from 'react';
import ActivityLayout from './ActivityLayout';
import TextPanel from './TextPanel';
import SentenceBuilder from './SentenceBuilder';
import PeelBuilder from './PeelBuilder';
import SentenceExpander from './SentenceExpander';
import HighlightModal from './HighlightModal';
import AiAssistant from '../AiAssistant';
import { PenTool, Move, Highlighter, Layers, Maximize2, User, MapPin, Sparkles, Lightbulb, Swords } from 'lucide-react';

const CATEGORY_CONFIG = {
    character: { label: 'Character', color: 'blue', icon: User },
    setting: { label: 'Setting', color: 'green', icon: MapPin },
    figurative: { label: 'Figurative Language', color: 'purple', icon: Sparkles },
    theme: { label: 'Theme', color: 'amber', icon: Lightbulb },
    conflict: { label: 'Conflict', color: 'red', icon: Swords }
};

const NumberTheStarsModule = ({ onBack, userName }) => {
    const [activeTab, setActiveTab] = useState('scramble');
    const [isAiOpen, setIsAiOpen] = useState(false);
    const [highlights, setHighlights] = useState([]);
    const [activityLevel, setActivityLevel] = useState(1);
    const [completedTabs, setCompletedTabs] = useState({
        scramble: false,
        reading: false,
        peel: false,
        expand: false
    });

    // Highlight modal state
    const [showHighlightModal, setShowHighlightModal] = useState(false);
    const [pendingHighlight, setPendingHighlight] = useState(null);

    const tabs = [
        { id: 'scramble', label: 'Reconstruct', icon: Move },
        { id: 'reading', label: 'Investigate', icon: Highlighter },
        { id: 'peel', label: 'Analyze', icon: Layers },
        { id: 'expand', label: 'Create', icon: Maximize2 }
    ];

    const handleTabComplete = (tabId) => {
        setCompletedTabs(prev => ({ ...prev, [tabId]: true }));
    };

    const advanceToNextTab = (currentTabId) => {
        const currentIndex = tabs.findIndex(t => t.id === currentTabId);
        if (currentIndex < tabs.length - 1) {
            setActiveTab(tabs[currentIndex + 1].id);
        }
    };

    // Chapter content
    const chapterContent = `
"I'll race you to the corner, Ellen!" Annemarie adjusted the thick leather pack on her back so that her schoolbooks balanced evenly. "Ready?"

"No," Ellen cried, laughing. "You know I can't beat you. My legs aren't as long. Can't we just walk, like civilized people?" She was a stocky ten-year-old, unlike lanky Annemarie.

"We have to practice for the athletic meet on Friday—I know I'm going to win the girls' race this week. I was second last week, but I've been practicing every day. Come on, Ellen!" Annemarie pleaded, eyeing the distance to the next corner of the Copenhagen street. "Please?"

Ellen hesitated, then nodded and shifted her own rucksack of books against her shoulders. "Oh, all right. Ready," she said.

"Go!" shouted Annemarie, and the two girls broke into a run, their long legs flying, their laughter echoing against the buildings.
  `;

    // Sentence activity data
    const wordBank = [
        "Ellen", "hesitated", ",", "then", "nodded",
        "and", "shifted", "her", "own", "rucksack",
        "of", "books", "."
    ];

    // PEEL quotes for guided mode
    const peelQuotes = [
        "You know I can't beat you. My legs aren't as long.",
        "She was a stocky ten-year-old, unlike lanky Annemarie.",
        "I know I'm going to win the girls' race this week.",
        "their long legs flying, their laughter echoing against the buildings"
    ];

    // Sentence expansion data
    const sentenceKernel = "Annemarie ran.";
    const authorSentence = "Annemarie pleaded, eyeing the distance to the next corner of the Copenhagen street.";

    // Handle text selection for highlighting
    const handleHighlight = ({ text }) => {
        if (activeTab === 'reading') {
            setPendingHighlight(text);
            setShowHighlightModal(true);
        }
    };

    // Save highlight with category and explanation
    const handleSaveHighlight = (highlightData) => {
        setHighlights(prev => {
            // Check if already highlighted
            const exists = prev.find(h => h.text === highlightData.text);
            if (exists) {
                return prev.map(h => h.text === highlightData.text ? highlightData : h);
            }
            return [...prev, highlightData];
        });
    };

    // Remove highlight on click
    const handleHighlightClick = (highlight) => {
        setHighlights(prev => prev.filter(h => h.text !== highlight.text));
    };

    // Get activity label for AI context
    const getActivityLabel = () => {
        switch (activeTab) {
            case 'scramble': return 'Syntactic Reconstruction';
            case 'reading': return 'Textual Analysis';
            case 'peel': return 'Analytical Writing';
            case 'expand': return 'Creative Emulation';
            default: return 'Reading Activity';
        }
    };

    // Get activity data for AI context
    const getActivityData = () => {
        switch (activeTab) {
            case 'scramble':
                return "Student is reconstructing a sentence showing Ellen's reluctance and compliance.";
            case 'reading':
                const highlightSummary = highlights.map(h =>
                    `"${h.text}" (${CATEGORY_CONFIG[h.category]?.label || 'uncategorized'}): ${h.explanation || 'no explanation'}`
                ).join('; ');
                return `Student is analyzing the contrast between Annemarie and Ellen. Current highlights: ${highlightSummary || 'none yet'}`;
            case 'peel':
                return "Student is writing a PEEL paragraph analyzing how the author establishes the friendship dynamic.";
            case 'expand':
                return `Student is expanding the kernel sentence "${sentenceKernel}" with descriptive details about setting or emotion.`;
            default:
                return "";
        }
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
                        onHighlightClick={handleHighlightClick}
                    />
                }
                rightPanel={
                    <div className="flex flex-col h-full gap-6 overflow-y-auto p-6">
                        {/* Tab Switcher */}
                        <div className="flex p-1 bg-slate-100 rounded-xl flex-shrink-0">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isCompleted = completedTabs[tab.id];
                                const isActive = activeTab === tab.id;

                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex-1 py-2 px-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-1 sm:gap-2
                                            ${isActive ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        {isCompleted ? <div className="w-4 h-4 text-green-500">✓</div> : <Icon className="w-4 h-4" />}
                                        <span className="hidden sm:inline">{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 flex flex-col min-h-0">
                            {/* Sentence Building */}
                            {activeTab === 'scramble' && (
                                <>
                                    <div className="mb-4">
                                        <h2 className="text-xl font-bold text-slate-800 mb-2">Syntactic Reconstruction</h2>
                                        <p className="text-slate-600">
                                            Reconstruct this sentence to see how the author describes Ellen's hesitation and ultimate agreement.
                                        </p>
                                    </div>
                                    <div className="flex-1 bg-slate-50 rounded-xl p-4 border border-slate-100 shadow-inner min-h-[400px]">
                                        <SentenceBuilder
                                            initialWords={wordBank}
                                            onComplete={() => {
                                                handleTabComplete('scramble');
                                                setTimeout(() => advanceToNextTab('scramble'), 1500);
                                            }}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Close Reading */}
                            {activeTab === 'reading' && (
                                <div className="space-y-6 flex flex-col h-full">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-800 mb-2">Character Contrast</h2>
                                        <p className="text-slate-600">
                                            Highlight evidence that juxtaposes the two girls. How does the author use physical description to hint at personality differences?
                                        </p>
                                    </div>

                                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex-1">
                                        <h4 className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
                                            <PenTool className="w-4 h-4" /> Your Evidence
                                        </h4>
                                        {highlights.length === 0 ? (
                                            <p className="text-sm text-yellow-600 italic">Select text in the left panel to highlight it.</p>
                                        ) : (
                                            <ul className="space-y-3">
                                                {highlights.map((h, i) => {
                                                    const config = CATEGORY_CONFIG[h.category] || { color: 'slate', label: 'Note' };
                                                    return (
                                                        <li key={i} className="bg-white p-3 rounded-lg border border-yellow-100 space-y-2">
                                                            <div className="flex items-start justify-between gap-2">
                                                                <span className="text-sm text-slate-700 font-medium">"{h.text}"</span>
                                                                <span className={`text-xs px-2 py-0.5 rounded-full bg-${config.color}-100 text-${config.color}-700`}>
                                                                    {config.label}
                                                                </span>
                                                            </div>
                                                            {h.explanation && (
                                                                <p className="text-xs text-slate-500 italic">{h.explanation}</p>
                                                            )}
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        )}
                                    </div>

                                    <div className="bg-sky-50 p-4 rounded-xl border border-sky-100">
                                        <p className="text-sm text-sky-800">
                                            <strong>Inquiry Focus:</strong> "Stocky" vs. "Lanky" — how do these physical traits reflect their approach to the "race"?
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => {
                                            handleTabComplete('reading');
                                            advanceToNextTab('reading');
                                        }}
                                        className="w-full py-3 bg-sky-600 text-white font-medium rounded-xl hover:bg-sky-700 transition-colors shadow-sm"
                                    >
                                        Complete Analysis & Continue
                                    </button>
                                </div>
                            )}

                            {/* PEEL Writing */}
                            {activeTab === 'peel' && (
                                <PeelBuilder
                                    quotes={peelQuotes}
                                    accentColor="sky"
                                    level={activityLevel}
                                    onComplete={(paragraph) => {
                                        console.log('PEEL complete:', paragraph);
                                        handleTabComplete('peel');
                                    }}
                                    onRequestAiFeedback={(text) => {
                                        setIsAiOpen(true);
                                    }}
                                />
                            )}

                            {/* Sentence Expansion */}
                            {activeTab === 'expand' && (
                                <SentenceExpander
                                    kernel={sentenceKernel}
                                    authorOriginal={authorSentence}
                                    accentColor="sky"
                                    level={activityLevel}
                                    onComplete={(sentence) => {
                                        console.log('Expansion complete:', sentence);
                                        handleTabComplete('expand');
                                    }}
                                    onRequestAiFeedback={(text) => {
                                        setIsAiOpen(true);
                                    }}
                                />
                            )}
                        </div>
                    </div>
                }
            />

            {/* Highlight Modal */}
            <HighlightModal
                isOpen={showHighlightModal}
                onClose={() => {
                    setShowHighlightModal(false);
                    setPendingHighlight(null);
                }}
                selectedText={pendingHighlight}
                onSave={handleSaveHighlight}
                level={activityLevel}
                accentColor="sky"
            />

            <AiAssistant
                isOpen={isAiOpen}
                onToggle={() => setIsAiOpen(!isAiOpen)}
                context={{
                    studentName: userName,
                    book: "Number the Stars",
                    activity: getActivityLabel(),
                    data: getActivityData()
                }}
            />
        </>
    );
};

export default NumberTheStarsModule;

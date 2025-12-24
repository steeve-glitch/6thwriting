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

const SticksAndStonesModule = ({ onBack, userName }) => {
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
CHAPTER ONE

There’s a word for people like me.
Actually, there are a lot of words for people like me.
Freak. Weirdo. Monster.
I’ve heard them all.

But the word I hate the most isn’t any of those. It’s the one that’s supposed to be nice.
*Special.*

Adults use it when they don’t know what else to say. "Elyse is so... special," they tell my mom, their voices trailing off as they stare at my arms.
I look down at my skin. Today, the words *clumsy* and *anxious* are blooming just above my left wrist, in a jagged, dark blue font that matches my mood.
  `;

    // Sentence activity data
    const wordBank = [
        "But", "the", "word", "I", "hate",
        "the", "most", "isn't", "any", "of",
        "those", "."
    ];

    // PEEL quotes for guided mode
    const peelQuotes = [
        "Actually, there are a lot of words for people like me.",
        "It’s the one that’s supposed to be nice. Special.",
        "their voices trailing off as they stare at my arms",
        "the words clumsy and anxious are blooming just above my left wrist"
    ];

    // Sentence expansion data
    const sentenceKernel = "I heard words.";
    const authorSentence = "I heard the sharp, stinging words that people whispered behind their hands.";

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
                return "Student is reconstructing a sentence about Elyse's reaction to labels.";
            case 'reading':
                const highlightSummary = highlights.map(h =>
                    `"${h.text}" (${CATEGORY_CONFIG[h.category]?.label || 'uncategorized'}): ${h.explanation || 'no explanation'}`
                ).join('; ');
                return `Student is analyzing the theme of Identity and the supernatural element (words on skin). Current highlights: ${highlightSummary || 'none yet'}`;
            case 'peel':
                return "Student is writing a PEEL paragraph analyzing the irony of the word 'Special'.";
            case 'expand':
                return `Student is expanding the kernel sentence "${sentenceKernel}" to capture the protagonist's internal voice.`;
            default:
                return "";
        }
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
                                            ${isActive ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
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
                                            Reconstruct the sentence where Elyse reveals the label she hurts from the most.
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
                                        <h2 className="text-xl font-bold text-slate-800 mb-2">Identity Investigation</h2>
                                        <p className="text-slate-600">
                                            Highlight words that show how others perceive Elyse versus how she feels. Look for the supernatural element (words on skin).
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

                                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                                        <p className="text-sm text-orange-800">
                                            <strong>Inquiry Focus:</strong> Why is "Special" worse than "Freak"? How does the author subvert our expectations?
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => {
                                            handleTabComplete('reading');
                                            advanceToNextTab('reading');
                                        }}
                                        className="w-full py-3 bg-orange-600 text-white font-medium rounded-xl hover:bg-orange-700 transition-colors shadow-sm"
                                    >
                                        Complete Investigation & Continue
                                    </button>
                                </div>
                            )}

                            {/* PEEL Writing */}
                            {activeTab === 'peel' && (
                                <PeelBuilder
                                    quotes={peelQuotes}
                                    accentColor="orange"
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
                                    accentColor="orange"
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
                accentColor="orange"
            />

            <AiAssistant
                isOpen={isAiOpen}
                onToggle={() => setIsAiOpen(!isAiOpen)}
                context={{
                    studentName: userName,
                    book: "Sticks and Stones",
                    activity: getActivityLabel(),
                    data: getActivityData()
                }}
            />
        </>
    );
};

export default SticksAndStonesModule;

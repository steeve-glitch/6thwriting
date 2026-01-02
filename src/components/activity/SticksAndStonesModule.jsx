import React, { useState, useEffect } from 'react';
import ActivityLayout from './ActivityLayout';
import TextPanel from './TextPanel';
import SentenceBuilder from './SentenceBuilder';
import PeelBuilder from './PeelBuilder';
import SentenceExpander from './SentenceExpander';
import HighlightModal from './HighlightModal';
import GuidedReadingPanel from './GuidedReadingPanel';
import AiAssistant from '../AiAssistant';
import InstructionBar from '../InstructionBar';
import { useProgress } from '../../context/ProgressContext';
import { PenTool, Move, Highlighter, Layers, Maximize2, User, MapPin, Sparkles, Lightbulb, Swords, Check, BookOpen, ArrowRight } from 'lucide-react';

// Guided reading passages with hints
const GUIDED_PASSAGES = [
    {
        id: 'passage-1',
        text: "Actually, there are a lot of words for people like me.",
        hint: "What's the tone of this opening?"
    },
    {
        id: 'passage-2',
        text: "It's the one that's supposed to be nice. Special.",
        hint: "Why does Elyse hate this word the most?"
    },
    {
        id: 'passage-3',
        text: "their voices trailing off as they stare at my arms",
        hint: "What does this body language reveal about how adults treat Elyse?"
    },
    {
        id: 'passage-4',
        text: "the words clumsy and anxious are blooming just above my left wrist",
        hint: "How do the words on her skin reflect her emotional state?"
    }
];

const INQUIRY_QUESTION = "How does the author show Elyse's internal struggle with being 'different'?";

const CATEGORY_CONFIG = {
    character: { label: 'Character', color: 'blue', icon: User },
    setting: { label: 'Setting', color: 'green', icon: MapPin },
    figurative: { label: 'Figurative Language', color: 'purple', icon: Sparkles },
    theme: { label: 'Theme', color: 'amber', icon: Lightbulb },
    conflict: { label: 'Conflict', color: 'red', icon: Swords }
};

const BOOK_ID = 'sticks-and-stones';

const INSTRUCTIONS = {
    scramble: {
        instruction: "Drag the words into the correct order to build the sentence.",
        tip: "Read the words first. Think about what makes sense!"
    },
    reading: {
        instruction: "Find evidence in the text! Highlight important words or phrases.",
        tip: "Click and drag to select text on the left side."
    },
    peel: {
        instruction: "Write a paragraph step by step. Follow the 4 steps below.",
        tip: "Take your time with each step before moving on."
    },
    expand: {
        instruction: "Make the simple sentence more interesting by adding details.",
        tip: "Answer the questions to add color to your writing."
    }
};

// Glossary definitions for bilingual support
const GLOSSARY_TERMS = [
    { term: "trailing off", definition: "Becoming quieter and quieter until silence." },
    { term: "jagged", definition: "Having rough, sharp points; not smooth." },
    { term: "font", definition: "A specific style of text or letters." },
    { term: "anxious", definition: "Feeling very worried, nervous, or uneasy." },
    { term: "clumsy", definition: "Awkward in movement; likely to drop things or trip." },
    { term: "weirdo", definition: "A word people use to be mean to someone who is different." },
    { term: "blooming", definition: "Appearing or growing, like a flower opening up." }
];

const WRITING_PROMPTS = [
    {
        id: 'tone',
        label: 'Analyze the Tone',
        question: "How does Elyse feel about the labels people use?",
        thesisBuilder: {
            template: "Elyse's internal thoughts reveal her {emotion} about being labeled '{label}'.",
            options: {
                emotion: ["bitterness", "anger", "frustration"],
                label: ["Special", "Freak", "Different"]
            }
        },
        starters: {
            point: ["The author conveys a tone of...", "Elyse's reaction to the word 'Special' shows..."],
            evidence: ["She describes the word as...", "The text says..."],
            explanation: ["This suggests that...", "By hating the 'nice' word, she shows..."],
            link: ["This reveals that...", "Ultimately, the tone is..."]
        }
    },
    {
        id: 'imagery',
        label: 'Analyze the Imagery',
        question: "How do the words on her skin reflect her feelings?",
        thesisBuilder: {
            template: "The {adjective} font on her skin reflects her {feeling} mood.",
            options: {
                adjective: ["jagged", "dark blue", "blooming"],
                feeling: ["anxious", "stormy", "painful"]
            }
        },
        starters: {
            point: ["The imagery of the words on her skin...", "The author connects her physical appearance to..."],
            evidence: ["The text describes the words as...", "For instance..."],
            explanation: ["The word 'jagged' implies...", "This visual description helps us understand..."],
            link: ["This imagery creates...", "Therefore, the supernatural element..."]
        }
    }
];

const SticksAndStonesModule = ({ onBack, userName }) => {
    const { markTabComplete, setLastTab, isTabComplete, getNextIncompleteTab } = useProgress();
    const [activeTab, setActiveTab] = useState('scramble');
    const [isAiOpen, setIsAiOpen] = useState(false);
    const [highlights, setHighlights] = useState([]); // For optional custom highlights
    const [annotations, setAnnotations] = useState([]); // For guided passage analysis
    const [activityLevel, setActivityLevel] = useState(1);

    // New state for reading focus
    const [hasStarted, setHasStarted] = useState(false);
    const [isTextCollapsed, setIsTextCollapsed] = useState(false);

    const completedTabs = {
        scramble: isTabComplete(BOOK_ID, 'scramble'),
        reading: isTabComplete(BOOK_ID, 'reading'),
        peel: isTabComplete(BOOK_ID, 'peel'),
        expand: isTabComplete(BOOK_ID, 'expand')
    };

    const [showHighlightModal, setShowHighlightModal] = useState(false);
    const [pendingHighlight, setPendingHighlight] = useState(null);

    // State to hold pre-selected prompt from Evidence Preview
    const [preSelectedPrompt, setPreSelectedPrompt] = useState(null);

    const tabs = [
        { id: 'scramble', label: 'Build Sentence', shortLabel: '1', icon: Move },
        { id: 'reading', label: 'Find Evidence', shortLabel: '2', icon: Highlighter },
        { id: 'peel', label: 'Write Paragraph', shortLabel: '3', icon: Layers },
        { id: 'expand', label: 'Add Details', shortLabel: '4', icon: Maximize2 }
    ];

    useEffect(() => {
        setLastTab(BOOK_ID, activeTab);
    }, [activeTab, setLastTab]);

    useEffect(() => {
        const nextTab = getNextIncompleteTab(BOOK_ID);
        if (nextTab && nextTab !== activeTab) {
            setActiveTab(nextTab);
        }
    }, []);

    const handleTabComplete = (tabId) => {
        markTabComplete(BOOK_ID, tabId);
    };

    const advanceToNextTab = (currentTabId) => {
        const currentIndex = tabs.findIndex(t => t.id === currentTabId);
        if (currentIndex < tabs.length - 1) {
            setActiveTab(tabs[currentIndex + 1].id);
        }
    };

    const handleStartActivities = () => {
        setHasStarted(true);
        setIsTextCollapsed(true);
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

    // Handle guided passage annotation
    const handleAnnotate = (annotationData) => {
        setAnnotations(prev => {
            const exists = prev.find(a => a.passageId === annotationData.passageId);
            if (exists) {
                return prev.map(a => a.passageId === annotationData.passageId ? annotationData : a);
            }
            return [...prev, annotationData];
        });
    };

    // Remove annotation
    const handleRemoveAnnotation = (passageId) => {
        setAnnotations(prev => prev.filter(a => a.passageId !== passageId));
    };

    // Handle when student selects prompt from Evidence Preview and continues
    const handleSelectPromptAndContinue = (selectedPrompt, evidence) => {
        setPreSelectedPrompt(selectedPrompt);
        handleTabComplete('reading');
        advanceToNextTab('reading');
    };

    // Get all evidence for PEEL (annotations + custom highlights)
    const getAllEvidence = () => {
        const guidedEvidence = annotations.map(a => ({
            text: a.text,
            explanation: a.explanation,
            source: 'guided'
        }));
        const customEvidence = highlights.map(h => ({
            text: h.text,
            explanation: h.explanation || '',
            source: 'custom'
        }));
        return [...guidedEvidence, ...customEvidence];
    };

    // Get activity label for AI context (using kid-friendly labels)
    const getActivityLabel = () => {
        switch (activeTab) {
            case 'scramble': return 'Build the Sentence';
            case 'reading': return 'Find Evidence';
            case 'peel': return 'Write Your Paragraph';
            case 'expand': return 'Add Details';
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

    // Initial "Read First" View
    const renderWelcomeScreen = () => (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                <BookOpen className="w-10 h-10 text-orange-600" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-4">Read the Story First!</h2>
            <p className="text-lg text-slate-600 max-w-md mb-8">
                Take your time to read the text on the left. When you're ready, we'll start analyzing!
            </p>
            <button
                onClick={handleStartActivities}
                className="group flex items-center gap-3 px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
                Start Activities
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
    );

    return (
        <>
            <ActivityLayout
                onBack={onBack}
                accentColor="bg-orange-600"
                bookTitle="Sticks and Stones"
                isTextCollapsed={isTextCollapsed}
                onToggleTextCollapsed={setIsTextCollapsed}
                theme={{
                    mainBg: 'bg-orange-50 bg-notebook-pattern',
                    panelBg: 'bg-white',
                    font: 'font-notebook',
                    borderColor: 'border-orange-200',
                    backgroundImage: (
                        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">  
                            <div className="absolute top-10 left-10 text-6xl font-bold -rotate-12">Freak</div>
                            <div className="absolute bottom-20 right-20 text-8xl font-bold rotate-6">Special</div>
                            <div className="absolute top-1/2 left-20 text-5xl font-bold rotate-12">Words</div>
                            <div className="absolute top-20 right-1/3 text-4xl font-bold -rotate-6">Smart</div>
                        </div>
                    )
                }}
                leftPanel={
                    <TextPanel
                        title="Sticks and Stones"
                        chapter="Chapter 1: The Hallway"
                        content={chapterContent.trim()}
                        highlights={highlights}
                        glossary={GLOSSARY_TERMS}
                        onHighlight={activeTab === 'reading' ? handleHighlight : undefined}
                        onHighlightClick={handleHighlightClick}
                    />
                }
                rightPanel={
                    !hasStarted ? renderWelcomeScreen() : (
                    <div className="flex flex-col h-full gap-4">
                        {/* Tab Switcher with Step Numbers */}
                        <div className="flex p-1 bg-slate-100 rounded-xl flex-shrink-0">
                            {tabs.map((tab, index) => {
                                const Icon = tab.icon;
                                const isCompleted = completedTabs[tab.id];
                                const isActive = activeTab === tab.id;
                                const isPreviousComplete = index === 0 || completedTabs[tabs[index - 1].id];

                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex-1 py-2 px-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-1 sm:gap-2
                                            ${isActive ? 'bg-white text-orange-600 shadow-sm ring-2 ring-orange-200' : 'text-slate-500 hover:text-slate-700'}
                                            ${!isPreviousComplete && !isCompleted ? 'opacity-50' : ''}`}  
                                    >
                                        {isCompleted ? (
                                            <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center">
                                                <Check className="w-3 h-3" />
                                            </div>
                                        ) : (
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
                                                ${isActive ? 'bg-orange-600 text-white' : 'bg-slate-300 text-slate-600'}`}>
                                                {tab.shortLabel}
                                            </div>
                                        )}
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
                                    <InstructionBar
                                        instruction={INSTRUCTIONS.scramble.instruction}
                                        tip={INSTRUCTIONS.scramble.tip}
                                        accentColor="orange"
                                    />
                                    <div className="flex-1 bg-slate-50 rounded-xl p-4 border border-slate-100 shadow-inner min-h-[400px]">
                                        <SentenceBuilder
                                            initialWords={wordBank}
                                            onComplete={() => {
                                                handleTabComplete('scramble');
                                            }}
                                            onNext={() => advanceToNextTab('scramble')}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Close Reading - Guided */}
                            {activeTab === 'reading' && (
                                <div className="flex flex-col h-full">
                                    <GuidedReadingPanel
                                        passages={GUIDED_PASSAGES}
                                        annotations={annotations}
                                        onAnnotate={handleAnnotate}
                                        onRemoveAnnotation={handleRemoveAnnotation}
                                        inquiryQuestion={INQUIRY_QUESTION}
                                        accentColor="orange"
                                        customHighlights={highlights}
                                        onEnableHighlighting={() => setIsTextCollapsed(false)}
                                        minRequired={3}
                                        writingPrompts={WRITING_PROMPTS}
                                        onSelectPromptAndContinue={handleSelectPromptAndContinue}
                                    />
                                </div>
                            )}

                            {/* PEEL Writing */}
                            {activeTab === 'peel' && (
                                <PeelBuilder
                                    evidence={getAllEvidence()}
                                    writingPrompts={WRITING_PROMPTS}
                                    preSelectedPrompt={preSelectedPrompt}
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
                    )
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

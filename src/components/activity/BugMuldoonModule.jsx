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
import { PenTool, Move, Highlighter, Layers, Maximize2, User, MapPin, Sparkles, Lightbulb, Swords, Check, Search, BookOpen, ArrowRight } from 'lucide-react';

// Guided reading passages with hints
const GUIDED_PASSAGES = [
    {
        id: 'passage-1',
        text: "Come in and grab a seat. Not on the flypaper.",
        hint: "How does this line mix danger with everyday bug life?"
    },
    {
        id: 'passage-2',
        text: "He was a bluebottle, and he looked jittery.",
        hint: "What detective story tropes does this use?"
    },
    {
        id: 'passage-3',
        text: "The Garden was a dangerous place, especially for a guy like Eddie.",
        hint: "How is 'The Garden' treated like a noir city?"
    },
    {
        id: 'passage-4',
        text: "Two sugar cubes a day, plus expenses.",
        hint: "What's funny about this payment method?"
    }
];

const INQUIRY_QUESTION = "How does mixing serious detective language with a garden setting create humor?";

const CATEGORY_CONFIG = {
    character: { label: 'Character', color: 'blue', icon: User },
    setting: { label: 'Setting', color: 'green', icon: MapPin },
    figurative: { label: 'Figurative Language', color: 'purple', icon: Sparkles },
    theme: { label: 'Theme', color: 'amber', icon: Lightbulb },
    conflict: { label: 'Conflict', color: 'red', icon: Swords }
};

const BOOK_ID = 'bug-muldoon';

const INSTRUCTIONS = {
    scramble: {
        instruction: "Drag the words into the correct order to build the sentence.",
        tip: "Read the words first. Think about what makes sense!"
    },
    reading: {
        instruction: "Find evidence in the story! Highlight important words or phrases.",
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
    { term: "flypaper", definition: "Sticky paper hanging from the ceiling to catch flies." },
    { term: "bluebottle", definition: "A big, loud fly with a shiny blue body." },
    { term: "jittery", definition: "Very nervous, shaking, or unable to sit still." },
    { term: "compost heap", definition: "A pile of rotting plants and leaves in a garden." },
    { term: "expenses", definition: "Money you spend to do a job that you get paid back later." },
    { term: "steep", definition: "Expensive; costing a lot of sugar cubes!" },
    { term: "private investigator", definition: "A detective who works on their own, not for the police." },
    { term: "contact", definition: "A person who knows secret information." }
];

const WRITING_PROMPTS = [
    {
        id: 'atmosphere',
        label: 'Analyze the Atmosphere',
        question: "How does the author make the garden feel like a dangerous city?",
        thesisBuilder: {
            template: "The author uses {technique} to create a {mood} atmosphere.",
            options: {
                technique: ["dark imagery", "tense dialogue", "mystery"],
                mood: ["suspenseful", "dangerous", "gloomy"]
            }
        },
        starters: {
            point: ["The author establishes a dangerous atmosphere by...", "The setting plays a key role in..."],
            evidence: ["For example, the text states...", "We see this when..."],
            explanation: ["This word suggests...", "This imagery creates a feeling of..."],
            link: ["Therefore, the setting...", "This effectively creates..."]
        }
    },
    {
        id: 'character',
        label: 'Analyze the Character',
        question: "How do we know the fly is nervous?",
        thesisBuilder: {
            template: "By describing the fly's {behavior}, the text reveals his {emotion}.",
            options: {
                behavior: ["shaking legs", "jittery movements", "stuttering voice"],
                emotion: ["intense fear", "nervousness", "panic"]
            }
        },
        starters: {
            point: ["The author shows the fly's nervousness through...", "The character's actions reveal..."],
            evidence: ["The text describes...", "For instance, it says..."],
            explanation: ["This action shows...", "The word 'jittery' implies..."],
            link: ["This helps the reader understand...", "In conclusion, the fly..."]
        }
    }
];

const BugMuldoonModule = ({ onBack, userName }) => {
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
I was sitting in my office, cleaning the flypaper, when the door opened.
It was a fly.

"Is this the office of Bug Muldoon, Private Investigator?" he asked.
"That's right," I said. "Come in and grab a seat. Not on the flypaper."

He sat on the edge of the desk, rubbing his front legs together nervously. He was a bluebottle, and he looked jittery.
"I need your help, Muldoon," he said. "It's about Eddie the Earwig. He's missing."

"Missing?" I asked. "Since when?"
"Since yesterday," said the fly. "He went down to the compost heap to meet a contact, and he never came back."

I leaned back in my chair. The Garden was a dangerous place, especially for a guy like Eddie.
"I'll take the case," I said. "But my rates are steep. Two sugar cubes a day, plus expenses."
  `;

    // Sentence activity data
    const wordBank = [
        "He", "was", "a", "bluebottle", ",", "and",
        "he", "looked", "jittery", "."
    ];

    // PEEL quotes for guided mode
    const peelQuotes = [
        "Come in and grab a seat. Not on the flypaper.",
        "He was a bluebottle, and he looked jittery.",
        "The Garden was a dangerous place, especially for a guy like Eddie.",
        "But my rates are steep. Two sugar cubes a day, plus expenses."
    ];

    // Sentence expansion data
    const sentenceKernel = "The fly sat.";
    const authorSentence = "He sat on the edge of the desk, rubbing his front legs together nervously.";  

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
                return "Student is reconstructing a sentence to understand character description and rhythm.";
            case 'reading':
                const highlightSummary = highlights.map(h =>
                    `"${h.text}" (${CATEGORY_CONFIG[h.category]?.label || 'uncategorized'}): ${h.explanation || 'no explanation'}`
                ).join('; ');
                return `Student is analyzing the 'Noir' genre conventions. Current highlights: ${highlightSummary || 'none yet'}`;
            case 'peel':
                return "Student is writing a PEEL paragraph analyzing how Shipton uses humor and detective tropes.";
            case 'expand':
                return `Student is practicing 'Showing, not Telling' by expanding: "${sentenceKernel}".`; 
            default:
                return "";
        }
    };

    // Initial "Read First" View
    const renderWelcomeScreen = () => (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <BookOpen className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-4">Read the Story First!</h2>
            <p className="text-lg text-slate-600 max-w-md mb-8">
                Take your time to read the text on the left. When you're ready, we'll start the detective work!
            </p>
            <button
                onClick={handleStartActivities}
                className="group flex items-center gap-3 px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
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
                accentColor="bg-green-600"
                bookTitle="Bug Muldoon"
                isTextCollapsed={isTextCollapsed}
                onToggleTextCollapsed={setIsTextCollapsed}
                theme={{
                    mainBg: 'bg-slate-900 bg-noir-pattern',
                    panelBg: 'bg-[#fdfbf6]', // Manila folder color
                    font: 'font-noir',
                    borderColor: 'border-slate-800',
                    backgroundImage: (
                        <div className="absolute -bottom-20 -right-20 opacity-10 rotate-12 pointer-events-none">
                            <Search className="w-96 h-96 text-white" />
                        </div>
                    )
                }}
                leftPanel={
                    <TextPanel
                        title="Bug Muldoon"
                        chapter="Chapter 1: The Case of the Missing Earwig"
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
                                            ${isActive ? 'bg-white text-emerald-600 shadow-sm ring-2 ring-emerald-200' : 'text-slate-500 hover:text-slate-700'}
                                            ${!isPreviousComplete && !isCompleted ? 'opacity-50' : ''}`}  
                                    >
                                        {isCompleted ? (
                                            <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center">
                                                <Check className="w-3 h-3" />
                                            </div>
                                        ) : (
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
                                                ${isActive ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-600'}`}>
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
                                        accentColor="emerald"
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
                                        accentColor="emerald"
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
                                    accentColor="green"
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
                                    accentColor="green"
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
                accentColor="green"
            />

            <AiAssistant
                isOpen={isAiOpen}
                onToggle={() => setIsAiOpen(!isAiOpen)}
                context={{
                    studentName: userName,
                    book: "Bug Muldoon",
                    activity: getActivityLabel(),
                    data: getActivityData()
                }}
            />
        </>
    );
};

export default BugMuldoonModule;

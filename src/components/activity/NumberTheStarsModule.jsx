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
import { PenTool, Move, Highlighter, Layers, Maximize2, User, MapPin, Sparkles, Lightbulb, Swords, Lock, Check, Star, BookOpen, ArrowRight } from 'lucide-react';

// Guided reading passages with hints
const GUIDED_PASSAGES = [
    {
        id: 'passage-1',
        text: "You know I can't beat you. My legs aren't as long.",
        hint: "What does Ellen's response reveal about her attitude?"
    },
    {
        id: 'passage-2',
        text: "She was a stocky ten-year-old, unlike lanky Annemarie.",
        hint: "How does the author use physical traits to contrast them?"
    },
    {
        id: 'passage-3',
        text: "I know I'm going to win the girls' race this week.",
        hint: "What does this tell us about Annemarie's personality?"
    },
    {
        id: 'passage-4',
        text: "Ellen hesitated, then nodded",
        hint: "Why is Ellen's hesitation significant?"
    }
];

const INQUIRY_QUESTION = "How do the physical descriptions of Annemarie and Ellen reveal their different personalities?";

const CATEGORY_CONFIG = {
    character: { label: 'Character', color: 'blue', icon: User },
    setting: { label: 'Setting', color: 'green', icon: MapPin },
    figurative: { label: 'Figurative Language', color: 'purple', icon: Sparkles },
    theme: { label: 'Theme', color: 'amber', icon: Lightbulb },
    conflict: { label: 'Conflict', color: 'red', icon: Swords }
};

const BOOK_ID = 'number-the-stars';

// Simple, kid-friendly instructions for each activity
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
    { term: "lanky", definition: "Tall and thin, with long arms and legs." },
    { term: "stocky", definition: "Strong and solid, often shorter and wider." },
    { term: "civilized", definition: "Polite, well-mannered, and acting like adults." },
    { term: "rucksack", definition: "A strong bag carried on the back, like a backpack." },
    { term: "pleaded", definition: "Asked for something in a serious and emotional way." },
    { term: "athletic meet", definition: "A sports competition where people race." },
    { term: "Copenhagen", definition: "The capital city of Denmark, where the story takes place." }
];

const WRITING_PROMPTS = [
    {
        id: 'contrast',
        label: 'Compare Annemarie and Ellen',
        question: "How does the author show the differences between the two friends?",
        thesisBuilder: {
            template: "The author uses {technique} to contrast Annemarie's {trait1} with Ellen's {trait2}.",
            options: {
                technique: ["physical descriptions", "dialogue", "actions"],
                trait1: ["confidence", "height", "boldness"],
                trait2: ["fear", "shortness", "caution"]
            }
        },
        starters: {
            point: ["The author contrasts the two girls by...", "Through physical description, we see..."],
            evidence: ["The text describes Annemarie as...", "In contrast, Ellen is described as..."],
            explanation: ["This description highlights...", "The difference in their appearance suggests..."],
            link: ["This contrast helps the reader...", "Ultimately, their differences..."]
        }
    },
    {
        id: 'friendship',
        label: 'Analyze their Friendship',
        question: "How does the text show that they are close friends?",
        thesisBuilder: {
            template: "The text demonstrates the strength of their friendship when {character} {action}.",
            options: {
                character: ["Annemarie", "Ellen", "they both"],
                action: ["waits for her friend", "jokes together", "races down the street"]
            }
        },
        starters: {
            point: ["The friendship is clearly shown when...", "The author illustrates their bond by..."],
            evidence: ["For example...", "The text states..."],
            explanation: ["This interaction shows...", "Laughing together suggests..."],
            link: ["Therefore, we can see...", "This moment proves..."]
        }
    }
];

const NumberTheStarsModule = ({ onBack, userName }) => {
    const { markTabComplete, setLastTab, isTabComplete, getNextIncompleteTab } = useProgress();
    const [activeTab, setActiveTab] = useState('scramble');
    const [isAiOpen, setIsAiOpen] = useState(false);
    const [highlights, setHighlights] = useState([]); // For optional custom highlights
    const [annotations, setAnnotations] = useState([]); // For guided passage analysis
    const [activityLevel, setActivityLevel] = useState(1);

    // New state for reading focus
    const [hasStarted, setHasStarted] = useState(false);
    const [isTextCollapsed, setIsTextCollapsed] = useState(false);

    // Sync with progress context
    const completedTabs = {
        scramble: isTabComplete(BOOK_ID, 'scramble'),
        reading: isTabComplete(BOOK_ID, 'reading'),
        peel: isTabComplete(BOOK_ID, 'peel'),
        expand: isTabComplete(BOOK_ID, 'expand')
    };

    // Highlight modal state
    const [showHighlightModal, setShowHighlightModal] = useState(false);
    const [pendingHighlight, setPendingHighlight] = useState(null);

    // State to hold pre-selected prompt from Evidence Preview
    const [preSelectedPrompt, setPreSelectedPrompt] = useState(null);

    // Simplified, kid-friendly tab labels
    const tabs = [
        { id: 'scramble', label: 'Build Sentence', shortLabel: '1', icon: Move },
        { id: 'reading', label: 'Find Evidence', shortLabel: '2', icon: Highlighter },
        { id: 'peel', label: 'Write Paragraph', shortLabel: '3', icon: Layers },
        { id: 'expand', label: 'Add Details', shortLabel: '4', icon: Maximize2 }
    ];

    // Update last visited tab in progress context
    useEffect(() => {
        setLastTab(BOOK_ID, activeTab);
    }, [activeTab, setLastTab]);

    // Start on the next incomplete tab
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

    // Initial "Read First" View
    const renderWelcomeScreen = () => (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center mb-6">
                <BookOpen className="w-10 h-10 text-sky-600" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-4">Read the Story First!</h2>
            <p className="text-lg text-slate-600 max-w-md mb-8">
                Take your time to read the text on the left. When you're ready, we'll start analyzing!
            </p>
            <button
                onClick={handleStartActivities}
                className="group flex items-center gap-3 px-8 py-4 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
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
                accentColor="bg-sky-600"
                bookTitle="Number the Stars"
                isTextCollapsed={isTextCollapsed}
                onToggleTextCollapsed={setIsTextCollapsed}
                theme={{
                    mainBg: 'bg-slate-800',
                    panelBg: 'bg-slate-50',
                    font: 'font-historical',
                    borderColor: 'border-slate-300',
                    backgroundImage: (
                        <div className="absolute top-10 right-10 opacity-10 pointer-events-none">
                            <Star className="w-[500px] h-[500px] text-white" fill="white" />
                        </div>
                    )
                }}
                leftPanel={
                    <TextPanel
                        title="Number the Stars"
                        chapter="Chapter 1: Why Are You Running?"
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
                                            ${isActive ? 'bg-white text-sky-600 shadow-sm ring-2 ring-sky-200' : 'text-slate-500 hover:text-slate-700'}
                                            ${!isPreviousComplete && !isCompleted ? 'opacity-50' : ''}`}  
                                    >
                                        {isCompleted ? (
                                            <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center">
                                                <Check className="w-3 h-3" />
                                            </div>
                                        ) : (
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
                                                ${isActive ? 'bg-sky-600 text-white' : 'bg-slate-300 text-slate-600'}`}>
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
                                        accentColor="sky"
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
                                        accentColor="sky"
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

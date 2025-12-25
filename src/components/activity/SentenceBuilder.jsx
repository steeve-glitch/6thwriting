import React, { useState, useEffect } from 'react';
import {
    DndContext,
    DragOverlay,
    pointerWithin,
    rectIntersection,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    defaultDropAnimationSideEffects,
    useDroppable,
    MeasuringStrategy,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableWord } from './SortableWord';
import { Check, RotateCcw, Trophy, ArrowRight, X, ArrowUp, MousePointer2, Lightbulb, Eye, EyeOff, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Learning Purpose Component - explains WHY this activity matters
const LearningPurpose = ({ onDismiss }) => {
    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200 overflow-hidden"
        >
            <div className="p-4">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
                        <Lightbulb className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-amber-800 text-sm mb-1">Why This Matters</h4>
                        <p className="text-sm text-amber-700 leading-relaxed">
                            When you rebuild an author's sentence, you learn how professional writers
                            put words together. This helps you <strong>understand grammar patterns</strong> and
                            <strong> write better sentences</strong> in your own work.
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                            <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full font-medium">
                                📝 Sentence Structure
                            </span>
                            <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full font-medium">
                                🧠 Word Order
                            </span>
                            <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full font-medium">
                                ✨ Author's Craft
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onDismiss}
                        className="p-1 text-amber-400 hover:text-amber-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

// Example Preview Component - shows the target sentence
const ExamplePreview = ({ sentence, isVisible, onToggle }) => {
    return (
        <div className="mb-4">
            <button
                onClick={onToggle}
                className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mb-2"
            >
                {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {isVisible ? 'Hide Example' : 'Need Help? See the Answer'}
            </button>
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-indigo-50 border border-indigo-200 rounded-xl p-4"
                    >
                        <div className="flex items-start gap-3">
                            <BookOpen className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs uppercase tracking-wider text-indigo-500 font-semibold mb-1">
                                    Target Sentence
                                </p>
                                <p className="text-indigo-800 font-serif text-lg">
                                    "{sentence}"
                                </p>
                                <p className="text-xs text-indigo-600 mt-2 italic">
                                    Now try to build it yourself by dragging the words!
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// First-time user hint component
const FirstTimeHint = ({ onDismiss }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm rounded-2xl"
        >
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm mx-4 text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MousePointer2 className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">How to Play</h3>
                <p className="text-slate-600 text-sm mb-4">
                    Drag words from the <strong>Word Bank</strong> below and drop them into the <strong>Your Sentence</strong> box above to build the correct sentence.
                </p>
                <button
                    onClick={onDismiss}
                    className="w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors"
                >
                    Got it!
                </button>
            </div>
        </motion.div>
    );
};

// Animated arrow pointing up
const DragArrowHint = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none"
        >
            <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
                <ArrowUp className="w-6 h-6 text-indigo-500" />
            </motion.div>
            <span className="text-xs font-medium text-indigo-600 whitespace-nowrap">Drag words up here</span>
        </motion.div>
    );
};

const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
        styles: {
            active: {
                opacity: '0.5',
            },
        },
    }),
};

// Fisher-Yates shuffle algorithm
const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const DroppableContainer = ({ id, items, title, placeholder, isRow = false, isCorrect, isWrong, isOver, isDragging, showFirstItemPulse = false }) => {
    const { setNodeRef, isOver: isOverContainer } = useDroppable({ id });

    // Determine if we should show the "drop here" state
    const showDropState = isDragging && (isOver || isOverContainer);

    let borderColor = "border-slate-200";
    let bgColor = "bg-slate-50/50";
    let extraStyles = "";

    if (isCorrect) {
        borderColor = "border-green-400";
        bgColor = "bg-green-50";
    } else if (isWrong) {
        borderColor = "border-red-300";
        bgColor = "bg-red-50";
    } else if (showDropState) {
        borderColor = "border-indigo-400";
        bgColor = "bg-indigo-50";
        extraStyles = "ring-4 ring-indigo-100 scale-[1.02]";
    }

    return (
        <div
            ref={setNodeRef}
            className={`flex flex-col h-full rounded-2xl border-3 border-dashed ${borderColor} ${bgColor} p-5 transition-all duration-200 ${extraStyles}`}
        >
            {title && (
                <h3 className={`text-sm font-bold uppercase tracking-widest mb-4 ml-1 transition-colors ${showDropState ? 'text-indigo-500' : 'text-slate-400'}`}>
                    {title} {showDropState && '← Drop here!'}
                </h3>
            )}

            <SortableContext id={id} items={items} strategy={horizontalListSortingStrategy}>
                <div
                    className={`
                        flex flex-wrap gap-3 min-h-[120px] content-start p-2 rounded-xl
                        ${isRow ? 'flex-row items-center' : 'flex-row'}
                        ${showDropState ? 'bg-indigo-100/50' : ''}
                    `}
                >
                    {items.map((item, index) => (
                        <SortableWord
                            key={item.id}
                            id={item.id}
                            text={item.text}
                            showPulse={showFirstItemPulse && index === 0}
                        />
                    ))}

                    {items.length === 0 && placeholder && (
                        <div className={`w-full h-28 flex items-center justify-center italic text-sm rounded-xl border-2 border-dashed
                            ${showDropState ? 'text-indigo-500 border-indigo-300 bg-indigo-50' : 'text-slate-400 border-transparent'}`}>
                            {showDropState ? '👆 Drop the word here!' : placeholder}
                        </div>
                    )}
                </div>
            </SortableContext>
        </div>
    );
};

export default function SentenceBuilder({ initialWords, onComplete, onNext }) {
    // Generate unique IDs for the target words to track correct order
    // initialWords is expected to be in the CORRECT order
    const [targetOrder] = useState(initialWords);
    
    // State: items object containing 'bank' and 'sentence' arrays
    const [items, setItems] = useState({
        // Shuffle the initial words for the bank
        bank: shuffleArray(initialWords.map((w, i) => ({ id: `word-${i}-${w}`, text: w, originalIndex: i }))),
        sentence: [],
    });

    const [activeId, setActiveId] = useState(null);
    const [overContainerId, setOverContainerId] = useState(null);
    const [checkStatus, setCheckStatus] = useState('idle'); // idle, correct, wrong
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [showFirstTimeHint, setShowFirstTimeHint] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const [showLearningPurpose, setShowLearningPurpose] = useState(true);
    const [showExamplePreview, setShowExamplePreview] = useState(false);

    // The target sentence as a string for the example preview
    const targetSentence = targetOrder.join(' ');

    // Check if user has seen the hint before
    useEffect(() => {
        const hasSeenHint = localStorage.getItem('sentenceBuilder_hintSeen');
        if (!hasSeenHint) {
            setShowFirstTimeHint(true);
        }
        // Check if learning purpose was dismissed before
        const hasSeenLearning = localStorage.getItem('sentenceBuilder_learningSeen');
        if (hasSeenLearning) {
            setShowLearningPurpose(false);
        }
    }, []);

    const dismissLearningPurpose = () => {
        setShowLearningPurpose(false);
        localStorage.setItem('sentenceBuilder_learningSeen', 'true');
    };

    const dismissFirstTimeHint = () => {
        setShowFirstTimeHint(false);
        localStorage.setItem('sentenceBuilder_hintSeen', 'true');
    };

    // Configure sensors with activation constraints for better UX
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // 8px movement required before drag starts
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 150, // 150ms hold before drag starts on touch
                tolerance: 5, // 5px movement tolerance during delay
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Custom collision detection that prioritizes containers
    const collisionDetection = (args) => {
        // First check if we're inside a container using pointerWithin
        const pointerCollisions = pointerWithin(args);

        if (pointerCollisions.length > 0) {
            return pointerCollisions;
        }

        // Fallback to rectIntersection for edge cases
        return rectIntersection(args);
    };

    const findContainer = (id) => {
        if (id in items) return id;
        return Object.keys(items).find((key) => items[key].find((i) => i.id === id));
    };

    const handleDragStart = (event) => {
        const { active } = event;
        setActiveId(active.id);
        setCheckStatus('idle'); // Reset status on interaction
        setFeedbackMessage('');
        setHasInteracted(true); // User has started dragging
    };

    const handleDragOver = (event) => {
        const { active, over } = event;
        const overId = over?.id;

        // Track which container we're over for visual feedback
        if (overId === 'bank' || overId === 'sentence') {
            setOverContainerId(overId);
        } else if (overId) {
            const container = findContainer(overId);
            setOverContainerId(container);
        } else {
            setOverContainerId(null);
        }

        if (!overId || active.id === overId) return;

        // Find the containers
        const activeContainer = findContainer(active.id);
        const overContainer = findContainer(overId) || (overId === 'bank' || overId === 'sentence' ? overId : null);

        if (!activeContainer || !overContainer || activeContainer === overContainer) {
            return;
        }

        setItems((prev) => {
            const activeItems = prev[activeContainer];
            const overItems = prev[overContainer];

            const activeIndex = activeItems.findIndex((i) => i.id === active.id);
            let overIndex;

            // If dropping directly on a container (not an item), add to end
            if (overId === 'bank' || overId === 'sentence') {
                overIndex = overItems.length;
            } else {
                const isBelowOverItem =
                    over &&
                    active.rect.current.translated &&
                    active.rect.current.translated.top > over.rect.top + over.rect.height;

                const modifier = isBelowOverItem ? 1 : 0;
                overIndex = overItems.findIndex((i) => i.id === overId) + modifier;
            }

            return {
                ...prev,
                [activeContainer]: [
                    ...prev[activeContainer].filter((item) => item.id !== active.id),
                ],
                [overContainer]: [
                    ...prev[overContainer].slice(0, overIndex),
                    activeItems[activeIndex],
                    ...prev[overContainer].slice(overIndex, prev[overContainer].length),
                ],
            };
        });
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (!over) {
            setActiveId(null);
            setOverContainerId(null);
            return;
        }

        const activeContainer = findContainer(active.id);
        const overId = over.id;

        // Check if we're dropping on a container directly
        const isOverContainer = overId === 'bank' || overId === 'sentence';
        const overContainer = isOverContainer ? overId : findContainer(overId);

        // Handle cross-container drops (when dropping directly on container)
        if (activeContainer && overContainer && activeContainer !== overContainer && isOverContainer) {
            setItems((prev) => {
                const activeItems = prev[activeContainer];
                const activeIndex = activeItems.findIndex((i) => i.id === active.id);

                if (activeIndex === -1) return prev;

                return {
                    ...prev,
                    [activeContainer]: prev[activeContainer].filter((item) => item.id !== active.id),
                    [overContainer]: [...prev[overContainer], activeItems[activeIndex]],
                };
            });
        }
        // Handle reordering within the same container
        else if (activeContainer && overContainer && activeContainer === overContainer && !isOverContainer) {
            const activeIndex = items[activeContainer].findIndex((i) => i.id === active.id);
            const overIndex = items[activeContainer].findIndex((i) => i.id === over.id);

            if (activeIndex !== overIndex && overIndex !== -1) {
                setItems((prev) => ({
                    ...prev,
                    [activeContainer]: arrayMove(prev[activeContainer], activeIndex, overIndex),
                }));
            }
        }

        setActiveId(null);
        setOverContainerId(null);
    };

    const handleDragCancel = () => {
        setActiveId(null);
        setOverContainerId(null);
    };

    const checkAnswer = () => {
        const currentSentence = items.sentence.map(i => i.text);
        
        // Basic length check
        if (currentSentence.length !== targetOrder.length) {
            setCheckStatus('wrong');
            setFeedbackMessage(`You need to use all ${targetOrder.length} words. currently using ${currentSentence.length}.`);
            return;
        }

        // Exact match check
        const isCorrect = currentSentence.every((word, index) => word === targetOrder[index]);

        if (isCorrect) {
            setCheckStatus('correct');
            setFeedbackMessage('Perfect! You reconstructed the sentence exactly.');
            if (onComplete) onComplete();
        } else {
            setCheckStatus('wrong');
            setFeedbackMessage('Not quite right. Check the word order and punctuation.');
        }
    };

    const handleReset = () => {
        setItems({
            bank: shuffleArray(initialWords.map((w, i) => ({ id: `word-${i}-${w}`, text: w, originalIndex: i }))),
            sentence: [],
        });
        setCheckStatus('idle');
        setFeedbackMessage('');
    };

    // Helper to get active item for overlay
    const activeItem = activeId
        ? (items.bank.find(i => i.id === activeId) || items.sentence.find(i => i.id === activeId))
        : null;

    if (checkStatus === 'correct') {
         return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col h-full items-center justify-center p-6 text-center space-y-5"
            >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <Trophy className="w-10 h-10 text-green-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Sentence Mastered!</h2>
                    <p className="text-slate-600 text-lg font-serif">"{targetOrder.join(' ')}"</p>
                </div>

                {/* Learning Reflection */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 p-4 max-w-md text-left">
                    <h4 className="font-bold text-green-800 text-sm mb-2 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" /> What You Learned
                    </h4>
                    <ul className="text-sm text-green-700 space-y-1">
                        <li>• How this author structures sentences</li>
                        <li>• The importance of word order for meaning</li>
                        <li>• Grammar patterns you can use in your own writing</li>
                    </ul>
                </div>

                <div className="flex gap-3 w-full max-w-xs">
                     <button
                        onClick={handleReset}
                        className="flex-1 py-3 px-4 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                        <RotateCcw className="w-4 h-4" /> Replay
                    </button>
                    {onNext && (
                        <button
                            onClick={onNext}
                            className="flex-1 py-3 px-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                        >
                            Next Activity <ArrowRight className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </motion.div>
        );
    }

    return (
        <div className="flex flex-col h-full gap-4 relative">
            {/* Learning Purpose - dismissible educational context */}
            <AnimatePresence>
                {showLearningPurpose && (
                    <LearningPurpose onDismiss={dismissLearningPurpose} />
                )}
            </AnimatePresence>

            {/* Example Preview - optional help */}
            <ExamplePreview
                sentence={targetSentence}
                isVisible={showExamplePreview}
                onToggle={() => setShowExamplePreview(!showExamplePreview)}
            />

            {/* First-time user overlay */}
            <AnimatePresence>
                {showFirstTimeHint && (
                    <FirstTimeHint onDismiss={dismissFirstTimeHint} />
                )}
            </AnimatePresence>

            <DndContext
                sensors={sensors}
                collisionDetection={collisionDetection}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
                measuring={{
                    droppable: {
                        strategy: MeasuringStrategy.Always,
                    },
                }}
            >
                {/* Workspace: The Sentence Strip */}
                <div className="flex-1 min-h-[180px]">
                    <DroppableContainer
                        id="sentence"
                        title="Your Sentence"
                        placeholder="Drag words here to build your sentence..."
                        items={items.sentence}
                        isRow
                        isCorrect={checkStatus === 'correct'}
                        isWrong={checkStatus === 'wrong'}
                        isOver={overContainerId === 'sentence'}
                        isDragging={!!activeId}
                    />
                     {/* Feedback Area */}
                    <div className="h-8 mt-2 flex items-center justify-center">
                        <AnimatePresence>
                            {feedbackMessage && (
                                <motion.p 
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className={`text-sm font-medium flex items-center gap-2 ${checkStatus === 'wrong' ? 'text-red-500' : 'text-green-600'}`}
                                >
                                    {checkStatus === 'wrong' && <X className="w-4 h-4" />}
                                    {feedbackMessage}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Source: The Word Bank */}
                <div className="flex-1 min-h-[150px] relative">
                    {/* Show arrow hint if user hasn't interacted yet */}
                    {!hasInteracted && items.sentence.length === 0 && !showFirstTimeHint && (
                        <DragArrowHint />
                    )}
                    <DroppableContainer
                        id="bank"
                        title="Word Bank"
                        placeholder="All words used!"
                        items={items.bank}
                        isOver={overContainerId === 'bank'}
                        isDragging={!!activeId}
                        showFirstItemPulse={!hasInteracted && items.sentence.length === 0 && !showFirstTimeHint}
                    />
                </div>

                <DragOverlay dropAnimation={dropAnimation}>
                    {activeItem ? <SortableWord id={activeItem.id} text={activeItem.text} isOverlay /> : null}
                </DragOverlay>
            </DndContext>

            {/* Action Bar */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <button
                    onClick={handleReset}
                    className="text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg hover:bg-slate-50"
                >
                    <RotateCcw className="w-4 h-4" /> Reset
                </button>

                <button
                    onClick={checkAnswer}
                    disabled={items.sentence.length === 0}
                    className={`
                        flex items-center gap-2 px-6 py-3 rounded-xl font-bold shadow-sm transition-all
                        ${items.sentence.length === 0 
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md active:scale-95'}
                    `}
                >
                    <Check className="w-5 h-5" />
                    Check Answer
                </button>
            </div>
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    defaultDropAnimationSideEffects,
    useDroppable,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableWord } from './SortableWord';
import { Check, RotateCcw, Trophy, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

const DroppableContainer = ({ id, items, title, placeholder, isRow = false, isCorrect, isWrong }) => {
    const { setNodeRef } = useDroppable({ id });

    let borderColor = "border-slate-200";
    let bgColor = "bg-slate-50/50";
    
    if (isCorrect) {
        borderColor = "border-green-400";
        bgColor = "bg-green-50";
    } else if (isWrong) {
        borderColor = "border-red-300";
        bgColor = "bg-red-50";
    }

    return (
        <div
            ref={setNodeRef}
            className={`flex flex-col h-full rounded-2xl border-2 border-dashed ${borderColor} ${bgColor} p-4 transition-colors hover:border-brand-200 hover:bg-brand-50/30`}
        >
            {title && (
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">
                    {title}
                </h3>
            )}

            <SortableContext id={id} items={items} strategy={rectSortingStrategy}>
                <div
                    className={`
                flex flex-wrap gap-3 min-h-[100px] content-start
                ${isRow ? 'flex-row items-center' : 'flex-row'} 
            `}
                >
                    {items.map((item) => (
                        <SortableWord key={item.id} id={item.id} text={item.text} />
                    ))}

                    {items.length === 0 && placeholder && (
                        <div className="w-full h-24 flex items-center justify-center text-slate-400 italic text-sm">
                            {placeholder}
                        </div>
                    )}
                </div>
            </SortableContext>
        </div>
    );
};

export default function SentenceBuilder({ initialWords, onComplete }) {
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
    const [checkStatus, setCheckStatus] = useState('idle'); // idle, correct, wrong
    const [feedbackMessage, setFeedbackMessage] = useState('');

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const findContainer = (id) => {
        if (id in items) return id;
        return Object.keys(items).find((key) => items[key].find((i) => i.id === id));
    };

    const handleDragStart = (event) => {
        const { active } = event;
        setActiveId(active.id);
        setCheckStatus('idle'); // Reset status on interaction
        setFeedbackMessage('');
    };

    const handleDragOver = (event) => {
        const { active, over } = event;
        const overId = over?.id;

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

            if (overId in prev) {
                overIndex = overItems.length + 1;
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
        const activeContainer = findContainer(active.id);
        const overContainer = over ? (findContainer(over.id) || (over.id === 'bank' || over.id === 'sentence' ? over.id : null)) : null;

        if (
            activeContainer &&
            overContainer &&
            activeContainer === overContainer
        ) {
            const activeIndex = items[activeContainer].findIndex((i) => i.id === active.id);
            const overIndex = items[activeContainer].findIndex((i) => i.id === over.id);

            if (activeIndex !== overIndex) {
                setItems((prev) => ({
                    ...prev,
                    [activeContainer]: arrayMove(prev[activeContainer], activeIndex, overIndex),
                }));
            }
        }

        setActiveId(null);
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
                className="flex flex-col h-full items-center justify-center p-8 text-center space-y-6"
            >
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Trophy className="w-12 h-12 text-green-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Sentence Mastered!</h2>
                    <p className="text-slate-600 text-lg">"{targetOrder.join(' ')}"</p>
                </div>
                
                <div className="flex gap-4 w-full max-w-xs">
                     <button 
                        onClick={handleReset}
                        className="flex-1 py-3 px-4 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                        <RotateCcw className="w-4 h-4" /> Replay
                    </button>
                    {onComplete && (
                        <button 
                            onClick={onComplete}
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
        <div className="flex flex-col h-full gap-6">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                {/* Workspace: The Sentence Strip */}
                <div className="flex-1 min-h-[150px]">
                    <DroppableContainer
                        id="sentence"
                        title="Your Sentence"
                        placeholder="Drag words here to build your sentence..."
                        items={items.sentence}
                        isRow
                        isCorrect={checkStatus === 'correct'}
                        isWrong={checkStatus === 'wrong'}
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
                <div className="flex-1">
                    <DroppableContainer
                        id="bank"
                        title="Word Bank"
                        placeholder="All words used!"
                        items={items.bank}
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

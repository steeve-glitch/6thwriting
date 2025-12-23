import React, { useState } from 'react';
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

const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
        styles: {
            active: {
                opacity: '0.5',
            },
        },
    }),
};

const DroppableContainer = ({ id, items, title, placeholder, isRow = false }) => {
    const { setNodeRef } = useDroppable({ id });

    return (
        <div
            ref={setNodeRef}
            className="flex flex-col h-full bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 p-4 transition-colors hover:border-brand-200 hover:bg-brand-50/30"
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

export default function SentenceBuilder({ initialWords, checkSolution }) {
    // State: items object containing 'bank' and 'sentence' arrays
    const [items, setItems] = useState({
        bank: initialWords.map((w, i) => ({ id: `word-${i}-${w}`, text: w })),
        sentence: [],
    });

    const [activeId, setActiveId] = useState(null);

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
                // We are over a container (likely empty or appending)
                // If it's the sentence container, we typically want to append to the end or insert at 0 if empty
                overIndex = overItems.length + 1;
            } else {
                // We are over an item
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

    // Helper to get active item for overlay
    const activeItem = activeId
        ? (items.bank.find(i => i.id === activeId) || items.sentence.find(i => i.id === activeId))
        : null;

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
                    />
                </div>

                {/* Source: The Word Bank */}
                <div className="flex-1">
                    <DroppableContainer
                        id="bank"
                        title="Word Bank"
                        placeholder="Empty"
                        items={items.bank}
                    />
                </div>

                <DragOverlay dropAnimation={dropAnimation}>
                    {activeItem ? <SortableWord id={activeItem.id} text={activeItem.text} isOverlay /> : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}

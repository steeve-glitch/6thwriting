import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export const SortableWord = ({ id, text, isOverlay, showPulse = false }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
        isSorting,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: transition || 'transform 200ms cubic-bezier(0.25, 1, 0.5, 1)',
        opacity: isDragging ? 0.4 : 1,
    };

    // Overlay style (the item being dragged)
    if (isOverlay) {
        return (
            <div
                className="px-5 py-3 rounded-xl text-lg font-bold cursor-grabbing select-none border-2
                    bg-indigo-500 text-white border-indigo-600 shadow-2xl scale-105
                    ring-4 ring-indigo-400/30 animate-pulse"
                style={{ transform: 'rotate(-2deg)' }}
            >
                {text}
            </div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`
                px-4 py-2.5 rounded-xl text-lg font-medium select-none border-2
                ${isDragging
                    ? 'bg-slate-100 border-dashed border-slate-300 text-slate-400'
                    : 'bg-white text-slate-700 border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md hover:scale-105 cursor-grab active:cursor-grabbing'
                }
                ${showPulse ? 'animate-pulse ring-2 ring-indigo-400 ring-offset-2' : ''}
                transition-all duration-200
            `}
        >
            {text}
        </div>
    );
};

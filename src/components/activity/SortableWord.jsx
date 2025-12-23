import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export const SortableWord = ({ id, text, isOverlay }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`
        px-4 py-2 rounded-xl text-lg font-medium cursor-grab active:cursor-grabbing select-none border-2
        ${isDragging || isOverlay
                    ? 'bg-brand-500 text-white border-brand-600 shadow-xl scale-110 z-50 ring-4 ring-brand-500/20'
                    : 'bg-white text-slate-700 border-slate-200 shadow-sm hover:border-brand-300 hover:shadow-md'
                }
        transition-colors duration-200
      `}
        >
            {text}
        </div>
    );
};

import React, { useState, useRef, useEffect } from 'react';
import { User, MapPin, Sparkles, Lightbulb, Swords, Book } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORY_ICONS = {
    character: User,
    setting: MapPin,
    figurative: Sparkles,
    theme: Lightbulb,
    conflict: Swords
};

const TextPanel = ({ title, content, chapter, highlights = [], glossary = [], onHighlight, onHighlightClick }) => {
    const [hoveredHighlight, setHoveredHighlight] = useState(null);
    const [activeDefinition, setActiveDefinition] = useState(null);
    const textRef = useRef(null);

    // Close definition when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (activeDefinition && !e.target.closest('.glossary-term') && !e.target.closest('.definition-card')) {
                setActiveDefinition(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activeDefinition]);

    const handleMouseUp = () => {
        const selection = window.getSelection();
        if (!selection.rangeCount || selection.isCollapsed) return;

        const text = selection.toString();

        // Simple verification to ensure selection is within this component
        if (text.length > 0 && onHighlight) {
            onHighlight({ text });
            selection.removeAllRanges();
        }
    };

    const handleGlossaryClick = (e, term, definition) => {
        e.stopPropagation();
        const rect = e.target.getBoundingClientRect();
        const containerRect = textRef.current.getBoundingClientRect();
        
        // Calculate position relative to container
        const top = rect.bottom - containerRect.top + 10;
        const left = rect.left - containerRect.left; // Align left with word
        
        // Check if there is space below
        const spaceBelow = containerRect.height - (rect.bottom - containerRect.top);
        const showAbove = spaceBelow < 180; // Heuristic for card height

        setActiveDefinition({
            term,
            definition,
            showAbove,
            position: { top, left, height: rect.height }
        });
    };

    const renderContent = () => {
        if (!content) return null;

        // Split by paragraph
        return content.split('\n').map((paragraph, pIdx) => {
            if (!paragraph.trim()) return <br key={pIdx} />;

            let children = [paragraph];

            // 1. Process Highlights
            if (highlights.length > 0) {
                highlights.forEach((h, hIdx) => {
                    const newChildren = [];
                    children.forEach(child => {
                        if (typeof child === 'string') {
                            const regex = new RegExp(`(${h.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                            const parts = child.split(regex);
                            parts.forEach((part, i) => {
                                if (part.toLowerCase() === h.text.toLowerCase()) {
                                    newChildren.push(
                                        <span
                                            key={`hl-${pIdx}-${hIdx}-${i}`}
                                            className={`relative bg-${h.color}-200 border-b-2 border-${h.color}-400 rounded-sm px-1 cursor-pointer hover:bg-${h.color}-300 transition-colors`}
                                            onMouseEnter={() => setHoveredHighlight(h)}
                                            onMouseLeave={() => setHoveredHighlight(null)}
                                            onClick={() => onHighlightClick && onHighlightClick(h)}
                                        >
                                            {part}
                                            {h.category && (
                                                <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full bg-${h.color}-500`} />
                                            )}
                                        </span>
                                    );
                                } else if (part) {
                                    newChildren.push(part);
                                }
                            });
                        } else {
                            newChildren.push(child);
                        }
                    });
                    children = newChildren;
                });
            }

            // 2. Process Glossary Terms (iterate over the already highlighted structure)
            if (glossary.length > 0) {
                glossary.forEach((item, gIdx) => {
                    const newChildren = [];
                    children.forEach(child => {
                        if (typeof child === 'string') {
                            const regex = new RegExp(`\\b(${item.term})\\b`, 'gi'); // Use word boundaries
                            const parts = child.split(regex);
                            parts.forEach((part, i) => {
                                if (part.toLowerCase() === item.term.toLowerCase()) {
                                    newChildren.push(
                                        <span
                                            key={`gl-${pIdx}-${gIdx}-${i}`}
                                            className="glossary-term cursor-pointer text-indigo-700 font-medium decoration-indigo-400 decoration-2 underline-offset-2 decoration-dotted border-b border-transparent hover:bg-indigo-50 rounded px-0.5 transition-all"
                                            onClick={(e) => handleGlossaryClick(e, item.term, item.definition)}
                                        >
                                            {part}
                                        </span>
                                    );
                                } else if (part) {
                                    newChildren.push(part);
                                }
                            });
                        } else {
                            newChildren.push(child);
                        }
                    });
                    children = newChildren;
                });
            }

            return (
                <p key={pIdx} className="mb-6 text-slate-700 relative">
                    {children}
                </p>
            );
        });
    };

    return (
        <div className="h-full bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col relative">
            <div className="bg-slate-50 border-b border-slate-100 p-6 flex justify-between items-start">
                <div>
                    <span className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-1 block">
                        Source Text • {chapter}
                    </span>
                    <h2 className="text-2xl font-serif font-bold text-slate-800">
                        {title}
                    </h2>
                </div>
                {glossary.length > 0 && (
                    <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full">
                        <Book className="w-3.5 h-3.5" />
                        <span>{glossary.length} vocabulary words</span>
                    </div>
                )}
            </div>

            <div
                ref={textRef}
                className="flex-1 overflow-y-auto p-8 custom-scrollbar selection:bg-brand-200 relative"
                onMouseUp={handleMouseUp}
            >
                <div className="prose prose-lg prose-slate max-w-none font-serif leading-relaxed">
                    {renderContent()}
                </div>

                {/* Definition Popover */}
                <AnimatePresence>
                    {activeDefinition && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            style={{ 
                                top: activeDefinition.showAbove 
                                    ? activeDefinition.position.top - activeDefinition.position.height - 20 // 20px gap + arrow
                                    : activeDefinition.position.top,
                                left: Math.max(10, Math.min(activeDefinition.position.left, textRef.current.clientWidth - 260)), // Keep within bounds
                            }}
                            className={`definition-card absolute z-50 w-64 bg-slate-800 text-white p-4 rounded-xl shadow-xl border border-slate-700 ${activeDefinition.showAbove ? '-translate-y-full' : ''}`}
                        >
                            <div className="flex items-start gap-3">
                                <Book className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-lg capitalize mb-1 text-white">
                                        {activeDefinition.term}
                                    </h4>
                                    <p className="text-sm text-slate-300 leading-relaxed">
                                        {activeDefinition.definition}
                                    </p>
                                </div>
                            </div>
                            {/* Arrow */}
                            <div 
                                className={`absolute left-4 w-4 h-4 bg-slate-800 transform rotate-45 border-slate-700
                                    ${activeDefinition.showAbove 
                                        ? '-bottom-2 border-b border-r' 
                                        : '-top-2 border-t border-l'}`}
                            ></div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default TextPanel;

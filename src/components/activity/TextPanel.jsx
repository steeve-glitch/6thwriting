import React from 'react';

const TextPanel = ({ title, content, chapter, highlights = [], onHighlight }) => {

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

    const renderContent = () => {
        if (!content) return null;

        // Split by paragraph
        return content.split('\n').map((paragraph, pIdx) => {
            if (!paragraph.trim()) return <br key={pIdx} />;

            let children = [paragraph];

            // Very basic simple string matching for highlights (MVP)
            if (highlights.length > 0) {
                highlights.forEach(h => {
                    const newChildren = [];
                    children.forEach(child => {
                        if (typeof child === 'string') {
                            // case insensitive split for better UX
                            const regex = new RegExp(`(${h.text})`, 'gi');
                            const parts = child.split(regex);
                            parts.forEach((part, i) => {
                                if (part.toLowerCase() === h.text.toLowerCase()) {
                                    newChildren.push(
                                        <span key={`${pIdx}-${h.text}-${i}`} className={`bg-${h.color}-200 border-b-2 border-${h.color}-400 rounded-sm px-1 cursor-pointer hover:bg-${h.color}-300 transition-colors`}>
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
                <p key={pIdx} className="mb-6 text-slate-700">
                    {children}
                </p>
            );
        });
    };

    return (
        <div className="h-full bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="bg-slate-50 border-b border-slate-100 p-6">
                <span className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-1 block">
                    Source Text • {chapter}
                </span>
                <h2 className="text-2xl font-serif font-bold text-slate-800">
                    {title}
                </h2>
            </div>

            <div
                className="flex-1 overflow-y-auto p-8 custom-scrollbar selection:bg-brand-200"
                onMouseUp={handleMouseUp}
            >
                <div className="prose prose-lg prose-slate max-w-none font-serif leading-relaxed">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default TextPanel;

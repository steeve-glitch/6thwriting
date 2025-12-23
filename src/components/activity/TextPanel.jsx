import React from 'react';

const TextPanel = ({ title, content, chapter }) => {
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

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="prose prose-lg prose-slate max-w-none font-serif leading-relaxed">
                    {content.split('\n').map((paragraph, idx) => (
                        <p key={idx} className="mb-6 text-slate-700">
                            {paragraph}
                        </p>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TextPanel;

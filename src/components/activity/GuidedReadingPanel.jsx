import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Check, Plus, Highlighter, X, Lightbulb, ChevronRight, Target, ArrowRight, Quote, Sparkles } from 'lucide-react';

const GuidedReadingPanel = ({
    passages = [],
    annotations = [],
    onAnnotate,
    onRemoveAnnotation,
    inquiryQuestion,
    accentColor = 'sky',
    customHighlights = [],
    onEnableHighlighting,
    minRequired = 3,
    writingPrompts = [],
    onSelectPromptAndContinue
}) => {
    const [selectedPassage, setSelectedPassage] = useState(null);
    const [analysisText, setAnalysisText] = useState('');
    const [showEvidencePreview, setShowEvidencePreview] = useState(false);
    const [selectedPromptId, setSelectedPromptId] = useState(null);
    const textareaRef = useRef(null);

    const completedCount = annotations.length;
    const progress = passages.length > 0 ? Math.min((completedCount / passages.length) * 100, 100) : 0;
    const canContinue = completedCount >= minRequired;

    const getAnnotation = useCallback((passageId) => {
        return annotations.find(a => a.passageId === passageId);
    }, [annotations]);

    const isCompleted = (passageId) => !!getAnnotation(passageId);

    // Focus textarea and load existing annotation when modal opens
    useEffect(() => {
        if (selectedPassage) {
            // Load existing annotation
            const existing = annotations.find(a => a.passageId === selectedPassage.id);
            setAnalysisText(existing?.explanation || '');

            // Focus textarea
            if (textareaRef.current) {
                setTimeout(() => textareaRef.current?.focus(), 100);
            }
        }
    }, [selectedPassage, annotations]);

    const handleOpenPassage = (passage) => {
        setSelectedPassage(passage);
    };

    const handleCloseModal = () => {
        setSelectedPassage(null);
        setAnalysisText('');
    };

    const handleSave = () => {
        if (analysisText.trim().length >= 15) {
            onAnnotate({
                passageId: selectedPassage.id,
                text: selectedPassage.text,
                explanation: analysisText.trim(),
                source: 'guided'
            });
            handleCloseModal();
        }
    };

    const handleRemoveAndClose = () => {
        onRemoveAnnotation(selectedPassage.id);
        handleCloseModal();
    };

    // Get all evidence (guided + custom highlights)
    const getAllEvidence = () => {
        const guidedEvidence = annotations.map(a => ({
            text: a.text,
            explanation: a.explanation,
            source: 'guided'
        }));
        const customEvidence = (customHighlights || []).map(h => ({
            text: h.text,
            explanation: h.explanation || '',
            source: 'custom'
        }));
        return [...guidedEvidence, ...customEvidence];
    };

    const handleContinueToWrite = () => {
        if (selectedPromptId && onSelectPromptAndContinue) {
            const selectedPrompt = writingPrompts.find(p => p.id === selectedPromptId);
            onSelectPromptAndContinue(selectedPrompt, getAllEvidence());
        }
    };

    // Evidence Preview View
    if (showEvidencePreview && writingPrompts.length > 0) {
        const allEvidence = getAllEvidence();
        const selectedPrompt = writingPrompts.find(p => p.id === selectedPromptId);

        return (
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="mb-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 bg-green-100 rounded-lg`}>
                            <Sparkles className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">Great Work! You Found {allEvidence.length} Pieces of Evidence</h2>
                            <p className="text-sm text-slate-600">Now let's see which argument your evidence supports best.</p>
                        </div>
                    </div>
                </div>

                {/* Evidence Summary */}
                <div className="mb-4">
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">Your Evidence:</h3>
                    <div className="flex flex-wrap gap-2">
                        {allEvidence.map((ev, idx) => (
                            <div
                                key={idx}
                                className={`text-xs px-3 py-1.5 rounded-full border transition-all
                                    ${selectedPromptId
                                        ? `bg-${accentColor}-50 border-${accentColor}-200 text-${accentColor}-700`
                                        : 'bg-slate-100 border-slate-200 text-slate-600'
                                    }`}
                            >
                                <Quote className="w-3 h-3 inline mr-1" />
                                "{ev.text.substring(0, 30)}{ev.text.length > 30 ? '...' : ''}"
                            </div>
                        ))}
                    </div>
                </div>

                {/* Writing Prompts Selection */}
                <div className="flex-1 overflow-y-auto">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">Which argument will you make?</h3>
                    <div className="space-y-3">
                        {writingPrompts.map((prompt) => (
                            <button
                                key={prompt.id}
                                onClick={() => setSelectedPromptId(prompt.id)}
                                className={`w-full text-left p-4 rounded-xl border-2 transition-all
                                    ${selectedPromptId === prompt.id
                                        ? `bg-${accentColor}-50 border-${accentColor}-400 ring-2 ring-${accentColor}-200`
                                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg flex-shrink-0 transition-colors
                                        ${selectedPromptId === prompt.id
                                            ? `bg-${accentColor}-100`
                                            : 'bg-slate-100'
                                        }`}
                                    >
                                        <Target className={`w-4 h-4 ${selectedPromptId === prompt.id ? `text-${accentColor}-600` : 'text-slate-500'}`} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className={`font-semibold ${selectedPromptId === prompt.id ? `text-${accentColor}-800` : 'text-slate-800'}`}>
                                            {prompt.label}
                                        </h4>
                                        <p className={`text-sm mt-0.5 ${selectedPromptId === prompt.id ? `text-${accentColor}-600` : 'text-slate-500'}`}>
                                            {prompt.question}
                                        </p>
                                    </div>
                                    {selectedPromptId === prompt.id && (
                                        <Check className={`w-5 h-5 text-${accentColor}-600 flex-shrink-0`} />
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 pt-4 border-t border-slate-200 flex gap-3">
                    <button
                        onClick={() => setShowEvidencePreview(false)}
                        className="px-4 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors"
                    >
                        ← Back to Evidence
                    </button>
                    <button
                        onClick={handleContinueToWrite}
                        disabled={!selectedPromptId}
                        className={`flex-1 py-2.5 font-medium rounded-xl transition-all flex items-center justify-center gap-2
                            ${selectedPromptId
                                ? `bg-${accentColor}-600 text-white hover:bg-${accentColor}-700 shadow-lg shadow-${accentColor}-200`
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                    >
                        Continue to Write
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col h-full">
                {/* Compact Mission Header */}
                <div className={`bg-${accentColor}-50 border border-${accentColor}-200 rounded-xl p-4 mb-4`}>
                    <div className="flex items-start gap-3">
                        <div className={`p-2 bg-${accentColor}-100 rounded-lg flex-shrink-0`}>
                            <Search className={`w-4 h-4 text-${accentColor}-600`} />
                        </div>
                        <div className="min-w-0">
                            <p className={`text-${accentColor}-700 font-medium text-sm leading-snug`}>
                                {inquiryQuestion}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                        <span className="font-medium text-slate-600">
                            {completedCount} of {passages.length} analyzed
                        </span>
                        {canContinue && (
                            <span className="text-green-600 font-medium flex items-center gap-1">
                                <Check className="w-3 h-3" /> Ready
                            </span>
                        )}
                    </div>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div
                            className={`h-full bg-${accentColor}-500 rounded-full`}
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>

                    {/* Continue Button - appears when enough evidence collected */}
                    {canContinue && writingPrompts.length > 0 && (
                        <motion.button
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => setShowEvidencePreview(true)}
                            className={`mt-3 w-full py-2.5 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-200`}
                        >
                            <Sparkles className="w-4 h-4" />
                            Ready! Choose Your Argument
                            <ArrowRight className="w-4 h-4" />
                        </motion.button>
                    )}
                </div>

                {/* Passage Cards - Compact Grid */}
                <div className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {passages.map((passage, index) => {
                            const completed = isCompleted(passage.id);
                            const annotation = getAnnotation(passage.id);

                            return (
                                <button
                                    key={passage.id}
                                    onClick={() => handleOpenPassage(passage)}
                                    className={`text-left p-4 rounded-xl border-2 transition-all group
                                        ${completed
                                            ? 'bg-green-50 border-green-300 hover:border-green-400'
                                            : `bg-white border-slate-200 hover:border-${accentColor}-300 hover:shadow-md`
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Status Badge */}
                                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                                            ${completed
                                                ? 'bg-green-500 text-white'
                                                : `bg-${accentColor}-100 text-${accentColor}-600`
                                            }`}
                                        >
                                            {completed ? <Check className="w-3.5 h-3.5" /> : index + 1}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium leading-snug line-clamp-2
                                                ${completed ? 'text-green-800' : 'text-slate-700'}`}
                                            >
                                                "{passage.text}"
                                            </p>
                                            {completed && annotation && annotation.explanation && (
                                                <p className="text-xs text-green-600 mt-1.5 line-clamp-1">
                                                    ✓ {annotation.explanation.substring(0, 50)}...
                                                </p>
                                            )}
                                        </div>

                                        {/* Arrow */}
                                        <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:translate-x-0.5
                                            ${completed ? 'text-green-400' : 'text-slate-300'}`}
                                        />
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Optional: Add Your Own */}
                    <div className="mt-4 pt-4 border-t border-slate-200">
                        <button
                            onClick={onEnableHighlighting}
                            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Found something else? Highlight in the text</span>
                            <Highlighter className="w-4 h-4" />
                        </button>

                        {/* Show custom highlights if any */}
                        {customHighlights && customHighlights.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {customHighlights.map((h, i) => (
                                    <div key={i} className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                                        "{h.text ? h.text.substring(0, 20) : ''}..."
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Full-Screen Analysis Modal */}
            <AnimatePresence>
                {selectedPassage && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleCloseModal}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="fixed inset-4 sm:inset-8 md:inset-12 lg:inset-16 bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className={`bg-${accentColor}-50 border-b border-${accentColor}-100 px-6 py-4 flex items-center justify-between`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full bg-${accentColor}-100 flex items-center justify-center`}>
                                        <span className={`text-sm font-bold text-${accentColor}-600`}>
                                            {passages.findIndex(p => p.id === selectedPassage.id) + 1}
                                        </span>
                                    </div>
                                    <h2 className="text-lg font-bold text-slate-800">Analyze This Passage</h2>
                                </div>
                                <button
                                    onClick={handleCloseModal}
                                    className="p-2 hover:bg-white/50 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {/* The Quote */}
                                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                                    <p className="text-lg sm:text-xl font-medium text-slate-800 leading-relaxed">
                                        "{selectedPassage.text}"
                                    </p>
                                </div>

                                {/* The Hint */}
                                <div className={`bg-${accentColor}-50 rounded-xl p-4 border border-${accentColor}-200`}>
                                    <div className="flex items-start gap-3">
                                        <Lightbulb className={`w-5 h-5 text-${accentColor}-500 flex-shrink-0 mt-0.5`} />
                                        <div>
                                            <p className={`text-sm font-semibold text-${accentColor}-800 mb-1`}>
                                                Think about:
                                            </p>
                                            <p className={`text-${accentColor}-700`}>
                                                {selectedPassage.hint}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Analysis Input */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-semibold text-slate-700">
                                        Your Analysis
                                    </label>
                                    <textarea
                                        ref={textareaRef}
                                        value={analysisText}
                                        onChange={(e) => setAnalysisText(e.target.value)}
                                        placeholder="What does this passage reveal? Why is it significant? Explain your thinking..."
                                        className={`w-full h-40 sm:h-48 px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-base resize-none
                                            focus:outline-none focus:border-${accentColor}-400 focus:ring-4 focus:ring-${accentColor}-100
                                            placeholder:text-slate-400`}
                                    />
                                    <div className="flex justify-between text-sm">
                                        <span className={analysisText.length >= 15 ? 'text-green-600 font-medium' : 'text-slate-400'}>
                                            {analysisText.length} characters
                                            {analysisText.length < 15 && ` (${15 - analysisText.length} more needed)`}
                                        </span>
                                        {analysisText.length >= 15 && (
                                            <span className="text-green-600 flex items-center gap-1">
                                                <Check className="w-4 h-4" /> Ready to save
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 flex items-center justify-between gap-4">
                                <div>
                                    {isCompleted(selectedPassage.id) && (
                                        <button
                                            onClick={handleRemoveAndClose}
                                            className="text-sm text-red-500 hover:text-red-600 font-medium"
                                        >
                                            Remove analysis
                                        </button>
                                    )}
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleCloseModal}
                                        className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={analysisText.trim().length < 15}
                                        className={`px-6 py-2.5 font-medium rounded-xl transition-all flex items-center gap-2
                                            ${analysisText.trim().length >= 15
                                                ? `bg-${accentColor}-600 text-white hover:bg-${accentColor}-700 shadow-lg shadow-${accentColor}-200`
                                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                            }`}
                                    >
                                        <Check className="w-4 h-4" />
                                        Save Analysis
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default GuidedReadingPanel;

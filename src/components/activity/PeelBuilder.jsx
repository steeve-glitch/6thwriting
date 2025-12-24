import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Quote, MessageSquare, Link2, ChevronRight, ChevronLeft, Check, Sparkles, RotateCcw, Trophy, Copy } from 'lucide-react';
import LevelSelector from './LevelSelector';

const STEPS = [
    {
        id: 'point',
        label: 'Point',
        icon: FileText,
        description: 'Write your main idea or argument',
        placeholder: 'The author shows that...',
        starters: [
            'The author demonstrates that...',
            'This passage reveals...',
            'The text suggests that...',
            'An important idea in this section is...'
        ]
    },
    {
        id: 'evidence',
        label: 'Evidence',
        icon: Quote,
        description: 'Select a quote that supports your point',
        placeholder: 'Choose a quote from the text...',
        starters: []
    },
    {
        id: 'explanation',
        label: 'Explanation',
        icon: MessageSquare,
        description: 'Explain how the evidence supports your point',
        placeholder: 'This quote shows...',
        starters: [
            'This quote demonstrates...',
            'The word/phrase "___" suggests...',
            'This evidence supports my point because...',
            'The reader can infer that...'
        ]
    },
    {
        id: 'link',
        label: 'Link',
        icon: Link2,
        description: 'Connect back to your main idea',
        placeholder: 'Therefore...',
        starters: [
            'Therefore, this shows that...',
            'This reinforces the idea that...',
            'Ultimately, this demonstrates...',
            'In conclusion, we can see that...'
        ]
    }
];

const PeelBuilder = ({ quotes = [], accentColor = 'sky', level = 1, onComplete, onRequestAiFeedback }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [peelData, setPeelData] = useState({
        point: '',
        evidence: '',
        explanation: '',
        link: ''
    });
    const [showPreview, setShowPreview] = useState(false);
    const [isActivityComplete, setIsActivityComplete] = useState(false);
    const [copied, setCopied] = useState(false);
    const [errors, setErrors] = useState({});
    const [activityLevel, setActivityLevel] = useState(level);

    const currentStepData = STEPS[currentStep];

    const validateStep = (stepId, value) => {
        if (activityLevel === 3) return true; // No validation in independent mode

        if (activityLevel === 1) {
            if (stepId === 'point' && value.length < 15) return 'Your point needs to be at least 15 characters.';
            if (stepId === 'evidence' && !value) return 'Please select a quote for your evidence.';
            if (stepId === 'explanation' && value.length < 25) return 'Explain your evidence in at least 25 characters.';
            if (stepId === 'link' && value.length < 15) return 'Your link needs to be at least 15 characters.';
        } else if (activityLevel === 2) {
            if (stepId === 'point' && value.length < 10) return 'Write a bit more for your point.';
            if (stepId === 'explanation' && value.length < 15) return 'Add more to your explanation.';
        }
        return null;
    };

    const handleNext = () => {
        const stepId = STEPS[currentStep].id;
        const value = peelData[stepId];
        const error = validateStep(stepId, value);

        if (error) {
            setErrors({ ...errors, [stepId]: error });
            return;
        }

        setErrors({ ...errors, [stepId]: null });

        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            setShowPreview(true);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleInputChange = (stepId, value) => {
        setPeelData({ ...peelData, [stepId]: value });
        if (errors[stepId]) {
            setErrors({ ...errors, [stepId]: null });
        }
    };

    const handleSelectQuote = (quote) => {
        setPeelData({ ...peelData, evidence: quote });
        setErrors({ ...errors, evidence: null });
    };

    const handleStarterClick = (starter) => {
        const stepId = STEPS[currentStep].id;
        setPeelData({ ...peelData, [stepId]: starter });
    };

    const handleReset = () => {
        setPeelData({ point: '', evidence: '', explanation: '', link: '' });
        setCurrentStep(0);
        setShowPreview(false);
        setIsActivityComplete(false);
        setCopied(false);
        setErrors({});
    };

    const handleComplete = () => {
        setIsActivityComplete(true);
        if (onComplete) {
            onComplete(peelData);
        }
    };

    const handleCopyParagraph = () => {
        navigator.clipboard.writeText(buildParagraph());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRequestFeedback = () => {
        if (onRequestAiFeedback) {
            onRequestAiFeedback(buildParagraph());
        }
    };

    const buildParagraph = () => {
        return `${peelData.point} ${peelData.evidence ? `"${peelData.evidence}"` : ''} ${peelData.explanation} ${peelData.link}`;
    };

    // Completion Celebration View
    if (isActivityComplete) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
            >
                {/* Celebration Header */}
                <div className="text-center py-6">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.2 }}
                        className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4"
                    >
                        <Trophy className="w-10 h-10 text-green-600" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-slate-800">Great Work!</h2>
                    <p className="text-slate-600 mt-2">You've completed your PEEL paragraph.</p>
                </div>

                {/* Final Paragraph */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-6">
                    <h3 className="text-sm font-semibold text-green-700 mb-3">Your Completed Paragraph:</h3>
                    <p className="text-slate-700 leading-relaxed">
                        {buildParagraph()}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={handleCopyParagraph}
                        className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                    >
                        <Copy className="w-5 h-5" />
                        {copied ? 'Copied!' : 'Copy Paragraph'}
                    </button>
                    <button
                        onClick={handleRequestFeedback}
                        className={`flex-1 py-3 bg-${accentColor}-600 text-white font-medium rounded-xl hover:bg-${accentColor}-700 transition-colors flex items-center justify-center gap-2`}
                    >
                        <Sparkles className="w-5 h-5" />
                        Get AI Feedback
                    </button>
                </div>

                <button
                    onClick={handleReset}
                    className="w-full py-3 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                    <RotateCcw className="w-5 h-5" />
                    Write Another Paragraph
                </button>
            </motion.div>
        );
    }

    // Preview Mode
    if (showPreview) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-800">Your PEEL Paragraph</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowPreview(false)}
                            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-2"
                        >
                            <ChevronLeft className="w-4 h-4" /> Edit
                        </button>
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-2"
                        >
                            <RotateCcw className="w-4 h-4" /> Start Over
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                    <div className="prose prose-slate max-w-none">
                        <p className="text-lg leading-relaxed">
                            <span className={`bg-blue-100 px-1 rounded`}>{peelData.point}</span>{' '}
                            {peelData.evidence && (
                                <span className={`bg-purple-100 px-1 rounded`}>"{peelData.evidence}"</span>
                            )}{' '}
                            <span className={`bg-green-100 px-1 rounded`}>{peelData.explanation}</span>{' '}
                            <span className={`bg-amber-100 px-1 rounded`}>{peelData.link}</span>
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                        <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded-full">Point</span>
                        <span className="text-xs font-medium px-2 py-1 bg-purple-100 text-purple-700 rounded-full">Evidence</span>
                        <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">Explanation</span>
                        <span className="text-xs font-medium px-2 py-1 bg-amber-100 text-amber-700 rounded-full">Link</span>
                    </div>
                </div>

                {activityLevel === 3 && (
                    <button
                        onClick={handleRequestFeedback}
                        className={`w-full py-3 bg-${accentColor}-600 text-white font-medium rounded-xl hover:bg-${accentColor}-700 transition-colors flex items-center justify-center gap-2`}
                    >
                        <Sparkles className="w-5 h-5" />
                        Get AI Feedback on My Paragraph
                    </button>
                )}

                <button
                    onClick={handleComplete}
                    className={`w-full py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2`}
                >
                    <Check className="w-5 h-5" />
                    Complete Activity
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Level Selector */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">PEEL Paragraph</h2>
                <LevelSelector level={activityLevel} onChange={setActivityLevel} accentColor={accentColor} />
            </div>

            {/* Step Progress */}
            <div className="flex items-center gap-2">
                {STEPS.map((step, idx) => {
                    const Icon = step.icon;
                    const isActive = idx === currentStep;
                    const isComplete = idx < currentStep || (idx === currentStep && peelData[step.id]);
                    const colors = ['blue', 'purple', 'green', 'amber'];
                    const color = colors[idx];

                    return (
                        <React.Fragment key={step.id}>
                            <button
                                onClick={() => idx <= currentStep && setCurrentStep(idx)}
                                disabled={idx > currentStep}
                                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all
                                    ${isActive
                                        ? `bg-${color}-100 text-${color}-700 ring-2 ring-${color}-300`
                                        : isComplete
                                            ? `bg-${color}-50 text-${color}-600`
                                            : 'bg-slate-100 text-slate-400'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="hidden sm:inline">{step.label}</span>
                            </button>
                            {idx < STEPS.length - 1 && (
                                <ChevronRight className={`w-4 h-4 ${idx < currentStep ? 'text-slate-400' : 'text-slate-200'}`} />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Current Step */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4"
                >
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            {React.createElement(currentStepData.icon, { className: 'w-5 h-5' })}
                            {currentStepData.label}
                        </h3>
                        <p className="text-slate-500 text-sm mt-1">{currentStepData.description}</p>
                    </div>

                    {/* Evidence Step - Quote Selection */}
                    {currentStepData.id === 'evidence' ? (
                        <div className="space-y-3">
                            {activityLevel === 1 && quotes.length > 0 ? (
                                <>
                                    <p className="text-sm text-slate-600">Select a quote that supports your point:</p>
                                    <div className="space-y-2">
                                        {quotes.map((quote, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleSelectQuote(quote)}
                                                className={`w-full text-left p-4 rounded-xl border-2 transition-all text-sm
                                                    ${peelData.evidence === quote
                                                        ? 'bg-purple-50 border-purple-400 text-purple-700'
                                                        : 'bg-white border-slate-200 hover:border-purple-300'
                                                    }`}
                                            >
                                                "{quote}"
                                            </button>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className="text-sm text-slate-600">
                                        {activityLevel === 2
                                            ? 'Type or paste a quote from the text:'
                                            : 'Enter your evidence:'}
                                    </p>
                                    <textarea
                                        value={peelData.evidence}
                                        onChange={(e) => handleInputChange('evidence', e.target.value)}
                                        placeholder="Enter a quote from the text..."
                                        className="w-full h-24 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </>
                            )}
                        </div>
                    ) : (
                        /* Other Steps - Text Input */
                        <div className="space-y-3">
                            {/* Sentence Starters (Level 1 only) */}
                            {activityLevel === 1 && currentStepData.starters.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs text-slate-500">Try starting with:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {currentStepData.starters.map((starter, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleStarterClick(starter)}
                                                className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors"
                                            >
                                                {starter.substring(0, 25)}...
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <textarea
                                value={peelData[currentStepData.id]}
                                onChange={(e) => handleInputChange(currentStepData.id, e.target.value)}
                                placeholder={currentStepData.placeholder}
                                className={`w-full h-32 px-4 py-3 bg-slate-50 border rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-${accentColor}-500
                                    ${errors[currentStepData.id] ? 'border-red-300' : 'border-slate-200'}`}
                            />

                            <div className="flex justify-between text-xs text-slate-400">
                                <span>{peelData[currentStepData.id].length} characters</span>
                                {activityLevel === 1 && currentStepData.id !== 'evidence' && (
                                    <span>
                                        Minimum: {currentStepData.id === 'explanation' ? 25 : 15} characters
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {errors[currentStepData.id] && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600"
                        >
                            {errors[currentStepData.id]}
                        </motion.div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between">
                <button
                    onClick={handleBack}
                    disabled={currentStep === 0}
                    className={`px-5 py-2.5 text-slate-600 font-medium rounded-xl transition-colors flex items-center gap-2
                        ${currentStep === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-100'}`}
                >
                    <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button
                    onClick={handleNext}
                    className={`px-5 py-2.5 bg-${accentColor}-600 text-white font-medium rounded-xl hover:bg-${accentColor}-700 transition-colors flex items-center gap-2`}
                >
                    {currentStep === STEPS.length - 1 ? 'Preview' : 'Next'}
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default PeelBuilder;

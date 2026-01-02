import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Zap, MapPin, Target, Eye, EyeOff, Sparkles, RotateCcw, PenTool, Trophy, Copy, Lightbulb, BookOpen, Palette } from 'lucide-react';
import LevelSelector from './LevelSelector';

// Author's Craft Analysis - breaking down techniques in the author's sentence
const analyzeAuthorCraft = (authorSentence) => {
    if (!authorSentence) return [];

    const techniques = [];

    // Check for adjectives (simplified detection)
    if (/\b(sharp|stinging|dim|dark|bright|cold|warm|soft|hard|loud|quiet)\b/i.test(authorSentence)) {
        techniques.push({
            type: 'Sensory Details',
            icon: '👁️',
            description: 'The author uses words that help you see, hear, or feel the scene.',
            color: 'blue'
        });
    }

    // Check for emotional language
    if (/\b(whispered|trembled|feared|hoped|dreamed|worried|excited)\b/i.test(authorSentence)) {
        techniques.push({
            type: 'Emotional Language',
            icon: '💭',
            description: 'Words that show how characters feel or create a mood.',
            color: 'purple'
        });
    }

    // Check for specific verbs
    if (/\b(crept|dashed|crawled|whispered|shouted|glanced|stared)\b/i.test(authorSentence)) {
        techniques.push({
            type: 'Strong Verbs',
            icon: '⚡',
            description: 'Action words that are more specific than "said" or "went".',
            color: 'amber'
        });
    }

    // Check for prepositional phrases
    if (/\b(behind|through|across|beneath|beside|between|around)\b/i.test(authorSentence)) {
        techniques.push({
            type: 'Location Details',
            icon: '📍',
            description: 'Words that help readers picture exactly where things happen.',
            color: 'green'
        });
    }

    // Default technique if none detected
    if (techniques.length === 0) {
        techniques.push({
            type: 'Descriptive Writing',
            icon: '✨',
            description: 'The author adds details to paint a picture in the reader\'s mind.',
            color: 'indigo'
        });
    }

    return techniques;
};

const EXPANSION_PROMPTS = [
    {
        id: 'when',
        label: 'When?',
        icon: Clock,
        color: 'blue',
        examples: ['In the morning...', 'Suddenly...', 'After a moment...', 'While waiting...'],
        description: 'Add a time or sequence'
    },
    {
        id: 'how',
        label: 'How?',
        icon: Zap,
        color: 'purple',
        examples: ['Quickly...', 'Nervously...', 'With determination...', 'Carefully...'],
        description: 'Add manner or emotion'
    },
    {
        id: 'where',
        label: 'Where?',
        icon: MapPin,
        color: 'green',
        examples: ['Through the door...', 'In the hallway...', 'Across the room...', 'Along the path...'],
        description: 'Add location or direction'
    },
    {
        id: 'why',
        label: 'Why?',
        icon: Target,
        color: 'amber',
        examples: ['To escape...', 'Because she was late...', 'Hoping to...', 'In order to...'],
        description: 'Add purpose or reason'
    }
];

const SentenceExpander = ({
    kernel = "Tom walked.",
    authorOriginal = "",
    accentColor = 'sky',
    level = 1,
    onComplete,
    onRequestAiFeedback
}) => {
    const [expansions, setExpansions] = useState({
        when: '',
        how: '',
        where: '',
        why: ''
    });
    const [activePrompt, setActivePrompt] = useState(null);
    const [showComparison, setShowComparison] = useState(false);
    const [activityLevel, setActivityLevel] = useState(level);
    const [userSentence, setUserSentence] = useState('');
    const [isComplete, setIsComplete] = useState(false);
    const [copied, setCopied] = useState(false);

    // Build the expanded sentence
    const expandedSentence = useMemo(() => {
        const parts = [];

        // Parse kernel into subject and verb
        const kernelParts = kernel.replace('.', '').split(' ');
        const subject = kernelParts[0];
        const verb = kernelParts.slice(1).join(' ');

        // Build expanded sentence with additions in natural order
        if (expansions.when) parts.push(expansions.when.replace(/[.,]$/, '') + ',');
        parts.push(subject);
        if (expansions.how) parts.push(expansions.how.replace(/[.,]$/, ''));
        parts.push(verb);
        if (expansions.where) parts.push(expansions.where.replace(/[.,]$/, ''));
        if (expansions.why) parts.push(expansions.why.replace(/[.,]$/, ''));

        let sentence = parts.join(' ').trim();
        if (!sentence.endsWith('.')) sentence += '.';

        return sentence;
    }, [kernel, expansions]);

    const handleExpansionChange = (promptId, value) => {
        setExpansions({ ...expansions, [promptId]: value });
    };

    const handleExampleClick = (promptId, example) => {
        setExpansions({ ...expansions, [promptId]: example });
    };

    const handleReset = () => {
        setExpansions({ when: '', how: '', where: '', why: '' });
        setUserSentence('');
        setShowComparison(false);
        setIsComplete(false);
        setCopied(false);
    };

    const handleComplete = () => {
        setIsComplete(true);
        if (onComplete) {
            onComplete(activityLevel === 3 ? userSentence : expandedSentence);
        }
    };

    const handleRequestFeedback = () => {
        if (onRequestAiFeedback) {
            onRequestAiFeedback(activityLevel === 3 ? userSentence : expandedSentence);
        }
    };

    const handleCopySentence = () => {
        const sentence = activityLevel === 3 ? userSentence : expandedSentence;
        navigator.clipboard.writeText(sentence);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const filledCount = Object.values(expansions).filter(v => v.trim()).length;

    // Completion Celebration View
    if (isComplete) {
        const finalSentence = activityLevel === 3 ? userSentence : expandedSentence;
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
                    <h2 className="text-2xl font-bold text-slate-800">Excellent Work!</h2>
                    <p className="text-slate-600 mt-2">You've expanded your sentence beautifully.</p>
                </div>

                {/* Comparison */}
                <div className="space-y-4">
                    <div className="bg-slate-100 rounded-xl p-4">
                        <p className="text-xs uppercase tracking-wider text-slate-500 mb-2 font-semibold">Original Kernel</p>
                        <p className="text-slate-600">{kernel}</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-4">
                        <p className="text-xs uppercase tracking-wider text-green-600 mb-2 font-semibold">Your Expanded Sentence</p>
                        <p className="text-lg text-slate-800 font-serif">{finalSentence}</p>
                    </div>

                    {authorOriginal && (
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                            <p className="text-xs uppercase tracking-wider text-slate-500 mb-2 font-semibold">Author's Version</p>
                            <p className="text-slate-700 italic">"{authorOriginal}"</p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={handleCopySentence}
                        className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                    >
                        <Copy className="w-5 h-5" />
                        {copied ? 'Copied!' : 'Copy Sentence'}
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
                    Try Another Sentence
                </button>
            </motion.div>
        );
    }

    // Level 3: Independent writing mode
    if (activityLevel === 3) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-800">Write Your Own Sentence</h2>
                    <LevelSelector level={activityLevel} onChange={setActivityLevel} accentColor={accentColor} />
                </div>

                <div className={`p-4 bg-${accentColor}-50 rounded-xl border border-${accentColor}-100`}>
                    <p className="text-sm text-slate-600 mb-2">
                        <strong>Challenge:</strong> Write a descriptive sentence inspired by the text.
                        Include details about when, how, where, or why the action happens.
                    </p>
                    <p className="text-xs text-slate-500">
                        The kernel "{kernel}" can inspire you, but write your own original sentence.
                    </p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                        Your Sentence:
                    </label>
                    <textarea
                        value={userSentence}
                        onChange={(e) => setUserSentence(e.target.value)}
                        placeholder="Write a descriptive sentence with rich details..."
                        className={`w-full h-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-${accentColor}-500`}
                    />
                    <div className="flex justify-between mt-2 text-xs text-slate-400">
                        <span>{userSentence.split(' ').filter(w => w).length} words</span>
                        <span>Try to include sensory details!</span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleRequestFeedback}
                        disabled={userSentence.length < 10}
                        className={`flex-1 py-3 bg-${accentColor}-600 text-white font-medium rounded-xl hover:bg-${accentColor}-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        <Sparkles className="w-5 h-5" />
                        Get AI Feedback
                    </button>
                    <button
                        onClick={handleReset}
                        className="px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                        <RotateCcw className="w-5 h-5" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Level Selector */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">Sentence Expansion</h2>
                <LevelSelector level={activityLevel} onChange={setActivityLevel} accentColor={accentColor} />
            </div>

            {/* Kernel Sentence Display */}
            <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className={`p-5 bg-gradient-to-r from-${accentColor}-50 to-${accentColor}-100/50 rounded-2xl border border-${accentColor}-200`}
            >
                <p className="text-xs uppercase tracking-wider text-slate-500 mb-2 font-semibold">Kernel Sentence</p>
                <p className="text-2xl font-serif font-bold text-slate-800">{kernel}</p>
                <p className="text-sm text-slate-500 mt-2">
                    Expand this simple sentence by adding details below.
                </p>
            </motion.div>

            {/* Expansion Prompts */}
            <div className="grid grid-cols-2 gap-3">
                {EXPANSION_PROMPTS.map((prompt) => {
                    const Icon = prompt.icon;
                    const isActive = activePrompt === prompt.id;
                    const hasValue = expansions[prompt.id].trim();

                    return (
                        <motion.div
                            key={prompt.id}
                            layout
                            className={`rounded-xl border-2 overflow-hidden transition-all
                                ${hasValue
                                    ? `bg-${prompt.color}-50 border-${prompt.color}-300`
                                    : isActive
                                        ? `bg-white border-${prompt.color}-400 ring-2 ring-${prompt.color}-200`
                                        : 'bg-white border-slate-200 hover:border-slate-300'
                                }`}
                        >
                            <button
                                onClick={() => setActivePrompt(isActive ? null : prompt.id)}
                                className="w-full p-4 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${hasValue ? `bg-${prompt.color}-100` : 'bg-slate-100'}`}>
                                        <Icon className={`w-5 h-5 ${hasValue ? `text-${prompt.color}-600` : 'text-slate-400'}`} />
                                    </div>
                                    <div className="text-left">
                                        <p className={`font-semibold ${hasValue ? `text-${prompt.color}-700` : 'text-slate-700'}`}>
                                            {prompt.label}
                                        </p>
                                        <p className="text-xs text-slate-500">{prompt.description}</p>
                                    </div>
                                </div>
                                {hasValue && (
                                    <div className={`w-2 h-2 rounded-full bg-${prompt.color}-500`} />
                                )}
                            </button>

                            <AnimatePresence>
                                {isActive && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="px-4 pb-4"
                                    >
                                        {/* Examples (Level 1 only) */}
                                        {activityLevel === 1 && (
                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {prompt.examples.map((example, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleExampleClick(prompt.id, example)}
                                                        className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors"
                                                    >
                                                        {example}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        <input
                                            type="text"
                                            value={expansions[prompt.id]}
                                            onChange={(e) => handleExpansionChange(prompt.id, e.target.value)}
                                            placeholder={`Add ${prompt.label.toLowerCase().replace('?', '')} detail...`}
                                            className={`w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-${prompt.color}-500`}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>

            {/* Live Preview */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <PenTool className="w-4 h-4" />
                        Your Expanded Sentence
                    </p>
                    <span className="text-xs text-slate-400">{filledCount}/4 additions</span>
                </div>
                <p className="text-lg font-serif text-slate-800 leading-relaxed">
                    {filledCount > 0 ? (
                        <>
                            {expansions.when && <span className="bg-blue-100 px-1 rounded">{expansions.when}</span>}{' '}
                            {kernel.split(' ')[0]}{' '}
                            {expansions.how && <span className="bg-purple-100 px-1 rounded">{expansions.how}</span>}{' '}
                            {kernel.split(' ').slice(1).join(' ').replace('.', '')}{' '}
                            {expansions.where && <span className="bg-green-100 px-1 rounded">{expansions.where}</span>}{' '}
                            {expansions.why && <span className="bg-amber-100 px-1 rounded">{expansions.why}</span>}
                            .
                        </>
                    ) : (
                        <span className="text-slate-400 italic">Add details above to see your sentence grow...</span>
                    )}
                </p>
            </div>

            {/* Author Comparison with Craft Analysis */}
            {authorOriginal && (
                <div className="space-y-3">
                    <button
                        onClick={() => setShowComparison(!showComparison)}
                        className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
                    >
                        {showComparison ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {showComparison ? 'Hide' : 'Compare to'} Author's Sentence
                    </button>

                    <AnimatePresence>
                        {showComparison && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-3"
                            >
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                    <p className="text-xs uppercase tracking-wider text-slate-500 mb-2 font-semibold">
                                        Author's Version
                                    </p>
                                    <p className="text-lg font-serif text-slate-700 italic">
                                        "{authorOriginal}"
                                    </p>
                                </div>

                                {/* Author's Craft Analysis */}
                                {activityLevel === 1 && (
                                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Palette className="w-5 h-5 text-purple-600" />
                                            <p className="text-sm font-bold text-purple-800">Author's Craft - Techniques Used</p>
                                        </div>
                                        <div className="space-y-2">
                                            {analyzeAuthorCraft(authorOriginal).map((technique, idx) => (
                                                <div key={idx} className={`flex items-start gap-2 p-2 bg-white rounded-lg`}>
                                                    <span className="text-lg">{technique.icon}</span>
                                                    <div>
                                                        <p className={`text-sm font-semibold text-${technique.color}-700`}>{technique.type}</p>
                                                        <p className="text-xs text-slate-600">{technique.description}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-xs text-purple-600 mt-3 italic">
                                            Try using these same techniques in your expanded sentence!
                                        </p>
                                    </div>
                                )}

                                {/* Critical Thinking Reflection */}
                                <div className="mt-4 bg-amber-50 rounded-xl p-4 border border-amber-200">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Lightbulb className="w-5 h-5 text-amber-600" />
                                        <p className="text-sm font-bold text-amber-800">Critical Thinking</p>
                                    </div>
                                    <p className="text-sm text-slate-700 mb-3">
                                        Compare your sentence with the author's. Which one creates a clearer picture in your mind?
                                    </p>
                                    
                                    <textarea
                                        placeholder="I think the author's version is more tense because..."
                                        className="w-full h-24 p-3 text-sm bg-white border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
                <button
                    onClick={handleComplete}
                    disabled={filledCount === 0}
                    className={`flex-1 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    Complete Activity
                </button>
                <button
                    onClick={handleReset}
                    className="px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                    <RotateCcw className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default SentenceExpander;

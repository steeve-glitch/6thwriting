import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, MapPin, Sparkles, Lightbulb, Swords, Check, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

const CATEGORIES = [
    {
        id: 'character',
        label: 'Character',
        color: 'blue',
        icon: User,
        description: 'Traits, actions, or dialogue that reveal character',
        sentenceStems: [
            'This shows the character is... because...',
            'The author reveals that [character name] feels...',
            'This quote suggests [character] is [trait] because...',
            'We learn that [character] might be... when...'
        ],
        exampleHighlight: {
            text: '"She stood frozen, her hands trembling"',
            explanation: 'This shows the character is afraid because her body language (frozen, trembling) reveals fear without directly stating it.'
        }
    },
    {
        id: 'setting',
        label: 'Setting',
        color: 'green',
        icon: MapPin,
        description: 'Time, place, or atmosphere details',
        sentenceStems: [
            'This tells us the story takes place...',
            'The author creates a [mood] atmosphere by...',
            'This detail about the setting suggests...',
            'The time/place is important because...'
        ],
        exampleHighlight: {
            text: '"The dim hallway echoed with whispers"',
            explanation: 'This creates a mysterious, slightly scary atmosphere. The words "dim" and "whispers" make the setting feel secretive.'
        }
    },
    {
        id: 'figurative',
        label: 'Figurative Language',
        color: 'purple',
        icon: Sparkles,
        description: 'Similes, metaphors, personification, etc.',
        sentenceStems: [
            'This is a [simile/metaphor/personification] that compares...',
            'The author uses this to show...',
            'This figurative language helps the reader imagine...',
            'By saying X is like Y, the author means...'
        ],
        exampleHighlight: {
            text: '"Her words were daggers"',
            explanation: 'This is a metaphor comparing words to daggers. It shows the words were hurtful and sharp, causing emotional pain.'
        }
    },
    {
        id: 'theme',
        label: 'Theme',
        color: 'amber',
        icon: Lightbulb,
        description: 'Ideas about life, society, or human nature',
        sentenceStems: [
            'This connects to the theme of [theme] because...',
            'The author is showing us that [message about life]...',
            'This quote teaches us that...',
            'This relates to the bigger idea that...'
        ],
        exampleHighlight: {
            text: '"Sometimes the bravest thing is asking for help"',
            explanation: 'This connects to the theme of courage. It shows that bravery isn\'t always about fighting - sometimes it\'s about being vulnerable.'
        }
    },
    {
        id: 'conflict',
        label: 'Conflict',
        color: 'red',
        icon: Swords,
        description: 'Struggles between characters, ideas, or forces',
        sentenceStems: [
            'This shows conflict between [X] and [Y]...',
            'The character is struggling with...',
            'This creates tension because...',
            'The problem here is...'
        ],
        exampleHighlight: {
            text: '"I wanted to tell the truth, but I knew it would hurt her"',
            explanation: 'This shows an internal conflict - the character is torn between honesty and protecting someone\'s feelings.'
        }
    }
];

const HighlightModal = ({ isOpen, onClose, selectedText, onSave, level = 1, accentColor = 'sky' }) => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [explanation, setExplanation] = useState('');
    const [error, setError] = useState('');
    const [showExample, setShowExample] = useState(false);
    const [showStarters, setShowStarters] = useState(false);

    // Reset state when modal opens with new text
    useEffect(() => {
        if (isOpen) {
            setSelectedCategory(null);
            setExplanation('');
            setError('');
            setShowExample(false);
            setShowStarters(false);
        }
    }, [isOpen, selectedText]);

    // Insert sentence stem into explanation
    const handleStemClick = (stem) => {
        setExplanation(stem);
        setShowStarters(false);
    };

    const handleSave = () => {
        // Level 1: Both required
        if (level === 1) {
            if (!selectedCategory) {
                setError('Please select a category for your highlight.');
                return;
            }
            if (explanation.trim().length < 10) {
                setError('Please explain why you highlighted this (at least 10 characters).');
                return;
            }
        }
        // Level 2: Category optional, explanation encouraged
        else if (level === 2) {
            if (explanation.trim().length < 5 && explanation.trim().length > 0) {
                setError('Please write a bit more in your explanation.');
                return;
            }
        }
        // Level 3: Everything optional

        const category = selectedCategory || CATEGORIES.find(c => c.id === 'character'); // Default
        onSave({
            text: selectedText,
            category: category.id,
            color: category.color,
            explanation: explanation.trim()
        });
        onClose();
    };

    const truncatedText = selectedText?.length > 80
        ? selectedText.substring(0, 80) + '...'
        : selectedText;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-3xl shadow-2xl z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className={`bg-${accentColor}-50 border-b border-${accentColor}-100 p-5`}>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-slate-800">Analyze Your Highlight</h3>
                                    <p className="text-sm text-slate-500 mt-1">
                                        "{truncatedText}"
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/50 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 space-y-5">
                            {/* Category Selection */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-3">
                                    {level === 1 ? 'What type of evidence is this? *' : 'What type of evidence is this?'}
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {CATEGORIES.map((cat) => {
                                        const Icon = cat.icon;
                                        const isSelected = selectedCategory?.id === cat.id;
                                        return (
                                            <button
                                                key={cat.id}
                                                onClick={() => setSelectedCategory(cat)}
                                                className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left
                                                    ${isSelected
                                                        ? `bg-${cat.color}-50 border-${cat.color}-400 text-${cat.color}-700`
                                                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                                    }`}
                                            >
                                                <div className={`p-1.5 rounded-lg ${isSelected ? `bg-${cat.color}-100` : 'bg-slate-100'}`}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm font-medium">{cat.label}</span>
                                                {isSelected && <Check className="w-4 h-4 ml-auto" />}
                                            </button>
                                        );
                                    })}
                                </div>
                                {selectedCategory && (
                                    <p className="text-xs text-slate-500 mt-2 italic">
                                        {selectedCategory.description}
                                    </p>
                                )}
                            </div>

                            {/* Explanation */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    {level === 1
                                        ? 'Why did you highlight this? *'
                                        : level === 2
                                            ? 'Why did you highlight this? (recommended)'
                                            : 'Add a note (optional)'}
                                </label>

                                {/* Sentence Starters (when category selected) */}
                                {selectedCategory && level <= 2 && (
                                    <div className="mb-3">
                                        <button
                                            onClick={() => setShowStarters(!showStarters)}
                                            className="flex items-center gap-2 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                                        >
                                            <HelpCircle className="w-3.5 h-3.5" />
                                            {showStarters ? 'Hide sentence starters' : 'Need help? Use a sentence starter'}
                                            {showStarters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                        </button>
                                        <AnimatePresence>
                                            {showStarters && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="mt-2 space-y-1"
                                                >
                                                    {selectedCategory.sentenceStems.map((stem, idx) => (
                                                        <button
                                                            key={idx}
                                                            onClick={() => handleStemClick(stem)}
                                                            className="block w-full text-left text-xs px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors"
                                                        >
                                                            {stem}
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}

                                <textarea
                                    value={explanation}
                                    onChange={(e) => setExplanation(e.target.value)}
                                    placeholder={
                                        level === 1
                                            ? "Explain what this quote reveals and why it's important..."
                                            : "What does this tell us about the story?"
                                    }
                                    className="w-full h-24 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                />
                                <div className="flex justify-between mt-1">
                                    <span className="text-xs text-slate-400">
                                        {explanation.length} characters
                                    </span>
                                    {level === 1 && (
                                        <span className="text-xs text-slate-400">
                                            Minimum 10 characters
                                        </span>
                                    )}
                                </div>

                                {/* Example Annotation (when category selected) */}
                                {selectedCategory && level === 1 && (
                                    <div className="mt-3">
                                        <button
                                            onClick={() => setShowExample(!showExample)}
                                            className="flex items-center gap-2 text-xs font-medium text-green-600 hover:text-green-700 transition-colors"
                                        >
                                            <Lightbulb className="w-3.5 h-3.5" />
                                            {showExample ? 'Hide example' : 'See an example annotation'}
                                        </button>
                                        <AnimatePresence>
                                            {showExample && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="mt-2 bg-green-50 border border-green-200 rounded-xl p-3"
                                                >
                                                    <p className="text-xs font-semibold text-green-800 mb-1">Example Highlight:</p>
                                                    <p className="text-sm text-green-700 italic mb-2">{selectedCategory.exampleHighlight.text}</p>
                                                    <p className="text-xs font-semibold text-green-800 mb-1">Example Explanation:</p>
                                                    <p className="text-xs text-green-700">{selectedCategory.exampleHighlight.explanation}</p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>

                            {/* Error Message */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className={`px-5 py-2.5 bg-${accentColor}-600 text-white font-medium rounded-xl hover:bg-${accentColor}-700 transition-colors flex items-center gap-2`}
                            >
                                <Check className="w-4 h-4" />
                                Save Highlight
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default HighlightModal;

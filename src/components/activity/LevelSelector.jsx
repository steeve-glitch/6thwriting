import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Compass, Rocket } from 'lucide-react';

const LEVELS = [
    { id: 1, label: 'Guided', icon: HelpCircle, description: 'Step-by-step support' },
    { id: 2, label: 'Supported', icon: Compass, description: 'Some guidance' },
    { id: 3, label: 'Independent', icon: Rocket, description: 'On your own' }
];

const LevelSelector = ({ level, onChange, accentColor = 'sky' }) => {
    return (
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            {LEVELS.map((lvl) => {
                const Icon = lvl.icon;
                const isActive = level === lvl.id;

                return (
                    <button
                        key={lvl.id}
                        onClick={() => onChange(lvl.id)}
                        className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                            ${isActive
                                ? `bg-white text-${accentColor}-600 shadow-sm`
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <Icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{lvl.label}</span>
                        {isActive && (
                            <motion.div
                                layoutId="levelIndicator"
                                className={`absolute inset-0 bg-white rounded-lg shadow-sm -z-10`}
                                transition={{ type: "spring", duration: 0.3 }}
                            />
                        )}
                    </button>
                );
            })}
        </div>
    );
};

export default LevelSelector;

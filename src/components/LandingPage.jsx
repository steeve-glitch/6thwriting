import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import stJohnsLogo from '../assets/StJohnsLogo.png';

const LandingPage = ({ onStart }) => {
    const [name, setName] = useState('');
    const [isExploding, setIsExploding] = useState(false);

    // A kaleidoscope of colors for the explosion
    const kaleidoscopeColors = [
        'bg-red-500', 'bg-orange-500', 'bg-yellow-500',
        'bg-green-500', 'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500'
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim()) {
            setIsExploding(true);
            setTimeout(() => {
                onStart(name.trim());
            }, 1200);
        }
    };

    return (
        <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-white text-slate-900 font-sans">

            {/* Dynamic Kaleidoscopic Explosion */}
            <AnimatePresence>
                {isExploding && (
                    <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
                        {kaleidoscopeColors.map((color, i) => (
                            <motion.div
                                key={i}
                                initial={{ scale: 0, rotate: 0, opacity: 1 }}
                                animate={{
                                    scale: [0, 20],
                                    rotate: [0, 90 + (i * 45)],
                                    opacity: [1, 1, 0]
                                }}
                                transition={{
                                    duration: 1.5,
                                    ease: "easeInOut",
                                    delay: i * 0.05
                                }}
                                className={`absolute w-full h-full mix-blend-multiply ${color} rounded-full opacity-60`}
                                style={{ originX: 0.5, originY: 0.5 }}
                            />
                        ))}
                        {/* White flush at the end to clean transition */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8, duration: 0.5 }}
                            className="absolute inset-0 bg-slate-50 z-60"
                        />
                    </div>
                )}
            </AnimatePresence>

            {/* Minimalist Entry UI */}
            <motion.div
                animate={{
                    opacity: isExploding ? 0 : 1,
                    scale: isExploding ? 0.9 : 1,
                    filter: isExploding ? 'blur(20px)' : 'blur(0px)'
                }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-lg p-8 flex flex-col items-center space-y-10"
            >
                {/* Logo */}
                <motion.img
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    src={stJohnsLogo}
                    alt="St Johns Logo"
                    className="w-32 h-auto mb-4 drop-shadow-sm"
                />

                <div className="space-y-2 text-center">
                    <motion.h1
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-3xl font-bold text-slate-800 tracking-tight"
                    >
                        Hello
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-lg text-slate-500 font-medium"
                    >
                        Enter your name to begin.
                    </motion.p>
                </div>

                <form onSubmit={handleSubmit} className="w-full space-y-8 flex flex-col items-center">
                    <motion.div
                        initial={{ opacity: 0, width: "50%" }}
                        animate={{ opacity: 1, width: "100%" }}
                        transition={{ delay: 0.6 }}
                        className="relative"
                    >
                        <input
                            type="text"
                            autoFocus
                            className="w-full text-center text-3xl font-bold py-3 border-b-2 border-slate-300 bg-transparent outline-none focus:border-blue-600 focus:border-b-4 transition-all placeholder:text-slate-200 text-slate-800"
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </motion.div>

                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={!name.trim()}
                        className="px-10 py-3 bg-slate-900 text-white rounded-full text-lg font-bold tracking-wide shadow-lg hover:bg-blue-700 hover:shadow-blue-500/30 transition-all flex items-center gap-2"
                    >
                        ENTER <ArrowRight className="w-5 h-5" />
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
};

export default LandingPage;

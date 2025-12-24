import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import stJohnsLogo from '../assets/StJohnsLogo.png';

const LandingPage = ({ onStart }) => {
    const [name, setName] = useState('');
    const [isExploding, setIsExploding] = useState(false);

    // Colors matching the 'Hello' gradient for the ripple effect
    const rippleColors = [
        'bg-blue-600',
        'bg-purple-600',
        'bg-pink-500',
        'bg-orange-500'
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim()) {
            setIsExploding(true);
            setTimeout(() => {
                onStart(name.trim());
            }, 1500);
        }
    };

    return (
        <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-white text-slate-900 font-sans">

            {/* Ripple Effect Transition */}
            <AnimatePresence>
                {isExploding && (
                    <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
                        {rippleColors.map((color, i) => (
                            <motion.div
                                key={i}
                                initial={{ scale: 0, opacity: 1 }}
                                animate={{
                                    scale: 40,
                                    opacity: 1
                                }}
                                transition={{
                                    duration: 1.2,
                                    ease: "circIn",
                                    delay: i * 0.15
                                }}
                                className={`absolute w-24 h-24 rounded-full ${color} z-${10 + i}`}
                            />
                        ))}
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

                <div className="space-y-4 text-center">
                    <motion.h1
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-6xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 via-pink-500 to-orange-500 bg-[length:300%_auto] animate-text-flow bg-clip-text text-transparent pb-2"
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
                        className="px-10 py-3 bg-red-600 text-white rounded-full text-lg font-bold tracking-wide shadow-lg hover:bg-red-700 hover:shadow-red-500/30 transition-all flex items-center gap-2"
                    >
                        ENTER <ArrowRight className="w-5 h-5" />
                    </motion.button>
                </form>
            </motion.div>

            {/* Footer */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="absolute bottom-8 left-0 right-0 flex flex-col items-center space-y-3 z-20 pointer-events-none"
            >
                <img src={stJohnsLogo} alt="St Johns Logo" className="w-16 h-auto opacity-90 mix-blend-multiply grayscale hover:grayscale-0 transition-all duration-500" />
                <p className="text-slate-400 text-xs font-bold tracking-[0.2em] uppercase">St Johns English Department 2026</p>
            </motion.div>
        </div>
    );
};

export default LandingPage;

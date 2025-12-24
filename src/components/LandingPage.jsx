import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen } from 'lucide-react';
import stJohnsLogo from '../assets/StJohnsLogo.png';

const LandingPage = ({ onStart }) => {
    const [name, setName] = useState('');
    const [isExiting, setIsExiting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim()) {
            setIsExiting(true);
            setTimeout(() => {
                onStart(name.trim());
            }, 800); // Faster, smoother transition
        }
    };

    return (
        <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-slate-900 font-sans selection:bg-brand-500 selection:text-white">
            
            {/* Abstract Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px] animate-pulse-slow delay-700" />
            </div>

            {/* Main Content Card */}
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={isExiting ? 
                    { opacity: 0, scale: 1.1, filter: "blur(10px)" } : 
                    { opacity: 1, y: 0, scale: 1 }
                }
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-2xl px-6"
            >
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-12 shadow-2xl shadow-black/50">
                    
                    {/* Header */}
                    <div className="text-center space-y-6 mb-12">
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex justify-center"
                        >
                            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4 border border-white/10">
                                <BookOpen className="w-8 h-8 text-white" />
                            </div>
                        </motion.div>
                        
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-5xl md:text-7xl font-bold text-white tracking-tight"
                        >
                            Lit Companion
                        </motion.h1>
                        
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-lg text-slate-300 font-light max-w-sm mx-auto"
                        >
                            Your interactive guide to critical reading and creative writing.
                        </motion.p>
                    </div>

                    {/* Input Form */}
                    <form onSubmit={handleSubmit} className="relative max-w-md mx-auto space-y-4">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="relative group"
                        >
                            <input
                                type="text"
                                autoFocus
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your name..."
                                className="w-full bg-black/20 border-2 border-white/10 rounded-2xl px-6 py-4 text-xl text-white placeholder:text-white/30 outline-none focus:border-white/40 focus:bg-black/30 transition-all duration-300 text-center font-medium"
                            />
                        </motion.div>

                        <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={!name.trim()}
                            className="w-full bg-white text-slate-900 rounded-2xl px-6 py-4 text-xl font-bold tracking-wide hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-3 group"
                        >
                            <span>Begin Journey</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                    </form>
                </div>
            </motion.div>

            {/* Footer */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="absolute bottom-8 text-center"
            >
                <p className="text-white/20 text-xs font-bold tracking-[0.3em] uppercase mb-4">
                    St Johns English Dept
                </p>
                <img src={stJohnsLogo} alt="Logo" className="w-12 h-auto opacity-30 mx-auto grayscale" />
            </motion.div>
        </div>
    );
};

export default LandingPage;

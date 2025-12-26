import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
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
            }, 800);
        }
    };

    return (
        <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-white font-sans selection:bg-pink-200">
            
            {/* The Living Canvas - Animated Blobs */}
            <div className="absolute inset-0 z-0 opacity-30 sm:opacity-40 overflow-hidden">
                <motion.div
                    animate={{
                        x: [0, 50, 0],
                        y: [0, -25, 0],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-10%] left-[-10%] w-[50%] sm:w-[60%] h-[50%] sm:h-[60%] rounded-full bg-blue-400 blur-[60px] sm:blur-[100px]"
                />
                <motion.div
                    animate={{
                        x: [0, -40, 0],
                        y: [0, 50, 0],
                        scale: [1, 1.05, 1],
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-[-10%] right-[-10%] w-[50%] sm:w-[60%] h-[50%] sm:h-[60%] rounded-full bg-pink-400 blur-[60px] sm:blur-[100px]"
                />
                <motion.div
                    animate={{
                        x: [0, 25, 0],
                        y: [0, 25, 0],
                        scale: [1, 1.15, 1],
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[20%] right-[10%] w-[35%] sm:w-[40%] h-[35%] sm:h-[40%] rounded-full bg-yellow-300 blur-[60px] sm:blur-[100px]"
                />
            </div>

            {/* Main Content */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isExiting ? 
                    { opacity: 0, scale: 1.5, filter: "blur(20px)" } : 
                    { opacity: 1, scale: 1 }
                }
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-xl px-4 sm:px-6 flex flex-col items-center"
            >
                {/* Typography */}
                <div className="text-center space-y-3 sm:space-y-4 mb-8 sm:mb-12">
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight leading-none"
                    >
                        <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-600 via-indigo-600 to-pink-600">
                            Hello
                        </span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-lg sm:text-xl text-slate-500 font-medium tracking-tight"
                    >
                        Ready for your next mission?
                    </motion.p>
                </div>

                {/* Interactive Form */}
                <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 sm:space-y-6 px-2 sm:px-0">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="relative"
                    >
                        <input
                            type="text"
                            autoFocus
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Type your name"
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-4 sm:py-5 text-xl sm:text-2xl font-bold text-slate-800 placeholder:text-slate-300 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner text-center"
                        />
                    </motion.div>

                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={!name.trim()}
                        className="w-full group relative max-w-xs mx-auto block"
                    >
                        <div className="absolute inset-0 bg-indigo-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
                        <div className="relative flex items-center justify-center gap-3 bg-indigo-600 text-white rounded-xl px-6 py-3 text-lg font-bold shadow-xl group-hover:bg-indigo-700 transition-colors">
                            <span>Let's Go</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </motion.button>
                </form>
            </motion.div>

            {/* Branded Footer */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="absolute bottom-6 sm:bottom-10 flex flex-col items-center gap-3 sm:gap-4"
            >
                <div className="h-px w-10 sm:w-12 bg-slate-200" />
                <img src={stJohnsLogo} alt="Logo" className="w-12 sm:w-16 h-auto transition-opacity cursor-pointer" />
                <p className="text-slate-400 text-[9px] sm:text-[10px] font-black tracking-[0.3em] sm:tracking-[0.4em] uppercase">
                    Literacy Companion
                </p>
            </motion.div>
        </div>
    );
};

export default LandingPage;

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const ActivityLayout = ({ onBack, leftPanel, rightPanel, accentColor = 'bg-blue-600' }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-screen flex flex-col bg-slate-100 overflow-hidden"
        >
            {/* Header */}
            <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 justify-between flex-shrink-0 z-20 shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-800"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="h-6 w-px bg-slate-200" />
                    <h1 className="font-bold text-slate-800 text-lg">Activity Module</h1>
                </div>

                <div className={`px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider ${accentColor}`}>
                    Reading & Writing
                </div>
            </header>

            {/* Main Split View */}
            <main className="flex-1 flex overflow-hidden p-6 gap-6 relative">
                {/* Left: Reading Panel */}
                <div className="w-5/12 h-full relative z-10">
                    {leftPanel}
                </div>

                {/* Right: Activity Workspace */}
                <div className="w-7/12 h-full flex flex-col relative z-10 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="flex-1 p-8 overflow-y-auto">
                        {rightPanel}
                    </div>

                    {/* Future AI Agent Bar could go here */}
                </div>

                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-200/50 -skew-x-[10deg] transform translate-x-20 -z-0 pointer-events-none" />
            </main>
        </motion.div>
    );
};

export default ActivityLayout;

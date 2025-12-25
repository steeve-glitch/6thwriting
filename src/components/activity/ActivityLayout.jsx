import React, { useState } from 'react';
import { ArrowLeft, BookOpen, PanelLeft, Eye, EyeOff, BookText, PenTool } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ActivityLayout = ({ 
    onBack, 
    leftPanel, 
    rightPanel, 
    accentColor = 'bg-blue-600', 
    bookTitle = 'Text',
    theme = {} 
}) => {
    const [isTextCollapsed, setIsTextCollapsed] = useState(false);
    const [mobileTab, setMobileTab] = useState('activity'); // 'text' or 'activity'

    // Theme defaults
    const {
        mainBg = 'bg-slate-100',
        panelBg = 'bg-white',
        font = 'font-sans',
        backgroundImage = null,
        borderColor = 'border-slate-200'
    } = theme;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`h-screen flex flex-col ${mainBg} ${font} overflow-hidden`}
        >
            {/* Header */}
            <header className={`h-16 ${panelBg} border-b ${borderColor} flex items-center px-6 justify-between flex-shrink-0 z-20 shadow-sm transition-colors duration-300`}>
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className={`p-2 hover:bg-black/5 rounded-full transition-colors text-slate-500 hover:text-slate-800`}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className={`h-6 w-px ${borderColor.replace('border', 'bg')}`} />
                    <h1 className="font-bold text-slate-800 text-lg hidden sm:block">{bookTitle} Activity</h1>
                </div>

                <div className="flex items-center gap-3">
                    {/* Text Panel Toggle */}
                    <button
                        onClick={() => setIsTextCollapsed(!isTextCollapsed)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all
                            ${isTextCollapsed
                                ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                                : 'bg-black/5 text-slate-600 hover:bg-black/10'}`}
                    >
                        {isTextCollapsed ? (
                            <>
                                <Eye className="w-4 h-4" />
                                <span className="hidden sm:inline">Show Text</span>
                            </>
                        ) : (
                            <>
                                <EyeOff className="w-4 h-4" />
                                <span className="hidden sm:inline">Hide Text</span>
                            </>
                        )}
                    </button>

                    <div className={`px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider ${accentColor}`}>
                        Reading & Writing
                    </div>
                </div>
            </header>

            {/* Main Split View - Desktop */}
            <main className="flex-1 hidden md:flex overflow-hidden p-4 sm:p-6 gap-4 sm:gap-6 relative z-10">
                {/* Left: Reading Panel - Collapsible */}
                <AnimatePresence mode="wait">
                    {!isTextCollapsed ? (
                        <motion.div
                            key="expanded"
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: '41.666667%', opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="h-full relative z-10 overflow-hidden"
                        >
                            {leftPanel}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="collapsed"
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: '60px', opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="h-full relative z-10 flex flex-col"
                        >
                            {/* Collapsed Strip */}
                            <div className={`h-full ${panelBg} rounded-2xl shadow-sm border ${borderColor} flex flex-col items-center py-4 gap-3`}>
                                <div className={`w-10 h-10 rounded-xl ${accentColor} flex items-center justify-center`}>
                                    <BookOpen className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1 flex items-center justify-center">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest"
                                        style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                                        {bookTitle}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setIsTextCollapsed(false)}
                                    className="w-10 h-10 rounded-xl bg-indigo-100 hover:bg-indigo-200 text-indigo-600 flex items-center justify-center transition-colors"
                                    title="Show Text"
                                >
                                    <PanelLeft className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Right: Activity Workspace - Expands when text is collapsed */}
                <motion.div
                    layout
                    className={`h-full flex flex-col relative z-10 ${panelBg} rounded-3xl shadow-sm border ${borderColor} overflow-hidden
                        ${isTextCollapsed ? 'flex-1' : 'w-7/12'}`}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                    <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                        {rightPanel}
                    </div>
                </motion.div>

                {/* Background decoration */}
                {backgroundImage ? backgroundImage : (
                     <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-200/50 -skew-x-[10deg] transform translate-x-20 -z-10 pointer-events-none" />
                )}
            </main>

            {/* Mobile Tabbed View */}
            <main className="flex-1 flex flex-col md:hidden overflow-hidden">
                {/* Mobile Tab Content */}
                <div className="flex-1 overflow-hidden">
                    <AnimatePresence mode="wait">
                        {mobileTab === 'text' ? (
                            <motion.div
                                key="mobile-text"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="h-full p-4 overflow-auto"
                            >
                                {leftPanel}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="mobile-activity"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.2 }}
                                className="h-full bg-white overflow-auto"
                            >
                                <div className="p-4">
                                    {rightPanel}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Mobile Tab Bar */}
                <div className="flex-shrink-0 bg-white border-t border-slate-200 px-4 py-2 safe-area-pb">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setMobileTab('text')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all
                                ${mobileTab === 'text'
                                    ? `${accentColor} text-white shadow-md`
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                            <BookText className="w-5 h-5" />
                            <span>Read</span>
                        </button>
                        <button
                            onClick={() => setMobileTab('activity')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all
                                ${mobileTab === 'activity'
                                    ? `${accentColor} text-white shadow-md`
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                            <PenTool className="w-5 h-5" />
                            <span>Activity</span>
                        </button>
                    </div>
                </div>
            </main>

        </motion.div>
    );
};

export default ActivityLayout;

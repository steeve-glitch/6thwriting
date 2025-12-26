import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, X, Bug, Star, Pencil, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatWithGemini } from '../services/gemini';

const AiAssistant = ({ context, isOpen, onToggle }) => {
    const studentName = context?.studentName || "";
    const bookTitle = context?.book || "";

    // Dynamic Theme Configuration based on Book Title
    const getTheme = (book) => {
        if (!book) return { color: 'from-indigo-500 to-purple-600', icon: Bot, name: 'Learning Companion' };

        if (book.includes("Bug Muldoon")) {
            return {
                color: 'from-emerald-600 to-teal-700',
                icon: Bug,
                name: 'Detective Muldoon AI',
                bg: 'bg-emerald-50'
            };
        }
        if (book.includes("Number the Stars")) {
            return {
                color: 'from-blue-600 to-indigo-700',
                icon: Star,
                name: 'Resistance Guide AI',
                bg: 'bg-blue-50'
            };
        }
        if (book.includes("Sticks and Stones")) {
            return {
                color: 'from-orange-500 to-pink-600',
                icon: Pencil,
                name: 'Writing Coach AI',
                bg: 'bg-orange-50'
            };
        }
        return { color: 'from-indigo-500 to-purple-600', icon: Bot, name: 'Learning Companion', bg: 'bg-slate-50' };
    };

    const theme = getTheme(bookTitle);
    const Icon = theme.icon;

    const getGreeting = (name) => name
        ? `Hi ${name}! I'm your ${theme.name}. I can help you find evidence or improve your sentences. How can I help you today?`
        : `Hi! I'm your ${theme.name}. I can help you find evidence or improve your sentences. How can I help you today?`;

    const [messages, setMessages] = useState([
        { role: 'assistant', text: getGreeting(studentName) }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showHint, setShowHint] = useState(true); // Show hint initially
    const messagesEndRef = useRef(null);

    // Update greeting when student name becomes available
    useEffect(() => {
        if (studentName && messages.length === 1 && !messages[0].text.includes(studentName)) {
            setMessages([{ role: 'assistant', text: getGreeting(studentName) }]);
        }
    }, [studentName, bookTitle]);

    // Auto-hide hint after delay
    useEffect(() => {
        const timer = setTimeout(() => setShowHint(false), 8000);
        return () => clearTimeout(timer);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        try {
            const responseText = await chatWithGemini(messages, userMessage.text, context || {});
            const aiResponse = { role: 'assistant', text: responseText };
            setMessages(prev => [...prev, aiResponse]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I lost my connection for a moment." }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleToggle = () => {
        setShowHint(false);
        onToggle();
    };

    return (
        <>
            {/* Floating Toggle Button with Tooltip */}
            {!isOpen && (
                <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
                    <AnimatePresence>
                        {showHint && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="mb-4 mr-2 bg-white px-4 py-2 rounded-xl shadow-xl border border-slate-100 relative"
                            >
                                <div className="text-sm font-bold text-slate-700">Need help? Ask me!</div>
                                {/* Triangle pointer */}
                                <div className="absolute bottom-0 right-6 translate-y-1/2 rotate-45 w-3 h-3 bg-white border-r border-b border-slate-100" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                        onClick={handleToggle}
                        className={`w-16 h-16 bg-gradient-to-r ${theme.color} rounded-full shadow-lg flex items-center justify-center text-white cursor-pointer hover:shadow-xl transition-all`}
                    >
                        <Icon className="w-8 h-8 animate-pulse" />
                        {/* Notification Dot */}
                        <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
                    </motion.button>
                </div>
            )}

            {/* Chat Interface */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className={`bg-gradient-to-r ${theme.color} p-4 flex items-center justify-between text-white`}>
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-full">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">{theme.name}</h3>
                                    <p className="text-xs opacity-90">Always here to help</p>
                                </div>
                            </div>
                            <button onClick={onToggle} className="p-1 hover:bg-white/20 rounded-full transition">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${theme.bg}`}>
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                            msg.role === 'user'
                                            ? `bg-gradient-to-r ${theme.color} text-white rounded-tr-sm`  
                                            : 'bg-white text-slate-700 border border-slate-200 rounded-tl-sm'
                                        }`}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white p-3 rounded-2xl rounded-tl-sm border border-slate-200 shadow-sm flex gap-1">
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75" />
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask me anything..."
                                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-700 transition-all"        
                            />
                            <button
                                type="submit"
                                disabled={!input.trim()}
                                className={`p-2.5 rounded-xl text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 bg-gradient-to-r ${theme.color}`}  
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AiAssistant;

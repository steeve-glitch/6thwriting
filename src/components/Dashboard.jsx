import React from 'react';
import { motion } from 'framer-motion';
import { Star, Bug, Pencil, BookOpen, ArrowRight } from 'lucide-react';

const BookCard = ({ title, author, theme, icon: Icon, color, onClick, delay }) => (
    <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        whileHover={{ y: -8, scale: 1.02 }}
        onClick={onClick}
        className={`relative group w-full text-left overflow-hidden rounded-3xl p-1 bg-gradient-to-br ${color} shadow-xl hover:shadow-2xl transition-all duration-300`}
    >
        <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl transform translate-x-12 -translate-y-12"></div>
        <div className="relative h-full bg-white/95 backdrop-blur-sm rounded-[22px] p-6 lg:p-8 flex flex-col justify-between overflow-hidden">

            {/* Background Icon Watermark */}
            <Icon className={`absolute -bottom-4 -right-4 w-40 h-40 opacity-[0.07] ${theme.text}`} />

            <div className="space-y-4">
                <div className={`w-14 h-14 rounded-2xl ${theme.bg} ${theme.text} flex items-center justify-center shadow-sm`}>
                    <Icon className="w-7 h-7" />
                </div>

                <div>
                    <h3 className="text-2xl font-bold text-slate-800 leading-tight group-hover:text-brand-600 transition-colors">
                        {title}
                    </h3>
                    <p className="text-slate-500 font-medium mt-1">{author}</p>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                    {theme.description}
                </p>
            </div>

            <div className="mt-8 flex items-center gap-2 font-semibold text-slate-800 group-hover:gap-3 transition-all">
                Open Module
                <ArrowRight className="w-5 h-5 text-brand-500" />
            </div>
        </div>
    </motion.button>
);

const Dashboard = ({ user, onSelectBook }) => {
    const books = [
        {
            id: 'number-the-stars',
            title: "Number the Stars",
            author: "Lois Lowry",
            icon: Star,
            color: "from-blue-400 to-indigo-600",
            theme: {
                text: "text-indigo-600",
                bg: "bg-indigo-50",
                description: "Practice close reading focusing on character, plot, and setting. Write formal vs. informal letters in a historical context."
            }
        },
        {
            id: 'bug-muldoon',
            title: "Bug Muldoon",
            author: "Paul Shipton",
            icon: Bug,
            color: "from-emerald-400 to-green-600",
            theme: {
                text: "text-emerald-600",
                bg: "bg-emerald-50",
                description: "Explore connection, individuality, and society. Reflect on tension and suspense in this noir-style garden mystery."
            }
        },
        {
            id: 'sticks-and-stones',
            title: "Sticks and Stones",
            author: "Abby Cooper",
            icon: Pencil, // Using Pencil for "Writing/Words" theme
            color: "from-orange-400 to-pink-600",
            theme: {
                text: "text-orange-600",
                bg: "bg-orange-50",
                description: "Center on personal reflection, personality vocabulary, and identity. A journey of self-discovery."
            }
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-y-auto">
            {/* Decorative Header Background */}
            <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-brand-100/50 to-transparent z-0"></div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 lg:py-20">
                <header className="mb-16">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/60 backdrop-blur-sm rounded-full border border-slate-200 text-sm font-medium text-slate-600 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Reader Active
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
                            Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-400">{user.name}</span>.
                        </h1>
                        <p className="text-lg text-slate-600 max-w-xl">
                            Select a novel below to begin your reading and writing adventure. Each path offers unique challenges and rewards.
                        </p>
                    </motion.div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {books.map((book, index) => (
                        <BookCard
                            key={index}
                            {...book}
                            delay={index * 0.1 + 0.3}
                            onClick={() => onSelectBook && onSelectBook(book.id)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

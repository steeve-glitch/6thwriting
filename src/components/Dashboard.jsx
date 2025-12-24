import React from 'react';
import { motion } from 'framer-motion';
import { Star, Bug, Pencil, BookOpen, ArrowRight, Search, Zap, Feather } from 'lucide-react';

const BookCard = ({ title, author, theme, icon: Icon, onClick, delay, variant }) => {
    
    // Define variant-specific styles
    const styles = {
        'noir': {
            container: "bg-slate-900 border-slate-800",
            header: "text-emerald-400",
            subtext: "text-slate-400",
            description: "text-slate-300 font-mono",
            accent: "bg-emerald-900/30 text-emerald-400 border border-emerald-800",
            icon: "text-emerald-900",
            shadow: "shadow-emerald-900/20",
            pattern: "radial-gradient(circle at top right, rgba(16, 185, 129, 0.1), transparent 70%)"
        },
        'historical': {
            container: "bg-[#1a2333] border-blue-900/50",
            header: "text-amber-200",
            subtext: "text-blue-200/60",
            description: "text-blue-100/80 font-serif italic",
            accent: "bg-blue-900/40 text-amber-300 border border-blue-800",
            icon: "text-blue-950",
            shadow: "shadow-blue-900/20",
            pattern: "linear-gradient(135deg, rgba(251, 191, 36, 0.05) 0%, transparent 100%)"
        },
        'sketch': {
            container: "bg-white border-slate-200",
            header: "text-slate-900",
            subtext: "text-slate-500",
            description: "text-slate-600 font-handwriting",
            accent: "bg-orange-100 text-orange-600 border border-orange-200",
            icon: "text-orange-50",
            shadow: "shadow-orange-500/10",
            pattern: "repeating-linear-gradient(transparent, transparent 23px, #e5e7eb 24px)"
        }
    };

    const s = styles[variant] || styles['noir'];

    return (
        <motion.button
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.6, type: "spring" }}
            whileHover={{ y: -10, scale: 1.02 }}
            onClick={onClick}
            className={`relative group w-full text-left overflow-hidden rounded-[2rem] border ${s.container} shadow-xl ${s.shadow} hover:shadow-2xl transition-all duration-300 flex flex-col h-full`}
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: s.pattern }} />
            
            {/* Huge Background Icon Watermark */}
            <Icon className={`absolute -bottom-8 -right-8 w-48 h-48 opacity-10 ${s.icon} transform group-hover:rotate-12 transition-transform duration-500 ease-out`} />

            <div className="relative z-10 p-8 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                    <div className={`w-16 h-16 rounded-2xl ${s.accent} flex items-center justify-center shadow-inner`}>
                        <Icon className="w-8 h-8" />
                    </div>
                    {variant === 'historical' && <Star className="w-6 h-6 text-amber-400/40" />}
                </div>

                <div className="mb-4">
                    <h3 className={`text-3xl font-bold leading-tight mb-2 ${s.header}`}>
                        {title}
                    </h3>
                    <p className={`text-sm font-medium tracking-wide uppercase ${s.subtext}`}>
                        {author}
                    </p>
                </div>

                <p className={`text-base leading-relaxed flex-grow ${s.description}`}>
                    {theme.description}
                </p>

                <div className="mt-8 pt-6 border-t border-current border-opacity-10 flex items-center justify-between group-hover:px-2 transition-all duration-300">
                    <span className={`font-bold text-sm tracking-widest uppercase opacity-70 ${s.header}`}>Start Mission</span>
                    <div className={`p-2 rounded-full ${s.accent} group-hover:bg-opacity-100 transition-colors`}>
                        <ArrowRight className="w-5 h-5" />
                    </div>
                </div>
            </div>
        </motion.button>
    );
};

const LibraryCard = ({ onClick }) => (
    <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        whileHover={{ scale: 1.02 }}
        onClick={onClick}
        className="relative group w-full text-left overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-100 to-white border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 h-full min-h-[300px]"
    >
        <div className="absolute inset-0 bg-grid-slate-200/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
        <div className="relative z-10 p-8 flex flex-col h-full justify-between">
            <div>
                <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Search className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mb-2">Library Search</h3>
                <p className="text-slate-500 font-medium">Research & Analysis Tool</p>
            </div>
            
            <div className="mt-8">
                <p className="text-slate-600 mb-6">
                    Access the full text database. Search for quotes, analyze themes, and gather evidence across all novels.
                </p>
                <div className="flex items-center gap-2 font-bold text-indigo-600">
                    Access Database <ArrowRight className="w-5 h-5" />
                </div>
            </div>
        </div>
    </motion.button>
);

const Dashboard = ({ user, onSelectBook, onOpenLibrary }) => {
    const books = [
        {
            id: 'bug-muldoon',
            title: "Bug Muldoon",
            author: "Paul Shipton",
            icon: Bug,
            variant: "noir",
            theme: {
                description: "Enter the dark undergrowth of the Garden. A noir mystery where survival is the only law. Analyze the tension."
            }
        },
        {
            id: 'number-the-stars',
            title: "Number the Stars",
            author: "Lois Lowry",
            icon: Star,
            variant: "historical",
            theme: {
                description: "Copenhagen, 1943. Courage isn't the absence of fear. Examine character bravery in the face of history."
            }
        },
        {
            id: 'sticks-and-stones',
            title: "Sticks and Stones",
            author: "Abby Cooper",
            icon: Pencil,
            variant: "sketch",
            theme: {
                description: "Words have power—literally. A journey of self-discovery, identity, and the labels we wear."
            }
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-y-auto font-sans selection:bg-indigo-100">
            {/* Header Section */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-bold tracking-wider uppercase">Student Dashboard</p>
                            <h1 className="text-2xl font-bold text-slate-900">
                                Welcome back, <span className="text-indigo-600">{user.name}</span>
                            </h1>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-sm font-medium text-slate-600">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Online
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-12">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                        Choose Your Mission
                    </h2>
                    <p className="text-xl text-slate-600 max-w-2xl">
                        Select a novel to begin your inquiry. Each module is designed to challenge your critical thinking and creative writing skills.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Book Cards */}
                    {books.map((book, index) => (
                        <BookCard
                            key={index}
                            {...book}
                            delay={index * 0.1 + 0.2}
                            onClick={() => onSelectBook && onSelectBook(book.id)}
                        />
                    ))}

                    {/* Library Search */}
                    <LibraryCard onClick={onOpenLibrary} />
                </div>
            </main>
        </div>
    );
};

export default Dashboard;

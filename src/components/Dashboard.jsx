import React from 'react';
import { motion } from 'framer-motion';
import { Star, Bug, Pencil, BookOpen, ArrowRight } from 'lucide-react';

const BookCard = ({ title, author, image, onClick, delay, variant }) => {
    
    // Gradient overlays based on genre for text readability
    const overlays = {
        'noir': "from-emerald-900/90 to-slate-900/40",
        'historical': "from-blue-900/90 to-amber-900/40",
        'sketch': "from-orange-600/90 to-pink-600/40"
    };

    const overlay = overlays[variant] || overlays['noir'];

    return (
        <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, duration: 0.4 }}
            whileHover={{ scale: 1.03 }}
            onClick={onClick}
            className="relative group w-full h-[400px] rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500"
        >
            {/* Background Image with Zoom Effect */}
            <div className="absolute inset-0">
                <img 
                    src={image} 
                    alt={title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t ${overlay} opacity-80 group-hover:opacity-90 transition-opacity`} />
            </div>

            {/* Content */}
            <div className="absolute inset-0 p-8 flex flex-col justify-end text-left">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-3xl font-black text-white leading-tight mb-2 drop-shadow-lg">
                        {title}
                    </h3>
                    <p className="text-lg text-white/90 font-medium font-serif tracking-wide mb-6">
                        {author}
                    </p>
                    
                    <div className="flex items-center gap-2 text-white/0 group-hover:text-white font-bold tracking-widest uppercase text-xs transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                        Start Adventure
                        <ArrowRight className="w-4 h-4" />
                    </div>
                </div>
            </div>
        </motion.button>
    );
};

const Dashboard = ({ user, onSelectBook, onOpenLibrary }) => {
    const books = [
        {
            id: 'bug-muldoon',
            title: "Bug Muldoon",
            author: "Paul Shipton",
            image: "https://images.unsplash.com/photo-1469212044023-0e55b4b9745a?auto=format&fit=crop&w=800&q=80", // Dramatic Beetle/Garden
            icon: Bug,
            variant: "noir",
        },
        {
            id: 'number-the-stars',
            title: "Number the Stars",
            author: "Lois Lowry",
            image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80", // Starry Night/Historical
            icon: Star,
            variant: "historical",
        },
        {
            id: 'sticks-and-stones',
            title: "Sticks and Stones",
            author: "Abby Cooper",
            image: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80", // Colorful Notebook/Pencils
            icon: Pencil,
            variant: "sketch",
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-y-auto font-sans selection:bg-indigo-100">
            {/* Header Section */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-bold tracking-wider uppercase">Student Dashboard</p>
                            <h1 className="text-xl font-bold text-slate-900">
                                Welcome, <span className="text-indigo-600">{user.name}</span>
                            </h1>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-xs font-medium text-slate-600">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Online
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-12">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 text-center"
                >
                    <h2 className="text-5xl font-black text-slate-900 tracking-tight mb-4">
                        Your Next Adventure
                    </h2>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto">
                        Choose a story to begin your mission.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Book Cards */}
                    {books.map((book, index) => (
                        <BookCard
                            key={index}
                            {...book}
                            delay={index * 0.1 + 0.2}
                            onClick={() => onSelectBook && onSelectBook(book.id)}
                        />
                    ))}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;

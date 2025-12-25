import React from 'react';
import { motion } from 'framer-motion';
import { Star, Bug, Pencil, ArrowRight, CheckCircle, PlayCircle } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import logo from '../assets/StJohnsLogo.png';

const ProgressRing = ({ percentage, size = 48, strokeWidth = 4 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90" width={size} height={size}>
                <circle
                    className="text-white/20"
                    strokeWidth={strokeWidth}
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                <circle
                    className="text-white transition-all duration-500"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                {percentage === 100 ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                ) : (
                    <span className="text-xs font-bold text-white">{percentage}%</span>
                )}
            </div>
        </div>
    );
};

const BookCard = ({ title, author, image, onClick, delay, variant, bookId, isFirstBook, hasAnyProgress }) => {
    const { getBookPercentage } = useProgress();
    const percentage = getBookPercentage(bookId);
    const showStartHere = isFirstBook && !hasAnyProgress;
    
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

            {/* Progress Ring - Top Right */}
            <div className="absolute top-4 right-4 z-10">
                <ProgressRing percentage={percentage} />
            </div>

            {/* Start Here Badge */}
            {showStartHere && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: delay + 0.3, type: 'spring' }}
                    className="absolute top-4 left-4 z-10 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg"
                >
                    Start Here
                </motion.div>
            )}

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
                        {percentage > 0 && percentage < 100 ? 'Continue' : percentage === 100 ? 'Review' : 'Start Adventure'}
                        <ArrowRight className="w-4 h-4" />
                    </div>
                </div>
            </div>
        </motion.button>
    );
};

const BOOK_TITLES = {
    'bug-muldoon': 'Bug Muldoon',
    'number-the-stars': 'Number the Stars',
    'sticks-and-stones': 'Sticks and Stones'
};

const Dashboard = ({ user, onSelectBook, onOpenLibrary }) => {
    const { getContinuePoint, hasAnyProgress } = useProgress();
    const continuePoint = getContinuePoint();
    const anyProgress = hasAnyProgress();

    const books = [
        {
            id: 'bug-muldoon',
            title: "Bug Muldoon",
            author: "Paul Shipton",
            image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80",
            icon: Bug,
            variant: "noir",
        },
        {
            id: 'number-the-stars',
            title: "Number the Stars",
            author: "Lois Lowry",
            image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
            icon: Star,
            variant: "historical",
        },
        {
            id: 'sticks-and-stones',
            title: "Sticks and Stones",
            author: "Abby Cooper",
            image: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80",
            icon: Pencil,
            variant: "sketch",
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-y-auto font-sans selection:bg-indigo-100">
            {/* Header Section */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <img src={logo} alt="St Johns Logo" className="h-12 w-auto object-contain" />
                        <div>
                            <p className="text-xs text-slate-500 font-bold tracking-wider uppercase">Student Dashboard</p>
                            <h1 className="text-xl font-bold text-slate-900">
                                Welcome, <span className="text-indigo-600">{user.name}</span>
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-12">
                {/* Continue Button */}
                {continuePoint && (
                    <motion.button
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => onSelectBook && onSelectBook(continuePoint.bookId)}
                        className="w-full mb-8 p-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl text-white flex items-center justify-between shadow-lg hover:shadow-xl transition-shadow group"
                    >
                        <div className="flex items-center gap-3">
                            <PlayCircle className="w-8 h-8" />
                            <div className="text-left">
                                <p className="text-sm opacity-80">Continue where you left off</p>
                                <p className="text-lg font-bold">{BOOK_TITLES[continuePoint.bookId]}</p>
                            </div>
                        </div>
                        <ArrowRight className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Book Cards */}
                    {books.map((book, index) => (
                        <BookCard
                            key={book.id}
                            {...book}
                            bookId={book.id}
                            delay={index * 0.1 + 0.2}
                            onClick={() => onSelectBook && onSelectBook(book.id)}
                            isFirstBook={index === 0}
                            hasAnyProgress={anyProgress}
                        />
                    ))}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Copy, Check, ArrowLeft, BookOpen, FileText } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const LibrarySearch = ({ onBack }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBook, setSelectedBook] = useState('all');
    const [results, setResults] = useState([]);
    const [copiedId, setCopiedId] = useState(null);
    const [books, setBooks] = useState([]);

    // Fetch available books on mount
    React.useEffect(() => {
        const fetchBooks = async () => {
            const { data } = await supabase.from('books').select('id, title');
            if (data) setBooks(data);
        };
        fetchBooks();
    }, []);

    React.useEffect(() => {
        if (!searchTerm.trim()) {
            setResults([]);
            return;
        }

        const searchLibrary = async () => {
            let query = supabase
                .from('books')
                .select('id, title, content');

            if (selectedBook !== 'all') {
                query = query.eq('id', selectedBook);
            }

            // Note: This matches the simple naive search we had before.
            // For production, we'd use Full Text Search (fts) features of Postgres/Supabase.
            // But since we are storing raw text in 'content', we can pull it client side 
            // OR use ilike (which is slow for huge text but fine for this scale).
            // Actually, pulling 50MB of text to client is bad. Use .ilike()

            query = query.ilike('content', `%${searchTerm}%`);

            const { data, error } = await query;

            if (error) {
                console.error('Search error:', error);
                return;
            }

            // Process results (client-side context extraction)
            // Ideally this happens on the server via a Postgres Function,
            // but for now we replicate the previous client-side logic on the returned rows.
            // WARNING: .ilike returns the WHOLE content. This is heavy.
            // Let's optimize: We only search. We rely on the fact we have ~6 books.

            let searchResults = [];
            data?.forEach(book => {
                const regex = new RegExp(`.{0,150}${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.{0,150}`, 'gi');
                const matches = book.content.match(regex);
                if (matches) {
                    matches.forEach((match, index) => {
                        searchResults.push({
                            id: `${book.id}-${index}`,
                            bookTitle: book.title,
                            bookId: book.id,
                            context: match,
                            fullContent: match
                        });
                    });
                }
            });
            setResults(searchResults);
        };

        const timeoutId = setTimeout(searchLibrary, 500); // Debounce
        return () => clearTimeout(timeoutId);

    }, [searchTerm, selectedBook]);

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const highlightText = (text, highlight) => {
        if (!highlight.trim()) return text;
        const parts = text.split(new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
        return (
            <span>
                {parts.map((part, i) =>
                    part.toLowerCase() === highlight.toLowerCase() ?
                        <span key={i} className="bg-yellow-200 text-slate-900 font-semibold px-0.5 rounded">{part}</span> :
                        part
                )}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            <BookOpen className="w-6 h-6 text-brand-600" />
                            <span>Library Search</span>
                        </h1>
                    </div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-6 py-8">
                {/* Search Controls */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search for a quote, character, or theme..."
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all text-lg"
                                autoFocus
                            />
                        </div>
                        <select
                            value={selectedBook}
                            onChange={(e) => setSelectedBook(e.target.value)}
                            className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-700 outline-none focus:border-brand-500"
                        >
                            <option value="all">All Books</option>
                            {books.map(book => (
                                <option key={book.id} value={book.id}>
                                    {book.title}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                        <FileText className="w-4 h-4" />
                        <span>Searching across {selectedBook === 'all' ? books.length : 1} book(s)</span>
                    </div>
                </div>

                {/* Results */}
                <div className="space-y-4">
                    {searchTerm && results.length === 0 && (
                        <div className="text-center py-12 text-slate-400">
                            <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No results found for "{searchTerm}"</p>
                        </div>
                    )}

                    {results.map((result) => (
                        <motion.div
                            key={result.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all group"
                        >
                            <div className="flex items-start justify-between gap-4 mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-600 border border-slate-200">
                                        {result.bookTitle}
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleCopy(result.context, result.id)}
                                    className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                                    title="Copy text"
                                >
                                    {copiedId === result.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>

                            <p className="text-slate-700 leading-relaxed font-serif text-lg border-l-4 border-brand-200 pl-4 py-1 italic">
                                "...{highlightText(result.context, searchTerm)}..."
                            </p>

                        </motion.div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default LibrarySearch;

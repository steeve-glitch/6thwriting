import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import NumberTheStarsModule from './components/activity/NumberTheStarsModule';
import BugMuldoonModule from './components/activity/BugMuldoonModule';
import SticksAndStonesModule from './components/activity/SticksAndStonesModule';
const LibrarySearch = React.lazy(() => import('./components/LibrarySearch'));

function App() {
  const [user, setUser] = useState({ name: '' });
  const [view, setView] = useState('landing'); // 'landing', 'dashboard', 'activity:...'

  const handleStart = (name) => {
    setUser({ name });
    setView('dashboard');
  };

  const handleSelectBook = (bookId) => {
    setView(`activity:${bookId}`);
  };

  const handleBackToDashboard = () => {
    setView('dashboard');
  };

  // Activity Router
  const renderActivity = () => {
    switch (view) {
      case 'activity:number-the-stars':
        return <NumberTheStarsModule onBack={handleBackToDashboard} userName={user.name} />;
      case 'activity:bug-muldoon':
        return <BugMuldoonModule onBack={handleBackToDashboard} userName={user.name} />;
      case 'activity:sticks-and-stones':
        return <SticksAndStonesModule onBack={handleBackToDashboard} userName={user.name} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-slate-50 font-sans text-slate-900">
      <AnimatePresence mode="wait">
        {view === 'landing' && (
          <motion.div
            key="landing"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full"
          >
            <LandingPage onStart={handleStart} />
          </motion.div>
        )}

        {view === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full"
          >
            <Dashboard
              user={user}
              onSelectBook={handleSelectBook}
              onOpenLibrary={() => setView('library-search')}
            />
          </motion.div>
        )}

        {view === 'library-search' && (
          <motion.div
            key="library"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="w-full h-full"
          >
            <React.Suspense fallback={<div className="p-8 text-center">Loading Library...</div>}>
              <LibrarySearch onBack={handleBackToDashboard} />
            </React.Suspense>
          </motion.div>
        )}

        {view.startsWith('activity:') && (
          <motion.div
            key="activity"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full"
          >
            {renderActivity()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;

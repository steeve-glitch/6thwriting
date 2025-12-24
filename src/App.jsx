import React, { useState } from 'react';
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
      {view === 'landing' && <LandingPage onStart={handleStart} />}

      {view === 'dashboard' && (
        <Dashboard
          user={user}
          onSelectBook={handleSelectBook}
          onOpenLibrary={() => setView('library-search')}
        />
      )}

      {view === 'library-search' && (
        <React.Suspense fallback={<div className="p-8 text-center">Loading Library...</div>}>
          <LibrarySearch onBack={handleBackToDashboard} />
        </React.Suspense>
      )}

      {view.startsWith('activity:') && renderActivity()}
    </div>
  );
}

export default App;

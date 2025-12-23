import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import NumberTheStarsModule from './components/activity/NumberTheStarsModule';

function App() {
  const [user, setUser] = useState({ name: '' });
  const [view, setView] = useState('landing'); // 'landing', 'dashboard', 'activity:number-the-stars'

  const handleStart = (name) => {
    setUser({ name });
    setView('dashboard');
  };

  const handleSelectBook = (bookId) => {
    // For now only Number the Stars is implemented
    if (bookId === 'number-the-stars') {
      setView('activity:number-the-stars');
    } else {
      console.log('Module not ready:', bookId);
    }
  };

  const handleBackToDashboard = () => {
    setView('dashboard');
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-slate-50 font-sans text-slate-900">
      {/* Global Background (can be used for shared textural elements) */}

      {view === 'landing' && (
        <LandingPage onStart={handleStart} />
      )}

      {view === 'dashboard' && (
        <Dashboard user={user} onSelectBook={handleSelectBook} />
      )}

      {view === 'activity:number-the-stars' && (
        <NumberTheStarsModule onBack={handleBackToDashboard} />
      )}
    </div>
  );
}

export default App;

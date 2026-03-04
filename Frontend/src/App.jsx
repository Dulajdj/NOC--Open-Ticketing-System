import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';

function App() {
  const [activeCategory, setActiveCategory] = useState('daily');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  // whenever darkMode changes update document class and persist
  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <div className={`${darkMode ? 'dark' : ''} w-full h-screen flex bg-gray-50 dark:bg-slate-900`}>

      {/* Sidebar shown on larger screens (left) */}
      <div className="w-80 hidden lg:block border-r border-gray-200 lg:sticky lg:top-0 lg:h-screen">
        <Sidebar activeCategory={activeCategory} setActiveCategory={setActiveCategory} darkMode={darkMode} setDarkMode={setDarkMode} />
      </div>

      <div className="flex-1 overflow-auto">
        <Dashboard activeCategory={activeCategory} setActiveCategory={setActiveCategory} darkMode={darkMode} setDarkMode={setDarkMode} />
      </div>
    </div>
  );
}

export default App;
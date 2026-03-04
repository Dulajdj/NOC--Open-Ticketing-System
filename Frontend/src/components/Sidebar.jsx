// src/components/Sidebar.jsx
import React from 'react';
import logo from '../assets/logo.png';

const Sidebar = ({ setActiveCategory, activeCategory, darkMode, setDarkMode }) => {
  const banks = [
    { id: 'daily', label: 'FIT Tickets', icon: '📅' }, 
    { id: 'peoples', label: "People's Bank Tickets", icon: '🏦' },
    { id: 'hdfc', label: 'HDFC Bank Tickets', icon: '💳' }
  ];

  // sidebar background gradients per category
  const bgMap = {
    daily: {
      light: 'from-indigo-50 to-purple-50',
      dark: 'from-slate-900 to-slate-800'
    },
    peoples: {
      light: 'from-yellow-50 to-red-50',
      dark: 'from-slate-900 to-red-900'
    },
    hdfc: {
      light: 'from-blue-50 to-red-50',
      dark: 'from-slate-900 to-blue-900'
    }
  };

  const currentBg = bgMap[activeCategory] || bgMap.daily;
  const gradient = darkMode ? currentBg.dark : currentBg.light;

  return (
    <aside className={`w-full h-full bg-gradient-to-br ${gradient} text-slate-800 dark:text-slate-200 border-r border-slate-300 dark:border-slate-700 shadow-sm p-6 flex flex-col`}>
      {/* Logo Section */}
      <div className="mb-10 flex justify-center">
        <div className="#">
          <img src={logo} alt="logo" className="h-50 w-auto object-contain" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1">
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 ml-2">
          Navigation Menu
        </p>
        <ul className="space-y-3">
          {banks.map((bank) => (
            <li key={bank.id}>
              <button
                onClick={() => setActiveCategory(bank.id)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-left transition-all duration-300 ${
                  activeCategory === bank.id
                    ? 'bg-white text-indigo-600 shadow-md ring-1 ring-slate-200 font-bold scale-[1.02] dark:bg-slate-700 dark:ring-slate-600'
                    : 'text-slate-500 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-600 dark:hover:text-white'
                }`}
              >
                <span className="text-2xl">{bank.icon}</span>
                <span className="text-sm font-bold tracking-tight">{bank.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer / Create Ticket Button */}
      <div className="mt-auto pt-6 border-t border-slate-300 dark:border-slate-700">
        <div className="mt-4">
            <div className="text-[10px] text-center font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-loose">
              © {new Date().getFullYear()} <br />
              NOC Open Ticket System
            </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
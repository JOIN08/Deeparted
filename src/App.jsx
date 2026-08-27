import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginModal from './components/LoginModal';
import { VesselTable } from './components/VesselTable';
import { KpiCards } from './components/KpiCards';
import { ShipBuilder } from './components/ShipBuilder'; 
import { PortsManager } from './components/PortsManager'; // 1. Added PortsManager import

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('Jeff');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('Dashboard');
  
  const TIMEOUT_DURATION = 60;
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [timeLeft, setTimeLeft] = useState(TIMEOUT_DURATION);

  // Dark Mode side-effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Inactivity Timer logic
  const resetTimer = useCallback(() => {
    if (isLoggedIn) setTimeLeft(TIMEOUT_DURATION);
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsLoggedIn(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      clearInterval(interval);
    };
  }, [isLoggedIn, resetTimer]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (username.trim()) {
      setIsLoggedIn(true);
      setTimeLeft(TIMEOUT_DURATION);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setPassword('');
  };

  return (
    <div className="min-h-screen w-full bg-[#f4f6fa] dark:bg-[#090d16] text-slate-800 dark:text-slate-100 font-sans flex transition-colors duration-300 relative overflow-x-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isLoggedIn={isLoggedIn} />

      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-500 ${!isLoggedIn ? 'blur-md pointer-events-none select-none' : ''}`}>
        <Header 
          timeLeft={timeLeft} 
          isDarkMode={isDarkMode} 
          setIsDarkMode={setIsDarkMode} 
          handleLogout={handleLogout} 
        />
        <main className="p-8 space-y-6 max-w-[1600px] mx-auto w-full">
          {/* Active Tab View Switcher */}
          {activeTab === 'Dashboard' && <VesselTable />}
          {activeTab === 'Vessels' && <ShipBuilder />}
          {activeTab === 'Ports Manager' && <PortsManager />}
        </main>
      </div>

      {!isLoggedIn && (
        <LoginModal 
          username={username}
          setUsername={setUsername}
          password={password}
          setPassword={setPassword}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          handleLogin={handleLogin}
          timeLeft={timeLeft}
        />
      )}
    </div>
  );
}
import { useCallback, useEffect, useState } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import LoginModal from './components/LoginModal'
import { VesselTable } from './components/VesselTable'
import { ShipBuilder } from './components/ShipBuilder'
import { PortsManager } from './components/PortsManager'
import { Routes } from './components/Routes'
import { Reports } from './components/Reports'
import { Users } from './components/Users'
import { Voyages } from './components/Voyages'
import { Bookings } from './components/Bookings'

type TabName = 'Dashboard' | 'Vessels' | 'Voyages' | 'Bookings' | 'Ports Manager' | 'Routes' | 'Reports' | 'Users'

const TIMEOUT_DURATION = 60

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState('Jeff')
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState<TabName>('Dashboard')
  const [isLoggedIn, setIsLoggedIn] = useState(true)
  const [timeLeft, setTimeLeft] = useState(TIMEOUT_DURATION)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode)
  }, [isDarkMode])

  const resetTimer = useCallback(() => {
    if (isLoggedIn) setTimeLeft(TIMEOUT_DURATION)
  }, [isLoggedIn])

  useEffect(() => {
    if (!isLoggedIn) return

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
    events.forEach((event) => window.addEventListener(event, resetTimer))

    const interval = window.setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 1) {
          setIsLoggedIn(false)
          return 0
        }
        return previous - 1
      })
    }, 1000)

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer))
      window.clearInterval(interval)
    }
  }, [isLoggedIn, resetTimer])

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (username.trim()) {
      setIsLoggedIn(true)
      setTimeLeft(TIMEOUT_DURATION)
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#f4f6fa] dark:bg-[#090d16] text-slate-800 dark:text-slate-100 font-sans flex transition-colors duration-300 relative overflow-x-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isLoggedIn={isLoggedIn} />
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-500 ${!isLoggedIn ? 'blur-md pointer-events-none select-none' : ''}`}>
        <Header timeLeft={timeLeft} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} handleLogout={() => setIsLoggedIn(false)} />
        <main className="p-8 space-y-6 max-w-[1600px] mx-auto w-full">
          {activeTab === 'Dashboard' && <VesselTable />}
          {activeTab === 'Vessels' && <ShipBuilder />}
          {activeTab === 'Voyages' && <Voyages currentUser={username} />}
          {activeTab === 'Bookings' && <Bookings currentUser={username} />}
          {activeTab === 'Ports Manager' && <PortsManager />}
          {activeTab === 'Routes' && <Routes />}
          {activeTab === 'Reports' && <Reports />}
          {activeTab === 'Users' && <Users />}
        </main>
      </div>
      {!isLoggedIn && (
        <LoginModal username={username} setUsername={setUsername} password={password} setPassword={setPassword} showPassword={showPassword} setShowPassword={setShowPassword} handleLogin={handleLogin} timeLeft={timeLeft} />
      )}
    </div>
  )
}
import { useState } from 'react'
import Sidebar from './components/Sidebar'
import TicketsPage from './pages/TicketsPage'
import AssetsPage from './pages/AssetsPage'
import MonitoringPage from './pages/MonitoringPage'
import ReportsPage from './pages/ReportsPage'
import KbPage from './pages/KbPage'

const SECTIONS = ['tickets', 'assets', 'monitoring', 'reports', 'kb']

export default function App() {
  // Deep-linking: /?section=reports otwiera od razu wskazaną sekcję
  const initial = new URLSearchParams(window.location.search).get('section')
  const [section, setSection] = useState(SECTIONS.includes(initial) ? initial : 'tickets')

  return (
    <div className="flex min-h-screen">
      <Sidebar section={section} onNavigate={setSection} />

      <main className="flex-1 px-10 py-8">
        {section === 'tickets' && <TicketsPage />}
        {section === 'assets' && <AssetsPage />}
        {section === 'monitoring' && <MonitoringPage />}
        {section === 'reports' && <ReportsPage />}
        {section === 'kb' && <KbPage />}
      </main>
    </div>
  )
}

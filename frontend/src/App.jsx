import { useState } from 'react'
import Sidebar from './components/Sidebar'
import TicketsPage from './pages/TicketsPage'
import AssetsPage from './pages/AssetsPage'

export default function App() {
  const [section, setSection] = useState('tickets')

  return (
    <div className="flex min-h-screen">
      <Sidebar section={section} onNavigate={setSection} />

      <main className="flex-1 px-10 py-8">
        {section === 'tickets' && <TicketsPage />}
        {section === 'assets' && <AssetsPage />}
      </main>
    </div>
  )
}

import React from 'react'
import Dashboard from './pages/Dashboard'
import LiveTail from './pages/LiveTail'

export default function App(){
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Domain Traffic Monitor</h1>
      </header>
      <main className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Dashboard />
          <LiveTail />
        </div>
        <aside className="col-span-1">
        </aside>
      </main>
    </div>
  )
}

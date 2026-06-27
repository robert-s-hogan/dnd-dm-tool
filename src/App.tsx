import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useStore } from './store/useStore'
import Nav from './components/Nav'
import Home from './pages/Home'
import Upload from './pages/Upload'
import Session from './pages/Session'
import Map from './pages/Map'

export default function App() {
  const { init, loading, error } = useStore()

  useEffect(() => {
    init()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-green-700 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-stone-500 text-sm">Connecting to database…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="bg-stone-800 border border-red-800 rounded-xl p-6 max-w-md text-center space-y-3">
          <p className="text-red-400 font-bold">Database connection failed</p>
          <p className="text-stone-400 text-sm">{error}</p>
          <p className="text-stone-500 text-xs">Check that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set correctly in .env.local</p>
          <button
            onClick={() => init()}
            className="px-4 py-2 bg-stone-700 hover:bg-stone-600 text-stone-200 text-sm rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-stone-950 flex flex-col">
        <Nav />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/session" element={<Session />} />
            <Route path="/map" element={<Map />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

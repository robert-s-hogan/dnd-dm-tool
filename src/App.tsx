import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Nav from './components/Nav'
import Home from './pages/Home'
import Upload from './pages/Upload'
import Session from './pages/Session'
import Map from './pages/Map'

export default function App() {
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

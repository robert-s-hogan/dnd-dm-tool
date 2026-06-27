import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home', exact: true },
  { to: '/upload', label: 'Characters' },
  { to: '/session', label: 'Session' },
  { to: '/map', label: 'Map', soon: true },
]

export default function Nav() {
  return (
    <nav className="bg-stone-900 border-b border-stone-700 px-6 py-3 flex items-center gap-6">
      <span className="text-olive-700 font-bold text-lg tracking-widest uppercase" style={{ color: '#7a9e3a' }}>
        DM Toolkit
      </span>
      <div className="flex gap-4 ml-4">
        {links.map((link) =>
          link.soon ? (
            <span
              key={link.to}
              className="text-stone-600 text-sm cursor-not-allowed flex items-center gap-1"
              title="Coming in Phase 3"
            >
              {link.label}
              <span className="text-xs bg-stone-800 text-stone-500 px-1.5 py-0.5 rounded">soon</span>
            </span>
          ) : (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.exact}
              className={({ isActive }) =>
                `text-sm transition-colors ${
                  isActive
                    ? 'text-green-400 font-semibold'
                    : 'text-stone-400 hover:text-stone-200'
                }`
              }
            >
              {link.label}
            </NavLink>
          )
        )}
      </div>
    </nav>
  )
}

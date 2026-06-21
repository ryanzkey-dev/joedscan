import { Menu, LogOut } from 'lucide-react'

export default function Topbar({ fullName, role, onMenuClick, onLogout }) {
  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 lg:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100 lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>

      <div className="ml-auto flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-800">{fullName}</p>
          <p className="text-xs capitalize text-gray-500">{role}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-orange-400 text-sm font-semibold text-white">
          {fullName?.charAt(0) || '?'}
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="hidden items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 sm:flex"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  )
}

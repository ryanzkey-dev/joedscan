import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  UserPlus,
  Users,
  Package,
  ClipboardList,
  LogOut,
  FileText,
  Send,
  Wrench,
  X,
} from 'lucide-react'

const ADMIN_MENU = [
  { label: 'Overview', to: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Subscribers', to: '/admin/subscribers', icon: Users },
  { label: 'Dispatch', to: '/admin/dispatch', icon: Send },
  { label: 'Repair', to: '/admin/repair', icon: Wrench },
  { label: 'Inventory / Materials', to: '/admin/inventory', icon: Package },
  { label: 'Add Technician', to: '/admin/add-technician', icon: UserPlus },
  { label: 'Transactions', to: '/admin/transactions', icon: ClipboardList },
]

const TECH_MENU = [
  { label: 'Dashboard', to: '/technician', icon: LayoutDashboard, end: true },
  { label: 'Form', to: '/technician/form', icon: FileText },
  { label: 'My Encoded Records', to: '/technician/records', icon: ClipboardList },
  { label: 'Assigned Job Orders', to: '/technician/assigned-job-orders', icon: Send },
  { label: 'Assigned Repairs', to: '/technician/assigned-repairs', icon: Wrench },
]

export default function Sidebar({ role, isOpen, onClose, onLogout }) {
  const menu = role === 'admin' ? ADMIN_MENU : TECH_MENU

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-lg transition-transform lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between bg-gradient-to-br from-red-600 via-orange-500 to-orange-400 px-5 py-5">
          <div>
            <p className="text-lg font-bold text-white">JOEDSCAN</p>
            <p className="text-xs text-white/80">
              {role === 'admin' ? 'Admin Panel' : 'Technician Panel'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-white lg:hidden"
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-3">
          {menu.map(({ label, to, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-orange-50 text-orange-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}

          <button
            type="button"
            onClick={onLogout}
            className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut size={18} />
            Logout
          </button>
        </nav>
      </aside>
    </>
  )
}

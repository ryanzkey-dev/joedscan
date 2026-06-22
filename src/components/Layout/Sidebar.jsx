import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  UserPlus,
  Database,
  Package,
  ClipboardList,
  LogOut,
  FileText,
  Send,
  Wrench,
  Plus,
  ArrowRightLeft,
  Boxes,
  ChevronDown,
  Calendar,
  X,
} from 'lucide-react'

const ADMIN_MENU = [
  { label: 'Overview', to: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Raw Data', to: '/admin/raw-data', icon: Database },
  { label: 'Dispatch', to: '/admin/dispatch', icon: Send },
  { label: 'Repair', to: '/admin/repair', icon: Wrench },
  {
    label: 'Materials',
    icon: Package,
    children: [
      { label: 'Add Materials', to: '/admin/materials/add', icon: Plus },
      { label: 'Send Materials', to: '/admin/materials/send', icon: Send },
      { label: 'Transfer Materials', to: '/admin/materials/transfer', icon: ArrowRightLeft },
      { label: 'Inventory', to: '/admin/materials/inventory', icon: Boxes },
    ],
  },
  { label: 'Attendance', to: '/admin/attendance', icon: Calendar },
  { label: 'Add Technician', to: '/admin/add-technician', icon: UserPlus },
  { label: 'Transactions', to: '/admin/transactions', icon: ClipboardList },
]

const TECH_MENU = [
  { label: 'Dashboard', to: '/technician', icon: LayoutDashboard, end: true },
  { label: 'Attendance', to: '/technician/attendance', icon: Calendar },
  { label: 'Form', to: '/technician/form', icon: FileText },
  { label: 'My Encoded Records', to: '/technician/records', icon: ClipboardList },
  { label: 'Assigned Job Orders', to: '/technician/assigned-job-orders', icon: Send },
  { label: 'Assigned Repairs', to: '/technician/assigned-repairs', icon: Wrench },
  {
    label: 'Material',
    icon: Package,
    children: [
      { label: 'My Stocks', to: '/technician/materials/my-stocks', icon: Boxes },
      { label: 'Transfer Materials', to: '/technician/materials/transfer', icon: ArrowRightLeft },
    ],
  },
]

function NavItem({ item, onClose }) {
  const location = useLocation()
  const hasActiveChild = item.children?.some((child) => location.pathname.startsWith(child.to))
  const [open, setOpen] = useState(Boolean(hasActiveChild))

  if (!item.children) {
    const Icon = item.icon
    return (
      <NavLink
        to={item.to}
        end={item.end}
        onClick={onClose}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
            isActive ? 'bg-orange-50 text-orange-700' : 'text-gray-600 hover:bg-gray-100'
          }`
        }
      >
        <Icon size={18} />
        {item.label}
      </NavLink>
    )
  }

  const GroupIcon = item.icon
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
          hasActiveChild ? 'text-orange-700' : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <GroupIcon size={18} />
        <span className="flex-1">{item.label}</span>
        <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-gray-100 pl-3">
          {item.children.map((child) => {
            const ChildIcon = child.icon
            return (
              <NavLink
                key={child.to}
                to={child.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive ? 'bg-orange-50 text-orange-700' : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                <ChildIcon size={16} />
                {child.label}
              </NavLink>
            )
          })}
        </div>
      )}
    </div>
  )
}

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
        className={`fixed inset-y-0 left-0 z-40 w-64 transform overflow-y-auto bg-white shadow-lg transition-transform lg:static lg:translate-x-0 ${
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
          {menu.map((item) => (
            <NavItem key={item.label} item={item} onClose={onClose} />
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

export default function StatCard({ label, value, icon: Icon, accent = false }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        {Icon && (
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${
              accent
                ? 'bg-gradient-to-br from-red-600 to-orange-400 text-white'
                : 'bg-orange-50 text-orange-600'
            }`}
          >
            <Icon size={18} />
          </div>
        )}
      </div>
      <p className="mt-2 text-2xl font-bold text-gray-800">{value}</p>
    </div>
  )
}

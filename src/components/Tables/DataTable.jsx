import { useState } from 'react'
import Pagination from './Pagination'

export default function DataTable({ columns, rows, pageSize = 10 }) {
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
  const start = (page - 1) * pageSize
  const visibleRows = rows.slice(start, start + pageSize)

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm">
      {/* Mobile / small screens: stacked cards */}
      <div className="divide-y divide-gray-100 sm:hidden">
        {visibleRows.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-gray-400">No records found.</p>
        ) : (
          visibleRows.map((row, rowIndex) => (
            <div key={row.id || rowIndex} className="space-y-1.5 p-4">
              {columns.map((col) => (
                <div key={col.key} className="flex items-start justify-between gap-3 text-sm">
                  <span className="shrink-0 pt-0.5 text-xs font-medium uppercase text-gray-400">
                    {col.label}
                  </span>
                  <span className="text-right text-gray-700">
                    {col.render ? col.render(row) : row[col.key]}
                  </span>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Larger screens: full table */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full min-w-max text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="whitespace-nowrap px-4 py-3 font-semibold">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {visibleRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-400">
                  No records found.
                </td>
              </tr>
            ) : (
              visibleRows.map((row, rowIndex) => (
                <tr key={row.id || rowIndex} className="hover:bg-gray-50">
                  {columns.map((col) => (
                    <td key={col.key} className="whitespace-nowrap px-4 py-3 text-gray-700">
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={(p) => setPage(Math.min(Math.max(1, p), totalPages))}
      />
    </div>
  )
}

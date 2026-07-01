import { useEffect, useMemo, useState } from 'react'
import { Search, AlertCircle, CheckCircle2, Plus } from 'lucide-react'
import LoadingData from '../../../components/Loading/LoadingData'
import { apiRequest } from '../../../utils/sheetsApi'

const uploadedGeotaggingOptions = [
  'DONE UPLOAD',
  'PENDING',
  'REUSE',
  'VOICE & DATA ONLY',
  'MODIFY',
  'DATA ONLY',
  'DONE EMAIL',
  'NO IPTV S.O',
  'DONE UPLOAD GEOTAGGING',
  'NOT UPLOAD GEOTAGGING',
]

function getUploadedGeotaggingColor(status = '') {
  const value = String(status).trim().toUpperCase()
  const colors = {
    'DONE UPLOAD': 'bg-green-100 text-green-700 border-green-300',
    'PENDING': 'bg-yellow-100 text-yellow-700 border-yellow-300',
    'REUSE': 'bg-blue-100 text-blue-700 border-blue-300',
    'VOICE & DATA ONLY': 'bg-purple-100 text-purple-700 border-purple-300',
    'MODIFY': 'bg-orange-100 text-orange-700 border-orange-300',
    'DATA ONLY': 'bg-cyan-100 text-cyan-700 border-cyan-300',
    'DONE EMAIL': 'bg-emerald-100 text-emerald-700 border-emerald-300',
    'NO IPTV S.O': 'bg-gray-100 text-gray-700 border-gray-300',
    'DONE UPLOAD GEOTAGGING': 'bg-teal-100 text-teal-700 border-teal-300',
    'NOT UPLOAD GEOTAGGING': 'bg-red-100 text-red-700 border-red-300',
  }
  return colors[value] || 'bg-white text-gray-700 border-gray-300'
}

const installRawDataColumns = [
  { key: 'uploadedGeotagging', label: 'UPLOADED GEOTAGGING' },
  { key: 'tms', label: 'TMS' },
  { key: 'ofsc', label: 'OFSC' },
  { key: 'remarks2', label: 'REMARKS 2' },
  { key: 'remarks3', label: 'REMARKS 3' },
  { key: 'month', label: 'MONTH' },
  { key: 'date', label: 'DATE' },
  { key: 'techNames', label: 'TECH NAMES' },
  { key: 'soType', label: 'SO TYPE' },
  { key: 'projectId', label: 'PROJECT ID' },
  { key: 'soVoice', label: 'SO VOICE' },
  { key: 'soData', label: 'SO DATA' },
  { key: 'soIptv', label: 'SO IPTV' },
  { key: 'subscriber', label: 'SUBSCRIBER' },
  { key: 'address', label: 'ADDRESS' },
  { key: 'cbr', label: 'CBR' },
  { key: 'tel', label: 'TEL' },
  { key: 'exchanged', label: 'EXCHANGED' },
  { key: 'cpeStatus', label: 'CPE STATUS' },
  { key: 'focPrefabSerial', label: 'FOC PREFAB SERIAL' },
  { key: 'modem', label: 'MODEM' },
  { key: 'telset', label: 'TELSET' },
  { key: 'iptvCcaNo', label: 'IPTV CCA NO' },
  { key: 'cafac', label: 'CAFAC' },
  { key: 'mhb', label: 'MHB' },
  { key: 'ioo', label: 'IOO' },
  { key: 'patch', label: 'PATCH' },
  { key: 'ojb', label: 'OJB' },
  { key: 'cableTie', label: 'CABLE TIE' },
  { key: 'fclip', label: 'FCLIP' },
  { key: 'fclamp', label: 'FCLAMP' },
  { key: 'fic', label: 'FIC' },
  { key: 'span', label: 'SPAN' },
  { key: 'meterStart', label: 'METER START' },
  { key: 'meterEnd', label: 'METER END' },
  { key: 'meterConsume', label: 'METER CONSUME' },
  { key: 'focType', label: 'FOC TYPE' },
]

const columnKeys = installRawDataColumns.map((col) => col.key)

const wideColumns = ['subscriber', 'address', 'remarks2', 'remarks3', 'uploadedGeotagging']

const DEFAULT_ROW_COUNT = 3

function createEmptyInstallRawDataRow() {
  return {
    _rowNumber: '',
    uploadedGeotagging: '',
    tms: '',
    ofsc: '',
    remarks2: '',
    remarks3: '',
    month: '',
    date: '',
    techNames: '',
    soType: '',
    projectId: '',
    soVoice: '',
    soData: '',
    soIptv: '',
    subscriber: '',
    address: '',
    cbr: '',
    tel: '',
    exchanged: '',
    cpeStatus: '',
    focPrefabSerial: '',
    modem: '',
    telset: '',
    iptvCcaNo: '',
    cafac: '',
    mhb: '',
    ioo: '',
    patch: '',
    ojb: '',
    cableTie: '',
    fclip: '',
    fclamp: '',
    fic: '',
    span: '',
    meterStart: '',
    meterEnd: '',
    meterConsume: '',
    focType: '',
  }
}

export default function RawDataInstall() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [search, setSearch] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await apiRequest('getInstallRawData')
      const fetched = res.rows || []
      setRows(fetched.length > 0 ? fetched : Array.from({ length: DEFAULT_ROW_COUNT }, createEmptyInstallRawDataRow))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const flashSuccess = () => {
    setSuccess('Raw data updated successfully.')
    setTimeout(() => setSuccess(''), 2500)
  }

  const updateCell = (rowIndex, key, value) => {
    setRows((prev) => {
      const updated = [...prev]
      updated[rowIndex] = { ...updated[rowIndex], [key]: value }
      return updated
    })
  }

  const saveRow = async (rowIndex) => {
    const row = rows[rowIndex]
    if (!row) return
    setError('')
    try {
      if (row._rowNumber) {
        await apiRequest('updateInstallRawDataRow', { rowNumber: row._rowNumber, row })
      } else {
        const res = await apiRequest('addInstallRawDataRows', { rows: [row] })
        const newRowNumber = res.rowNumbers?.[0]
        if (newRowNumber) {
          setRows((prev) => {
            const updated = [...prev]
            updated[rowIndex] = { ...updated[rowIndex], _rowNumber: newRowNumber }
            return updated
          })
        }
      }
      flashSuccess()
    } catch (err) {
      setError(err.message)
    }
  }

  const saveCell = async (rowNumber, field, value) => {
    if (!rowNumber) return
    setError('')
    try {
      await apiRequest('updateInstallRawDataCell', { rowNumber, field, value })
      flashSuccess()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleAddRow = async () => {
    setError('')
    try {
      await apiRequest('addInstallRawDataRowAtTop', { row: createEmptyInstallRawDataRow() })
      flashSuccess()
      // Reload so all _rowNumber values reflect the shift caused by the insert
      const res = await apiRequest('getInstallRawData')
      const fetched = res.rows || []
      setRows(fetched.length > 0 ? fetched : Array.from({ length: DEFAULT_ROW_COUNT }, createEmptyInstallRawDataRow))
    } catch (err) {
      setError(err.message)
    }
  }

  const persistPastedRows = async (allRows, startIdx, endIdx) => {
    const affected = allRows.slice(startIdx, endIdx + 1)
    const existing = affected.filter((r) => r._rowNumber)
    const fresh = affected.filter((r) => !r._rowNumber)

    setError('')
    try {
      if (existing.length > 0) {
        await apiRequest('bulkUpdateInstallRawData', { rows: existing })
      }
      if (fresh.length > 0) {
        const res = await apiRequest('addInstallRawDataRows', { rows: fresh })
        if (res.rowNumbers) {
          setRows((prev) => {
            const updated = [...prev]
            let freshIdx = 0
            for (let i = startIdx; i <= endIdx; i++) {
              if (!updated[i]._rowNumber) {
                updated[i] = { ...updated[i], _rowNumber: res.rowNumbers[freshIdx] }
                freshIdx++
              }
            }
            return updated
          })
        }
      }
      flashSuccess()
    } catch (err) {
      setError(err.message)
    }
  }

  const handlePaste = (e, startRowIndex, startColumnKey) => {
    e.preventDefault()

    const pastedText = e.clipboardData.getData('text')
    const pastedRows = pastedText
      .replace(/\r/g, '')
      .split('\n')
      .filter((row, idx, arr) => !(idx === arr.length - 1 && row === ''))
      .map((row) => row.split('\t'))

    const startColumnIndex = columnKeys.indexOf(startColumnKey)
    if (startColumnIndex === -1) return

    const updatedRows = [...rows]
    pastedRows.forEach((rowData, rowOffset) => {
      const targetRowIndex = startRowIndex + rowOffset
      while (updatedRows.length <= targetRowIndex) {
        updatedRows.push(createEmptyInstallRawDataRow())
      }
      rowData.forEach((cellValue, colOffset) => {
        const targetColumnKey = columnKeys[startColumnIndex + colOffset]
        if (targetColumnKey) {
          updatedRows[targetRowIndex] = { ...updatedRows[targetRowIndex], [targetColumnKey]: cellValue.trim() }
        }
      })
    })

    setRows(updatedRows)
    persistPastedRows(updatedRows, startRowIndex, startRowIndex + pastedRows.length - 1)
  }

  const filteredIndices = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return rows.map((_, idx) => idx)
    return rows
      .map((row, idx) => ({ row, idx }))
      .filter(({ row }) => columnKeys.some((key) => String(row[key] || '').toLowerCase().includes(term)))
      .map(({ idx }) => idx)
  }, [rows, search])

  return (
    <div className="w-full max-w-full space-y-6 overflow-hidden">
      <h1 className="text-xl font-bold text-gray-800">Raw Data — Install</h1>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          <CheckCircle2 size={18} />
          {success}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search across all columns"
            className="w-full rounded-xl border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          />
        </div>
        <button
          type="button"
          onClick={handleAddRow}
          className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Plus size={14} />+ Add Row
        </button>
      </div>

      {loading ? (
        <LoadingData />
      ) : (
        <div className="w-full max-w-full overflow-hidden">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="max-h-[650px] overflow-auto">
              <table className="w-full min-w-[4200px] border-collapse text-sm">
                <thead className="sticky top-0 z-20 bg-gray-50">
                  <tr>
                    <th className="border border-gray-200 whitespace-nowrap px-3 py-3 text-center text-xs font-bold uppercase text-gray-600">
                      #
                    </th>
                    {installRawDataColumns.map((col) => (
                      <th
                        key={col.key}
                        className="border border-gray-200 whitespace-nowrap px-3 py-3 text-left text-xs font-bold uppercase text-gray-600"
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredIndices.map((rowIndex) => {
                    const row = rows[rowIndex]
                    return (
                      <tr
                        key={row._rowNumber || `new-${rowIndex}`}
                        className="hover:bg-orange-50/30"
                      >
                        <td className="border border-gray-100 px-3 py-1 text-center text-xs text-gray-400 align-middle bg-white">
                          {rowIndex + 1}
                        </td>
                        {installRawDataColumns.map((col) => (
                          <td key={col.key} className="border border-gray-100 p-0 align-middle bg-white">
                            {col.key === 'uploadedGeotagging' ? (
                              <select
                                value={row.uploadedGeotagging || ''}
                                onChange={(e) => {
                                  const val = e.target.value
                                  updateCell(rowIndex, 'uploadedGeotagging', val)
                                  if (row._rowNumber) saveCell(row._rowNumber, 'uploadedGeotagging', val)
                                }}
                                className={`w-full min-w-[220px] border-0 px-2 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-inset focus:ring-orange-400 ${getUploadedGeotaggingColor(row.uploadedGeotagging)}`}
                              >
                                <option value="">SELECT STATUS</option>
                                {uploadedGeotaggingOptions.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                value={row[col.key] || ''}
                                onChange={(e) => updateCell(rowIndex, col.key, e.target.value)}
                                onBlur={() => saveRow(rowIndex)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') e.target.blur()
                                }}
                                onPaste={(e) => handlePaste(e, rowIndex, col.key)}
                                className={`w-full ${
                                  wideColumns.includes(col.key) ? 'min-w-[220px]' : 'min-w-[130px]'
                                } bg-transparent border-0 outline-none px-2 py-1.5 text-sm focus:ring-2 focus:ring-inset focus:ring-orange-400`}
                              />
                            )}
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

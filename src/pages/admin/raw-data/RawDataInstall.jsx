import { useEffect, useMemo, useState } from 'react'
import { Search, AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react'
import LoadingData from '../../../components/Loading/LoadingData'
import { apiRequest } from '../../../utils/sheetsApi'

const COLUMN_WIDTH_STORAGE_KEY = 'xq_raw_data_install_column_widths'

const tmsStatusOptions = [
  'CLOSED',
  'RPR',
  'UNATTENDED',
  'NOT ON TMS',
  'BK INSTALL',
  'FOR CLOSING TMS',
  'CLOSED IPTV TMS',
  'PENDING IPTV',
  'AREA NOT MATCH',
  'FOR RE-OPEN SO',
  'FOR CHECKING CPE ON TMS',
  'WRONG AERIAL TYPE',
  'PENDING TELSET',
  'PENDING BEYOND FIBER ONU',
  'FOR CHANGE MODEM',
  'FOR CLOSING RELOC',
  'DONE SURVEY',
  'IPTV DUPLICATE',
  'FOR MANUAL LUNOD',
]

function getTmsStatusColor(status = '') {
  const value = String(status).trim().toUpperCase()
  const colors = {
    'CLOSED': 'bg-red-100 text-red-700',
    'RPR': 'bg-red-700 text-white',
    'UNATTENDED': 'bg-gray-700 text-white',
    'NOT ON TMS': 'bg-teal-300 text-gray-900',
    'BK INSTALL': 'bg-blue-600 text-white',
    'FOR CLOSING TMS': 'bg-purple-700 text-white',
    'CLOSED IPTV TMS': 'bg-pink-500 text-white',
    'PENDING IPTV': 'bg-yellow-300 text-gray-900',
    'AREA NOT MATCH': 'bg-blue-700 text-white',
    'FOR RE-OPEN SO': 'bg-blue-700 text-white',
    'FOR CHECKING CPE ON TMS': 'bg-purple-200 text-purple-800',
    'WRONG AERIAL TYPE': 'bg-fuchsia-700 text-black',
    'PENDING TELSET': 'bg-blue-500 text-black',
    'PENDING BEYOND FIBER ONU': 'bg-yellow-900 text-yellow-100',
    'FOR CHANGE MODEM': 'bg-cyan-900 text-cyan-100',
    'FOR CLOSING RELOC': 'bg-blue-700 text-white',
    'DONE SURVEY': 'bg-green-700 text-white',
    'IPTV DUPLICATE': 'bg-yellow-200 text-yellow-900',
    'FOR MANUAL LUNOD': 'bg-sky-200 text-blue-800',
  }
  return colors[value] || 'bg-white text-gray-700'
}

const remarks2StatusOptions = [
  'ACTIVATED',
  'NOT YET ACTIVATED',
  'RPR/CALL THRU',
  'UNATTENDED',
  'ALREADY INSTALL',
  'ASSIGN ANOTHER BP',
  'COMPLETED',
  'ONGOING',
  'FOR ACTIVATION',
  'SURVEY/VISITED',
  'NO FIBER FACILITIES',
  'ENTERPRISE',
  'INSTALLABLE',
  'SUBS CANCEL REQUEST',
  'RESCHEDULE',
  'CBR PROBLEM',
  'FOR REVISIT',
  'CPP/NPA',
  'FULL NAP',
  'NO FTTX',
  'NO END BUTTON',
  'MCT',
  'DEAP NAP',
  'WRONG ADDRESS',
  'PENDING IPTV',
  'HIGH READING',
  'NO POLE TO ATTACH',
  'UNDECIDED',
  'FOR NCU',
  'NAP NOT YET BROACASTED',
  'CRITICAL AREA',
  'DEAD NAP',
  'DOUBLE APPLICATION',
  'OVERSPANNING',
  'HOUSE CLOSED',
  'HIGH LOS',
  'RPR/VISITED SURVEY',
  'CROSSING PRIVATE PROPERTY',
  'NOT INTERESTED',
  'AWAITING PROJECT COMP',
  'NOT YET BROADCASTED',
  'CHANGE PLAN',
  'FOR CX HANDLING',
  'RELOCATION',
  'FOR OPSIM',
  'NO PLDT FACILITIES',
  'NEED PERMIT',
  'BAD WEATHER',
  'CANCEL AND RECREATE',
  'VEHICLE PROBLEM',
  'CONDUIT PROBLEM',
  'WAITING WORKING PERMIT',
  'DAMAGED CAR',
  'FOR CONT.TAUD UGMA',
  'NO FOC',
  'NO MATERIALS',
  'DO NOT TRIGGER',
  'ACTIVATION FAILED',
  'FOR RECONFIG',
  'OLT DOWN',
  'LATLONG ISSUE',
  'DONE INSTALL',
  'HOUSE UNDER CONS',
  'CANT VIEW IN ORACLE',
  'SUBS N/A',
  'RPR-AFD',
  'FOR REIMP',
  'CANCELLED SO',
  'FOR CREATION',
  'NOT YET IN SERVICE',
  'P2P',
  'UNO OFFLINE',
  'TECH VEHICLE BREAKDOWN',
  'Activation Failure ❌',
  'Circuit Redesign Requested ⏳',
  'VIEW IN ORACLE',
  'KENAN COMPLETED',
  'WAITING BEYOND FIBER ONU',
  'NO ELECTRICITY',
  'FOR CANCEL RECREATE',
  'WAITING MATERIALS',
  'NO MODEM',
  'Activation Requested ⏳',
  'Circuit Redesign Requested Error',
  'THUMBS DOWN',
  'ONU OFFLINE',
]

function getRemarks2StatusColor(status = '') {
  const value = String(status).trim().toUpperCase()
  const colors = {
    'ACTIVATED': 'bg-green-100 text-green-800',
    'NOT YET ACTIVATED': 'bg-yellow-100 text-yellow-800',
    'RPR/CALL THRU': 'bg-orange-100 text-orange-800',
    'UNATTENDED': 'bg-gray-700 text-white',
    'ALREADY INSTALL': 'bg-green-100 text-green-800',
    'ASSIGN ANOTHER BP': 'bg-purple-100 text-purple-800',
    'COMPLETED': 'bg-green-100 text-green-800',
    'ONGOING': 'bg-blue-100 text-blue-800',
    'FOR ACTIVATION': 'bg-sky-100 text-sky-800',
    'SURVEY/VISITED': 'bg-indigo-100 text-indigo-800',
    'NO FIBER FACILITIES': 'bg-red-100 text-red-800',
    'ENTERPRISE': 'bg-violet-100 text-violet-800',
    'INSTALLABLE': 'bg-emerald-100 text-emerald-800',
    'SUBS CANCEL REQUEST': 'bg-red-100 text-red-800',
    'RESCHEDULE': 'bg-yellow-100 text-yellow-800',
    'CBR PROBLEM': 'bg-red-100 text-red-800',
    'FOR REVISIT': 'bg-orange-100 text-orange-800',
    'CPP/NPA': 'bg-red-100 text-red-800',
    'FULL NAP': 'bg-red-100 text-red-800',
    'NO FTTX': 'bg-red-100 text-red-800',
    'NO END BUTTON': 'bg-red-100 text-red-800',
    'MCT': 'bg-slate-100 text-slate-800',
    'DEAP NAP': 'bg-orange-100 text-orange-800',
    'WRONG ADDRESS': 'bg-red-100 text-red-800',
    'PENDING IPTV': 'bg-yellow-100 text-yellow-800',
    'HIGH READING': 'bg-red-100 text-red-800',
    'NO POLE TO ATTACH': 'bg-red-100 text-red-800',
    'UNDECIDED': 'bg-gray-100 text-gray-800',
    'FOR NCU': 'bg-blue-100 text-blue-800',
    'NAP NOT YET BROACASTED': 'bg-yellow-100 text-yellow-800',
    'CRITICAL AREA': 'bg-red-100 text-red-800',
    'DEAD NAP': 'bg-red-100 text-red-800',
    'DOUBLE APPLICATION': 'bg-orange-100 text-orange-800',
    'OVERSPANNING': 'bg-red-100 text-red-800',
    'HOUSE CLOSED': 'bg-gray-100 text-gray-800',
    'HIGH LOS': 'bg-red-100 text-red-800',
    'RPR/VISITED SURVEY': 'bg-orange-100 text-orange-800',
    'CROSSING PRIVATE PROPERTY': 'bg-red-100 text-red-800',
    'NOT INTERESTED': 'bg-gray-100 text-gray-800',
    'AWAITING PROJECT COMP': 'bg-purple-100 text-purple-800',
    'NOT YET BROADCASTED': 'bg-yellow-100 text-yellow-800',
    'CHANGE PLAN': 'bg-blue-100 text-blue-800',
    'FOR CX HANDLING': 'bg-orange-100 text-orange-800',
    'RELOCATION': 'bg-indigo-100 text-indigo-800',
    'FOR OPSIM': 'bg-sky-100 text-sky-800',
    'NO PLDT FACILITIES': 'bg-red-100 text-red-800',
    'NEED PERMIT': 'bg-yellow-100 text-yellow-800',
    'BAD WEATHER': 'bg-blue-100 text-blue-800',
    'CANCEL AND RECREATE': 'bg-red-100 text-red-800',
    'VEHICLE PROBLEM': 'bg-red-100 text-red-800',
    'CONDUIT PROBLEM': 'bg-orange-100 text-orange-800',
    'WAITING WORKING PERMIT': 'bg-yellow-100 text-yellow-800',
    'DAMAGED CAR': 'bg-red-100 text-red-800',
    'FOR CONT.TAUD UGMA': 'bg-orange-100 text-orange-800',
    'NO FOC': 'bg-red-100 text-red-800',
    'NO MATERIALS': 'bg-red-100 text-red-800',
    'DO NOT TRIGGER': 'bg-gray-200 text-gray-900',
    'ACTIVATION FAILED': 'bg-red-100 text-red-800',
    'FOR RECONFIG': 'bg-blue-100 text-blue-800',
    'OLT DOWN': 'bg-red-100 text-red-800',
    'LATLONG ISSUE': 'bg-orange-100 text-orange-800',
    'DONE INSTALL': 'bg-green-100 text-green-800',
    'HOUSE UNDER CONS': 'bg-yellow-100 text-yellow-800',
    'CANT VIEW IN ORACLE': 'bg-red-100 text-red-800',
    'SUBS N/A': 'bg-gray-100 text-gray-800',
    'RPR-AFD': 'bg-orange-100 text-orange-800',
    'FOR REIMP': 'bg-orange-100 text-orange-800',
    'CANCELLED SO': 'bg-red-100 text-red-800',
    'FOR CREATION': 'bg-blue-100 text-blue-800',
    'NOT YET IN SERVICE': 'bg-yellow-100 text-yellow-800',
    'P2P': 'bg-indigo-100 text-indigo-800',
    'UNO OFFLINE': 'bg-red-100 text-red-800',
    'TECH VEHICLE BREAKDOWN': 'bg-red-100 text-red-800',
    'ACTIVATION FAILURE ❌': 'bg-red-100 text-red-800',
    'CIRCUIT REDESIGN REQUESTED ⏳': 'bg-yellow-100 text-yellow-800',
    'VIEW IN ORACLE': 'bg-blue-100 text-blue-800',
    'KENAN COMPLETED': 'bg-green-100 text-green-800',
    'WAITING BEYOND FIBER ONU': 'bg-yellow-100 text-yellow-800',
    'NO ELECTRICITY': 'bg-red-100 text-red-800',
    'FOR CANCEL RECREATE': 'bg-red-100 text-red-800',
    'WAITING MATERIALS': 'bg-yellow-100 text-yellow-800',
    'NO MODEM': 'bg-red-100 text-red-800',
    'ACTIVATION REQUESTED ⏳': 'bg-blue-100 text-blue-800',
    'CIRCUIT REDESIGN REQUESTED ERROR': 'bg-red-100 text-red-800',
    'THUMBS DOWN': 'bg-red-100 text-red-800',
    'ONU OFFLINE': 'bg-red-100 text-red-800',
  }
  return colors[value] || 'bg-white text-gray-700'
}

const focTypeOptions = ['PREFAB', 'REGULARFOC', 'REUSE']

function getFocTypeColor(status = '') {
  const value = String(status).trim().toUpperCase()
  const colors = {
    'PREFAB': 'bg-gray-100 text-gray-800',
    'REGULARFOC': 'bg-blue-100 text-blue-800',
    'REUSE': 'bg-green-100 text-green-800',
  }
  return colors[value] || 'bg-white text-gray-700'
}

const ofscStatusOptions = [
  'CLOSED IN ORACLE',
  'NO END BUTTON',
  'ACTIVATION REQUESTED',
  'NOT DONE',
  'HANDLED BY OTHER BP',
  'DONE BOOKED',
  'UNATTENDED',
  'ON GOING INSTALL',
  'SURVEY INSTALLABLE',
  'SURVEY RPR',
  'BK INSTALLED',
  'SME/CBG INSTALLED',
  'DONE BK INSTALL',
  'CLOSE WITH IPTV PENDING',
  'BK INSTALLED W/ IPTV',
  'FOR SURVEY',
  'DUPLICATE',
  'SURVEY UNATTENDED',
  'FOR CLOSING',
  'ON GOING/TRACKROLL',
  'RESCHED W/ IN THE DAY',
  'WAITING MATERIALS',
  'AWAITING PROJECT COMP',
  'WITHDRAW MATERIALS',
  'ON GOING/TOK WITH SUBS',
  'HANDLE BY FH',
  'FOR REIMP',
  'ACTIVATED ON ACTUAL',
  'FOR CLOSING ORACLE(ORACLE ERROR)',
  'FOR PULL OUT',
  'DONE PULL OUT',
  'FOR CLOSING ORACLE (ACTIVATED ON ACTUAL)',
]

function getOfscStatusColor(status = '') {
  const value = String(status).trim().toUpperCase()
  const colors = {
    'CLOSED IN ORACLE': 'bg-gray-200 text-gray-900',
    'NO END BUTTON': 'bg-red-100 text-red-700',
    'ACTIVATION REQUESTED': 'bg-blue-100 text-blue-800',
    'NOT DONE': 'bg-red-100 text-red-800',
    'HANDLED BY OTHER BP': 'bg-gray-100 text-gray-900',
    'DONE BOOKED': 'bg-green-100 text-green-800',
    'UNATTENDED': 'bg-gray-700 text-white',
    'ON GOING INSTALL': 'bg-blue-100 text-blue-800',
    'SURVEY INSTALLABLE': 'bg-emerald-100 text-emerald-800',
    'SURVEY RPR': 'bg-orange-100 text-orange-800',
    'BK INSTALLED': 'bg-green-100 text-green-800',
    'SME/CBG INSTALLED': 'bg-green-100 text-green-800',
    'DONE BK INSTALL': 'bg-yellow-300 text-yellow-900',
    'CLOSE WITH IPTV PENDING': 'bg-purple-100 text-purple-800',
    'BK INSTALLED W/ IPTV': 'bg-green-100 text-green-800',
    'FOR SURVEY': 'bg-sky-100 text-sky-800',
    'DUPLICATE': 'bg-gray-100 text-gray-800',
    'SURVEY UNATTENDED': 'bg-orange-100 text-orange-800',
    'FOR CLOSING': 'bg-indigo-100 text-indigo-800',
    'ON GOING/TRACKROLL': 'bg-blue-100 text-blue-800',
    'RESCHED W/ IN THE DAY': 'bg-yellow-100 text-yellow-800',
    'WAITING MATERIALS': 'bg-amber-100 text-amber-800',
    'AWAITING PROJECT COMP': 'bg-purple-100 text-purple-800',
    'WITHDRAW MATERIALS': 'bg-red-100 text-red-800',
    'ON GOING/TOK WITH SUBS': 'bg-purple-200 text-purple-900',
    'HANDLE BY FH': 'bg-slate-100 text-slate-800',
    'FOR REIMP': 'bg-orange-100 text-orange-800',
    'ACTIVATED ON ACTUAL': 'bg-green-100 text-green-800',
    'FOR CLOSING ORACLE(ORACLE ERROR)': 'bg-red-100 text-red-800',
    'FOR PULL OUT': 'bg-red-100 text-red-800',
    'DONE PULL OUT': 'bg-green-100 text-green-800',
    'FOR CLOSING ORACLE (ACTIVATED ON ACTUAL)': 'bg-emerald-100 text-emerald-800',
  }
  return colors[value] || 'bg-white text-gray-700'
}

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
    'DONE UPLOAD': 'bg-green-100 text-green-700',
    'PENDING': 'bg-yellow-100 text-yellow-700',
    'REUSE': 'bg-blue-100 text-blue-700',
    'VOICE & DATA ONLY': 'bg-purple-100 text-purple-700',
    'MODIFY': 'bg-orange-100 text-orange-700',
    'DATA ONLY': 'bg-cyan-100 text-cyan-700',
    'DONE EMAIL': 'bg-emerald-100 text-emerald-700',
    'NO IPTV S.O': 'bg-gray-100 text-gray-700',
    'DONE UPLOAD GEOTAGGING': 'bg-teal-100 text-teal-700',
    'NOT UPLOAD GEOTAGGING': 'bg-red-100 text-red-700',
  }
  return colors[value] || 'bg-white text-gray-700'
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

const defaultColumnWidths = {
  uploadedGeotagging: 240,
  tms: 130,
  ofsc: 130,
  remarks2: 220,
  remarks3: 220,
  month: 120,
  date: 150,
  techNames: 180,
  soType: 140,
  projectId: 160,
  soVoice: 130,
  soData: 130,
  soIptv: 130,
  subscriber: 240,
  address: 300,
  cbr: 130,
  tel: 130,
  exchanged: 150,
  cpeStatus: 160,
  focPrefabSerial: 220,
  modem: 170,
  telset: 160,
  iptvCcaNo: 180,
  cafac: 130,
  mhb: 130,
  ioo: 130,
  patch: 130,
  ojb: 130,
  cableTie: 150,
  fclip: 130,
  fclamp: 140,
  fic: 130,
  span: 130,
  meterStart: 160,
  meterEnd: 160,
  meterConsume: 180,
  focType: 150,
}

const ROW_NUM_COL_WIDTH = 46

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
  const [addingRow, setAddingRow] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [search, setSearch] = useState('')

  const [columnWidths, setColumnWidths] = useState(() => {
    try {
      const saved = localStorage.getItem(COLUMN_WIDTH_STORAGE_KEY)
      return saved ? { ...defaultColumnWidths, ...JSON.parse(saved) } : defaultColumnWidths
    } catch {
      return defaultColumnWidths
    }
  })

  const totalTableWidth = useMemo(
    () =>
      installRawDataColumns.reduce((sum, col) => sum + (columnWidths[col.key] || 140), 0) +
      ROW_NUM_COL_WIDTH,
    [columnWidths]
  )

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    localStorage.setItem(COLUMN_WIDTH_STORAGE_KEY, JSON.stringify(columnWidths))
  }, [columnWidths])

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await apiRequest('getInstallRawData')
      const fetched = res.rows || []
      setRows(
        fetched.length > 0
          ? fetched
          : Array.from({ length: DEFAULT_ROW_COUNT }, createEmptyInstallRawDataRow)
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

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

  const handleAddRowAtTop = async () => {
    setAddingRow(true)
    setError('')
    try {
      await apiRequest('addInstallRawDataRowAtTop', { row: createEmptyInstallRawDataRow() })
      // Reload so every _rowNumber reflects the shift caused by insertRowAfter(1)
      const res = await apiRequest('getInstallRawData')
      const fetched = res.rows || []
      setRows(
        fetched.length > 0
          ? fetched
          : Array.from({ length: DEFAULT_ROW_COUNT }, createEmptyInstallRawDataRow)
      )
      flashSuccess()
    } catch (err) {
      setError(err.message)
    } finally {
      setAddingRow(false)
    }
  }

  const handleColumnResizeStart = (e, columnKey) => {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const startWidth = columnWidths[columnKey] || 140

    function onMove(moveEvent) {
      const newWidth = Math.max(90, startWidth + (moveEvent.clientX - startX))
      setColumnWidths((prev) => ({ ...prev, [columnKey]: newWidth }))
    }

    function onUp() {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
    }

    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup', onUp)
  }

  const resetColumnWidths = () => {
    setColumnWidths(defaultColumnWidths)
    localStorage.removeItem(COLUMN_WIDTH_STORAGE_KEY)
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
          updatedRows[targetRowIndex] = {
            ...updatedRows[targetRowIndex],
            [targetColumnKey]: cellValue.trim(),
          }
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
      .filter(({ row }) =>
        columnKeys.some((key) => String(row[key] || '').toLowerCase().includes(term))
      )
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
          onClick={handleAddRowAtTop}
          disabled={addingRow}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow hover:opacity-90 disabled:opacity-60"
        >
          {addingRow ? (
            <>
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Adding…
            </>
          ) : (
            '+ ADD ROW'
          )}
        </button>

        <button
          type="button"
          onClick={resetColumnWidths}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          <RotateCcw size={14} />
          Reset Columns
        </button>
      </div>

      {loading ? (
        <LoadingData />
      ) : (
        <div className="w-full max-w-full overflow-hidden">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="max-h-[650px] overflow-auto">
              <table
                className="border-collapse table-fixed text-sm"
                style={{ width: totalTableWidth, minWidth: totalTableWidth }}
              >
                <thead className="sticky top-0 z-20 bg-gray-50">
                  <tr>
                    <th
                      style={{ width: ROW_NUM_COL_WIDTH, minWidth: ROW_NUM_COL_WIDTH }}
                      className="border border-gray-200 px-2 py-3 text-center text-xs font-bold uppercase text-gray-600"
                    >
                      #
                    </th>
                    {installRawDataColumns.map((col) => {
                      const w = columnWidths[col.key] || 140
                      return (
                        <th
                          key={col.key}
                          style={{ width: w, minWidth: w }}
                          className="relative border border-gray-200 px-3 py-3 text-left text-xs font-bold uppercase text-gray-600"
                        >
                          <span className="block truncate pr-3">{col.label}</span>
                          {/* Drag handle — pointer events only, does not interfere with text */}
                          <div
                            onPointerDown={(e) => handleColumnResizeStart(e, col.key)}
                            className="absolute right-0 top-0 h-full w-2 cursor-col-resize select-none hover:bg-orange-400"
                          />
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  {filteredIndices.map((rowIndex) => {
                    const row = rows[rowIndex]
                    return (
                      <tr
                        key={row._rowNumber || `new-${rowIndex}`}
                        className="hover:bg-orange-50/40"
                      >
                        <td
                          style={{ width: ROW_NUM_COL_WIDTH, minWidth: ROW_NUM_COL_WIDTH }}
                          className="border border-gray-100 bg-white px-2 py-1 text-center text-xs text-gray-400 align-middle"
                        >
                          {rowIndex + 1}
                        </td>
                        {installRawDataColumns.map((col) => {
                          const w = columnWidths[col.key] || 140
                          return (
                            <td
                              key={col.key}
                              style={{ width: w, minWidth: w }}
                              className="border border-gray-100 bg-white p-0 align-middle"
                            >
                              {col.key === 'uploadedGeotagging' ? (
                                <select
                                  value={row.uploadedGeotagging || ''}
                                  onChange={(e) => {
                                    const val = e.target.value
                                    updateCell(rowIndex, 'uploadedGeotagging', val)
                                    if (row._rowNumber)
                                      saveCell(row._rowNumber, 'uploadedGeotagging', val)
                                  }}
                                  className={`w-full border-0 px-2 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-inset focus:ring-orange-400 ${getUploadedGeotaggingColor(row.uploadedGeotagging)}`}
                                >
                                  <option value="">SELECT STATUS</option>
                                  {uploadedGeotaggingOptions.map((option) => (
                                    <option key={option} value={option}>
                                      {option}
                                    </option>
                                  ))}
                                </select>
                              ) : col.key === 'remarks2' ? (
                                <select
                                  value={row.remarks2 || ''}
                                  onChange={(e) => {
                                    const val = e.target.value
                                    updateCell(rowIndex, 'remarks2', val)
                                    if (row._rowNumber) saveCell(row._rowNumber, 'remarks2', val)
                                  }}
                                  className={`w-full border-0 px-2 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-inset focus:ring-orange-400 ${getRemarks2StatusColor(row.remarks2)}`}
                                >
                                  <option value="">SELECT REMARKS 2 STATUS</option>
                                  {remarks2StatusOptions.map((option) => (
                                    <option key={option} value={option}>
                                      {option}
                                    </option>
                                  ))}
                                </select>
                              ) : col.key === 'ofsc' ? (
                                <select
                                  value={row.ofsc || ''}
                                  onChange={(e) => {
                                    const val = e.target.value
                                    updateCell(rowIndex, 'ofsc', val)
                                    if (row._rowNumber) saveCell(row._rowNumber, 'ofsc', val)
                                  }}
                                  className={`w-full border-0 px-2 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-inset focus:ring-orange-400 ${getOfscStatusColor(row.ofsc)}`}
                                >
                                  <option value="">SELECT OFSC STATUS</option>
                                  {ofscStatusOptions.map((option) => (
                                    <option key={option} value={option}>
                                      {option}
                                    </option>
                                  ))}
                                </select>
                              ) : col.key === 'tms' ? (
                                <select
                                  value={row.tms || ''}
                                  onChange={(e) => {
                                    const val = e.target.value
                                    updateCell(rowIndex, 'tms', val)
                                    if (row._rowNumber) saveCell(row._rowNumber, 'tms', val)
                                  }}
                                  className={`w-full border-0 px-2 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-inset focus:ring-orange-400 ${getTmsStatusColor(row.tms)}`}
                                >
                                  <option value="">SELECT TMS STATUS</option>
                                  {tmsStatusOptions.map((option) => (
                                    <option key={option} value={option}>
                                      {option}
                                    </option>
                                  ))}
                                </select>
                              ) : col.key === 'focType' ? (
                                <select
                                  value={row.focType || ''}
                                  onChange={(e) => {
                                    const val = e.target.value
                                    updateCell(rowIndex, 'focType', val)
                                    if (row._rowNumber) saveCell(row._rowNumber, 'focType', val)
                                  }}
                                  className={`w-full border-0 px-2 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-inset focus:ring-orange-400 ${getFocTypeColor(row.focType)}`}
                                >
                                  <option value="">SELECT FOC TYPE</option>
                                  {focTypeOptions.map((option) => (
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
                                  className="w-full border-0 bg-transparent px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-inset focus:ring-orange-400"
                                />
                              )}
                            </td>
                          )
                        })}
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

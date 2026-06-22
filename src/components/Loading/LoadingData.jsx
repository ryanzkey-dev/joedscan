import xqPortalLogo from '../../assets/xq-portal-logo.jpg'

export default function LoadingData({ text = 'Loading Data..' }) {
  return (
    <div className="flex min-h-[240px] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-orange-100 border-t-orange-600" />
          <img
            src={xqPortalLogo}
            alt="XQ Portal"
            className="h-8 w-8 rounded-full object-contain"
          />
        </div>

        <p className="text-sm font-semibold text-gray-600">{text}</p>
      </div>
    </div>
  )
}

export default function PhoneFrame({ children }) {
  return (
    <div className="min-h-screen bg-[#1A1A2E] flex items-center justify-center p-4 md:p-8">
      <div
        className="relative bg-pace-bg w-full max-w-[390px] rounded-[44px] overflow-hidden shadow-phone"
        style={{ height: 'min(844px, calc(100vh - 32px))' }}
      >
        {/* Status bar */}
        <div className="flex items-center justify-between px-8 pt-4 pb-2 bg-pace-bg">
          <span className="text-[13px] font-semibold text-pace-text">9:41</span>
          <div className="w-24 h-5 bg-pace-text rounded-full" />
          <div className="flex items-center gap-1">
            <div className="flex gap-[3px] items-end h-4">
              <div className="w-[3px] h-2 bg-pace-text rounded-sm" />
              <div className="w-[3px] h-3 bg-pace-text rounded-sm" />
              <div className="w-[3px] h-4 bg-pace-text rounded-sm" />
            </div>
            <div className="w-4 h-3 border-2 border-pace-text rounded-[3px] ml-1">
              <div className="w-[60%] h-full bg-pace-text rounded-[1px]" />
            </div>
          </div>
        </div>

        {/* App content */}
        <div className="h-full overflow-hidden">{children}</div>
      </div>
    </div>
  )
}

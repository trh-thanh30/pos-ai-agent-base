export default function StorefrontLoading() {
  return (
    <main className="min-h-screen bg-white" aria-label="Đang tải cửa hàng">
      <div className="h-1 overflow-hidden bg-[#eeeeeb]">
        <div className="sf-loading-progress h-full w-1/2 bg-[#262626]" />
      </div>
      <div className="mx-auto max-w-[1440px] animate-pulse px-5 py-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between border-b border-[#eeeeeb] pb-6">
          <div className="h-9 w-36 rounded bg-[#eeeeeb]" />
          <div className="hidden h-11 w-[38%] rounded bg-[#f3f3f1] sm:block" />
          <div className="h-9 w-24 rounded bg-[#eeeeeb]" />
        </div>
        <div className="mt-8 aspect-[16/6] min-h-64 rounded bg-[#f1f1ef]" />
        <div className="mt-16 h-10 w-64 rounded bg-[#e9e9e6]" />
        <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index}>
              <div className="aspect-square rounded bg-[#f1f1ef]" />
              <div className="mt-4 h-5 w-4/5 rounded bg-[#e9e9e6]" />
              <div className="mt-2 h-4 w-2/5 rounded bg-[#f1f1ef]" />
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">Đang tải nội dung cửa hàng...</span>
    </main>
  );
}

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-primary">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex h-12 w-12">
          <div className="absolute h-full w-full animate-ping rounded-full bg-king-500/30" />
          <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-king-500 to-king-700">
            <span className="text-lg font-bold text-white">K2</span>
          </div>
        </div>
        <p className="text-sm text-zinc-500">جاري التحميل...</p>
      </div>
    </div>
  );
}

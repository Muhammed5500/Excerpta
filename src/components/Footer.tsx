export default function Footer() {
  return (
    <footer className="border-t border-border-light/50 mt-20 nav-bg backdrop-blur-sm relative z-10">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-full bg-terracotta flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">E</span>
          </div>
          <span className="text-sm text-slate-muted">Excerpta</span>
        </div>
        <p className="text-xs text-slate-muted">
          Curated research from {new Date().getFullYear()}. Built for the curious.
        </p>
      </div>
    </footer>
  );
}

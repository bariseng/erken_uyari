export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-20 text-center">
      <div className="inline-flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-[var(--muted)]">Yükleniyor...</span>
      </div>
    </div>
  );
}

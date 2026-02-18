import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-32 text-center">
      <p className="text-6xl mb-4">🔍</p>
      <h1 className="text-3xl font-bold">Sayfa Bulunamadı</h1>
      <p className="mt-3 text-[var(--muted)]">
        Aradığınız sayfa mevcut değil veya taşınmış olabilir.
      </p>
      <div className="mt-8 flex items-center justify-center gap-3">
        <Link href="/" className="btn-primary">Ana Sayfa</Link>
        <Link href="/hesapla" className="btn-secondary">Hesap Araçları</Link>
      </div>
    </div>
  );
}

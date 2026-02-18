"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function KayitPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Kayıt başarısız.");
        setLoading(false);
        return;
      }

      // Otomatik giriş
      await signIn("credentials", { email, password, redirect: false });
      router.push("/hesapla");
      router.refresh();
    } catch {
      setError("Bir hata oluştu.");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <div className="card p-8">
        <h1 className="text-2xl font-bold text-center">Kayıt Ol</h1>
        <p className="text-sm text-[var(--muted)] text-center mt-1">Ücretsiz GeoForce hesabı oluşturun</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Ad Soyad</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="input-field"
              placeholder="Adınız"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">E-posta</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input-field"
              placeholder="ornek@mail.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Şifre</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input-field"
              placeholder="En az 6 karakter"
              minLength={6}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 disabled:opacity-50">
            {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-[var(--muted)]">
          Zaten hesabınız var mı?{" "}
          <Link href="/giris" className="text-brand-600 hover:underline font-medium">Giriş Yap</Link>
        </p>

        <div className="mt-6 rounded-lg bg-earth-50 dark:bg-neutral-800 p-4">
          <p className="text-xs font-medium mb-2">Ücretsiz plan içerir:</p>
          <ul className="text-xs text-[var(--muted)] space-y-1">
            <li>✅ 18 hesap modülü</li>
            <li>✅ PDF rapor oluşturma</li>
            <li>✅ 3 proje kaydetme</li>
          </ul>
          <p className="text-xs font-medium mt-3 text-brand-600">Pro plan:</p>
          <ul className="text-xs text-[var(--muted)] space-y-1">
            <li>⭐ Sınırsız proje</li>
            <li>⭐ Özel logo ile rapor</li>
            <li>⭐ Toplu rapor oluşturma</li>
            <li>⭐ Şablon kaydetme</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import Field from "@/components/Field";
import { checkPasswordStrength } from "@/lib/validation";

export default function KayitPage() {
  const router = useRouter();
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const passwordStrength = checkPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (!name.trim()) {
      setError("Ad Soyad alanı zorunludur.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    if (passwordStrength.score < 4) {
      setError("Şifre yeterince güçlü değil: " + passwordStrength.feedback.join(", "));
      return;
    }

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
        <h1 className="text-2xl font-bold text-center">{t("registerTitle")}</h1>
        <p className="text-sm text-[var(--muted)] text-center mt-1">{t("registerDesc")}</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <div role="alert" aria-live="assertive" className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <Field
            label={t("name")}
            value={name}
            onChange={setName}
            type="text"
            required
            placeholder="Adınız Soyadınız"
          />

          <Field
            label={t("email")}
            value={email}
            onChange={setEmail}
            type="email"
            required
            placeholder="ornek@mail.com"
          />

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium">{t("password")}</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                {showPassword ? "🙈 Gizle" : "👁️ Göster"}
              </button>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input-field"
              placeholder="En az 8 karakter"
              minLength={8}
              required
            />
            {password && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded ${
                        i <= passwordStrength.score
                          ? passwordStrength.score <= 2 ? "bg-red-500"
                          : passwordStrength.score <= 3 ? "bg-yellow-500"
                          : "bg-green-500"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    />
                  ))}
                </div>
                {passwordStrength.feedback.length > 0 && (
                  <p className="text-xs text-[var(--muted)] mt-1">
                    {passwordStrength.feedback.join(" • ")}
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Şifre Tekrar <span className="text-red-500">*</span>
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="input-field"
              placeholder="Şifreyi tekrar girin"
              required
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-red-500 mt-1">Şifreler eşleşmiyor</p>
            )}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 disabled:opacity-50">
            {loading ? t("registering") : t("registerBtn")}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-[var(--muted)]">
          {t("hasAccount")}{" "}
          <Link href="/giris" className="text-brand-600 hover:underline font-medium">{t("loginBtn")}</Link>
        </p>

        <div className="mt-6 rounded-lg bg-earth-50 dark:bg-neutral-800 p-4">
          <p className="text-xs font-medium mb-2">{t("freePlan")}</p>
          <ul className="text-xs text-[var(--muted)] space-y-1">
            <li>✅ {t("freeFeature1")}</li>
            <li>✅ {t("freeFeature2")}</li>
            <li>✅ {t("freeFeature3")}</li>
          </ul>
          <p className="text-xs font-medium mt-3 text-brand-600">{t("proPlan")}</p>
          <ul className="text-xs text-[var(--muted)] space-y-1">
            <li>⭐ {t("proFeature1")}</li>
            <li>⭐ {t("proFeature2")}</li>
            <li>⭐ {t("proFeature3")}</li>
            <li>⭐ {t("proFeature4")}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

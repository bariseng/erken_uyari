"use client";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();

  const toggle = () => {
    const next = locale === "tr" ? "en" : "tr";
    document.cookie = `locale=${next};path=/;max-age=31536000`;
    router.refresh();
  };

  return (
    <button
      onClick={toggle}
      className="px-2 py-1 rounded-md text-xs font-medium border border-[var(--card-border)] hover:bg-earth-100 dark:hover:bg-neutral-800 transition-colors"
      title={locale === "tr" ? "Switch to English" : "Türkçe'ye geç"}
    >
      {locale === "tr" ? "EN" : "TR"}
    </button>
  );
}

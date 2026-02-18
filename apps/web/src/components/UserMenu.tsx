"use client";
import { useSession, signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function UserMenu() {
  const { data: session, status } = useSession();
  const t = useTranslations("common");

  if (status === "loading") {
    return <div className="w-20 h-8 rounded-lg bg-earth-100 dark:bg-neutral-800 animate-pulse" />;
  }

  if (!session?.user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/giris" className="px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-earth-100 dark:hover:bg-neutral-800 transition-colors">
          {t("login")}
        </Link>
        <Link href="/kayit" className="btn-primary text-sm py-1.5">
          {t("register")}
        </Link>
      </div>
    );
  }

  const tier = session.user.tier || "free";

  return (
    <div className="flex items-center gap-3">
      <Link href="/projeler" className="px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-earth-100 dark:hover:bg-neutral-800 transition-colors">
        📁 {t("projects")}
      </Link>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{session.user.name}</span>
        {tier === "pro" && (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-400">PRO</span>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="px-2 py-1 rounded-lg text-xs text-[var(--muted)] hover:bg-earth-100 dark:hover:bg-neutral-800 transition-colors"
        >
          {t("logout")}
        </button>
      </div>
    </div>
  );
}

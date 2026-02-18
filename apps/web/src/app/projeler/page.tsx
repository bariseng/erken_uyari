"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Project {
  id: string;
  name: string;
  description?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProjelerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newLoc, setNewLoc] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/giris");
    if (status === "authenticated") fetchProjects();
  }, [status]);

  const fetchProjects = async () => {
    setLoading(true);
    const res = await fetch("/api/projects");
    if (res.ok) setProjects(await res.json());
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, description: newDesc, location: newLoc, data: {} }),
    });
    if (res.ok) {
      setShowNew(false);
      setNewName("");
      setNewDesc("");
      setNewLoc("");
      fetchProjects();
    } else {
      const data = await res.json();
      setError(data.error || "Proje oluşturulamadı.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu projeyi silmek istediğinize emin misiniz?")) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    fetchProjects();
  };

  const tier = (session?.user as any)?.tier || "free";
  const maxProjects = tier === "pro" ? Infinity : 3;

  if (status === "loading" || loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <p className="text-[var(--muted)]">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">📁 Projelerim</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            {projects.length}/{maxProjects === Infinity ? "∞" : maxProjects} proje
            {tier === "free" && <span className="ml-2 text-xs">(Ücretsiz plan)</span>}
          </p>
        </div>
        <button onClick={() => setShowNew(!showNew)} className="btn-primary text-sm">
          + Yeni Proje
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {showNew && (
        <form onSubmit={handleCreate} className="mt-4 card p-5 space-y-3">
          <h2 className="font-semibold">Yeni Proje</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Proje adı *</label>
            <input type="text" value={newName} onChange={e => setNewName(e.target.value)} className="input-field" placeholder="Örn: Konut İnşaatı" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Açıklama</label>
              <input type="text" value={newDesc} onChange={e => setNewDesc(e.target.value)} className="input-field" placeholder="Opsiyonel" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Konum</label>
              <input type="text" value={newLoc} onChange={e => setNewLoc(e.target.value)} className="input-field" placeholder="Örn: İstanbul" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary text-sm">Oluştur</button>
            <button type="button" onClick={() => setShowNew(false)} className="btn-secondary text-sm">İptal</button>
          </div>
        </form>
      )}

      {projects.length === 0 ? (
        <div className="mt-8 card p-12 text-center text-[var(--muted)]">
          <p className="text-4xl mb-3">📂</p>
          <p className="font-medium">Henüz proje yok</p>
          <p className="text-sm mt-1">Yukarıdaki "Yeni Proje" butonuyla başlayın</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {projects.map(p => (
            <div key={p.id} className="card p-5 flex items-center justify-between group hover:border-brand-400 transition-colors">
              <div>
                <h3 className="font-semibold group-hover:text-brand-600 transition-colors">{p.name}</h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-[var(--muted)]">
                  {p.location && <span>📍 {p.location}</span>}
                  {p.description && <span>{p.description}</span>}
                  <span>Güncelleme: {new Date(p.updatedAt).toLocaleDateString("tr-TR")}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/rapor?project=${p.id}`} className="btn-secondary text-xs py-1 px-3">📄 Rapor</Link>
                <button onClick={() => handleDelete(p.id)} className="text-xs text-red-500 hover:text-red-700 px-2 py-1">Sil</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tier === "free" && (
        <div className="mt-8 card p-5 bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-800">
          <h3 className="font-semibold text-brand-700 dark:text-brand-400">⭐ Pro'ya Yükselt</h3>
          <p className="text-sm text-[var(--muted)] mt-1">Sınırsız proje, özel logo, toplu rapor ve daha fazlası.</p>
          <button className="btn-primary text-sm mt-3">Pro Planı İncele</button>
        </div>
      )}
    </div>
  );
}

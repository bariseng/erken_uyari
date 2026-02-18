import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Proje listesi
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const userId = (session.user as any).id;
  const projects = await prisma.project.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(projects);
}

// Yeni proje oluştur
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const userId = (session.user as any).id;
  const tier = (session.user as any).tier || "free";

  // Free tier: max 3 proje
  if (tier === "free") {
    const count = await prisma.project.count({ where: { userId } });
    if (count >= 3) {
      return NextResponse.json({ error: "Ücretsiz planda en fazla 3 proje kaydedebilirsiniz. Pro'ya yükseltin." }, { status: 403 });
    }
  }

  const { name, description, location, data } = await req.json();
  if (!name) return NextResponse.json({ error: "Proje adı gerekli." }, { status: 400 });

  const project = await prisma.project.create({
    data: { userId, name, description, location, data: JSON.stringify(data || {}) },
  });

  return NextResponse.json(project, { status: 201 });
}

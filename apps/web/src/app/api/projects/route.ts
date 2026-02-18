import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { projectCreateSchema, projectUpdateSchema } from "@/lib/validation";

// Proje listesi
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const userId = (session.user as { id: string }).id;
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

  const userId = (session.user as { id: string; tier?: string }).id;
  const tier = (session.user as { tier?: string }).tier || "free";

  // Free tier: max 3 proje
  if (tier === "free") {
    const count = await prisma.project.count({ where: { userId } });
    if (count >= 3) {
      return NextResponse.json({ error: "Ücretsiz planda en fazla 3 proje kaydedebilirsiniz. Pro'ya yükseltin." }, { status: 403 });
    }
  }

  try {
    const body = await req.json();
    
    // Validate and sanitize input
    const parsed = projectCreateSchema.safeParse(body);
    if (!parsed.success) {
      const error = parsed.error.issues[0]?.message || "Geçersiz giriş.";
      return NextResponse.json({ error }, { status: 400 });
    }

    const { name, description, location, data } = parsed.data;

    const project = await prisma.project.create({
      data: { 
        userId, 
        name, 
        description: description || null,
        location: location || null,
        data: JSON.stringify(data || {}) 
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Bilinmeyen hata";
    console.error("Project create error:", message);
    return NextResponse.json({ error: "Proje oluşturulurken hata oluştu." }, { status: 500 });
  }
}

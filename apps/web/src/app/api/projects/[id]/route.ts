import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { projectUpdateSchema } from "@/lib/validation";

// Proje detay
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const project = await prisma.project.findFirst({ where: { id: params.id, userId } });
  if (!project) return NextResponse.json({ error: "Proje bulunamadı." }, { status: 404 });

  return NextResponse.json(project);
}

// Proje güncelle
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const existing = await prisma.project.findFirst({ where: { id: params.id, userId } });
  if (!existing) return NextResponse.json({ error: "Proje bulunamadı." }, { status: 404 });

  try {
    const body = await req.json();
    
    // Validate and sanitize input
    const parsed = projectUpdateSchema.safeParse(body);
    if (!parsed.success) {
      const error = parsed.error.issues[0]?.message || "Geçersiz giriş.";
      return NextResponse.json({ error }, { status: 400 });
    }

    const { name, description, location, data } = parsed.data;

    const project = await prisma.project.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(location !== undefined && { location }),
        ...(data !== undefined && { data: JSON.stringify(data) }),
      },
    });

    return NextResponse.json(project);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Bilinmeyen hata";
    console.error("Project update error:", message);
    return NextResponse.json({ error: "Proje güncellenirken hata oluştu." }, { status: 500 });
  }
}

// Proje sil
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const existing = await prisma.project.findFirst({ where: { id: params.id, userId } });
  if (!existing) return NextResponse.json({ error: "Proje bulunamadı." }, { status: 404 });

  await prisma.project.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

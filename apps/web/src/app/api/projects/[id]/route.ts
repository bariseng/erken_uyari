import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Proje detay
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const userId = (session.user as any).id;
  const project = await prisma.project.findFirst({ where: { id: params.id, userId } });
  if (!project) return NextResponse.json({ error: "Proje bulunamadı." }, { status: 404 });

  return NextResponse.json(project);
}

// Proje güncelle
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const userId = (session.user as any).id;
  const existing = await prisma.project.findFirst({ where: { id: params.id, userId } });
  if (!existing) return NextResponse.json({ error: "Proje bulunamadı." }, { status: 404 });

  const { name, description, location, data } = await req.json();
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
}

// Proje sil
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const userId = (session.user as any).id;
  const existing = await prisma.project.findFirst({ where: { id: params.id, userId } });
  if (!existing) return NextResponse.json({ error: "Proje bulunamadı." }, { status: 404 });

  await prisma.project.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

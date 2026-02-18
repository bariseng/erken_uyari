import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { projectUpdateSchema } from "@/lib/validation";
import { projectsRateLimiter, getClientIp, addRateLimitHeaders } from "@/lib/rate-limit";

// Proje detay
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  // Rate limiting check
  const ip = getClientIp(req);
  const rateResult = projectsRateLimiter.check(ip);
  
  if (!rateResult.success) {
    const response = NextResponse.json(
      { 
        error: "Çok fazla istek. Lütfen bir dakika bekleyip tekrar deneyin.",
        retryAfter: rateResult.retryAfter 
      },
      { status: 429 }
    );
    response.headers.set('Retry-After', String(rateResult.retryAfter || 60));
    return response;
  }

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    const response = NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
    addRateLimitHeaders(response, rateResult.limit, rateResult.remaining, rateResult.resetTime);
    return response;
  }

  const userId = (session.user as { id: string }).id;
  const project = await prisma.project.findFirst({ where: { id: params.id, userId } });
  if (!project) {
    const response = NextResponse.json({ error: "Proje bulunamadı." }, { status: 404 });
    addRateLimitHeaders(response, rateResult.limit, rateResult.remaining, rateResult.resetTime);
    return response;
  }

  const response = NextResponse.json(project);
  addRateLimitHeaders(response, rateResult.limit, rateResult.remaining, rateResult.resetTime);
  return response;
}

// Proje güncelle
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  // Rate limiting check
  const ip = getClientIp(req);
  const rateResult = projectsRateLimiter.check(ip);
  
  if (!rateResult.success) {
    const response = NextResponse.json(
      { 
        error: "Çok fazla istek. Lütfen bir dakika bekleyip tekrar deneyin.",
        retryAfter: rateResult.retryAfter 
      },
      { status: 429 }
    );
    response.headers.set('Retry-After', String(rateResult.retryAfter || 60));
    return response;
  }

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    const response = NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
    addRateLimitHeaders(response, rateResult.limit, rateResult.remaining, rateResult.resetTime);
    return response;
  }

  const userId = (session.user as { id: string }).id;
  const existing = await prisma.project.findFirst({ where: { id: params.id, userId } });
  if (!existing) {
    const response = NextResponse.json({ error: "Proje bulunamadı." }, { status: 404 });
    addRateLimitHeaders(response, rateResult.limit, rateResult.remaining, rateResult.resetTime);
    return response;
  }

  try {
    const body = await req.json();
    
    // Validate and sanitize input
    const parsed = projectUpdateSchema.safeParse(body);
    if (!parsed.success) {
      const error = parsed.error.issues[0]?.message || "Geçersiz giriş.";
      const response = NextResponse.json({ error }, { status: 400 });
      addRateLimitHeaders(response, rateResult.limit, rateResult.remaining, rateResult.resetTime);
      return response;
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

    const response = NextResponse.json(project);
    addRateLimitHeaders(response, rateResult.limit, rateResult.remaining, rateResult.resetTime);
    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Bilinmeyen hata";
    console.error("Project update error:", message);
    const response = NextResponse.json({ error: "Proje güncellenirken hata oluştu." }, { status: 500 });
    addRateLimitHeaders(response, rateResult.limit, rateResult.remaining, rateResult.resetTime);
    return response;
  }
}

// Proje sil
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  // Rate limiting check
  const ip = getClientIp(req);
  const rateResult = projectsRateLimiter.check(ip);
  
  if (!rateResult.success) {
    const response = NextResponse.json(
      { 
        error: "Çok fazla istek. Lütfen bir dakika bekleyip tekrar deneyin.",
        retryAfter: rateResult.retryAfter 
      },
      { status: 429 }
    );
    response.headers.set('Retry-After', String(rateResult.retryAfter || 60));
    return response;
  }

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    const response = NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
    addRateLimitHeaders(response, rateResult.limit, rateResult.remaining, rateResult.resetTime);
    return response;
  }

  const userId = (session.user as { id: string }).id;
  const existing = await prisma.project.findFirst({ where: { id: params.id, userId } });
  if (!existing) {
    const response = NextResponse.json({ error: "Proje bulunamadı." }, { status: 404 });
    addRateLimitHeaders(response, rateResult.limit, rateResult.remaining, rateResult.resetTime);
    return response;
  }

  await prisma.project.delete({ where: { id: params.id } });
  
  const response = NextResponse.json({ ok: true });
  addRateLimitHeaders(response, rateResult.limit, rateResult.remaining, rateResult.resetTime);
  return response;
}

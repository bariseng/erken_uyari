import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { projectCreateSchema, projectUpdateSchema } from "@/lib/validation";
import { projectsRateLimiter, getClientIp, addRateLimitHeaders } from "@/lib/rate-limit";

// Proje listesi
export async function GET(req: NextRequest) {
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
  const projects = await prisma.project.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });

  const response = NextResponse.json(projects);
  addRateLimitHeaders(response, rateResult.limit, rateResult.remaining, rateResult.resetTime);
  return response;
}

// Yeni proje oluştur
export async function POST(req: NextRequest) {
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

  const userId = (session.user as { id: string; tier?: string }).id;
  const tier = (session.user as { tier?: string }).tier || "free";

  // Free tier: max 3 proje
  if (tier === "free") {
    const count = await prisma.project.count({ where: { userId } });
    if (count >= 3) {
      const response = NextResponse.json({ error: "Ücretsiz planda en fazla 3 proje kaydedebilirsiniz. Pro'ya yükseltin." }, { status: 403 });
      addRateLimitHeaders(response, rateResult.limit, rateResult.remaining, rateResult.resetTime);
      return response;
    }
  }

  try {
    const body = await req.json();
    
    // Validate and sanitize input
    const parsed = projectCreateSchema.safeParse(body);
    if (!parsed.success) {
      const error = parsed.error.issues[0]?.message || "Geçersiz giriş.";
      const response = NextResponse.json({ error }, { status: 400 });
      addRateLimitHeaders(response, rateResult.limit, rateResult.remaining, rateResult.resetTime);
      return response;
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

    const response = NextResponse.json(project, { status: 201 });
    addRateLimitHeaders(response, rateResult.limit, rateResult.remaining, rateResult.resetTime);
    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Bilinmeyen hata";
    console.error("Project create error:", message);
    const response = NextResponse.json({ error: "Proje oluşturulurken hata oluştu." }, { status: 500 });
    addRateLimitHeaders(response, rateResult.limit, rateResult.remaining, rateResult.resetTime);
    return response;
  }
}

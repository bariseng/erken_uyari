import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashSync } from "bcryptjs";
import { registerSchema } from "@/lib/validation";
import { authRateLimiter, getClientIp, addRateLimitHeaders } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  // Rate limiting check
  const ip = getClientIp(req);
  const rateResult = authRateLimiter.check(ip);
  
  if (!rateResult.success) {
    const response = NextResponse.json(
      { 
        error: "Çok fazla kayıt denemesi. Lütfen bir dakika bekleyip tekrar deneyin.",
        retryAfter: rateResult.retryAfter 
      },
      { status: 429 }
    );
    response.headers.set('Retry-After', String(rateResult.retryAfter || 60));
    return response;
  }

  try {
    const body = await req.json();
    
    // Validate input with Zod
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      const error = parsed.error.issues[0]?.message || "Geçersiz giriş.";
      const response = NextResponse.json({ error }, { status: 400 });
      addRateLimitHeaders(response, rateResult.limit, rateResult.remaining, rateResult.resetTime);
      return response;
    }

    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      const response = NextResponse.json({ error: "Bu e-posta zaten kayıtlı." }, { status: 409 });
      addRateLimitHeaders(response, rateResult.limit, rateResult.remaining, rateResult.resetTime);
      return response;
    }

    const hashed = hashSync(password, 10);
    const user = await prisma.user.create({
      data: { name: name || email.split("@")[0], email, password: hashed, tier: "free" },
    });

    const response = NextResponse.json({ id: user.id, name: user.name, email: user.email, tier: user.tier }, { status: 201 });
    addRateLimitHeaders(response, rateResult.limit, rateResult.remaining, rateResult.resetTime);
    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Bilinmeyen hata";
    console.error("Register error:", message);
    const response = NextResponse.json({ error: "Kayıt sırasında hata oluştu." }, { status: 500 });
    addRateLimitHeaders(response, rateResult.limit, rateResult.remaining, rateResult.resetTime);
    return response;
  }
}

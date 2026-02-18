import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashSync } from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password || password.length < 6) {
      return NextResponse.json({ error: "E-posta ve en az 6 karakter şifre gerekli." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Bu e-posta zaten kayıtlı." }, { status: 409 });
    }

    const hashed = hashSync(password, 10);
    const user = await prisma.user.create({
      data: { name: name || email.split("@")[0], email, password: hashed, tier: "free" },
    });

    return NextResponse.json({ id: user.id, name: user.name, email: user.email, tier: user.tier }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: "Kayıt sırasında hata oluştu." }, { status: 500 });
  }
}

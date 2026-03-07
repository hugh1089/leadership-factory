import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const adminCount = await prisma.user.count({ where: { role: "admin" } });
  if (adminCount === 0) {
    await prisma.user.update({ where: { id: session.user.id }, data: { role: "admin" } });
    return NextResponse.json({ ok: true, message: "You are now admin (first admin)" });
  }

  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Only admins can promote users" }, { status: 403 });
  }

  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await prisma.user.update({ where: { id: user.id }, data: { role: "admin" } });
  return NextResponse.json({ ok: true, message: `${email} is now admin` });
}

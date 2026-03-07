import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const { revenue } = await req.json();
  await prisma.project.update({ where: { id: projectId }, data: { revenue: Number(revenue) || 0 } });
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(_req: Request, { params }: { params: Promise<{ projectId: string; fileId: string }> }) {
  const { fileId } = await params;

  const file = await prisma.knowledgeFile.findUnique({ where: { id: fileId } });
  if (!file) return NextResponse.json({ error: "File not found" }, { status: 404 });

  try {
    const absPath = path.join(process.cwd(), file.filePath);
    const buffer = await readFile(absPath);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(file.fileName)}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found on disk" }, { status: 404 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const title = formData.get("title") as string;
  const stepKey = formData.get("stepKey") as string;
  const category = formData.get("category") as string;
  const description = formData.get("description") as string;
  const uploadedBy = formData.get("uploadedBy") as string;

  if (!file || !title) {
    return NextResponse.json({ error: "Missing file or title" }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), "data", "uploads", projectId);
  await mkdir(uploadDir, { recursive: true });

  const ext = path.extname(file.name);
  const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._\-\u4e00-\u9fa5]/g, "_")}`;
  const filePath = path.join(uploadDir, safeName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  await prisma.knowledgeFile.create({
    data: {
      stepKey: stepKey || "",
      title,
      fileType: ext.replace(".", ""),
      category: category || "other",
      description: description || "",
      fileName: file.name,
      fileSize: file.size,
      filePath: `data/uploads/${projectId}/${safeName}`,
      uploadedBy: uploadedBy || "",
      projectId,
    },
  });

  return NextResponse.json({ ok: true });
}

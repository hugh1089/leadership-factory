import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const { learners } = await req.json();

  if (!Array.isArray(learners) || learners.length === 0) {
    return NextResponse.json({ error: "无有效数据" }, { status: 400 });
  }

  const FIELD_MAP: Record<string, string> = {
    "姓名": "name", "name": "name",
    "部门": "department", "department": "department",
    "岗位": "position", "position": "position",
    "工龄": "yearsWork", "yearsWork": "yearsWork",
    "管理年限": "yearsMgmt", "yearsMgmt": "yearsMgmt",
    "直线主管": "supervisor", "supervisor": "supervisor",
    "电话": "phone", "phone": "phone",
    "邮箱": "email", "email": "email",
    "加入日期": "joinDate", "joinDate": "joinDate",
    "类型": "learnerType", "learnerType": "learnerType",
    "档案编号": "fileNo", "fileNo": "fileNo",
  };

  const mapped = learners.map((row: Record<string, string>) => {
    const item: Record<string, string> = { projectId };
    for (const [key, val] of Object.entries(row)) {
      const mapped_key = FIELD_MAP[key.trim()];
      if (mapped_key) item[mapped_key] = String(val || "").trim();
    }
    if (!item.name) return null;
    return item;
  }).filter(Boolean);

  if (mapped.length === 0) {
    return NextResponse.json({ error: "未找到有效的学员数据，请确保包含「姓名」列" }, { status: 400 });
  }

  await prisma.learner.createMany({ data: mapped as unknown as Array<{ projectId: string; name: string }> });

  return NextResponse.json({ ok: true, count: mapped.length });
}

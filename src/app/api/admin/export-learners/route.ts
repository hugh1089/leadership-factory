import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const { projectIds } = await req.json();
  if (!Array.isArray(projectIds) || projectIds.length === 0) {
    return NextResponse.json({ error: "No project IDs" }, { status: 400 });
  }

  const learners = await prisma.learner.findMany({
    where: { projectId: { in: projectIds } },
    include: { project: { select: { name: true } } },
  });

  const headers = "项目名称,姓名,部门,岗位,工龄,管理年限,直线主管,电话,邮箱,加入日期,类型,档案编号\n";
  const rows = learners.map((l) =>
    [l.project.name, l.name, l.department, l.position, l.yearsWork, l.yearsMgmt, l.supervisor, l.phone, l.email, l.joinDate, l.learnerType, l.fileNo].join(",")
  ).join("\n");

  const csv = "\uFEFF" + headers + rows;
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${encodeURIComponent("学员数据")}.csv"`,
    },
  });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import ExcelJS from "exceljs";

const HEADER_FILL: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F4E79" } };
const HEADER_FONT: Partial<ExcelJS.Font> = { bold: true, color: { argb: "FFFFFFFF" }, size: 10 };
const BORDER: Partial<ExcelJS.Borders> = {
  top: { style: "thin" }, bottom: { style: "thin" },
  left: { style: "thin" }, right: { style: "thin" },
};

function addHeaders(ws: ExcelJS.Worksheet, headers: string[]) {
  const row = ws.addRow(headers);
  row.eachCell((cell) => {
    cell.fill = HEADER_FILL;
    cell.font = HEADER_FONT;
    cell.border = BORDER;
    cell.alignment = { vertical: "middle", wrapText: true };
  });
}

function addDataRows(ws: ExcelJS.Worksheet, rows: string[][]) {
  rows.forEach((data) => {
    const row = ws.addRow(data);
    row.eachCell((cell) => {
      cell.border = BORDER;
      cell.alignment = { vertical: "top", wrapText: true };
      cell.font = { size: 10 };
    });
  });
}

export async function POST(req: Request) {
  const { projectIds } = await req.json();
  if (!Array.isArray(projectIds) || projectIds.length === 0) {
    return NextResponse.json({ error: "No project IDs" }, { status: 400 });
  }

  const projects = await prisma.project.findMany({
    where: { id: { in: projectIds } },
    include: {
      user: { select: { name: true, email: true } },
      charter: true,
      stakeholders: true,
      businessNeeds: true,
      competencyGaps: true,
      personas: true,
      objectives: true,
      journeyPhases: { orderBy: { sortOrder: "asc" } },
      modules: { include: { sessions: { orderBy: { sortOrder: "asc" } } }, orderBy: { sortOrder: "asc" } },
      assessments: true,
      facilitators: true,
      calendarEvents: { orderBy: { sortOrder: "asc" } },
      learners: true,
      budgetItems: true,
      commPlans: true,
      risks: true,
      review: true,
      stepStatus: true,
    },
  });

  const wb = new ExcelJS.Workbook();
  wb.creator = "学习项目设计工作台 - 管理后台";

  const summary = wb.addWorksheet("项目汇总");
  summary.columns = [
    { width: 25 }, { width: 20 }, { width: 15 }, { width: 10 },
    { width: 10 }, { width: 10 }, { width: 12 }, { width: 15 },
  ];
  addHeaders(summary, ["项目名称", "组织", "所有者", "状态", "进度", "学员数", "预算合计", "更新时间"]);
  projects.forEach((p) => {
    const completed = p.stepStatus.filter((s) => s.status === "completed").length;
    const budgetTotal = p.budgetItems.reduce((s, b) => s + b.planTotal, 0);
    addDataRows(summary, [[
      p.name, p.org, p.user.name || p.user.email, p.status,
      `${Math.round((completed / 15) * 100)}%`,
      String(p.learners.length),
      `¥${budgetTotal.toLocaleString()}`,
      p.updatedAt.toISOString().slice(0, 10),
    ]]);
  });

  for (const project of projects) {
    const prefix = project.name.slice(0, 15);

    if (project.charter) {
      const ws = wb.addWorksheet(`${prefix}_章程`);
      ws.columns = [{ width: 20 }, { width: 40 }, { width: 20 }, { width: 40 }];
      const c = project.charter;
      addHeaders(ws, ["字段", "内容", "字段", "内容"]);
      addDataRows(ws, [
        ["项目名称", c.projectName, "所属组织", c.orgName],
        ["发起人", c.sponsor, "项目经理", c.projectManager],
        ["开始日期", c.startDate, "结束日期", c.endDate],
        ["背景", c.background, "目标学员", c.targetAudience],
        ["预期成果", c.expectedOutcome, "范围", c.scope],
        ["成功标准", c.successCriteria, "约束", c.constraints],
      ]);
    }

    if (project.learners.length > 0) {
      const ws = wb.addWorksheet(`${prefix}_学员`);
      ws.columns = Array(11).fill({ width: 14 });
      addHeaders(ws, ["姓名", "部门", "岗位", "工龄", "管理年限", "主管", "电话", "邮箱", "加入日期", "类型", "编号"]);
      project.learners.forEach((l) => {
        addDataRows(ws, [[l.name, l.department, l.position, l.yearsWork, l.yearsMgmt, l.supervisor, l.phone, l.email, l.joinDate, l.learnerType, l.fileNo]]);
      });
    }

    if (project.budgetItems.length > 0) {
      const ws = wb.addWorksheet(`${prefix}_预算`);
      ws.columns = Array(10).fill({ width: 14 });
      addHeaders(ws, ["类别", "项目", "类型", "计划单价", "计划数量", "计划小计", "实际单价", "实际数量", "实际小计", "状态"]);
      project.budgetItems.forEach((b) => {
        addDataRows(ws, [[b.category, b.itemName, b.feeType, String(b.planPrice), String(b.planQty), String(b.planTotal), String(b.actualPrice), String(b.actualQty), String(b.actualTotal), b.status]]);
      });
    }
  }

  const buffer = await wb.xlsx.writeBuffer();
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${encodeURIComponent("项目批量导出")}.xlsx"`,
    },
  });
}

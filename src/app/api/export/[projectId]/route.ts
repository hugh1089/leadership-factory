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

export async function GET(_req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
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
      actionTeams: true,
      coachingSessions: true,
      calendarEvents: { orderBy: { sortOrder: "asc" } },
      learners: true,
      budgetItems: true,
      commPlans: true,
      risks: true,
      review: true,
    },
  });

  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const wb = new ExcelJS.Workbook();
  wb.creator = "学习项目设计工作台";

  // 01 Charter
  const ws1 = wb.addWorksheet("01_项目章程");
  ws1.columns = [{ width: 20 }, { width: 40 }, { width: 20 }, { width: 40 }];
  const c = project.charter;
  if (c) {
    addHeaders(ws1, ["字段", "内容", "字段", "内容"]);
    addDataRows(ws1, [
      ["项目名称", c.projectName, "所属组织", c.orgName],
      ["项目发起人", c.sponsor, "项目经理", c.projectManager],
      ["开始日期", c.startDate, "结束日期", c.endDate],
      ["项目背景", c.background, "", ""],
      ["目标学员", c.targetAudience, "预期成果", c.expectedOutcome],
      ["项目范围", c.scope, "排除范围", c.outOfScope],
      ["成功标准", c.successCriteria, "约束条件", c.constraints],
    ]);
    ws1.addRow([]);
    addHeaders(ws1, ["干系人", "角色", "期望", "影响力"]);
    project.stakeholders.forEach((s) => {
      addDataRows(ws1, [[s.name, s.role, s.expectations, s.influence]]);
    });
  }

  // 02 TNA
  const ws2 = wb.addWorksheet("02_需求分析TNA");
  ws2.columns = Array(8).fill({ width: 18 });
  addHeaders(ws2, ["业务挑战", "战略关联", "影响岗位", "期望结果", "指标", "当前", "目标", "优先级"]);
  project.businessNeeds.forEach((b) => {
    addDataRows(ws2, [[b.challenge, b.strategic, b.affectedRoles, b.expectedResult, b.metric, b.currentData, b.targetData, b.priority]]);
  });
  ws2.addRow([]); ws2.addRow(["能力差距矩阵"]);
  addHeaders(ws2, ["能力维度", "目标群体", "当前水平", "要求水平", "差距分", "建议", "方法", "优先级"]);
  project.competencyGaps.forEach((g) => {
    addDataRows(ws2, [[g.dimension, g.targetGroup, String(g.currentLevel), String(g.requiredLevel), String(g.gapScore), g.recommendation, g.method, g.priority]]);
  });

  // 03 Personas
  const ws3 = wb.addWorksheet("03_学员画像");
  ws3.columns = Array(6).fill({ width: 22 });
  project.personas.forEach((p, i) => {
    if (i > 0) ws3.addRow([]);
    ws3.addRow([`画像 ${i + 1}: ${p.name}`]);
    addHeaders(ws3, ["维度", "内容", "维度", "内容", "维度", "内容"]);
    addDataRows(ws3, [
      ["年龄", p.age, "部门", p.department, "岗位", p.position],
      ["工作年限", p.yearsExp, "管理年限", p.mgmtYears, "数字化水平", p.techLevel],
      ["性格特征", p.traits, "学习动机", p.motivation, "主要挑战", p.challenges],
      ["学习偏好", p.learnStyle, "DISC测评", p.assessDisc, "MBTI类型", p.assessMbti],
      ["360评估", p.assess360, "其他测评", p.assessCustom, "", ""],
      ["跟踪记录", p.trackNotes, "", "", "", ""],
    ]);
  });

  // 04 Objectives
  const ws4 = wb.addWorksheet("04_学习目标矩阵");
  ws4.columns = Array(8).fill({ width: 18 });
  addHeaders(ws4, ["模块", "学习目标", "布鲁姆层级", "能力维度", "业务目标", "评估方法", "评估时机", "难度"]);
  project.objectives.forEach((o) => {
    addDataRows(ws4, [[o.moduleName, o.objective, o.bloomLevel, o.competency, o.businessGoal, o.assessMethod, o.assessTiming, String(o.difficulty)]]);
  });

  // 05 Journey
  const ws5 = wb.addWorksheet("05_学习旅程地图");
  ws5.columns = Array(8).fill({ width: 18 });
  addHeaders(ws5, ["阶段", "时长", "描述", "活动", "情绪", "干预", "负责人", "标准"]);
  project.journeyPhases.forEach((j) => {
    addDataRows(ws5, [[j.phase, j.duration, j.description, j.activities, j.emotion, j.intervention, j.responsible, j.criteria]]);
  });

  // 06 Curriculum
  const ws6 = wb.addWorksheet("06_课程架构");
  ws6.columns = Array(10).fill({ width: 16 });
  addHeaders(ws6, ["代码", "模块", "主题", "目标", "方法", "形式", "学时", "师资", "CAKE", "业务对齐"]);
  project.modules.forEach((m) => {
    addDataRows(ws6, [[m.code, m.name, m.topic, m.objective, m.method, m.format, String(m.hours), m.facilitatorType, m.competency, m.businessAlign]]);
  });

  // 07 Sessions
  const ws7 = wb.addWorksheet("07_单元设计详案");
  ws7.columns = Array(9).fill({ width: 18 });
  project.modules.forEach((m) => {
    ws7.addRow([`模块: ${m.code} ${m.name}`]);
    addHeaders(ws7, ["时间段", "时长(分)", "环节", "目标", "活动", "促进者", "材料", "评估", "备注"]);
    m.sessions.forEach((s) => {
      addDataRows(ws7, [[s.timeSlot, String(s.duration), s.name, s.objective, s.activity, s.facilitator, s.materials, s.assessment, s.notes]]);
    });
    ws7.addRow([]);
  });

  // 08 Assessment
  const ws8 = wb.addWorksheet("08_评估体系");
  ws8.columns = Array(8).fill({ width: 18 });
  addHeaders(ws8, ["层级", "工具", "描述", "具体工具", "时机", "目标", "模块", "维度"]);
  project.assessments.forEach((a) => {
    addDataRows(ws8, [[a.level, a.name, a.description, a.tool, a.timing, a.target, a.module, a.dimension]]);
  });

  // 09 Facilitators
  const ws9 = wb.addWorksheet("09_讲师管理");
  ws9.columns = Array(11).fill({ width: 16 });
  addHeaders(ws9, ["姓名", "师资来源", "专业", "资质", "模块", "天数", "日费", "总费", "合同", "评分", "联系"]);
  project.facilitators.forEach((f) => {
    addDataRows(ws9, [[f.name, f.source, f.expertise, f.credentials, f.module, String(f.days), String(f.dailyRate), String(f.totalFee), f.contractStatus, f.lastScore, f.contact]]);
  });

  // 10 Calendar
  const ws10 = wb.addWorksheet("10_运营日历");
  ws10.columns = Array(10).fill({ width: 16 });
  addHeaders(ws10, ["类型", "活动", "月份", "周次", "日期", "摘要", "主责", "协同", "人数", "状态"]);
  project.calendarEvents.forEach((e) => {
    addDataRows(ws10, [[e.type, e.name, e.month, e.week, e.date, e.summary, e.responsible, e.coworker, e.headcount, e.status]]);
  });

  // 11 Learners
  const ws11 = wb.addWorksheet("11_学员管理");
  ws11.columns = Array(11).fill({ width: 14 });
  addHeaders(ws11, ["姓名", "部门", "岗位", "工龄", "管理年限", "主管", "电话", "邮箱", "加入日期", "类型", "编号"]);
  project.learners.forEach((l) => {
    addDataRows(ws11, [[l.name, l.department, l.position, l.yearsWork, l.yearsMgmt, l.supervisor, l.phone, l.email, l.joinDate, l.learnerType, l.fileNo]]);
  });

  // 12 Budget
  const ws12 = wb.addWorksheet("12_预算追踪");
  ws12.columns = Array(10).fill({ width: 14 });
  addHeaders(ws12, ["类别", "项目", "类型", "计划单价", "计划数量", "计划小计", "实际单价", "实际数量", "实际小计", "状态"]);
  project.budgetItems.forEach((b) => {
    addDataRows(ws12, [[b.category, b.itemName, b.feeType, String(b.planPrice), String(b.planQty), String(b.planTotal), String(b.actualPrice), String(b.actualQty), String(b.actualTotal), b.status]]);
  });

  // 13 Communication
  const ws13 = wb.addWorksheet("13_沟通计划");
  ws13.columns = Array(8).fill({ width: 18 });
  addHeaders(ws13, ["干系人", "信息需求", "目的", "频次", "渠道", "格式", "发起方", "反馈"]);
  project.commPlans.forEach((c) => {
    addDataRows(ws13, [[c.stakeholder, c.infoNeeds, c.purpose, c.frequency, c.channel, c.format, c.initiator, c.feedback]]);
  });

  // 14 Risks
  const ws14 = wb.addWorksheet("14_风险管理");
  ws14.columns = Array(10).fill({ width: 16 });
  addHeaders(ws14, ["ID", "描述", "类别", "概率", "影响", "风险分", "策略", "措施", "责任人", "状态"]);
  project.risks.forEach((r) => {
    addDataRows(ws14, [[r.riskId, r.description, r.category, String(r.probability), String(r.impact), String(r.riskScore), r.strategy, r.measures, r.owner, r.status]]);
  });

  // 15 Action Learning
  const ws15a = wb.addWorksheet("15_行动学习");
  ws15a.columns = Array(10).fill({ width: 18 });
  addHeaders(ws15a, ["小组名称", "课题", "成员", "导师", "阶段", "里程碑1", "里程碑2", "里程碑3", "交付物", "评分"]);
  project.actionTeams.forEach((t) => {
    addDataRows(ws15a, [[t.teamName, t.topic, t.members, t.mentor, t.phase, `${t.milestone1}(${t.milestone1Status})`, `${t.milestone2}(${t.milestone2Status})`, `${t.milestone3}(${t.milestone3Status})`, t.deliverable, t.score]]);
  });

  // 16 Coaching
  const ws16 = wb.addWorksheet("16_教练辅导");
  ws16.columns = Array(10).fill({ width: 18 });
  addHeaders(ws16, ["学员", "教练", "类型", "目标", "阶段", "计划次数", "已完成", "前测", "后测", "成果"]);
  project.coachingSessions.forEach((c) => {
    addDataRows(ws16, [[c.coacheeName, c.coachName, c.coachType, c.goal, c.phase, String(c.sessionsPlanned), String(c.sessionsCompleted), c.preScore, c.postScore, c.outcome]]);
  });

  // 17 Review
  const ws15 = wb.addWorksheet("17_项目复盘");
  ws15.columns = [{ width: 25 }, { width: 60 }];
  const rv = project.review;
  if (rv) {
    addHeaders(ws15, ["项目", "内容"]);
    addDataRows(ws15, [
      ["AAR - 目标", rv.aarGoal],
      ["AAR - 结果", rv.aarResult],
      ["AAR - 差异", rv.aarDiff],
      ["AAR - 根因", rv.aarCause],
      ["值得保持", rv.aarKeep],
      ["需要改进", rv.aarImprove],
      ["项目亮点", rv.highlights],
      ["下年计划", rv.nextPlan],
    ]);
  }

  const buffer = await wb.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(project.name)}.xlsx"`,
    },
  });
}

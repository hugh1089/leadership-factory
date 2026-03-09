"use server";

import { prisma } from "./db";
import { getSession, hashPassword, verifyPassword, createSessionToken } from "./auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { TOTAL_STEPS } from "@/lib/steps";

// Auth actions — unified password entry
export async function enterPlatformAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) throw new Error("请填写邮箱和访问密码");

  const accessPassword = process.env.ACCESS_PASSWORD || "leadershipfactory";
  const adminPassword = process.env.ADMIN_PASSWORD || "Leadershipfactory";

  const isAdmin = password === adminPassword;
  const isUser = password === accessPassword;

  if (!isAdmin && !isUser) throw new Error("访问密码不正确，请联系管理员获取");

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const hashed = await hashPassword(password);
    user = await prisma.user.create({
      data: { name: email.split("@")[0], email, password: hashed, role: isAdmin ? "admin" : "user" },
    });
  } else if (isAdmin && user.role !== "admin") {
    user = await prisma.user.update({ where: { id: user.id }, data: { role: "admin" } });
  }

  const token = createSessionToken(user.id);
  const cookieStore = await cookies();
  cookieStore.set("session_token", token, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 30 });
  redirect("/dashboard");
}

export async function registerAction(formData: FormData) {
  return enterPlatformAction(formData);
}

export async function loginAction(formData: FormData) {
  return enterPlatformAction(formData);
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("session_token");
  redirect("/");
}

// Project actions
export async function createProject(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/");

  const name = formData.get("name") as string;
  const org = (formData.get("org") as string) || "";
  const description = (formData.get("description") as string) || "";

  const project = await prisma.project.create({
    data: {
      name,
      org,
      description,
      userId: session.user.id,
      charter: { create: { projectName: name, orgName: org } },
      review: { create: {} },
      stepStatus: {
        create: Array.from({ length: TOTAL_STEPS }, (_, i) => ({
          step: i + 1,
          status: i === 0 ? "in_progress" : "pending",
        })),
      },
    },
  });

  redirect(`/projects/${project.id}/charter`);
}

export async function deleteProject(projectId: string) {
  const session = await getSession();
  if (!session) redirect("/");
  await prisma.project.delete({ where: { id: projectId, userId: session.user.id } });
  revalidatePath("/dashboard");
}

export async function updateStepStatus(projectId: string, step: number, status: string) {
  await prisma.stepStatus.upsert({
    where: { projectId_step: { projectId, step } },
    update: { status },
    create: { projectId, step, status },
  });
  if (status === "completed" && step < TOTAL_STEPS) {
    await prisma.stepStatus.upsert({
      where: { projectId_step: { projectId, step: step + 1 } },
      update: { status: "in_progress" },
      create: { projectId, step: step + 1, status: "in_progress" },
    });
  }
  await prisma.project.update({
    where: { id: projectId },
    data: { currentStep: status === "completed" ? Math.min(step + 1, TOTAL_STEPS) : step },
  });
  revalidatePath(`/projects/${projectId}`);
}

// Charter actions
export async function saveCharter(projectId: string, data: Record<string, string>) {
  await prisma.charter.upsert({
    where: { projectId },
    update: data,
    create: { ...data, projectId },
  });
  revalidatePath(`/projects/${projectId}/charter`);
}

// Stakeholder actions
export async function saveStakeholders(projectId: string, stakeholders: Array<Record<string, string>>) {
  await prisma.stakeholder.deleteMany({ where: { projectId } });
  if (stakeholders.length > 0) {
    await prisma.stakeholder.createMany({
      data: stakeholders.map((s) => ({ ...s, projectId })),
    });
  }
  revalidatePath(`/projects/${projectId}/charter`);
}

// TNA actions
export async function saveBusinessNeeds(projectId: string, items: Array<Record<string, string>>) {
  await prisma.businessNeed.deleteMany({ where: { projectId } });
  if (items.length > 0) {
    await prisma.businessNeed.createMany({
      data: items.map((item) => ({ ...item, projectId })),
    });
  }
  revalidatePath(`/projects/${projectId}/tna`);
}

export async function saveCompetencyGaps(projectId: string, items: Array<Record<string, unknown>>) {
  await prisma.competencyGap.deleteMany({ where: { projectId } });
  if (items.length > 0) {
    await prisma.competencyGap.createMany({
      data: items.map((item) => ({
        dimension: (item.dimension as string) || "",
        targetGroup: (item.targetGroup as string) || "",
        currentLevel: Number(item.currentLevel) || 0,
        requiredLevel: Number(item.requiredLevel) || 0,
        gapScore: Number(item.gapScore) || 0,
        recommendation: (item.recommendation as string) || "",
        method: (item.method as string) || "",
        priority: (item.priority as string) || "中",
        projectId,
      })),
    });
  }
  revalidatePath(`/projects/${projectId}/tna`);
}

// Persona actions
export async function savePersonas(projectId: string, items: Array<Record<string, string>>) {
  await prisma.learnerPersona.deleteMany({ where: { projectId } });
  if (items.length > 0) {
    await prisma.learnerPersona.createMany({
      data: items.map((item) => ({ ...item, projectId })),
    });
  }
  revalidatePath(`/projects/${projectId}/persona`);
}

// Objectives actions
export async function saveObjectives(projectId: string, items: Array<Record<string, unknown>>) {
  await prisma.learningObjective.deleteMany({ where: { projectId } });
  if (items.length > 0) {
    await prisma.learningObjective.createMany({
      data: items.map((item) => ({
        moduleName: (item.moduleName as string) || "",
        objective: (item.objective as string) || "",
        bloomLevel: (item.bloomLevel as string) || "",
        competency: (item.competency as string) || "",
        businessGoal: (item.businessGoal as string) || "",
        assessMethod: (item.assessMethod as string) || "",
        assessTiming: (item.assessTiming as string) || "",
        difficulty: Number(item.difficulty) || 3,
        projectId,
      })),
    });
  }
  revalidatePath(`/projects/${projectId}/objectives`);
}

// Journey actions
export async function saveJourneyPhases(projectId: string, items: Array<Record<string, unknown>>) {
  await prisma.journeyPhase.deleteMany({ where: { projectId } });
  if (items.length > 0) {
    await prisma.journeyPhase.createMany({
      data: items.map((item, i) => ({
        phase: (item.phase as string) || "",
        duration: (item.duration as string) || "",
        startDate: (item.startDate as string) || "",
        description: (item.description as string) || "",
        activities: (item.activities as string) || "",
        emotion: (item.emotion as string) || "",
        intervention: (item.intervention as string) || "",
        responsible: (item.responsible as string) || "",
        criteria: (item.criteria as string) || "",
        sortOrder: i,
        projectId,
      })),
    });
  }
  revalidatePath(`/projects/${projectId}/journey`);
}

// Curriculum actions
export async function saveCurriculumModules(projectId: string, items: Array<Record<string, unknown>>) {
  const existing = await prisma.curriculumModule.findMany({ where: { projectId }, select: { id: true } });
  for (const e of existing) {
    await prisma.sessionPlan.deleteMany({ where: { moduleId: e.id } });
  }
  await prisma.curriculumModule.deleteMany({ where: { projectId } });
  if (items.length > 0) {
    await prisma.curriculumModule.createMany({
      data: items.map((item, i) => ({
        code: (item.code as string) || "",
        name: (item.name as string) || "",
        topic: (item.topic as string) || "",
        objective: (item.objective as string) || "",
        outline: (item.outline as string) || "",
        method: (item.method as string) || "",
        format: (item.format as string) || "",
        hours: Number(item.hours) || 0,
        facilitatorType: (item.facilitatorType as string) || "",
        competency: (item.competency as string) || "",
        businessAlign: (item.businessAlign as string) || "",
        sortOrder: i,
        projectId,
      })),
    });
  }
  revalidatePath(`/projects/${projectId}/curriculum`);
}

// Session plans
export async function saveSessionPlans(moduleId: string, items: Array<Record<string, unknown>>, projectId: string) {
  await prisma.sessionPlan.deleteMany({ where: { moduleId } });
  if (items.length > 0) {
    await prisma.sessionPlan.createMany({
      data: items.map((item, i) => ({
        timeSlot: (item.timeSlot as string) || "",
        duration: Number(item.duration) || 0,
        name: (item.name as string) || "",
        objective: (item.objective as string) || "",
        activity: (item.activity as string) || "",
        facilitator: (item.facilitator as string) || "",
        materials: (item.materials as string) || "",
        assessment: (item.assessment as string) || "",
        notes: (item.notes as string) || "",
        sortOrder: i,
        moduleId,
      })),
    });
  }
  revalidatePath(`/projects/${projectId}/sessions`);
}

// Assessment actions
export async function saveAssessments(projectId: string, items: Array<Record<string, string>>) {
  await prisma.assessment.deleteMany({ where: { projectId } });
  if (items.length > 0) {
    await prisma.assessment.createMany({
      data: items.map((item) => ({ ...item, projectId })),
    });
  }
  revalidatePath(`/projects/${projectId}/assessment`);
}

// Facilitator actions
export async function saveFacilitators(projectId: string, items: Array<Record<string, unknown>>) {
  await prisma.facilitator.deleteMany({ where: { projectId } });
  if (items.length > 0) {
    await prisma.facilitator.createMany({
      data: items.map((item) => ({
        name: (item.name as string) || "",
        source: (item.source as string) || "",
        expertise: (item.expertise as string) || "",
        credentials: (item.credentials as string) || "",
        module: (item.module as string) || "",
        days: Number(item.days) || 0,
        dailyRate: Number(item.dailyRate) || 0,
        totalFee: Number(item.totalFee) || 0,
        contractStatus: (item.contractStatus as string) || "pending",
        lastScore: (item.lastScore as string) || "",
        renew: (item.renew as string) || "",
        contact: (item.contact as string) || "",
        projectId,
      })),
    });
  }
  revalidatePath(`/projects/${projectId}/facilitators`);
}

// Calendar events
export async function saveCalendarEvents(projectId: string, items: Array<Record<string, unknown>>) {
  await prisma.calendarEvent.deleteMany({ where: { projectId } });
  if (items.length > 0) {
    await prisma.calendarEvent.createMany({
      data: items.map((item, i) => ({
        type: (item.type as string) || "",
        name: (item.name as string) || "",
        month: (item.month as string) || "",
        week: (item.week as string) || "",
        date: (item.date as string) || "",
        activityType: (item.activityType as string) || "",
        summary: (item.summary as string) || "",
        responsible: (item.responsible as string) || "",
        coworker: (item.coworker as string) || "",
        headcount: (item.headcount as string) || "",
        status: (item.status as string) || "pending",
        sortOrder: i,
        projectId,
      })),
    });
  }
  revalidatePath(`/projects/${projectId}/calendar`);
}

// Learner actions
export async function saveLearners(projectId: string, items: Array<Record<string, string>>) {
  await prisma.learner.deleteMany({ where: { projectId } });
  if (items.length > 0) {
    await prisma.learner.createMany({
      data: items.map((item) => ({ ...item, projectId })),
    });
  }
  revalidatePath(`/projects/${projectId}/learners`);
}

// Budget actions
export async function saveBudgetItems(projectId: string, items: Array<Record<string, unknown>>) {
  await prisma.budgetItem.deleteMany({ where: { projectId } });
  if (items.length > 0) {
    await prisma.budgetItem.createMany({
      data: items.map((item) => ({
        category: (item.category as string) || "",
        itemName: (item.itemName as string) || "",
        feeType: (item.feeType as string) || "",
        planPrice: Number(item.planPrice) || 0,
        planQty: Number(item.planQty) || 0,
        planTotal: Number(item.planTotal) || 0,
        actualPrice: Number(item.actualPrice) || 0,
        actualQty: Number(item.actualQty) || 0,
        actualTotal: Number(item.actualTotal) || 0,
        variance: Number(item.variance) || 0,
        status: (item.status as string) || "pending",
        notes: (item.notes as string) || "",
        projectId,
      })),
    });
  }
  revalidatePath(`/projects/${projectId}/budget`);
}

// Communication plan actions
export async function saveCommPlans(projectId: string, items: Array<Record<string, string>>) {
  await prisma.communicationPlan.deleteMany({ where: { projectId } });
  if (items.length > 0) {
    await prisma.communicationPlan.createMany({
      data: items.map((item) => ({ ...item, projectId })),
    });
  }
  revalidatePath(`/projects/${projectId}/communication`);
}

// Risk actions
export async function saveRisks(projectId: string, items: Array<Record<string, unknown>>) {
  await prisma.risk.deleteMany({ where: { projectId } });
  if (items.length > 0) {
    await prisma.risk.createMany({
      data: items.map((item) => ({
        riskId: (item.riskId as string) || "",
        description: (item.description as string) || "",
        category: (item.category as string) || "",
        probability: Number(item.probability) || 1,
        impact: Number(item.impact) || 1,
        riskScore: Number(item.riskScore) || 1,
        strategy: (item.strategy as string) || "",
        measures: (item.measures as string) || "",
        owner: (item.owner as string) || "",
        status: (item.status as string) || "监控中",
        projectId,
      })),
    });
  }
  revalidatePath(`/projects/${projectId}/risks`);
}

// Action Learning actions
export async function saveActionTeams(projectId: string, items: Array<Record<string, unknown>>) {
  await prisma.actionLearningTeam.deleteMany({ where: { projectId } });
  if (items.length > 0) {
    await prisma.actionLearningTeam.createMany({
      data: items.map((item) => ({
        teamName: (item.teamName as string) || "",
        topic: (item.topic as string) || "",
        description: (item.description as string) || "",
        members: (item.members as string) || "",
        mentor: (item.mentor as string) || "",
        phase: (item.phase as string) || "组建",
        startDate: (item.startDate as string) || "",
        endDate: (item.endDate as string) || "",
        milestone1: (item.milestone1 as string) || "",
        milestone1Date: (item.milestone1Date as string) || "",
        milestone1Status: (item.milestone1Status as string) || "pending",
        milestone2: (item.milestone2 as string) || "",
        milestone2Date: (item.milestone2Date as string) || "",
        milestone2Status: (item.milestone2Status as string) || "pending",
        milestone3: (item.milestone3 as string) || "",
        milestone3Date: (item.milestone3Date as string) || "",
        milestone3Status: (item.milestone3Status as string) || "pending",
        deliverable: (item.deliverable as string) || "",
        progressLog: (item.progressLog as string) || "",
        score: (item.score as string) || "",
        feedback: (item.feedback as string) || "",
        projectId,
      })),
    });
  }
  revalidatePath(`/projects/${projectId}/action-learning`);
}

// Coaching actions
export async function saveCoachingEngagements(projectId: string, items: Array<Record<string, unknown>>) {
  await prisma.coachingEngagement.deleteMany({ where: { projectId } });
  if (items.length > 0) {
    await prisma.coachingEngagement.createMany({
      data: items.map((item) => ({
        coacheeName: (item.coacheeName as string) || "",
        coachName: (item.coachName as string) || "",
        coachType: (item.coachType as string) || "",
        goal: (item.goal as string) || "",
        goalSmart: (item.goalSmart as string) || "",
        phase: (item.phase as string) || "匹配",
        sessionsPlanned: Number(item.sessionsPlanned) || 6,
        sessionsCompleted: Number(item.sessionsCompleted) || 0,
        sessionLog: (item.sessionLog as string) || "[]",
        startDate: (item.startDate as string) || "",
        endDate: (item.endDate as string) || "",
        preScore: (item.preScore as string) || "",
        postScore: (item.postScore as string) || "",
        outcome: (item.outcome as string) || "",
        coacheeReflection: (item.coacheeReflection as string) || "",
        managerFeedback: (item.managerFeedback as string) || "",
        projectId,
      })),
    });
  }
  revalidatePath(`/projects/${projectId}/coaching`);
}

// Knowledge file actions
export async function saveKnowledgeFile(projectId: string, data: Record<string, string>) {
  await prisma.knowledgeFile.create({
    data: {
      stepKey: data.stepKey || "",
      title: data.title || "",
      fileType: data.fileType || "",
      category: data.category || "",
      description: data.description || "",
      fileName: data.fileName || "",
      fileSize: Number(data.fileSize) || 0,
      filePath: data.filePath || "",
      uploadedBy: data.uploadedBy || "",
      projectId,
    },
  });
  revalidatePath(`/projects/${projectId}/knowledge`);
}

export async function deleteKnowledgeFile(fileId: string, projectId: string) {
  await prisma.knowledgeFile.delete({ where: { id: fileId } });
  revalidatePath(`/projects/${projectId}/knowledge`);
}

// Review actions
export async function saveReview(projectId: string, data: Record<string, string>) {
  await prisma.review.upsert({
    where: { projectId },
    update: data,
    create: { ...data, projectId },
  });
  revalidatePath(`/projects/${projectId}/review`);
}

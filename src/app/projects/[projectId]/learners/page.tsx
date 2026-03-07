import { prisma } from "@/lib/db";
import { StepPage } from "@/components/layout/step-page";
import { LearnersForm } from "./learners-form";

export default async function LearnersPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const [learners, stepStatus] = await Promise.all([
    prisma.learner.findMany({ where: { projectId } }),
    prisma.stepStatus.findUnique({ where: { projectId_step: { projectId, step: 12 } } }),
  ]);

  return (
    <StepPage
      projectId={projectId}
      stepNumber={12}
      title="学员管理"
      titleEn="Learner Management"
      description="管理学员花名册、出勤记录和成绩追踪"
      status={stepStatus?.status || "pending"}
      hints={[
        "学员人数将影响预算计算（人均成本）",
        "档案编号建议使用统一格式如 LP-2026-001",
        "出勤和成绩数据可在项目执行阶段持续更新",
      ]}
    >
      <LearnersForm projectId={projectId} learners={learners} />
    </StepPage>
  );
}

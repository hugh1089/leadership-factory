import { prisma } from "@/lib/db";
import { StepPage } from "@/components/layout/step-page";
import { ObjectivesForm } from "./objectives-form";

export default async function ObjectivesPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const [objectives, competencyGaps, stepStatus] = await Promise.all([
    prisma.learningObjective.findMany({ where: { projectId } }),
    prisma.competencyGap.findMany({ where: { projectId } }),
    prisma.stepStatus.findUnique({ where: { projectId_step: { projectId, step: 4 } } }),
  ]);

  return (
    <StepPage
      projectId={projectId}
      stepNumber={4}
      title="学习目标矩阵"
      titleEn="Learning Objectives Matrix"
      description="将能力差距转化为可衡量的学习目标，对齐业务需求"
      status={stepStatus?.status || "pending"}
      hints={[
        "学习目标使用SMART原则表述：具体、可衡量、可达成、相关、有时限",
        "布鲁姆层级从L1(记忆)到L6(创造)，层级越高越深入",
        "如果已填写TNA能力差距，可点击「从TNA导入」自动填充",
      ]}
    >
      <ObjectivesForm projectId={projectId} objectives={objectives} competencyGaps={competencyGaps} />
    </StepPage>
  );
}

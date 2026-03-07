import { prisma } from "@/lib/db";
import { StepPage } from "@/components/layout/step-page";
import { TnaForm } from "./tna-form";

export default async function TnaPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const [businessNeeds, competencyGaps, stepStatus] = await Promise.all([
    prisma.businessNeed.findMany({ where: { projectId } }),
    prisma.competencyGap.findMany({ where: { projectId } }),
    prisma.stepStatus.findUnique({ where: { projectId_step: { projectId, step: 2 } } }),
  ]);

  return (
    <StepPage
      projectId={projectId}
      stepNumber={2}
      title="需求分析"
      titleEn="Training Needs Analysis"
      description="从业务需求出发，识别绩效差距，确定学习需求的优先级"
      status={stepStatus?.status || "pending"}
      hints={[
        "从业务挑战出发，而非从课程出发——先问「业务需要什么」，再问「培训能帮什么」",
        "能力差距 = 要求水平 - 当前水平，差距越大优先级越高",
        "能力差距数据将自动流入学习目标矩阵和课程架构",
      ]}
    >
      <TnaForm projectId={projectId} businessNeeds={businessNeeds} competencyGaps={competencyGaps} />
    </StepPage>
  );
}

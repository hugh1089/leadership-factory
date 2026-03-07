import { prisma } from "@/lib/db";
import { StepPage } from "@/components/layout/step-page";
import { JourneyForm } from "./journey-form";

export default async function JourneyPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const [phases, stepStatus] = await Promise.all([
    prisma.journeyPhase.findMany({ where: { projectId }, orderBy: { sortOrder: "asc" } }),
    prisma.stepStatus.findUnique({ where: { projectId_step: { projectId, step: 5 } } }),
  ]);

  return (
    <StepPage
      projectId={projectId}
      stepNumber={5}
      title="学习旅程地图"
      titleEn="Learning Journey Map"
      description="设计学员从启动到收尾的完整学习体验路径"
      status={stepStatus?.status || "pending"}
      hints={[
        "关注学员在每个阶段的情绪变化，在低谷期设计干预措施",
        "旅程地图不等于课程表——它包含正式学习、非正式学习和社交学习",
        "每个阶段都应有明确的成功标准和负责人",
      ]}
    >
      <JourneyForm projectId={projectId} phases={phases} />
    </StepPage>
  );
}

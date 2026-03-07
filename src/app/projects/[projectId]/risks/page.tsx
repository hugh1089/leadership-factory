import { prisma } from "@/lib/db";
import { StepPage } from "@/components/layout/step-page";
import { RisksForm } from "./risks-form";

export default async function RisksPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const [risks, stepStatus] = await Promise.all([
    prisma.risk.findMany({ where: { projectId } }),
    prisma.stepStatus.findUnique({ where: { projectId_step: { projectId, step: 14 } } }),
  ]);

  return (
    <StepPage
      projectId={projectId}
      stepNumber={14}
      title="风险管理"
      titleEn="Risk Management"
      description="识别、评估和管理项目风险"
      status={stepStatus?.status || "pending"}
      hints={[
        "风险等级 = 发生概率 x 影响程度（1-5分制）",
        "高风险（≥15分）需制定详细应对措施和责任人",
        "建议定期（每月）更新风险状态",
      ]}
    >
      <RisksForm projectId={projectId} risks={risks} />
    </StepPage>
  );
}

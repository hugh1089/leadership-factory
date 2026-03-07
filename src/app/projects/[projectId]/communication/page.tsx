import { prisma } from "@/lib/db";
import { StepPage } from "@/components/layout/step-page";
import { CommunicationForm } from "./communication-form";

export default async function CommunicationPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const [commPlans, stakeholders, stepStatus] = await Promise.all([
    prisma.communicationPlan.findMany({ where: { projectId } }),
    prisma.stakeholder.findMany({ where: { projectId } }),
    prisma.stepStatus.findUnique({ where: { projectId_step: { projectId, step: 13 } } }),
  ]);

  return (
    <StepPage
      projectId={projectId}
      stepNumber={13}
      title="沟通计划"
      titleEn="Communication Plan"
      description="制定干系人沟通策略，确保信息畅通"
      status={stepStatus?.status || "pending"}
      hints={[
        "干系人列表可从项目章程自动导入",
        "为每个干系人群体定制沟通内容、频次和渠道",
        "明确信息发起方和反馈机制，确保双向沟通",
      ]}
    >
      <CommunicationForm projectId={projectId} commPlans={commPlans} stakeholders={stakeholders} />
    </StepPage>
  );
}

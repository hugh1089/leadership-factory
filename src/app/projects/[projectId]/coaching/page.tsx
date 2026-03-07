import { prisma } from "@/lib/db";
import { StepPage } from "@/components/layout/step-page";
import { CoachingForm } from "./coaching-form";

export default async function CoachingPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const [engagements, learners, stepStatus] = await Promise.all([
    prisma.coachingEngagement.findMany({ where: { projectId } }),
    prisma.learner.findMany({ where: { projectId }, select: { name: true, position: true } }),
    prisma.stepStatus.findUnique({ where: { projectId_step: { projectId, step: 16 } } }),
  ]);

  return (
    <StepPage
      projectId={projectId}
      stepNumber={16}
      title="教练辅导"
      titleEn="Coaching & Mentoring"
      description="为学员匹配教练，设定SMART目标，跟踪辅导过程与成果"
      status={stepStatus?.status || "pending"}
      hints={[
        "教练辅导4阶段：教练匹配 → 目标设定 → 辅导实施 → 成果评估",
        "建议每位学员6-8次辅导会谈，每次45-60分钟",
        "辅导目标使用SMART原则：具体、可衡量、可达成、相关、有时限",
        "鼓励学员在每次辅导后记录反思，主管定期反馈行为变化",
      ]}
    >
      <CoachingForm projectId={projectId} engagements={engagements} learners={learners} />
    </StepPage>
  );
}

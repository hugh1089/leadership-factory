import { prisma } from "@/lib/db";
import { StepPage } from "@/components/layout/step-page";
import { ActionLearningForm } from "./action-learning-form";

export default async function ActionLearningPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const [teams, learners, stepStatus] = await Promise.all([
    prisma.actionLearningTeam.findMany({ where: { projectId } }),
    prisma.learner.findMany({ where: { projectId }, select: { name: true, department: true } }),
    prisma.stepStatus.findUnique({ where: { projectId_step: { projectId, step: 15 } } }),
  ]);

  return (
    <StepPage
      projectId={projectId}
      stepNumber={15}
      title="行动学习"
      titleEn="Action Learning"
      description="通过真实业务课题，以小组为单位进行问题解决和能力提升"
      status={stepStatus?.status || "pending"}
      hints={[
        "行动学习5阶段：组建团队 → 选题立项 → 调研分析 → 方案实施 → 成果汇报",
        "每个小组需明确课题、导师、里程碑和最终交付物",
        "建议4-6人一组，跨部门组合以激发多元视角",
        "里程碑之间安排导师辅导和阶段汇报，确保进度可控",
      ]}
    >
      <ActionLearningForm projectId={projectId} teams={teams} learners={learners} />
    </StepPage>
  );
}

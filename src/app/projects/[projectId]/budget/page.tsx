import { prisma } from "@/lib/db";
import { StepPage } from "@/components/layout/step-page";
import { BudgetForm } from "./budget-form";

export default async function BudgetPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const [budgetItems, facilitators, learners, stepStatus, project] = await Promise.all([
    prisma.budgetItem.findMany({ where: { projectId } }),
    prisma.facilitator.findMany({ where: { projectId } }),
    prisma.learner.findMany({ where: { projectId } }),
    prisma.stepStatus.findUnique({ where: { projectId_step: { projectId, step: 10 } } }),
    prisma.project.findUnique({ where: { id: projectId }, select: { revenue: true } }),
  ]);

  return (
    <StepPage
      projectId={projectId}
      stepNumber={10}
      title="预算追踪"
      titleEn="Budget Tracking"
      description="按类别管理项目预算，实时追踪差异"
      status={stepStatus?.status || "pending"}
      hints={[
        "预算分9大类别（A-I），每个类别下可细分费用项",
        "计划金额 vs 实际金额的差异会自动计算",
        "讲师费用可从讲师管理页面自动导入",
      ]}
    >
      <BudgetForm
        projectId={projectId}
        budgetItems={budgetItems}
        facilitatorCount={facilitators.length}
        learnerCount={learners.length}
        initialRevenue={project?.revenue || 0}
      />
    </StepPage>
  );
}

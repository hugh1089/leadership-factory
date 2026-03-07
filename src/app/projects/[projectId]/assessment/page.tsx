import { prisma } from "@/lib/db";
import { StepPage } from "@/components/layout/step-page";
import { AssessmentForm } from "./assessment-form";

export default async function AssessmentPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const [assessments, objectives, stepStatus] = await Promise.all([
    prisma.assessment.findMany({ where: { projectId } }),
    prisma.learningObjective.findMany({ where: { projectId } }),
    prisma.stepStatus.findUnique({ where: { projectId_step: { projectId, step: 8 } } }),
  ]);

  return (
    <StepPage
      projectId={projectId}
      stepNumber={8}
      title="评估体系"
      titleEn="Assessment System"
      description="基于Kirkpatrick四层模型设计完整的评估方案"
      status={stepStatus?.status || "pending"}
      hints={[
        "L1反应层：学员对培训的满意度（课后问卷）",
        "L2学习层：知识/技能的实际掌握（测试/实操）",
        "L3行为层：回到工作岗位后行为的变化（360反馈）",
        "L4结果层：对业务绩效的影响（KPI变化）",
      ]}
    >
      <AssessmentForm projectId={projectId} assessments={assessments} objectives={objectives} />
    </StepPage>
  );
}

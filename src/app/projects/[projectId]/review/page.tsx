import { prisma } from "@/lib/db";
import { StepPage } from "@/components/layout/step-page";
import { ReviewForm } from "./review-form";

export default async function ReviewPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const [review, assessments, stepStatus] = await Promise.all([
    prisma.review.findUnique({ where: { projectId } }),
    prisma.assessment.findMany({ where: { projectId } }),
    prisma.stepStatus.findUnique({ where: { projectId_step: { projectId, step: 17 } } }),
  ]);

  return (
    <StepPage
      projectId={projectId}
      stepNumber={17}
      title="项目复盘"
      titleEn="Project Review"
      description="全面复盘项目成果，提炼经验，为下一个项目积累知识资产"
      status={stepStatus?.status || "pending"}
      hints={[
        "使用AAR（After Action Review）四步法：目标→结果→差异→原因",
        "KPI数据可从评估体系自动关联",
        "复盘不是批评会，重点是「下次如何做得更好」",
      ]}
    >
      <ReviewForm projectId={projectId} review={review} assessments={assessments} />
    </StepPage>
  );
}

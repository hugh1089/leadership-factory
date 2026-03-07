import { prisma } from "@/lib/db";
import { StepPage } from "@/components/layout/step-page";
import { CurriculumForm } from "./curriculum-form";

export default async function CurriculumPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const [modules, stepStatus] = await Promise.all([
    prisma.curriculumModule.findMany({ where: { projectId }, orderBy: { sortOrder: "asc" } }),
    prisma.stepStatus.findUnique({ where: { projectId_step: { projectId, step: 6 } } }),
  ]);

  return (
    <StepPage
      projectId={projectId}
      stepNumber={6}
      title="课程架构"
      titleEn="Curriculum Architecture"
      description="设计模块化的课程体系，平衡70-20-10学习配比"
      status={stepStatus?.status || "pending"}
      hints={[
        "70-20-10法则：70%在岗实践，20%社交学习，10%正式培训",
        "每个模块应与学习目标和CAKE能力维度对齐",
        "课程模块数据将自动流入讲师管理、预算追踪和运营日历",
      ]}
    >
      <CurriculumForm projectId={projectId} modules={modules} />
    </StepPage>
  );
}

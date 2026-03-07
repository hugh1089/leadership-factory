import { prisma } from "@/lib/db";
import { StepPage } from "@/components/layout/step-page";
import { FacilitatorsForm } from "./facilitators-form";

export default async function FacilitatorsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const [facilitators, modules, stepStatus] = await Promise.all([
    prisma.facilitator.findMany({ where: { projectId } }),
    prisma.curriculumModule.findMany({ where: { projectId }, orderBy: { sortOrder: "asc" } }),
    prisma.stepStatus.findUnique({ where: { projectId_step: { projectId, step: 9 } } }),
  ]);

  return (
    <StepPage
      projectId={projectId}
      stepNumber={9}
      title="讲师供应商管理"
      titleEn="Facilitator Management"
      description="管理讲师资源，分配模块，跟踪合同状态"
      status={stepStatus?.status || "pending"}
      hints={[
        "讲师信息与课程模块自动关联——如果已填写课程架构，模块信息会自动带入",
        "记得跟踪合同状态和评分，为后续项目积累讲师评价数据",
        "讲师费用数据将自动流入预算追踪",
      ]}
    >
      <FacilitatorsForm projectId={projectId} facilitators={facilitators} modules={modules} />
    </StepPage>
  );
}

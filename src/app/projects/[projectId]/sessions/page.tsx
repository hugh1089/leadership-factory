import { prisma } from "@/lib/db";
import { StepPage } from "@/components/layout/step-page";
import { SessionsForm } from "./sessions-form";

export default async function SessionsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const [modules, stepStatus] = await Promise.all([
    prisma.curriculumModule.findMany({
      where: { projectId },
      include: { sessions: { orderBy: { sortOrder: "asc" } } },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.stepStatus.findUnique({ where: { projectId_step: { projectId, step: 7 } } }),
  ]);

  return (
    <StepPage
      projectId={projectId}
      stepNumber={7}
      title="单元设计详案"
      titleEn="Session Design Plans"
      description="为每个课程模块设计详细的教学时间表和活动方案"
      status={stepStatus?.status || "pending"}
      hints={[
        "先在「课程架构」中创建模块，这里会自动列出所有模块",
        "每个时间块包含：时间段、活动名称、教学目标、具体活动描述、所需材料",
        "建议每90分钟设置一次休息，注意学员注意力节奏",
      ]}
    >
      <SessionsForm projectId={projectId} modules={modules} />
    </StepPage>
  );
}

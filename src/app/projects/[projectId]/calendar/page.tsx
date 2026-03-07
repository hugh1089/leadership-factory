import { prisma } from "@/lib/db";
import { StepPage } from "@/components/layout/step-page";
import { CalendarForm } from "./calendar-form";

export default async function CalendarPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const [events, modules, stepStatus] = await Promise.all([
    prisma.calendarEvent.findMany({ where: { projectId }, orderBy: { sortOrder: "asc" } }),
    prisma.curriculumModule.findMany({ where: { projectId }, orderBy: { sortOrder: "asc" } }),
    prisma.stepStatus.findUnique({ where: { projectId_step: { projectId, step: 11 } } }),
  ]);

  return (
    <StepPage
      projectId={projectId}
      stepNumber={11}
      title="运营主日历"
      titleEn="Operations Calendar"
      description="规划项目里程碑和月度运营活动"
      status={stepStatus?.status || "pending"}
      hints={[
        "先设定关键里程碑，再填充月度活动计划",
        "课程模块可自动生成日历事件",
        "建议使用颜色标记区分活动类型：启动/培训/考核/社交",
      ]}
    >
      <CalendarForm projectId={projectId} events={events} modules={modules} />
    </StepPage>
  );
}

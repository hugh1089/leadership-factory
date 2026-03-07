import { prisma } from "@/lib/db";
import { StepPage } from "@/components/layout/step-page";
import { CharterForm } from "./charter-form";

export default async function CharterPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const [charter, stakeholders, stepStatus] = await Promise.all([
    prisma.charter.findUnique({ where: { projectId } }),
    prisma.stakeholder.findMany({ where: { projectId } }),
    prisma.stepStatus.findUnique({ where: { projectId_step: { projectId, step: 1 } } }),
  ]);

  return (
    <StepPage
      projectId={projectId}
      stepNumber={1}
      title="项目章程"
      titleEn="Project Charter"
      description="定义项目范围、目标、关键干系人和成功标准"
      status={stepStatus?.status || "pending"}
      hints={[
        "项目章程是项目的「身份证」，明确项目为什么做、做什么、谁来做",
        "干系人分析是沟通计划的基础，请尽量详细填写",
        "成功标准建议使用SMART原则（具体、可衡量、可达成、相关、有时限）",
      ]}
    >
      <CharterForm
        projectId={projectId}
        charter={charter}
        stakeholders={stakeholders}
      />
    </StepPage>
  );
}

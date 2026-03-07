import { prisma } from "@/lib/db";
import { StepPage } from "@/components/layout/step-page";
import { PersonaForm } from "./persona-form";

export default async function PersonaPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const [personas, stepStatus] = await Promise.all([
    prisma.learnerPersona.findMany({ where: { projectId } }),
    prisma.stepStatus.findUnique({ where: { projectId_step: { projectId, step: 3 } } }),
  ]);

  return (
    <StepPage
      projectId={projectId}
      stepNumber={3}
      title="学员画像"
      titleEn="Learner Persona"
      description="刻画典型学员特征，为教学设计提供依据"
      status={stepStatus?.status || "pending"}
      hints={[
        "画像不是「平均值」，而是「典型代表」——每个画像代表一类学员",
        "关注学员的学习动机、痛点和偏好，这直接影响教学设计",
        "建议创建2-4个画像，覆盖主要学员类型",
      ]}
    >
      <PersonaForm projectId={projectId} personas={personas} />
    </StepPage>
  );
}

import { prisma } from "@/lib/db";
import { StepPage } from "@/components/layout/step-page";
import { ExportPanel } from "./export-panel";

export default async function ExportPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { stepStatus: true },
  });

  if (!project) return null;

  const completed = project.stepStatus.filter((s) => s.status === "completed").length;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">导出项目</h1>
      <p className="text-muted-foreground mb-6">{project.name} · 已完成 {completed}/15 步骤</p>
      <ExportPanel projectId={projectId} projectName={project.name} />
    </div>
  );
}

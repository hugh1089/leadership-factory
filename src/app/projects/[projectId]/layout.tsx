import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProjectSidebar } from "@/components/layout/project-sidebar";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/");

  const { projectId } = await params;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { stepStatus: { orderBy: { step: "asc" } } },
  });

  if (!project) redirect("/dashboard");

  return (
    <div className="min-h-screen flex bg-slate-50">
      <ProjectSidebar
        projectId={project.id}
        projectName={project.name}
        stepStatuses={project.stepStatus.map((s) => ({ step: s.step, status: s.status }))}
      />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

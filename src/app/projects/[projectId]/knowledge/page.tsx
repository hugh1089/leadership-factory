import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { KnowledgePanel } from "./knowledge-panel";
import { STEPS } from "@/lib/steps";

export default async function KnowledgePage({ params }: { params: Promise<{ projectId: string }> }) {
  const session = await getSession();
  if (!session) redirect("/");
  const { projectId } = await params;

  const files = await prisma.knowledgeFile.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });

  const stepOptions = STEPS.map((s) => ({ key: s.key, label: `${s.icon} ${s.label}` }));

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">📁</span>
          <h1 className="text-2xl font-bold">知识管理中心</h1>
          <span className="text-sm text-muted-foreground">Knowledge Management</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          集中管理项目全程的文档、作业、反思、模板等知识资产。支持按步骤分类上传，一键批量下载。
        </p>
      </div>
      <KnowledgePanel
        projectId={projectId}
        files={files}
        stepOptions={stepOptions}
        userName={session.user.name || session.user.email}
      />
    </div>
  );
}

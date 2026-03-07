import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createProject, deleteProject, logoutAction } from "@/lib/actions";
import Link from "next/link";
import { STEPS, TOTAL_STEPS } from "@/lib/steps";

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  draft: { label: "草稿", variant: "secondary" },
  in_progress: { label: "进行中", variant: "default" },
  completed: { label: "已完成", variant: "outline" },
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/");

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    include: { stepStatus: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">LF</div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Leadership Factory</h1>
              <p className="text-sm text-slate-500">学习项目设计全景工作台</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{session.user.name || session.user.email}</span>
            {session.user.role === "admin" && (
              <Link href="/admin"><Button variant="outline" size="sm">管理后台</Button></Link>
            )}
            <form action={logoutAction}>
              <Button variant="ghost" size="sm" type="submit">退出</Button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4">我的项目</h2>
            {projects.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  还没有项目，请在右侧创建第一个项目
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => {
                  const completed = project.stepStatus.filter((s) => s.status === "completed").length;
                  const progress = Math.round((completed / TOTAL_STEPS) * 100);
                  const currentStep = STEPS.find((s) => s.step === project.currentStep);
                  return (
                    <Card key={project.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="py-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <Link
                                href={`/projects/${project.id}/${currentStep?.route || "charter"}`}
                                className="text-lg font-semibold hover:text-primary"
                              >
                                {project.name}
                              </Link>
                              <Badge variant={STATUS_MAP[project.status]?.variant || "secondary"}>
                                {STATUS_MAP[project.status]?.label || project.status}
                              </Badge>
                            </div>
                            {project.org && <p className="text-sm text-slate-500 mb-2">{project.org}</p>}
                            {project.description && <p className="text-sm text-slate-600 mb-3">{project.description}</p>}
                            <div className="flex items-center gap-4">
                              <div className="flex-1 bg-slate-100 rounded-full h-2 max-w-xs">
                                <div
                                  className="bg-primary h-2 rounded-full transition-all"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <span className="text-xs text-slate-500">{progress}% ({completed}/{TOTAL_STEPS}步)</span>
                              {currentStep && (
                                <span className="text-xs text-slate-400">
                                  当前: {currentStep.icon} {currentStep.label}
                                </span>
                              )}
                            </div>
                          </div>
                          <form action={deleteProject.bind(null, project.id)}>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                              删除
                            </Button>
                          </form>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">创建新项目</h2>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">项目信息</CardTitle>
              </CardHeader>
              <CardContent>
                <form action={createProject} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">项目名称 *</Label>
                    <Input id="name" name="name" placeholder="如：2026年中层领导力发展项目" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="org">所属组织</Label>
                    <Input id="org" name="org" placeholder="如：XX集团人力资源部" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">项目简述</Label>
                    <Textarea id="description" name="description" placeholder="简要描述项目背景和目标..." rows={3} />
                  </div>
                  <Button type="submit" className="w-full">创建项目</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

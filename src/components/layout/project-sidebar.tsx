"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { STEPS, PHASES, EXTRA_ROUTES, TOTAL_STEPS, getStepsByPhase } from "@/lib/steps";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/lib/actions";

interface Props {
  projectId: string;
  projectName: string;
  stepStatuses: Array<{ step: number; status: string }>;
}

const statusIcon: Record<string, string> = {
  completed: "✅",
  in_progress: "🔵",
  pending: "⚪",
};

export function ProjectSidebar({ projectId, projectName, stepStatuses }: Props) {
  const pathname = usePathname();
  const completedCount = stepStatuses.filter((s) => s.status === "completed").length;
  const progress = Math.round((completedCount / TOTAL_STEPS) * 100);

  return (
    <aside className="w-64 bg-slate-900 flex flex-col h-screen sticky top-0 shrink-0">
      <div className="p-4 border-b border-slate-700 shrink-0">
        <Link href="/dashboard" className="text-xs text-slate-400 hover:text-white transition-colors">
          ← 返回项目列表
        </Link>
        <h2 className="font-semibold text-sm mt-2 truncate text-white" title={projectName}>{projectName}</h2>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 bg-slate-700 rounded-full h-1.5">
            <div className="bg-blue-400 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs text-slate-400">{progress}%</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <nav className="p-2 pb-4">
          {PHASES.map((phase) => {
            const phaseSteps = getStepsByPhase(phase.id);
            return (
              <div key={phase.id} className="mb-2">
                <div className="px-2 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  {phase.label}
                </div>
                {phaseSteps.map((step) => {
                  const ss = stepStatuses.find((s) => s.step === step.step);
                  const isActive = pathname.includes(`/${step.route}`);
                  return (
                    <Link
                      key={step.step}
                      href={`/projects/${projectId}/${step.route}`}
                      className={cn(
                        "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-colors",
                        isActive
                          ? "bg-blue-600/20 text-blue-300 font-medium"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      )}
                    >
                      <span className="text-[10px] shrink-0">{statusIcon[ss?.status || "pending"]}</span>
                      <span className="text-[10px] shrink-0">{step.icon}</span>
                      <span className="truncate">{step.label}</span>
                    </Link>
                  );
                })}
              </div>
            );
          })}

          <div className="mb-2 border-t border-slate-700 pt-2 mt-2">
            <div className="px-2 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              知识中心
            </div>
            {EXTRA_ROUTES.map((route) => {
              const isActive = pathname.includes(`/${route.route}`);
              return (
                <Link
                  key={route.key}
                  href={`/projects/${projectId}/${route.route}`}
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-colors",
                    isActive
                      ? "bg-blue-600/20 text-blue-300 font-medium"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <span className="text-[10px] shrink-0">{route.icon}</span>
                  <span className="truncate">{route.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      <div className="p-3 border-t border-slate-700 shrink-0">
        <Link href={`/projects/${projectId}/export`}>
          <Button variant="outline" size="sm" className="w-full mb-2 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white">
            导出 Excel
          </Button>
        </Link>
        <form action={logoutAction}>
          <Button variant="ghost" size="sm" className="w-full text-slate-400 hover:text-white hover:bg-slate-800" type="submit">退出登录</Button>
        </form>
      </div>
    </aside>
  );
}

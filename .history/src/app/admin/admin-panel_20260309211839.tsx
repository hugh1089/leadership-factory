"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

interface ProjectRow {
  id: string;
  name: string;
  org: string;
  status: string;
  owner: string;
  learnerCount: number;
  progress: number;
  updatedAt: string;
  createdAt: string;
}

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  projectCount: number;
  createdAt: string;
}

const STATUS_LABEL: Record<string, string> = {
  draft: "草稿", in_progress: "进行中", completed: "已完成",
};

export function AdminPanel({ projects, users }: { projects: ProjectRow[]; users: UserRow[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState(false);
  const [tab, setTab] = useState<"projects" | "users">("projects");
  const [promoting, setPromoting] = useState<string | null>(null);

  const toggleProject = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === projects.length) setSelected(new Set());
    else setSelected(new Set(projects.map((p) => p.id)));
  };

  const handleExportSelected = async () => {
    if (selected.size === 0) return;
    setExporting(true);
    try {
      if (selected.size === 1) {
        const id = Array.from(selected)[0];
        window.open(`/api/export/${id}`, "_blank");
      } else {
        const res = await fetch("/api/admin/export-batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectIds: Array.from(selected) }),
        });
        if (res.ok) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `全部项目数据_${new Date().toISOString().slice(0, 10)}.xlsx`;
          a.click();
          URL.revokeObjectURL(url);
        }
      }
    } finally { setExporting(false); }
  };

  const handleExportAll = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/admin/export-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectIds: projects.map((p) => p.id) }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `全部项目数据_${new Date().toISOString().slice(0, 10)}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } finally { setExporting(false); }
  };

  const handleExportLearners = async () => {
    setExporting(true);
    try {
      const ids = selected.size > 0 ? Array.from(selected) : projects.map((p) => p.id);
      const res = await fetch("/api/admin/export-learners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectIds: ids }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `学员数据_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } finally { setExporting(false); }
  };

  const handlePromote = async (userId: string) => {
    setPromoting(userId);
    try {
      await fetch("/api/admin/promote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      window.location.reload();
    } finally { setPromoting(null); }
  };

  const totalLearners = projects.reduce((s, p) => s + p.learnerCount, 0);
  const completedProjects = projects.filter((p) => p.status === "completed").length;
  const avgProgress = projects.length > 0 ? Math.round(projects.reduce((s, p) => s + p.progress, 0) / projects.length) : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">管理后台</h1>
            <p className="text-sm text-slate-500">数据管理 · 导出 · 分析</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard"><Button variant="outline" size="sm">返回工作台</Button></Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="py-4 text-center">
              <div className="text-2xl font-bold text-primary">{projects.length}</div>
              <div className="text-xs text-muted-foreground">项目总数</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">{users.length}</div>
              <div className="text-xs text-muted-foreground">用户总数</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <div className="text-2xl font-bold text-amber-600">{totalLearners}</div>
              <div className="text-xs text-muted-foreground">学员总数</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{avgProgress}%</div>
              <div className="text-xs text-muted-foreground">平均进度</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <div className="text-2xl font-bold text-slate-600">{completedProjects}</div>
              <div className="text-xs text-muted-foreground">已完成项目</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Button variant={tab === "projects" ? "default" : "outline"} size="sm" onClick={() => setTab("projects")}>
            项目管理 ({projects.length})
          </Button>
          <Button variant={tab === "users" ? "default" : "outline"} size="sm" onClick={() => setTab("users")}>
            用户管理 ({users.length})
          </Button>
        </div>

        {tab === "projects" && (
          <>
            <Card className="mb-4">
              <CardContent className="py-3 flex items-center gap-3 flex-wrap">
                <Button size="sm" variant="outline" onClick={handleExportAll} disabled={exporting}>
                  {exporting ? "导出中..." : "导出所有项目 Excel"}
                </Button>
                <Button size="sm" variant="outline" onClick={handleExportSelected} disabled={exporting || selected.size === 0}>
                  导出选中 ({selected.size}) 项目
                </Button>
                <Button size="sm" variant="outline" onClick={handleExportLearners} disabled={exporting}>
                  导出{selected.size > 0 ? "选中项目" : "全部"}学员数据 CSV
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">全部项目</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-slate-50">
                        <th className="py-2 px-3 text-left w-10">
                          <Checkbox checked={selected.size === projects.length && projects.length > 0} onCheckedChange={toggleAll} />
                        </th>
                        <th className="py-2 px-3 text-left">项目名称</th>
                        <th className="py-2 px-3 text-left">组织</th>
                        <th className="py-2 px-3 text-left">所有者</th>
                        <th className="py-2 px-3 text-center">状态</th>
                        <th className="py-2 px-3 text-center">进度</th>
                        <th className="py-2 px-3 text-center">学员</th>
                        <th className="py-2 px-3 text-left">更新时间</th>
                        <th className="py-2 px-3 text-left">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map((p) => (
                        <tr key={p.id} className="border-b hover:bg-slate-50">
                          <td className="py-2 px-3">
                            <Checkbox checked={selected.has(p.id)} onCheckedChange={() => toggleProject(p.id)} />
                          </td>
                          <td className="py-2 px-3 font-medium">{p.name}</td>
                          <td className="py-2 px-3 text-muted-foreground">{p.org || "—"}</td>
                          <td className="py-2 px-3">{p.owner}</td>
                          <td className="py-2 px-3 text-center">
                            <Badge variant={p.status === "completed" ? "outline" : "secondary"}>
                              {STATUS_LABEL[p.status] || p.status}
                            </Badge>
                          </td>
                          <td className="py-2 px-3 text-center">{p.progress}%</td>
                          <td className="py-2 px-3 text-center">{p.learnerCount}</td>
                          <td className="py-2 px-3 text-muted-foreground">{p.updatedAt}</td>
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-1">
                              <Link href={`/projects/${p.id}/charter`}>
                                <Button size="sm" variant="ghost" className="text-blue-600">查看</Button>
                              </Link>
                              <Button size="sm" variant="ghost" onClick={() => window.open(`/api/export/${p.id}`, "_blank")}>
                                下载
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {tab === "users" && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">全部用户</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-slate-50">
                      <th className="py-2 px-3 text-left">姓名</th>
                      <th className="py-2 px-3 text-left">邮箱</th>
                      <th className="py-2 px-3 text-center">角色</th>
                      <th className="py-2 px-3 text-center">项目数</th>
                      <th className="py-2 px-3 text-left">注册时间</th>
                      <th className="py-2 px-3 text-left">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b hover:bg-slate-50">
                        <td className="py-2 px-3 font-medium">{u.name || "—"}</td>
                        <td className="py-2 px-3">{u.email}</td>
                        <td className="py-2 px-3 text-center">
                          <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                            {u.role === "admin" ? "管理员" : "用户"}
                          </Badge>
                        </td>
                        <td className="py-2 px-3 text-center">{u.projectCount}</td>
                        <td className="py-2 px-3 text-muted-foreground">{u.createdAt}</td>
                        <td className="py-2 px-3">
                          {u.role !== "admin" && (
                            <Button size="sm" variant="ghost" className="text-blue-600" disabled={promoting === u.id} onClick={() => handlePromote(u.id)}>
                              {promoting === u.id ? "..." : "设为管理员"}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

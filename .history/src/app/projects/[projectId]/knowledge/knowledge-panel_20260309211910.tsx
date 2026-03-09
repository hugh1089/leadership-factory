"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { deleteKnowledgeFile } from "@/lib/actions";

const CATEGORIES = [
  { value: "homework", label: "作业/任务" },
  { value: "reflection", label: "反思日志" },
  { value: "template", label: "工具模板" },
  { value: "report", label: "报告/PPT" },
  { value: "reading", label: "阅读材料" },
  { value: "assessment", label: "测评数据" },
  { value: "other", label: "其他" },
];

const CATEGORY_COLORS: Record<string, string> = {
  homework: "bg-blue-100 text-blue-700",
  reflection: "bg-purple-100 text-purple-700",
  template: "bg-emerald-100 text-emerald-700",
  report: "bg-amber-100 text-amber-700",
  reading: "bg-slate-100 text-slate-700",
  assessment: "bg-pink-100 text-pink-700",
  other: "bg-gray-100 text-gray-700",
};

interface KFile {
  id: string;
  stepKey: string;
  title: string;
  fileType: string;
  category: string;
  description: string;
  fileName: string;
  fileSize: number;
  uploadedBy: string;
  createdAt: string | Date;
}

interface StepOption { key: string; label: string }

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export function KnowledgePanel({ projectId, files, stepOptions, userName }: {
  projectId: string;
  files: KFile[];
  stepOptions: StepOption[];
  userName: string;
}) {
  const [filter, setFilter] = useState("all");
  const [catFilter, setCatFilter] = useState("all");
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ stepKey: "", title: "", category: "homework", description: "" });
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = files.filter((f) => {
    if (filter !== "all" && f.stepKey !== filter) return false;
    if (catFilter !== "all" && f.category !== catFilter) return false;
    return true;
  });

  const stepGroups = stepOptions.reduce((acc, s) => {
    acc[s.key] = files.filter((f) => f.stepKey === s.key).length;
    return acc;
  }, {} as Record<string, number>);

  const handleBatchDownload = () => {
    // Download all filtered files one by one
    filtered.forEach((f) => {
      window.open(`/api/projects/${projectId}/knowledge/download/${f.id}`, "_blank");
    });
  };

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file || !form.title) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("stepKey", form.stepKey);
      formData.append("title", form.title);
      formData.append("category", form.category);
      formData.append("description", form.description);
      formData.append("uploadedBy", userName);

      const res = await fetch(`/api/projects/${projectId}/knowledge/upload`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setShowUpload(false);
        setForm({ stepKey: "", title: "", category: "homework", description: "" });
        if (fileRef.current) fileRef.current.value = "";
        window.location.reload();
      }
    } finally { setUploading(false); }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm("确定要删除此文件？")) return;
    await deleteKnowledgeFile(fileId, projectId);
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="py-4 text-center">
            <div className="text-2xl font-bold text-primary">{files.length}</div>
            <div className="text-xs text-muted-foreground">文件总数</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Object.values(stepGroups).filter((c) => c > 0).length}
            </div>
            <div className="text-xs text-muted-foreground">涉及步骤</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <div className="text-2xl font-bold text-amber-600">
              {formatSize(files.reduce((s, f) => s + f.fileSize, 0))}
            </div>
            <div className="text-xs text-muted-foreground">总文件大小</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <Button className="w-full" onClick={() => setShowUpload(!showUpload)}>
              {showUpload ? "取消上传" : "上传文件"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {showUpload && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-blue-800">上传文件</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>文件标题 *</Label>
                <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="如：第一阶段作业报告" />
              </div>
              <div className="space-y-2">
                <Label>关联步骤</Label>
                <Select value={form.stepKey} onValueChange={(v) => setForm((p) => ({ ...p, stepKey: v ?? "" }))}>
                  <SelectTrigger><SelectValue placeholder="选择步骤..." /></SelectTrigger>
                  <SelectContent>
                    {stepOptions.map((s) => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>分类</Label>
                <Select value={form.category} onValueChange={(v) => setForm((p) => ({ ...p, category: v ?? "" }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>描述</Label>
              <Textarea rows={2} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="简要描述文件内容..." />
            </div>
            <div className="flex items-center gap-3">
              <input ref={fileRef} type="file" className="text-sm" />
              <Button onClick={handleUpload} disabled={uploading || !form.title}>
                {uploading ? "上传中..." : "确认上传"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">文件列表</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={filter} onValueChange={(v) => setFilter(v ?? "all")}>
                <SelectTrigger className="w-40 text-sm"><SelectValue placeholder="按步骤筛选" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部步骤</SelectItem>
                  {stepOptions.map((s) => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={catFilter} onValueChange={(v) => setCatFilter(v ?? "all")}>
                <SelectTrigger className="w-32 text-sm"><SelectValue placeholder="按分类筛选" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部分类</SelectItem>
                  {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
              {filtered.length > 0 && (
                <Button size="sm" variant="outline" onClick={handleBatchDownload}>
                  批量下载 ({filtered.length})
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">暂无文件，点击上方上传按钮添加</p>
          ) : (
            <div className="space-y-2">
              {filtered.map((f) => {
                const stepLabel = stepOptions.find((s) => s.key === f.stepKey)?.label || "通用";
                const catLabel = CATEGORIES.find((c) => c.value === f.category)?.label || f.category;
                return (
                  <div key={f.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{f.title}</span>
                        <Badge className={CATEGORY_COLORS[f.category] || ""} variant="secondary">{catLabel}</Badge>
                        <Badge variant="outline" className="text-xs">{stepLabel}</Badge>
                      </div>
                      {f.description && <p className="text-xs text-muted-foreground truncate">{f.description}</p>}
                      <p className="text-xs text-slate-400 mt-1">{f.fileName} · {formatSize(f.fileSize)} · {f.uploadedBy} · {new Date(f.createdAt).toLocaleDateString("zh-CN")}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => window.open(`/api/projects/${projectId}/knowledge/download/${f.id}`, "_blank")}>
                        下载
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(f.id)}>
                        删除
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

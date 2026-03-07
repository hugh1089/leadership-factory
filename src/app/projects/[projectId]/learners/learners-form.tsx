"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EditableTable, ColumnDef } from "@/components/shared/editable-table";
import { saveLearners } from "@/lib/actions";

const columns: ColumnDef[] = [
  { key: "name", label: "姓名", placeholder: "学员姓名" },
  { key: "department", label: "部门", placeholder: "部门" },
  { key: "position", label: "岗位", placeholder: "岗位" },
  { key: "yearsWork", label: "工龄", width: "70px", placeholder: "10" },
  { key: "yearsMgmt", label: "管理年限", width: "80px", placeholder: "5" },
  { key: "supervisor", label: "直线主管", placeholder: "主管姓名" },
  { key: "phone", label: "电话", placeholder: "手机号" },
  { key: "email", label: "邮箱", placeholder: "email" },
  { key: "joinDate", label: "加入日期", placeholder: "2026-03" },
  { key: "learnerType", label: "类型", type: "select", width: "90px", options: [{ value: "正式", label: "正式" }, { value: "旁听", label: "旁听" }] },
  { key: "fileNo", label: "档案编号", placeholder: "LP-2026-001" },
];

function parseCSV(text: string): Array<Record<string, string>> {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^["']|["']$/g, ""));
  return lines.slice(1).map((line) => {
    const vals = line.split(",").map((v) => v.trim().replace(/^["']|["']$/g, ""));
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = vals[i] || ""; });
    return obj;
  });
}

export function LearnersForm({ projectId, learners }: { projectId: string; learners: Array<Record<string, string>> }) {
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadMsg("");

    try {
      const text = await file.text();
      const parsed = parseCSV(text);
      if (parsed.length === 0) {
        setUploadMsg("文件为空或格式不正确，请使用CSV格式（逗号分隔）");
        return;
      }

      const res = await fetch(`/api/projects/${projectId}/learners/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ learners: parsed }),
      });
      const data = await res.json();
      if (res.ok) {
        setUploadMsg(`成功导入 ${data.count} 名学员！刷新页面查看。`);
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setUploadMsg(data.error || "导入失败");
      }
    } catch {
      setUploadMsg("文件解析失败，请检查格式");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const downloadTemplate = () => {
    const headers = "姓名,部门,岗位,工龄,管理年限,直线主管,电话,邮箱,加入日期,类型,档案编号\n";
    const sample = "张三,运营部,总监,15,8,李总,13800138000,zhangsan@example.com,2026-03,正式,LP-2026-001\n";
    const blob = new Blob(["\uFEFF" + headers + sample], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "学员名单模板.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-blue-800">批量导入学员</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            上传CSV文件批量导入学员名单。列名支持中文（姓名、部门、岗位等）或英文字段名。
          </p>
          <div className="flex items-center gap-3">
            <Button size="sm" variant="outline" className="text-blue-700" onClick={downloadTemplate}>
              下载CSV模板
            </Button>
            <div className="relative">
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.txt"
                onChange={handleUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Button size="sm" disabled={uploading}>
                {uploading ? "导入中..." : "上传CSV文件"}
              </Button>
            </div>
          </div>
          {uploadMsg && (
            <p className={`text-sm mt-2 ${uploadMsg.includes("成功") ? "text-green-600" : "text-red-600"}`}>
              {uploadMsg}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">学员花名册</CardTitle>
          <p className="text-sm text-muted-foreground">
            管理所有参训学员的基本信息。学员人数将影响预算的人均成本计算。
            当前共 {learners.length} 名学员。
          </p>
        </CardHeader>
        <CardContent>
          <EditableTable
            columns={columns}
            data={learners}
            onSave={async (data) => { await saveLearners(projectId, data as Array<Record<string, string>>); }}
            addLabel="添加学员"
          />
        </CardContent>
      </Card>
    </div>
  );
}

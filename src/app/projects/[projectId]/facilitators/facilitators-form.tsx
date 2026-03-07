"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EditableTable, ColumnDef } from "@/components/shared/editable-table";
import { saveFacilitators } from "@/lib/actions";
import { FACILITATOR_SOURCES } from "@/lib/templates";
import { useState } from "react";

const columns: ColumnDef[] = [
  { key: "name", label: "讲师姓名", placeholder: "姓名" },
  { key: "source", label: "师资来源", type: "select", width: "120px", options: FACILITATOR_SOURCES.map((s) => ({ value: s, label: s })) },
  { key: "expertise", label: "专业领域", placeholder: "领导力/战略" },
  { key: "credentials", label: "资质认证", placeholder: "ICF PCC" },
  { key: "module", label: "授课模块", placeholder: "模块名称" },
  { key: "days", label: "天数", type: "number", width: "70px" },
  { key: "dailyRate", label: "日费(元)", type: "number", width: "100px" },
  { key: "totalFee", label: "总费用(元)", type: "number", width: "100px" },
  { key: "contractStatus", label: "合同状态", type: "select", width: "110px", options: [{ value: "pending", label: "待签" }, { value: "signed", label: "已签" }, { value: "completed", label: "已完成" }] },
  { key: "lastScore", label: "评分", placeholder: "4.5" },
  { key: "contact", label: "联系方式", placeholder: "电话/邮箱" },
];

interface Module {
  id: string;
  code: string;
  name: string;
  facilitatorType: string;
  hours: number;
}

export function FacilitatorsForm({ projectId, facilitators, modules }: { projectId: string; facilitators: Array<Record<string, unknown>>; modules: Module[] }) {
  const [data, setData] = useState(facilitators);

  const importFromModules = () => {
    const imported = modules.map((m) => ({
      name: "",
      source: "",
      expertise: "",
      credentials: "",
      module: `${m.code} ${m.name}`,
      days: Math.ceil(m.hours / 6),
      dailyRate: 0,
      totalFee: 0,
      contractStatus: "pending",
      lastScore: "",
      contact: "",
    }));
    setData((prev) => [...prev, ...imported]);
  };

  return (
    <div className="space-y-6">
      {modules.length > 0 && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-800">从课程架构导入</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 flex-wrap mb-3">
              {modules.map((m) => (
                <Badge key={m.id} variant="secondary">{m.code} {m.name} ({m.facilitatorType})</Badge>
              ))}
            </div>
            <Button size="sm" variant="outline" className="text-blue-700" onClick={importFromModules}>
              按模块生成讲师分配行
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">讲师资源库</CardTitle>
          <p className="text-sm text-muted-foreground">管理所有讲师/供应商信息，跟踪合同和评价</p>
        </CardHeader>
        <CardContent>
          <EditableTable
            columns={columns}
            data={data}
            onSave={async (rows) => { await saveFacilitators(projectId, rows); }}
            addLabel="添加讲师"
          />
        </CardContent>
      </Card>
    </div>
  );
}

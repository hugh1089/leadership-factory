"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EditableTable, ColumnDef } from "@/components/shared/editable-table";
import { saveCalendarEvents } from "@/lib/actions";
import { useState } from "react";

const columns: ColumnDef[] = [
  { key: "type", label: "类型", type: "select", width: "100px", options: [{ value: "milestone", label: "里程碑" }, { value: "training", label: "培训" }, { value: "assessment", label: "考核" }, { value: "social", label: "社交" }, { value: "meeting", label: "会议" }, { value: "other", label: "其他" }] },
  { key: "name", label: "活动名称", placeholder: "项目启动仪式" },
  { key: "month", label: "月份", width: "70px", placeholder: "3月" },
  { key: "week", label: "周次", width: "70px", placeholder: "W1" },
  { key: "date", label: "日期", width: "100px", placeholder: "3/2-3/6" },
  { key: "summary", label: "内容摘要", width: "200px", placeholder: "高管宣讲..." },
  { key: "responsible", label: "主责", placeholder: "HR" },
  { key: "coworker", label: "协同", placeholder: "讲师" },
  { key: "headcount", label: "人数", width: "70px", placeholder: "25" },
  { key: "status", label: "状态", type: "select", width: "100px", options: [{ value: "pending", label: "未开始" }, { value: "in_progress", label: "进行中" }, { value: "completed", label: "已完成" }] },
];

interface Module { id: string; code: string; name: string; hours: number; }

export function CalendarForm({ projectId, events, modules }: { projectId: string; events: Array<Record<string, unknown>>; modules: Module[] }) {
  const [data, setData] = useState(events);

  const importFromModules = () => {
    const imported = modules.map((m, i) => ({
      type: "training",
      name: `${m.code} ${m.name}`,
      month: "",
      week: `W${i + 2}`,
      date: "",
      summary: `${m.name} (${m.hours}学时)`,
      responsible: "",
      coworker: "",
      headcount: "",
      status: "pending",
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
                <Badge key={m.id} variant="secondary">{m.code} {m.name}</Badge>
              ))}
            </div>
            <Button size="sm" variant="outline" className="text-blue-700" onClick={importFromModules}>
              按模块生成日历事件
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">运营活动日历</CardTitle>
          <p className="text-sm text-muted-foreground">规划所有里程碑和月度运营活动</p>
        </CardHeader>
        <CardContent>
          <EditableTable
            columns={columns}
            data={data}
            onSave={async (rows) => { await saveCalendarEvents(projectId, rows); }}
            addLabel="添加事件"
          />
        </CardContent>
      </Card>
    </div>
  );
}

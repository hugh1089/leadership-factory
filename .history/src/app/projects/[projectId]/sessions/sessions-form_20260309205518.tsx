"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EditableTable, ColumnDef } from "@/components/shared/editable-table";
import { saveSessionPlans } from "@/lib/actions";

const columns: ColumnDef[] = [
  { key: "timeSlot", label: "时间段", width: "110px", placeholder: "09:00-09:30" },
  { key: "duration", label: "时长(分)", type: "number", width: "70px" },
  { key: "name", label: "环节名称", minWidth: "120px", placeholder: "开营破冰" },
  { key: "objective", label: "教学目标", type: "textarea", minWidth: "180px", placeholder: "建立学习共同体" },
  { key: "activity", label: "活动描述", type: "textarea", minWidth: "220px", placeholder: "详细描述活动..." },
  { key: "facilitator", label: "促进者要点", type: "textarea", minWidth: "150px", placeholder: "关键指导..." },
  { key: "materials", label: "所需材料", minWidth: "120px", placeholder: "白板·马克笔" },
  { key: "assessment", label: "即时评估", minWidth: "120px", placeholder: "手势投票" },
];

interface Module {
  id: string;
  code: string;
  name: string;
  hours: number;
  sessions: Array<Record<string, unknown>>;
}

export function SessionsForm({ projectId, modules }: { projectId: string; modules: Module[] }) {
  if (modules.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          请先在"课程架构"步骤中创建课程模块，然后回到这里设计每个模块的教学详案。
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {modules.map((mod) => (
        <Card key={mod.id}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{mod.code}</Badge>
              <CardTitle className="text-base">{mod.name}</CardTitle>
              <span className="text-sm text-muted-foreground">({mod.hours}学时)</span>
            </div>
          </CardHeader>
          <CardContent>
            <EditableTable
              columns={columns}
              data={mod.sessions}
              onSave={async (data) => { await saveSessionPlans(mod.id, data, projectId); }}
              addLabel="添加时间块"
              minWidth="1200px"
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

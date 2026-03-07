"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditableTable, ColumnDef } from "@/components/shared/editable-table";
import { saveJourneyPhases } from "@/lib/actions";
import { JOURNEY_PHASE_TEMPLATES } from "@/lib/templates";

const columns: ColumnDef[] = [
  { key: "phase", label: "阶段名称", placeholder: "启动前 Pre-Launch" },
  { key: "duration", label: "持续时间", width: "90px", placeholder: "2周" },
  { key: "description", label: "阶段描述", width: "200px", placeholder: "主要活动..." },
  { key: "activities", label: "学习活动", width: "180px", placeholder: "具体活动..." },
  { key: "emotion", label: "学员情绪", width: "100px", placeholder: "好奇/期待" },
  { key: "intervention", label: "干预措施", width: "150px", placeholder: "干预方式..." },
  { key: "responsible", label: "负责人", width: "100px", placeholder: "HR/讲师" },
  { key: "criteria", label: "成功标准", width: "150px", placeholder: "完成标准..." },
];

export function JourneyForm({ projectId, phases }: { projectId: string; phases: Array<Record<string, unknown>> }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">学习旅程阶段</CardTitle>
          <p className="text-sm text-muted-foreground">按时间顺序排列各阶段，每个阶段描述学员的体验和所需干预</p>
        </CardHeader>
        <CardContent>
          <EditableTable
            columns={columns}
            data={phases}
            onSave={async (data) => { await saveJourneyPhases(projectId, data); }}
            templateRows={JOURNEY_PHASE_TEMPLATES}
            addLabel="添加阶段"
          />
        </CardContent>
      </Card>

      <Card className="bg-amber-50/50 border-amber-200">
        <CardContent className="py-4">
          <p className="text-sm text-amber-800 font-medium mb-1">旅程情绪曲线提示</p>
          <p className="text-sm text-amber-700">
            典型的学习情绪曲线：好奇→紧张→兴奋→疲惫→思考→挑战→焦虑→自信→成就。
            在"疲惫"和"焦虑"等低谷阶段，需要设计特别的干预措施（如1对1辅导、团队共创、阶段性庆祝等）。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

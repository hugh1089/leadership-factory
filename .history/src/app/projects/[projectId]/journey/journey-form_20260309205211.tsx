"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditableTable, ColumnDef } from "@/components/shared/editable-table";
import { saveJourneyPhases } from "@/lib/actions";
import { JOURNEY_PHASE_TEMPLATES } from "@/lib/templates";

const EMOTION_OPTIONS = [
  { value: "好奇/期待", label: "好奇/期待 😊" },
  { value: "紧张/忐忑", label: "紧张/忐忑 😰" },
  { value: "兴奋/投入", label: "兴奋/投入 🤩" },
  { value: "疲惫/倦怠", label: "疲惫/倦怠 😩" },
  { value: "思考/沉淀", label: "思考/沉淀 🤔" },
  { value: "挑战/成长", label: "挑战/成长 💪" },
  { value: "焦虑/压力", label: "焦虑/压力 😟" },
  { value: "自信/掌控", label: "自信/掌控 😎" },
  { value: "成就/满足", label: "成就/满足 🏆" },
  { value: "不舍/回味", label: "不舍/回味 🥲" },
];

const ACTIVITY_OPTIONS = [
  { value: "测评与调研", label: "测评与调研" },
  { value: "集中培训/工作坊", label: "集中培训/工作坊" },
  { value: "在线学习", label: "在线学习" },
  { value: "行动学习项目", label: "行动学习项目" },
  { value: "1对1教练辅导", label: "1对1教练辅导" },
  { value: "导师辅导", label: "导师辅导" },
  { value: "同伴学习/读书会", label: "同伴学习/读书会" },
  { value: "岗位实践", label: "岗位实践" },
  { value: "汇报路演", label: "汇报路演" },
  { value: "复盘总结", label: "复盘总结" },
  { value: "庆祝/结业仪式", label: "庆祝/结业仪式" },
];

const columns: ColumnDef[] = [
  { key: "phase", label: "阶段名称", minWidth: "130px", placeholder: "启动前 Pre-Launch" },
  { key: "startDate", label: "开始日期", width: "120px", placeholder: "2025-01-01" },
  { key: "duration", label: "持续时间", width: "90px", placeholder: "2周" },
  { key: "description", label: "阶段描述", type: "textarea", minWidth: "200px", placeholder: "主要活动与目标..." },
  { key: "activities", label: "学习活动", type: "select", width: "150px", options: ACTIVITY_OPTIONS },
  { key: "emotion", label: "学员情绪", type: "select", width: "140px", options: EMOTION_OPTIONS },
  { key: "intervention", label: "干预措施", type: "textarea", minWidth: "180px", placeholder: "低谷期干预方式..." },
  { key: "responsible", label: "负责人", width: "100px", placeholder: "HR/讲师" },
  { key: "criteria", label: "输出/效果", type: "textarea", minWidth: "180px", placeholder: "阶段产出与预期效果..." },
];

export function JourneyForm({ projectId, phases }: { projectId: string; phases: Array<Record<string, unknown>> }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">学习旅程阶段</CardTitle>
          <p className="text-sm text-muted-foreground">按时间顺序排列各阶段，每个阶段描述学员的体验和所需干预。支持自动保存。</p>
        </CardHeader>
        <CardContent>
          <EditableTable
            columns={columns}
            data={phases}
            onSave={async (data) => { await saveJourneyPhases(projectId, data); }}
            templateRows={JOURNEY_PHASE_TEMPLATES}
            addLabel="添加阶段"
            minWidth="1400px"
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

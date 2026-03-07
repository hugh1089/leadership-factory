"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditableTable, ColumnDef } from "@/components/shared/editable-table";
import { saveAssessments } from "@/lib/actions";
import { ASSESSMENT_LEVELS } from "@/lib/templates";

const columns: ColumnDef[] = [
  { key: "level", label: "评估层级", type: "select", width: "150px", options: ASSESSMENT_LEVELS.map((l) => ({ value: l.value, label: l.label })) },
  { key: "name", label: "评估工具", placeholder: "课后满意度问卷" },
  { key: "description", label: "评估描述", width: "200px", placeholder: "描述..." },
  { key: "tool", label: "具体工具", placeholder: "NPS问卷" },
  { key: "timing", label: "评估时机", placeholder: "每次培训后" },
  { key: "target", label: "目标值", placeholder: "≥4.2/5.0" },
  { key: "module", label: "对应模块", placeholder: "全部模块" },
  { key: "dimension", label: "评估维度", placeholder: "满意度" },
];

const templates = [
  { level: "L1", name: "课后满意度问卷", description: "学员对培训体验的满意度", tool: "NPS问卷+5维度量表", timing: "每次培训后即时", target: "满意度≥4.2/5.0, NPS≥50", module: "所有模块", dimension: "满意度" },
  { level: "L2", name: "知识测试", description: "关键概念和方法论掌握度", tool: "在线测试", timing: "模块结束后1周", target: "平均分≥80", module: "所有模块", dimension: "知识掌握" },
  { level: "L2", name: "行动计划质量评分", description: "学员制定的行动计划完整度和可行性", tool: "专家评审量表", timing: "培训后2周", target: "平均分≥3.5/5.0", module: "战略解码", dimension: "技能应用" },
  { level: "L3", name: "180°行为评估", description: "上级和自评的行为变化程度", tool: "行为锚定量表", timing: "项目中期+结束", target: "行为改变率≥60%", module: "全项目", dimension: "行为变化" },
  { level: "L4", name: "业务绩效追踪", description: "关键业务指标的变化", tool: "KPI对比分析", timing: "项目结束后3个月", target: "KPI提升≥10%", module: "全项目", dimension: "业务影响" },
];

export function AssessmentForm({ projectId, assessments }: { projectId: string; assessments: Array<Record<string, string>>; objectives: Array<Record<string, unknown>> }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-5 gap-3">
        {ASSESSMENT_LEVELS.map((level) => (
          <Card key={level.value} className="text-center">
            <CardContent className="py-3">
              <div className="text-sm font-bold text-primary">{level.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{level.desc}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">评估工具矩阵</CardTitle>
          <p className="text-sm text-muted-foreground">为每个评估层级设计具体的工具、时机和目标值</p>
        </CardHeader>
        <CardContent>
          <EditableTable
            columns={columns}
            data={assessments}
            onSave={async (data) => { await saveAssessments(projectId, data as Array<Record<string, string>>); }}
            templateRows={templates}
            addLabel="添加评估项"
          />
        </CardContent>
      </Card>
    </div>
  );
}

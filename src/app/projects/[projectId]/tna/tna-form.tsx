"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditableTable, ColumnDef } from "@/components/shared/editable-table";
import { saveBusinessNeeds, saveCompetencyGaps } from "@/lib/actions";

const bnColumns: ColumnDef[] = [
  { key: "challenge", label: "业务挑战/机会", width: "180px", placeholder: "描述挑战..." },
  { key: "strategic", label: "战略关联性", placeholder: "与哪项战略相关" },
  { key: "affectedRoles", label: "影响的岗位群", placeholder: "中层管理者" },
  { key: "expectedResult", label: "期望业务结果", placeholder: "期望结果..." },
  { key: "metric", label: "衡量指标", placeholder: "KPI指标" },
  { key: "currentData", label: "当前数据", placeholder: "现状" },
  { key: "targetData", label: "目标数据", placeholder: "目标" },
  { key: "priority", label: "优先级", type: "select", width: "100px", options: [{ value: "高", label: "高" }, { value: "中", label: "中" }, { value: "低", label: "低" }] },
];

const cgColumns: ColumnDef[] = [
  { key: "dimension", label: "能力维度", placeholder: "如：经营决策思维" },
  { key: "targetGroup", label: "目标群体", placeholder: "中层干部" },
  { key: "currentLevel", label: "当前水平", type: "number", width: "80px" },
  { key: "requiredLevel", label: "要求水平", type: "number", width: "80px" },
  { key: "gapScore", label: "差距分", type: "number", width: "80px" },
  { key: "recommendation", label: "学习建议", placeholder: "正式培训+实践" },
  { key: "method", label: "建议方法", placeholder: "沙盘+案例" },
  { key: "priority", label: "优先级", type: "select", width: "100px", options: [{ value: "高优先级", label: "高优先级" }, { value: "中优先级", label: "中优先级" }, { value: "低优先级", label: "低优先级" }] },
];

const cgTemplates = [
  { dimension: "经营决策思维", targetGroup: "中层干部", currentLevel: 5, requiredLevel: 5, gapScore: 25, recommendation: "正式培训+实践演练", method: "沙盘+案例", priority: "高优先级" },
  { dimension: "团队领导力", targetGroup: "中层干部", currentLevel: 6, requiredLevel: 4, gapScore: 24, recommendation: "工作坊+辅导", method: "情境模拟+360反馈", priority: "高优先级" },
  { dimension: "变革管理", targetGroup: "中层干部", currentLevel: 4, requiredLevel: 4, gapScore: 16, recommendation: "案例学习+行动学习", method: "变革工作坊", priority: "中优先级" },
];

export function TnaForm({
  projectId,
  businessNeeds,
  competencyGaps,
}: {
  projectId: string;
  businessNeeds: Array<Record<string, unknown>>;
  competencyGaps: Array<Record<string, unknown>>;
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">业务需求分析</CardTitle>
          <p className="text-sm text-muted-foreground">从业务挑战出发，识别培训能解决的问题</p>
        </CardHeader>
        <CardContent>
          <EditableTable
            columns={bnColumns}
            data={businessNeeds}
            onSave={async (data) => {
              await saveBusinessNeeds(projectId, data as Array<Record<string, string>>);
            }}
            addLabel="添加业务需求"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">能力差距矩阵</CardTitle>
          <p className="text-sm text-muted-foreground">差距分 = 当前水平 x 要求水平（数值越大，优先级越高）。此数据将自动流入学习目标矩阵。</p>
        </CardHeader>
        <CardContent>
          <EditableTable
            columns={cgColumns}
            data={competencyGaps}
            onSave={async (data) => {
              await saveCompetencyGaps(projectId, data);
            }}
            templateRows={cgTemplates}
            addLabel="添加能力维度"
          />
        </CardContent>
      </Card>
    </div>
  );
}

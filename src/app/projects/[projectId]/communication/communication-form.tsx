"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EditableTable, ColumnDef } from "@/components/shared/editable-table";
import { saveCommPlans } from "@/lib/actions";
import { COMM_TEMPLATES } from "@/lib/templates";
import { useState } from "react";

const columns: ColumnDef[] = [
  { key: "stakeholder", label: "干系人", placeholder: "公司高管" },
  { key: "infoNeeds", label: "信息需求", width: "150px", placeholder: "项目进展" },
  { key: "purpose", label: "沟通目的", placeholder: "战略对齐" },
  { key: "frequency", label: "沟通频次", width: "90px", placeholder: "季度" },
  { key: "channel", label: "沟通渠道", placeholder: "面对面汇报" },
  { key: "format", label: "信息格式", placeholder: "PPT简报" },
  { key: "initiator", label: "发起方", placeholder: "项目负责人" },
  { key: "feedback", label: "反馈机制", placeholder: "会议纪要" },
];

interface Stakeholder { name: string; role: string; frequency: string; method: string; }

export function CommunicationForm({ projectId, commPlans, stakeholders }: {
  projectId: string;
  commPlans: Array<Record<string, string>>;
  stakeholders: Stakeholder[];
}) {
  const [data, setData] = useState(commPlans);

  const importFromStakeholders = () => {
    const imported = stakeholders.map((s) => ({
      stakeholder: `${s.name} (${s.role})`,
      infoNeeds: "",
      purpose: "",
      frequency: s.frequency || "",
      channel: s.method || "",
      format: "",
      initiator: "",
      feedback: "",
    }));
    setData((prev) => [...prev, ...imported]);
  };

  return (
    <div className="space-y-6">
      {stakeholders.length > 0 && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-800">从项目章程导入干系人</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 flex-wrap mb-3">
              {stakeholders.map((s, i) => (
                <Badge key={i} variant="secondary">{s.name} ({s.role})</Badge>
              ))}
            </div>
            <Button size="sm" variant="outline" className="text-blue-700" onClick={importFromStakeholders}>
              导入干系人到沟通矩阵
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">沟通矩阵</CardTitle>
          <p className="text-sm text-muted-foreground">为每个干系人群体制定沟通策略</p>
        </CardHeader>
        <CardContent>
          <EditableTable
            columns={columns}
            data={data}
            onSave={async (rows) => { await saveCommPlans(projectId, rows as Array<Record<string, string>>); }}
            templateRows={COMM_TEMPLATES}
            addLabel="添加沟通对象"
          />
        </CardContent>
      </Card>
    </div>
  );
}

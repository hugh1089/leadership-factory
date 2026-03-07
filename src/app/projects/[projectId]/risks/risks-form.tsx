"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditableTable, ColumnDef } from "@/components/shared/editable-table";
import { saveRisks } from "@/lib/actions";
import { RISK_CATEGORIES, RISK_TEMPLATES } from "@/lib/templates";
import { useMemo } from "react";

const columns: ColumnDef[] = [
  { key: "riskId", label: "风险ID", width: "70px", placeholder: "R01" },
  { key: "description", label: "风险描述", width: "250px", placeholder: "描述风险..." },
  { key: "category", label: "类别", type: "select", width: "110px", options: RISK_CATEGORIES.map((c) => ({ value: c, label: c })) },
  { key: "probability", label: "概率(1-5)", type: "number", width: "80px" },
  { key: "impact", label: "影响(1-5)", type: "number", width: "80px" },
  { key: "riskScore", label: "风险分", type: "number", width: "80px" },
  { key: "strategy", label: "应对策略", type: "select", width: "100px", options: [{ value: "规避", label: "规避" }, { value: "缓解", label: "缓解" }, { value: "转移", label: "转移" }, { value: "接受", label: "接受" }] },
  { key: "measures", label: "具体措施", width: "200px", placeholder: "措施..." },
  { key: "owner", label: "责任人", placeholder: "姓名" },
  { key: "status", label: "状态", type: "select", width: "100px", options: [{ value: "监控中", label: "监控中" }, { value: "已发生", label: "已发生" }, { value: "已关闭", label: "已关闭" }] },
];

export function RisksForm({ projectId, risks }: { projectId: string; risks: Array<Record<string, unknown>> }) {
  const matrix = useMemo(() => {
    const cells: Record<string, number> = {};
    risks.forEach((r) => {
      const key = `${r.probability}-${r.impact}`;
      cells[key] = (cells[key] || 0) + 1;
    });
    return cells;
  }, [risks]);

  const getCellColor = (p: number, i: number) => {
    const score = p * i;
    if (score >= 15) return "bg-red-200 text-red-800";
    if (score >= 8) return "bg-amber-200 text-amber-800";
    if (score >= 4) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">风险矩阵热力图</CardTitle>
          <p className="text-sm text-muted-foreground">概率 x 影响 = 风险等级。红色区域需重点关注。</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="text-sm mx-auto">
              <thead>
                <tr>
                  <th className="px-2 py-1 text-xs text-muted-foreground">概率 \ 影响</th>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <th key={i} className="px-4 py-1 text-xs text-center">{i}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[5, 4, 3, 2, 1].map((p) => (
                  <tr key={p}>
                    <td className="px-2 py-1 text-xs font-medium text-right">{p}</td>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <td key={i} className="px-1 py-1">
                        <div className={`w-12 h-10 rounded flex items-center justify-center text-xs font-medium ${getCellColor(p, i)}`}>
                          {matrix[`${p}-${i}`] ? `${p * i} (${matrix[`${p}-${i}`]})` : p * i}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">风险登记册</CardTitle>
          <p className="text-sm text-muted-foreground">记录所有已识别的风险、评估和应对措施</p>
        </CardHeader>
        <CardContent>
          <EditableTable
            columns={columns}
            data={risks}
            onSave={async (data) => { await saveRisks(projectId, data); }}
            templateRows={RISK_TEMPLATES}
            addLabel="添加风险项"
          />
        </CardContent>
      </Card>
    </div>
  );
}

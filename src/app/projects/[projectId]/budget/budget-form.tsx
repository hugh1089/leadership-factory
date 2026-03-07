"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EditableTable, ColumnDef } from "@/components/shared/editable-table";
import { saveBudgetItems } from "@/lib/actions";
import { BUDGET_CATEGORIES } from "@/lib/templates";

const columns: ColumnDef[] = [
  { key: "category", label: "费用类别", type: "select", width: "140px", options: BUDGET_CATEGORIES.map((c) => ({ value: c.category, label: `${c.category} ${c.label}` })) },
  { key: "itemName", label: "费用项目", placeholder: "线上测评费" },
  { key: "feeType", label: "费用类型", placeholder: "测评/场地/讲师" },
  { key: "planPrice", label: "计划单价", type: "number", width: "100px" },
  { key: "planQty", label: "计划数量", type: "number", width: "80px" },
  { key: "planTotal", label: "计划小计", type: "number", width: "100px" },
  { key: "actualPrice", label: "实际单价", type: "number", width: "100px" },
  { key: "actualQty", label: "实际数量", type: "number", width: "80px" },
  { key: "actualTotal", label: "实际小计", type: "number", width: "100px" },
  { key: "status", label: "状态", type: "select", width: "100px", options: [{ value: "pending", label: "未开始" }, { value: "in_progress", label: "进行中" }, { value: "completed", label: "已完成" }] },
];

export function BudgetForm({ projectId, budgetItems, facilitatorCount, learnerCount, initialRevenue }: {
  projectId: string;
  budgetItems: Array<Record<string, unknown>>;
  facilitatorCount: number;
  learnerCount: number;
  initialRevenue: number;
}) {
  const [revenue, setRevenue] = useState(initialRevenue);
  const [savingRevenue, setSavingRevenue] = useState(false);

  const summary = useMemo(() => {
    const planTotal = budgetItems.reduce((s, i) => s + (Number(i.planTotal) || 0), 0);
    const actualTotal = budgetItems.reduce((s, i) => s + (Number(i.actualTotal) || 0), 0);
    const planProfit = revenue - planTotal;
    const actualProfit = revenue > 0 && actualTotal > 0 ? revenue - actualTotal : 0;
    const profitRate = revenue > 0 ? (planProfit / revenue * 100) : 0;
    return { planTotal, actualTotal, variance: actualTotal - planTotal, planProfit, actualProfit, profitRate };
  }, [budgetItems, revenue]);

  const handleSaveRevenue = async () => {
    setSavingRevenue(true);
    try {
      await fetch(`/api/projects/${projectId}/revenue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revenue }),
      });
    } finally { setSavingRevenue(false); }
  };

  return (
    <div className="space-y-6">
      <Card className="border-emerald-200 bg-emerald-50/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-emerald-800">收入与利润概览</CardTitle>
          <p className="text-sm text-muted-foreground">收入 - 成本 = 利润（此区域仅管理员可见，不对客户展示）</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4 mb-4">
            <div className="space-y-1">
              <Label className="text-xs">项目报价/收入 (元)</Label>
              <Input
                type="number"
                className="w-48"
                value={revenue || ""}
                onChange={(e) => setRevenue(Number(e.target.value) || 0)}
                placeholder="输入项目总报价"
              />
            </div>
            <Button size="sm" variant="outline" onClick={handleSaveRevenue} disabled={savingRevenue}>
              {savingRevenue ? "保存中..." : "保存报价"}
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-white rounded-lg border border-emerald-200">
              <div className="text-xs text-muted-foreground">项目收入</div>
              <div className="text-xl font-bold text-emerald-700">{revenue > 0 ? `¥${revenue.toLocaleString()}` : "—"}</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-emerald-200">
              <div className="text-xs text-muted-foreground">计划利润</div>
              <div className={`text-xl font-bold ${summary.planProfit >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                {revenue > 0 ? `¥${summary.planProfit.toLocaleString()}` : "—"}
              </div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-emerald-200">
              <div className="text-xs text-muted-foreground">利润率</div>
              <div className={`text-xl font-bold ${summary.profitRate >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                {revenue > 0 ? `${summary.profitRate.toFixed(1)}%` : "—"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="py-4 text-center">
            <div className="text-xs text-muted-foreground">计划成本</div>
            <div className="text-xl font-bold text-primary">¥{summary.planTotal.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <div className="text-xs text-muted-foreground">实际支出</div>
            <div className="text-xl font-bold">{summary.actualTotal > 0 ? `¥${summary.actualTotal.toLocaleString()}` : "—"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <div className="text-xs text-muted-foreground">成本差异</div>
            <div className={`text-xl font-bold ${summary.variance > 0 ? "text-red-600" : summary.variance < 0 ? "text-green-600" : ""}`}>
              {summary.actualTotal > 0 ? `¥${summary.variance.toLocaleString()}` : "—"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <div className="text-xs text-muted-foreground">人均成本</div>
            <div className="text-xl font-bold text-slate-600">
              {learnerCount > 0 ? `¥${Math.round(summary.planTotal / learnerCount).toLocaleString()}` : "—"}
            </div>
            <div className="text-xs text-slate-400">{learnerCount}人 · {facilitatorCount}位讲师</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">成本明细</CardTitle>
          <p className="text-sm text-muted-foreground">费用类别对照：{BUDGET_CATEGORIES.map((c) => `${c.category}-${c.label}`).join("、")}</p>
        </CardHeader>
        <CardContent>
          <EditableTable
            columns={columns}
            data={budgetItems}
            onSave={async (data) => { await saveBudgetItems(projectId, data); }}
            addLabel="添加费用项"
          />
        </CardContent>
      </Card>
    </div>
  );
}

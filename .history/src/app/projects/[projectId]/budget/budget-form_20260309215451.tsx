"use client";

import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EditableTable, ColumnDef } from "@/components/shared/editable-table";
import { saveBudgetItems } from "@/lib/actions";
import { BUDGET_CATEGORIES } from "@/lib/templates";
import { useToast } from "@/components/ui/toast-provider";

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

// Auto-calculate subtotals when price or qty changes
const computeBudgetRow = (row: Record<string, unknown>, key: string) => {
  if (key === "planPrice" || key === "planQty") {
    row.planTotal = (Number(row.planPrice) || 0) * (Number(row.planQty) || 0);
  }
  if (key === "actualPrice" || key === "actualQty") {
    row.actualTotal = (Number(row.actualPrice) || 0) * (Number(row.actualQty) || 0);
  }
  return row;
};

export function BudgetForm({ projectId, budgetItems, facilitatorCount, learnerCount, initialRevenue }: {
  projectId: string;
  budgetItems: Array<Record<string, unknown>>;
  facilitatorCount: number;
  learnerCount: number;
  initialRevenue: number;
}) {
  const [revenue, setRevenue] = useState(initialRevenue);
  const [savingRevenue, setSavingRevenue] = useState(false);
  const [liveItems, setLiveItems] = useState(budgetItems);
  const { showToast } = useToast();

  const handleItemsChange = useCallback((rows: Array<Record<string, unknown>>) => {
    setLiveItems(rows);
  }, []);

  const summary = useMemo(() => {
    const planTotal = liveItems.reduce((s, i) => s + (Number(i.planTotal) || 0), 0);
    const actualTotal = liveItems.reduce((s, i) => s + (Number(i.actualTotal) || 0), 0);
    const planProfit = revenue - planTotal;
    const actualProfit = revenue > 0 && actualTotal > 0 ? revenue - actualTotal : 0;
    const planProfitRate = revenue > 0 ? (planProfit / revenue * 100) : 0;
    const actualProfitRate = revenue > 0 && actualTotal > 0 ? (actualProfit / revenue * 100) : 0;
    const budgetUsage = planTotal > 0 && actualTotal > 0 ? (actualTotal / planTotal * 100) : 0;

    // Category breakdown
    const byCategory: Record<string, { plan: number; actual: number }> = {};
    for (const item of liveItems) {
      const cat = String(item.category || "其他");
      if (!byCategory[cat]) byCategory[cat] = { plan: 0, actual: 0 };
      byCategory[cat].plan += Number(item.planTotal) || 0;
      byCategory[cat].actual += Number(item.actualTotal) || 0;
    }

    return { planTotal, actualTotal, variance: actualTotal - planTotal, planProfit, actualProfit, planProfitRate, actualProfitRate, budgetUsage, byCategory };
  }, [liveItems, revenue]);

  const handleSaveRevenue = async () => {
    setSavingRevenue(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/revenue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revenue }),
      });
      if (!res.ok) throw new Error();
      showToast("报价已保存");
    } catch {
      showToast("保存报价失败", "error");
    } finally { setSavingRevenue(false); }
  };

  return (
    <div className="space-y-6">
      <Card className="border-emerald-200 bg-emerald-50/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-emerald-800">收入与利润概览</CardTitle>
          <p className="text-sm text-muted-foreground">收入 − 成本 = 利润 · 单价 × 数量 自动计算小计</p>
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

          {/* Top line: Revenue / Plan Profit / Actual Profit */}
          <div className="grid grid-cols-4 gap-3 mb-3">
            <div className="text-center p-3 bg-white rounded-lg border border-emerald-200">
              <div className="text-xs text-muted-foreground">项目收入</div>
              <div className="text-xl font-bold text-emerald-700">{revenue > 0 ? `¥${revenue.toLocaleString()}` : "—"}</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-emerald-200">
              <div className="text-xs text-muted-foreground">计划利润</div>
              <div className={`text-xl font-bold ${summary.planProfit >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                {revenue > 0 ? `¥${summary.planProfit.toLocaleString()}` : "—"}
              </div>
              {revenue > 0 && <div className="text-xs text-muted-foreground">{summary.planProfitRate.toFixed(1)}%</div>}
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-emerald-200">
              <div className="text-xs text-muted-foreground">实际利润</div>
              <div className={`text-xl font-bold ${summary.actualProfit >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                {summary.actualTotal > 0 ? `¥${summary.actualProfit.toLocaleString()}` : "—"}
              </div>
              {summary.actualTotal > 0 && <div className="text-xs text-muted-foreground">{summary.actualProfitRate.toFixed(1)}%</div>}
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-emerald-200">
              <div className="text-xs text-muted-foreground">预算执行率</div>
              <div className={`text-xl font-bold ${summary.budgetUsage > 100 ? "text-red-600" : summary.budgetUsage > 90 ? "text-amber-600" : "text-emerald-700"}`}>
                {summary.budgetUsage > 0 ? `${summary.budgetUsage.toFixed(1)}%` : "—"}
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
              {summary.actualTotal > 0 ? `${summary.variance > 0 ? "+" : ""}¥${summary.variance.toLocaleString()}` : "—"}
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

      {/* Category breakdown */}
      {Object.keys(summary.byCategory).length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">费用类别汇总</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {Object.entries(summary.byCategory).map(([cat, vals]) => (
                <div key={cat} className="flex items-center justify-between p-2 bg-slate-50 rounded text-xs">
                  <span className="text-muted-foreground">{BUDGET_CATEGORIES.find(c => c.category === cat)?.label || cat}</span>
                  <div className="text-right">
                    <div className="font-medium">¥{vals.plan.toLocaleString()}</div>
                    {vals.actual > 0 && <div className="text-muted-foreground">实: ¥{vals.actual.toLocaleString()}</div>}
                    {summary.planTotal > 0 && <div className="text-blue-600">{(vals.plan / summary.planTotal * 100).toFixed(0)}%</div>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
            onChange={handleItemsChange}
            computeRow={computeBudgetRow}
          />
        </CardContent>
      </Card>
    </div>
  );
}

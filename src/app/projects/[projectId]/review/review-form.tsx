"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { saveReview } from "@/lib/actions";

interface ReviewData {
  kpis: string;
  aarGoal: string;
  aarResult: string;
  aarDiff: string;
  aarCause: string;
  aarKeep: string;
  aarImprove: string;
  highlights: string;
  improvements: string;
  nextPlan: string;
}

export function ReviewForm({ projectId, review, assessments }: {
  projectId: string;
  review: ReviewData | null;
  assessments: Array<Record<string, unknown>>;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ReviewData>({
    kpis: review?.kpis || "[]",
    aarGoal: review?.aarGoal || "",
    aarResult: review?.aarResult || "",
    aarDiff: review?.aarDiff || "",
    aarCause: review?.aarCause || "",
    aarKeep: review?.aarKeep || "",
    aarImprove: review?.aarImprove || "",
    highlights: review?.highlights || "",
    improvements: review?.improvements || "",
    nextPlan: review?.nextPlan || "",
  });

  const update = (key: keyof ReviewData, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try { await saveReview(projectId, form as unknown as Record<string, string>); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      {assessments.length > 0 && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-800">评估体系关联</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 flex-wrap">
              {assessments.map((a, i) => (
                <Badge key={i} variant="secondary">{String(a.level)} {String(a.name)} (目标: {String(a.target)})</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">AAR复盘四步法</CardTitle>
          <p className="text-sm text-muted-foreground">After Action Review: 目标是什么 → 结果是什么 → 差异在哪里 → 原因是什么</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Step 1: 目标是什么？</Label>
              <Textarea rows={3} value={form.aarGoal} onChange={(e) => update("aarGoal", e.target.value)} placeholder="项目启动时设定的完整目标清单..." />
            </div>
            <div className="space-y-2">
              <Label>Step 2: 实际结果是什么？</Label>
              <Textarea rows={3} value={form.aarResult} onChange={(e) => update("aarResult", e.target.value)} placeholder="实际达成的结果..." />
            </div>
            <div className="space-y-2">
              <Label>Step 3: 差异在哪里？</Label>
              <Textarea rows={3} value={form.aarDiff} onChange={(e) => update("aarDiff", e.target.value)} placeholder="目标与结果之间的差距分析..." />
            </div>
            <div className="space-y-2">
              <Label>Step 4: 根因分析</Label>
              <Textarea rows={3} value={form.aarCause} onChange={(e) => update("aarCause", e.target.value)} placeholder="造成差异的深层原因..." />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">经验提炼</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>值得保持的做法</Label>
              <Textarea rows={4} value={form.aarKeep} onChange={(e) => update("aarKeep", e.target.value)} placeholder="项目中做得好的地方，下次继续保持..." />
            </div>
            <div className="space-y-2">
              <Label>需要改进的地方</Label>
              <Textarea rows={4} value={form.aarImprove} onChange={(e) => update("aarImprove", e.target.value)} placeholder="需要改进和优化的方面..." />
            </div>
          </div>
          <div className="space-y-2">
            <Label>项目亮点</Label>
            <Textarea rows={2} value={form.highlights} onChange={(e) => update("highlights", e.target.value)} placeholder="最突出的成果和亮点..." />
          </div>
          <div className="space-y-2">
            <Label>下一年计划建议</Label>
            <Textarea rows={3} value={form.nextPlan} onChange={(e) => update("nextPlan", e.target.value)} placeholder="基于本次复盘，对下一年项目的建议..." />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>{saving ? "保存中..." : "保存复盘"}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

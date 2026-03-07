"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { EditableTable, ColumnDef } from "@/components/shared/editable-table";
import { saveObjectives } from "@/lib/actions";
import { BLOOM_LEVELS, CAKE_DIMENSIONS, OBJECTIVE_PRESETS } from "@/lib/templates";
import { useState } from "react";

const columns: ColumnDef[] = [
  { key: "moduleName", label: "模块名称", placeholder: "如：战略解码营" },
  { key: "objective", label: "学习目标（SMART表述）", width: "250px", placeholder: "学员能够..." },
  { key: "bloomLevel", label: "布鲁姆层级", type: "select", width: "140px", options: BLOOM_LEVELS },
  { key: "competency", label: "能力维度", type: "select", width: "140px", options: CAKE_DIMENSIONS },
  { key: "businessGoal", label: "对齐业务目标", placeholder: "业务目标..." },
  { key: "assessMethod", label: "评估方法", placeholder: "笔试/实操/汇报" },
  { key: "assessTiming", label: "评估时机", placeholder: "培训后1周" },
  { key: "difficulty", label: "难度", type: "number", width: "70px" },
];

interface Props {
  projectId: string;
  objectives: Array<Record<string, unknown>>;
  competencyGaps: Array<Record<string, unknown>>;
}

export function ObjectivesForm({ projectId, objectives, competencyGaps }: Props) {
  const [data, setData] = useState(objectives);
  const [selectedPresets, setSelectedPresets] = useState<Set<number>>(new Set());
  const [showPresets, setShowPresets] = useState(false);

  const importFromTna = () => {
    const imported = competencyGaps.map((gap) => ({
      moduleName: String(gap.dimension || ""),
      objective: `学员能够掌握并应用${gap.dimension}相关的知识和技能`,
      bloomLevel: "L4",
      competency: "C",
      businessGoal: "",
      assessMethod: String(gap.method || ""),
      assessTiming: "培训后2周",
      difficulty: 3,
    }));
    setData((prev) => [...prev, ...imported]);
  };

  const togglePreset = (idx: number) => {
    setSelectedPresets((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  const importPresets = () => {
    const toImport = Array.from(selectedPresets).map((idx) => ({ ...OBJECTIVE_PRESETS[idx] }));
    setData((prev) => [...prev, ...toImport]);
    setSelectedPresets(new Set());
    setShowPresets(false);
  };

  return (
    <div className="space-y-6">
      {competencyGaps.length > 0 && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-800">从TNA自动导入</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 flex-wrap mb-3">
              {competencyGaps.map((g, i) => (
                <Badge key={i} variant="secondary">{String(g.dimension)} (差距: {String(g.gapScore)})</Badge>
              ))}
            </div>
            <Button size="sm" variant="outline" className="text-blue-700" onClick={importFromTna}>
              从TNA能力差距导入为学习目标
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="border-amber-200 bg-amber-50/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-amber-800">预设学习目标库（{OBJECTIVE_PRESETS.length}个）</CardTitle>
            <Button size="sm" variant="ghost" onClick={() => setShowPresets(!showPresets)}>
              {showPresets ? "收起" : "展开选择"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">从常见领导力/管理能力培训目标中选择，勾选后一键导入</p>
        </CardHeader>
        {showPresets && (
          <CardContent>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {OBJECTIVE_PRESETS.map((preset, idx) => (
                <label
                  key={idx}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedPresets.has(idx) ? "border-amber-400 bg-amber-100/50" : "border-slate-200 hover:bg-slate-50"}`}
                >
                  <Checkbox
                    checked={selectedPresets.has(idx)}
                    onCheckedChange={() => togglePreset(idx)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{preset.moduleName}</span>
                      <Badge variant="outline" className="text-xs">{preset.bloomLevel}</Badge>
                      <Badge variant="outline" className="text-xs">{preset.competency}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{preset.objective}</p>
                    <p className="text-xs text-slate-400 mt-1">评估: {preset.assessMethod} · {preset.assessTiming} · 难度: {preset.difficulty}/5</p>
                  </div>
                </label>
              ))}
            </div>
            {selectedPresets.size > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <Button size="sm" onClick={importPresets}>
                  导入已选的 {selectedPresets.size} 个目标
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSelectedPresets(new Set())}>
                  清除选择
                </Button>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">学习目标矩阵</CardTitle>
          <p className="text-sm text-muted-foreground">每行代表一个学习模块的目标，使用布鲁姆认知层级和CAKE框架进行分类</p>
        </CardHeader>
        <CardContent>
          <EditableTable
            columns={columns}
            data={data}
            onSave={async (rows) => { await saveObjectives(projectId, rows); }}
            addLabel="添加学习目标"
          />
        </CardContent>
      </Card>
    </div>
  );
}

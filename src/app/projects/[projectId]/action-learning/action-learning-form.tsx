"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveActionTeams } from "@/lib/actions";

const PHASES = ["组建", "选题", "调研", "实施", "汇报", "完成"];
const MS_STATUS = [
  { value: "pending", label: "未开始" },
  { value: "in_progress", label: "进行中" },
  { value: "completed", label: "已完成" },
  { value: "delayed", label: "延迟" },
];

interface Team {
  teamName: string;
  topic: string;
  description: string;
  members: string;
  mentor: string;
  phase: string;
  startDate: string;
  endDate: string;
  milestone1: string;
  milestone1Date: string;
  milestone1Status: string;
  milestone2: string;
  milestone2Date: string;
  milestone2Status: string;
  milestone3: string;
  milestone3Date: string;
  milestone3Status: string;
  deliverable: string;
  progressLog: string;
  score: string;
  feedback: string;
}

const emptyTeam: Team = {
  teamName: "", topic: "", description: "", members: "", mentor: "", phase: "组建",
  startDate: "", endDate: "",
  milestone1: "选题答辩", milestone1Date: "", milestone1Status: "pending",
  milestone2: "中期汇报", milestone2Date: "", milestone2Status: "pending",
  milestone3: "成果路演", milestone3Date: "", milestone3Status: "pending",
  deliverable: "", progressLog: "", score: "", feedback: "",
};

interface LearnerInfo { name: string; department: string }

const phaseColor: Record<string, string> = {
  "组建": "bg-slate-100 text-slate-700",
  "选题": "bg-blue-100 text-blue-700",
  "调研": "bg-amber-100 text-amber-700",
  "实施": "bg-purple-100 text-purple-700",
  "汇报": "bg-emerald-100 text-emerald-700",
  "完成": "bg-green-100 text-green-700",
};

export function ActionLearningForm({ projectId, teams, learners }: { projectId: string; teams: Team[]; learners: LearnerInfo[] }) {
  const [items, setItems] = useState<Team[]>(teams.length > 0 ? teams : []);
  const [saving, setSaving] = useState(false);

  const update = (idx: number, key: keyof Team, value: string) => {
    setItems((prev) => prev.map((t, i) => (i === idx ? { ...t, [key]: value } : t)));
  };

  const handleSave = async () => {
    setSaving(true);
    try { await saveActionTeams(projectId, items as unknown as Array<Record<string, unknown>>); } finally { setSaving(false); }
  };

  const completedMs = (t: Team) =>
    [t.milestone1Status, t.milestone2Status, t.milestone3Status].filter((s) => s === "completed").length;

  return (
    <div className="space-y-6">
      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="py-4 text-center">
              <div className="text-2xl font-bold text-primary">{items.length}</div>
              <div className="text-xs text-muted-foreground">行动学习小组</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <div className="text-2xl font-bold text-amber-600">
                {items.reduce((s, t) => s + completedMs(t), 0)} / {items.length * 3}
              </div>
              <div className="text-xs text-muted-foreground">里程碑完成</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {items.filter((t) => t.phase === "完成").length}
              </div>
              <div className="text-xs text-muted-foreground">已结项小组</div>
            </CardContent>
          </Card>
        </div>
      )}

      {learners.length > 0 && items.length === 0 && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="py-4">
            <p className="text-sm text-blue-800 mb-2">已有 {learners.length} 名学员，可分组开展行动学习</p>
            <p className="text-xs text-blue-600">学员：{learners.map((l) => l.name).filter(Boolean).join("、") || "—"}</p>
          </CardContent>
        </Card>
      )}

      {items.map((team, idx) => (
        <Card key={idx} className="border-l-4" style={{ borderLeftColor: team.phase === "完成" ? "#10b981" : "#3b82f6" }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CardTitle className="text-base">小组 {idx + 1}: {team.teamName || "未命名"}</CardTitle>
                <Badge className={phaseColor[team.phase] || ""}>{team.phase}</Badge>
              </div>
              <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}>
                删除
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>小组名称</Label>
                <Input value={team.teamName} onChange={(e) => update(idx, "teamName", e.target.value)} placeholder="如：破风队" />
              </div>
              <div className="space-y-2">
                <Label>课题方向</Label>
                <Input value={team.topic} onChange={(e) => update(idx, "topic", e.target.value)} placeholder="如：提升客户转化率" />
              </div>
              <div className="space-y-2">
                <Label>当前阶段</Label>
                <Select value={team.phase} onValueChange={(v) => update(idx, "phase", v ?? "")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PHASES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>课题描述</Label>
              <Textarea rows={2} value={team.description} onChange={(e) => update(idx, "description", e.target.value)} placeholder="详细描述课题背景、目标、预期成果..." />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>成员（逗号分隔）</Label>
                <Input value={team.members} onChange={(e) => update(idx, "members", e.target.value)} placeholder="张三, 李四, 王五" />
              </div>
              <div className="space-y-2">
                <Label>导师/Sponsor</Label>
                <Input value={team.mentor} onChange={(e) => update(idx, "mentor", e.target.value)} placeholder="导师姓名" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>开始日期</Label>
                  <Input type="date" value={team.startDate} onChange={(e) => update(idx, "startDate", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>结束日期</Label>
                  <Input type="date" value={team.endDate} onChange={(e) => update(idx, "endDate", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">里程碑管理</h4>
              <div className="grid grid-cols-3 gap-4">
                {([["milestone1", "milestone1Date", "milestone1Status"], ["milestone2", "milestone2Date", "milestone2Status"], ["milestone3", "milestone3Date", "milestone3Status"]] as const).map(([nameKey, dateKey, statusKey], mi) => (
                  <div key={mi} className="p-3 border rounded-lg bg-slate-50/50">
                    <div className="space-y-2">
                      <Input value={team[nameKey]} onChange={(e) => update(idx, nameKey, e.target.value)} placeholder={`里程碑${mi + 1}`} className="text-sm" />
                      <Input type="date" value={team[dateKey]} onChange={(e) => update(idx, dateKey, e.target.value)} className="text-sm" />
                      <Select value={team[statusKey]} onValueChange={(v) => update(idx, statusKey, v ?? "")}>
                        <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {MS_STATUS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>最终交付物</Label>
                  <Textarea rows={2} value={team.deliverable} onChange={(e) => update(idx, "deliverable", e.target.value)} placeholder="方案报告、路演PPT、实施数据..." />
                </div>
                <div className="space-y-2">
                  <Label>进展日志</Label>
                  <Textarea rows={2} value={team.progressLog} onChange={(e) => update(idx, "progressLog", e.target.value)} placeholder="记录关键进展、决策、风险..." />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>评分</Label>
                  <Input value={team.score} onChange={(e) => update(idx, "score", e.target.value)} placeholder="如：85/100" />
                </div>
                <div className="space-y-2">
                  <Label>导师/评委反馈</Label>
                  <Input value={team.feedback} onChange={(e) => update(idx, "feedback", e.target.value)} placeholder="课题选择精准，方案落地性强" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={() => setItems((prev) => [...prev, { ...emptyTeam }])}>
          添加行动学习小组
        </Button>
        <div className="flex-1" />
        <Button onClick={handleSave} disabled={saving}>{saving ? "保存中..." : "保存"}</Button>
      </div>
    </div>
  );
}

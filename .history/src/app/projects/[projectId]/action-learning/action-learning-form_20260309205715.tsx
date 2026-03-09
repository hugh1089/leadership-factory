"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveActionTeams } from "@/lib/actions";
import { useToast } from "@/components/ui/toast-provider";

const SESSION_COUNT_OPTIONS = [
  { value: "3", label: "3次（精简型：选题→中期→路演）" },
  { value: "4", label: "4次（标准型：选题→调研→实施→路演）" },
  { value: "5", label: "5次（完整型：选题→调研→中期→实施→路演）" },
];

const TOPIC_MODE_OPTIONS = [
  { value: "team", label: "小组课题（每组一个共同课题）" },
  { value: "individual", label: "个人课题（每人一个独立课题）" },
];

const PHASES = ["组建", "选题", "调研", "实施", "汇报", "完成"];
const MS_STATUS = [
  { value: "pending", label: "未开始" },
  { value: "in_progress", label: "进行中" },
  { value: "completed", label: "已完成" },
  { value: "delayed", label: "延迟" },
];

const TOPIC_PRESETS = [
  "提升客户转化率", "优化内部流程效率", "新产品上市策略",
  "团队协作机制改进", "数字化转型落地", "降本增效方案",
  "人才梯队建设", "创新文化推动", "跨部门协同优化", "客户体验提升",
];

const SESSION_TEMPLATES: Record<string, Array<{ name: string; input: string; activity: string; output: string }>> = {
  "3": [
    { name: "选题答辩", input: "问题分析报告·业务数据支撑", activity: "课题发布→小组选题→可行性论证→专家点评", output: "选题确认书·初步行动计划" },
    { name: "中期汇报", input: "调研数据·初步方案·阶段成果", activity: "进展汇报→困难分析→同伴反馈→导师辅导", output: "改进方案·下阶段计划" },
    { name: "成果路演", input: "完整方案·实施数据·成果呈现", activity: "路演展示→评委提问→互评打分→颁奖", output: "最终报告·评分结果·行动转化计划" },
  ],
  "4": [
    { name: "选题答辩", input: "问题分析报告·业务数据支撑", activity: "课题发布→小组选题→可行性论证→专家点评", output: "选题确认书·初步行动计划" },
    { name: "调研汇报", input: "调研计划·访谈记录·数据分析", activity: "调研方法论讲解→小组调研成果分享→根因分析", output: "调研报告·根因分析图·假设验证" },
    { name: "方案实施", input: "解决方案草案·实施计划·资源需求", activity: "方案评审→试点设计→风险评估→资源对接", output: "实施方案书·试点计划·里程碑表" },
    { name: "成果路演", input: "完整方案·实施数据·成果呈现", activity: "路演展示→评委提问→互评打分→颁奖", output: "最终报告·评分结果·行动转化计划" },
  ],
  "5": [
    { name: "选题答辩", input: "问题分析报告·业务数据支撑", activity: "课题发布→小组选题→可行性论证→专家点评", output: "选题确认书·初步行动计划" },
    { name: "调研汇报", input: "调研计划·访谈记录·数据分析", activity: "调研方法论讲解→小组调研成果分享→根因分析", output: "调研报告·根因分析图·假设验证" },
    { name: "中期检查", input: "阶段进展·初步数据·遇到的问题", activity: "进展汇报→困难分析→同伴反馈→导师辅导", output: "改进方案·资源调整·下阶段重点" },
    { name: "方案实施", input: "解决方案·实施计划·试点数据", activity: "方案评审→试点复盘→优化迭代→推广计划", output: "优化方案·推广策略·效果数据" },
    { name: "成果路演", input: "完整方案·实施数据·成果呈现", activity: "路演展示→评委提问→互评打分→颁奖", output: "最终报告·评分结果·行动转化计划" },
  ],
};

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
  const [dirty, setDirty] = useState(false);
  const [sessionCount, setSessionCount] = useState("4");
  const [topicMode, setTopicMode] = useState("team");
  const [showConfig, setShowConfig] = useState(items.length === 0);
  const { showToast } = useToast();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const doSave = useCallback(async () => {
    setSaving(true);
    try {
      await saveActionTeams(projectId, itemsRef.current as unknown as Array<Record<string, unknown>>);
      setDirty(false);
      showToast("行动学习数据已保存");
    } catch { showToast("保存失败", "error"); }
    finally { setSaving(false); }
  }, [projectId, showToast]);

  // Auto-save every 3 minutes
  useEffect(() => {
    if (!dirty) return;
    timerRef.current = setTimeout(doSave, 180000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [dirty, doSave]);

  const update = (idx: number, key: keyof Team, value: string) => {
    setItems((prev) => prev.map((t, i) => (i === idx ? { ...t, [key]: value } : t)));
    setDirty(true);
  };

  const completedMs = (t: Team) =>
    [t.milestone1Status, t.milestone2Status, t.milestone3Status].filter((s) => s === "completed").length;

  const sessions = SESSION_TEMPLATES[sessionCount] || SESSION_TEMPLATES["4"];

  return (
    <div className="space-y-6">
      {/* Configuration Panel */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardHeader className="pb-2 cursor-pointer" onClick={() => setShowConfig(!showConfig)}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base text-blue-800">⚙️ 行动学习配置</CardTitle>
            <span className="text-xs text-blue-600">{showConfig ? "收起" : "展开"}</span>
          </div>
        </CardHeader>
        {showConfig && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>会议场次</Label>
                <Select value={sessionCount} onValueChange={setSessionCount}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SESSION_COUNT_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>课题模式</Label>
                <Select value={topicMode} onValueChange={setTopicMode}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TOPIC_MODE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Session flow preview */}
            <div>
              <Label className="text-sm font-medium mb-2 block">会议流程预览（每场的输入→活动→输出）</Label>
              <div className="grid gap-3">
                {sessions.map((ses, i) => (
                  <div key={i} className="p-3 bg-white rounded-lg border text-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">第{i + 1}次</Badge>
                      <span className="font-semibold">{ses.name}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div><span className="text-blue-600 font-medium">📥 输入：</span>{ses.input}</div>
                      <div><span className="text-purple-600 font-medium">🎯 活动：</span>{ses.activity}</div>
                      <div><span className="text-emerald-600 font-medium">📤 输出：</span>{ses.output}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Topic presets */}
            <div>
              <Label className="text-sm font-medium mb-2 block">常见课题方向参考</Label>
              <div className="flex flex-wrap gap-2">
                {TOPIC_PRESETS.map((t) => (
                  <Badge key={t} variant="outline" className="cursor-default text-xs">{t}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Summary cards */}
      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="py-4 text-center">
              <div className="text-2xl font-bold text-primary">{items.length}</div>
              <div className="text-xs text-muted-foreground">行动学习{topicMode === "team" ? "小组" : "个人"}</div>
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
              <div className="text-xs text-muted-foreground">已结项</div>
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
                <CardTitle className="text-base">{topicMode === "team" ? `小组 ${idx + 1}` : `学员 ${idx + 1}`}: {team.teamName || "未命名"}</CardTitle>
                <Badge className={phaseColor[team.phase] || ""}>{team.phase}</Badge>
                {dirty && <span className="text-xs text-orange-500">●未保存</span>}
              </div>
              <Button variant="ghost" size="sm" className="text-destructive" onClick={() => { setItems((prev) => prev.filter((_, i) => i !== idx)); setDirty(true); }}>
                删除
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{topicMode === "team" ? "小组名称" : "学员姓名"}</Label>
                <Input value={team.teamName} onChange={(e) => update(idx, "teamName", e.target.value)} placeholder={topicMode === "team" ? "如：破风队" : "如：张三"} />
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
                <Label>{topicMode === "team" ? "成员（逗号分隔）" : "所属部门"}</Label>
                <Input value={team.members} onChange={(e) => update(idx, "members", e.target.value)} placeholder={topicMode === "team" ? "张三, 李四, 王五" : "如：市场部"} />
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
        <Button variant="outline" onClick={() => { setItems((prev) => [...prev, { ...emptyTeam }]); setDirty(true); }}>
          添加{topicMode === "team" ? "行动学习小组" : "个人课题"}
        </Button>
        <div className="flex-1" />
        {dirty && <span className="text-xs text-orange-500 mr-2">●有未保存的更改</span>}
        <Button onClick={doSave} disabled={saving}>{saving ? "保存中..." : "保存"}</Button>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveCoachingEngagements } from "@/lib/actions";
import { useToast } from "@/components/ui/toast-provider";

const COACHING_PHASES = ["匹配", "目标设定", "辅导中", "评估", "完成"];
const COACH_TYPES = [
  { value: "external", label: "外部教练（ICF/EMCC认证）" },
  { value: "internal", label: "内部教练（受训内部员工）" },
  { value: "mentor", label: "导师（高管/资深经理）" },
  { value: "peer", label: "同伴教练（同级互助）" },
];

const SESSION_PLANS = [
  { value: "4", label: "4次（精简型：开启+2次辅导+总结）" },
  { value: "6", label: "6次（标准型：开启+4次辅导+总结）" },
  { value: "8", label: "8次（深度型：开启+6次辅导+总结）" },
  { value: "12", label: "12次（长期型：开启+10次辅导+总结）" },
];

const COACHING_RESOURCES = [
  { type: "external", materials: "教练协议·保密承诺书·目标设定工作表·会谈记录模板·360反馈表·行为改变追踪表" },
  { type: "internal", materials: "辅导手册·GROW对话框架·反馈工具包·行动计划模板·阶段评估表" },
  { type: "mentor", materials: "导师手册·导师-学员匹配表·月度沟通记录·经验分享大纲·关系评估表" },
  { type: "peer", materials: "同伴教练指引·互助协议·观察记录表·反馈交换框架·成长日志模板" },
];

interface Engagement {
  coacheeName: string;
  coachName: string;
  coachType: string;
  goal: string;
  goalSmart: string;
  phase: string;
  sessionsPlanned: number;
  sessionsCompleted: number;
  sessionLog: string;
  startDate: string;
  endDate: string;
  preScore: string;
  postScore: string;
  outcome: string;
  coacheeReflection: string;
  managerFeedback: string;
}

const emptyEngagement: Engagement = {
  coacheeName: "", coachName: "", coachType: "external",
  goal: "", goalSmart: "", phase: "匹配",
  sessionsPlanned: 6, sessionsCompleted: 0, sessionLog: "[]",
  startDate: "", endDate: "",
  preScore: "", postScore: "",
  outcome: "", coacheeReflection: "", managerFeedback: "",
};

interface LearnerInfo { name: string; position: string }

interface SessionEntry { date: string; topic: string; insight: string; action: string; behaviorChange: string }

const phaseColor: Record<string, string> = {
  "匹配": "bg-slate-100 text-slate-700",
  "目标设定": "bg-blue-100 text-blue-700",
  "辅导中": "bg-purple-100 text-purple-700",
  "评估": "bg-amber-100 text-amber-700",
  "完成": "bg-green-100 text-green-700",
};

function parseSessionLog(log: string): SessionEntry[] {
  try {
    const parsed = JSON.parse(log);
    return parsed.map((s: Record<string, string>) => ({ ...s, behaviorChange: s.behaviorChange || "" }));
  } catch { return []; }
}

export function CoachingForm({ projectId, engagements, learners }: { projectId: string; engagements: Engagement[]; learners: LearnerInfo[] }) {
  const [items, setItems] = useState<Engagement[]>(engagements.length > 0 ? engagements : []);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const { showToast } = useToast();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const doSave = useCallback(async () => {
    setSaving(true);
    try {
      await saveCoachingEngagements(projectId, itemsRef.current as unknown as Array<Record<string, unknown>>);
      setDirty(false);
      showToast("教练辅导数据已保存");
    } catch { showToast("保存失败", "error"); }
    finally { setSaving(false); }
  }, [projectId, showToast]);

  // Auto-save every 3 minutes
  useEffect(() => {
    if (!dirty) return;
    timerRef.current = setTimeout(doSave, 180000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [dirty, doSave]);

  const update = (idx: number, key: keyof Engagement, value: string | number) => {
    setItems((prev) => prev.map((e, i) => (i === idx ? { ...e, [key]: value } : e)));
    setDirty(true);
  };

  const addSession = (idx: number) => {
    const sessions = parseSessionLog(items[idx].sessionLog);
    sessions.push({ date: "", topic: "", insight: "", action: "", behaviorChange: "" });
    update(idx, "sessionLog", JSON.stringify(sessions));
    update(idx, "sessionsCompleted", sessions.length);
  };

  const removeSession = (engIdx: number, sesIdx: number) => {
    const sessions = parseSessionLog(items[engIdx].sessionLog);
    sessions.splice(sesIdx, 1);
    update(engIdx, "sessionLog", JSON.stringify(sessions));
    update(engIdx, "sessionsCompleted", sessions.length);
  };

  const updateSession = (engIdx: number, sesIdx: number, key: keyof SessionEntry, value: string) => {
    const sessions = parseSessionLog(items[engIdx].sessionLog);
    sessions[sesIdx] = { ...sessions[sesIdx], [key]: value };
    update(engIdx, "sessionLog", JSON.stringify(sessions));
  };

  const getResourcesForType = (coachType: string) => {
    return COACHING_RESOURCES.find((r) => r.type === coachType)?.materials || "";
  };

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      {items.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="py-4 text-center">
              <div className="text-2xl font-bold text-primary">{items.length}</div>
              <div className="text-xs text-muted-foreground">辅导关系</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {items.reduce((s, e) => s + parseSessionLog(e.sessionLog).length, 0)}
              </div>
              <div className="text-xs text-muted-foreground">已完成会谈</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <div className="text-2xl font-bold text-amber-600">
                {items.reduce((s, e) => s + e.sessionsPlanned, 0)}
              </div>
              <div className="text-xs text-muted-foreground">计划总会谈</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {items.filter((e) => e.phase === "完成").length}
              </div>
              <div className="text-xs text-muted-foreground">已结案</div>
            </CardContent>
          </Card>
        </div>
      )}

      {learners.length > 0 && items.length === 0 && (
        <Card className="border-purple-200 bg-purple-50/50">
          <CardContent className="py-4">
            <p className="text-sm text-purple-800">已有 {learners.length} 名学员，可为其安排教练辅导</p>
            <Button size="sm" variant="outline" className="mt-2 text-purple-700" onClick={() => {
              const newItems = learners.filter((l) => l.name).map((l) => ({
                ...emptyEngagement,
                coacheeName: l.name,
              }));
              setItems(newItems);
              setDirty(true);
            }}>
              为所有学员创建辅导记录
            </Button>
          </CardContent>
        </Card>
      )}

      {items.map((eng, idx) => {
        const sessions = parseSessionLog(eng.sessionLog);
        const progressPct = eng.sessionsPlanned > 0 ? Math.round((sessions.length / eng.sessionsPlanned) * 100) : 0;
        const resources = getResourcesForType(eng.coachType);
        return (
          <Card key={idx} className="border-l-4" style={{ borderLeftColor: eng.phase === "完成" ? "#10b981" : "#8b5cf6" }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-base">{eng.coacheeName || "未指定"} × {eng.coachName || "待匹配教练"}</CardTitle>
                  <Badge className={phaseColor[eng.phase] || ""}>{eng.phase}</Badge>
                  <span className="text-xs text-muted-foreground">{sessions.length}/{eng.sessionsPlanned} 次会谈 ({progressPct}%)</span>
                  {dirty && <span className="text-xs text-orange-500">●未保存</span>}
                </div>
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => { setItems((prev) => prev.filter((_, i) => i !== idx)); setDirty(true); }}>删除</Button>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                <div className="bg-purple-500 h-1.5 rounded-full transition-all" style={{ width: `${Math.min(progressPct, 100)}%` }} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>学员 (Coachee)</Label>
                  <Input value={eng.coacheeName} onChange={(e) => update(idx, "coacheeName", e.target.value)} placeholder="学员姓名" />
                </div>
                <div className="space-y-2">
                  <Label>教练 (Coach)</Label>
                  <Input value={eng.coachName} onChange={(e) => update(idx, "coachName", e.target.value)} placeholder="教练姓名" />
                </div>
                <div className="space-y-2">
                  <Label>教练类型</Label>
                  <Select value={eng.coachType} onValueChange={(v) => update(idx, "coachType", v ?? "")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {COACH_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>计划会谈次数</Label>
                  <Select value={String(eng.sessionsPlanned)} onValueChange={(v) => update(idx, "sessionsPlanned", Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SESSION_PLANS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>阶段</Label>
                <Select value={eng.phase} onValueChange={(v) => update(idx, "phase", v ?? "")}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COACHING_PHASES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Resource hint */}
              {resources && (
                <div className="text-xs text-purple-600 bg-purple-50 p-2 rounded">
                  <span className="font-medium">📋 建议准备材料：</span>{resources}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>辅导目标</Label>
                  <Textarea rows={2} value={eng.goal} onChange={(e) => update(idx, "goal", e.target.value)} placeholder="希望通过辅导实现什么..." />
                </div>
                <div className="space-y-2">
                  <Label>SMART目标描述</Label>
                  <Textarea rows={2} value={eng.goalSmart} onChange={(e) => update(idx, "goalSmart", e.target.value)} placeholder="具体、可衡量、可达成、相关、有时限" />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2"><Label>开始日期</Label><Input type="date" value={eng.startDate} onChange={(e) => update(idx, "startDate", e.target.value)} /></div>
                <div className="space-y-2"><Label>结束日期</Label><Input type="date" value={eng.endDate} onChange={(e) => update(idx, "endDate", e.target.value)} /></div>
                <div className="space-y-2"><Label>前测评分</Label><Input value={eng.preScore} onChange={(e) => update(idx, "preScore", e.target.value)} placeholder="如：3.2/5" /></div>
                <div className="space-y-2"><Label>后测评分</Label><Input value={eng.postScore} onChange={(e) => update(idx, "postScore", e.target.value)} placeholder="如：4.1/5" /></div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-slate-700">辅导会谈记录</h4>
                  <Button size="sm" variant="outline" onClick={() => addSession(idx)}>添加会谈</Button>
                </div>
                {sessions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">暂无会谈记录。点击"添加会谈"开始记录每次辅导。</p>
                ) : (
                  <div className="space-y-3">
                    {sessions.map((ses, si) => (
                      <div key={si} className="p-3 border rounded-lg bg-slate-50/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-slate-500">第{si + 1}次会谈</span>
                          <Button variant="ghost" size="sm" className="text-xs text-destructive h-6" onClick={() => removeSession(idx, si)}>移除</Button>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">日期</Label>
                            <Input type="date" value={ses.date} onChange={(e) => updateSession(idx, si, "date", e.target.value)} className="text-sm" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">主题</Label>
                            <Input value={ses.topic} onChange={(e) => updateSession(idx, si, "topic", e.target.value)} placeholder="本次主题" className="text-sm" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">核心洞察</Label>
                            <Input value={ses.insight} onChange={(e) => updateSession(idx, si, "insight", e.target.value)} placeholder="关键发现" className="text-sm" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">行动承诺</Label>
                            <Input value={ses.action} onChange={(e) => updateSession(idx, si, "action", e.target.value)} placeholder="下一步行动" className="text-sm" />
                          </div>
                        </div>
                        <div className="mt-2 space-y-1">
                          <Label className="text-xs">行为改变观察</Label>
                          <Input value={ses.behaviorChange || ""} onChange={(e) => updateSession(idx, si, "behaviorChange", e.target.value)} placeholder="记录学员在工作中可观察到的行为变化..." className="text-sm" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t pt-4 grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>辅导成果总结</Label>
                  <Textarea rows={2} value={eng.outcome} onChange={(e) => update(idx, "outcome", e.target.value)} placeholder="辅导达成了哪些成果..." />
                </div>
                <div className="space-y-2">
                  <Label>学员反思</Label>
                  <Textarea rows={2} value={eng.coacheeReflection} onChange={(e) => update(idx, "coacheeReflection", e.target.value)} placeholder="学员自我反思..." />
                </div>
                <div className="space-y-2">
                  <Label>主管反馈</Label>
                  <Textarea rows={2} value={eng.managerFeedback} onChange={(e) => update(idx, "managerFeedback", e.target.value)} placeholder="直线主管观察到的行为变化..." />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={() => { setItems((prev) => [...prev, { ...emptyEngagement }]); setDirty(true); }}>
          添加辅导关系
        </Button>
        <div className="flex-1" />
        {dirty && <span className="text-xs text-orange-500 mr-2">●有未保存的更改</span>}
        <Button onClick={doSave} disabled={saving}>{saving ? "保存中..." : "保存"}</Button>
      </div>
    </div>
  );
}

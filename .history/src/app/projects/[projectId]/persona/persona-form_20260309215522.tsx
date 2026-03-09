"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { savePersonas } from "@/lib/actions";
import { useToast } from "@/components/ui/toast-provider";

interface Persona {
  name: string;
  age: string;
  department: string;
  position: string;
  yearsExp: string;
  mgmtYears: string;
  traits: string;
  motivation: string;
  challenges: string;
  learnStyle: string;
  techLevel: string;
  // Assessment - categorized
  assessOnline: string;     // 线上测评
  assessOffline: string;    // 线下测评
  assessDisc: string;
  assessMbti: string;
  assess360: string;
  assessCustom: string;
  // New fields
  trainingHistory: string;  // 重要培训项目经历
  projectExp: string;       // 重大项目经验
  trackNotes: string;
}

const emptyPersona: Persona = {
  name: "", age: "", department: "", position: "", yearsExp: "", mgmtYears: "",
  traits: "", motivation: "", challenges: "", learnStyle: "", techLevel: "",
  assessOnline: "", assessOffline: "",
  assessDisc: "", assessMbti: "", assess360: "", assessCustom: "",
  trainingHistory: "", projectExp: "", trackNotes: "",
};

const ONLINE_ASSESSMENT_OPTIONS = [
  "DISC在线测评", "MBTI在线版", "盖洛普优势识别器", "Hogan领导力测评",
  "DDI领导力评鉴", "Lumina Spark", "Thomas International PPA",
];

const OFFLINE_ASSESSMENT_OPTIONS = [
  "商业案例分析", "BI行为面试", "360度评估反馈", "评价中心(AC)",
  "情境模拟演练", "公文筐测试", "无领导小组讨论", "角色扮演面试",
];

const LEARNING_STYLE_OPTIONS = [
  { value: "案例学习+实践", label: "案例学习+实践" },
  { value: "结构化学习+工具方法", label: "结构化学习+工具方法" },
  { value: "体验式学习+反思", label: "体验式学习+反思" },
  { value: "社交学习+同伴交流", label: "社交学习+同伴交流" },
  { value: "自主学习+线上课程", label: "自主学习+线上课程" },
  { value: "行动学习+项目实战", label: "行动学习+项目实战" },
  { value: "教练辅导+1对1", label: "教练辅导+1对1" },
];

const PERSONA_TEMPLATES: Persona[] = [
  {
    name: "变革推动者·张总监", age: "42", department: "运营部门", position: "总监",
    yearsExp: "15", mgmtYears: "8", traits: "结果导向,执行力强,善于沟通",
    motivation: "希望带领团队突破业绩瓶颈", challenges: "战略思维不够系统，跨部门协作有待加强",
    learnStyle: "案例学习+实践", techLevel: "中等",
    assessOnline: "DISC在线测评, MBTI在线版", assessOffline: "360度评估反馈, 商业案例分析",
    assessDisc: "D型-支配型", assessMbti: "ENTJ", assess360: "优势：执行力、决断力；发展：倾听、授权", assessCustom: "",
    trainingHistory: "2023年高管领导力项目（6个月）, 2022年战略思维工作坊（3天）",
    projectExp: "主导过3次组织变革项目，包括业务线整合和数字化转型试点",
    trackNotes: "",
  },
  {
    name: "稳健执行者·李经理", age: "38", department: "财务部门", position: "高级经理",
    yearsExp: "12", mgmtYears: "5", traits: "严谨细致,风险意识强,偏保守",
    motivation: "提升管理能力，为晋升做准备", challenges: "创新意识不足，领导风格偏控制型",
    learnStyle: "结构化学习+工具方法", techLevel: "中等",
    assessOnline: "DISC在线测评", assessOffline: "BI行为面试, 360度评估反馈",
    assessDisc: "C型-谨慎型", assessMbti: "ISTJ", assess360: "优势：严谨、合规；发展：创新、灵活", assessCustom: "",
    trainingHistory: "2024年财务管理者转型项目（3个月）",
    projectExp: "参与公司ERP系统上线项目，负责财务模块实施",
    trackNotes: "",
  },
];

export function PersonaForm({ projectId, personas }: { projectId: string; personas: Persona[] }) {
  const [items, setItems] = useState<Persona[]>(personas.length > 0 ? personas : []);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const { showToast } = useToast();
  const itemsRef = useRef(items);
  const dirtyRef = useRef(false);

  useEffect(() => { itemsRef.current = items; }, [items]);
  useEffect(() => { dirtyRef.current = dirty; }, [dirty]);

  // Auto-save every 3 minutes
  useEffect(() => {
    const timer = setInterval(async () => {
      if (dirtyRef.current && itemsRef.current.length > 0) {
        try {
          await savePersonas(projectId, itemsRef.current as unknown as Array<Record<string, string>>);
          dirtyRef.current = false;
          showToast("已自动保存", "info");
        } catch { /* silent */ }
      }
    }, 180000);
    return () => clearInterval(timer);
  }, [projectId, showToast]);

  const update = (idx: number, key: keyof Persona, value: string) => {
    setItems((prev) => prev.map((p, i) => (i === idx ? { ...p, [key]: value } : p)));
    dirtyRef.current = true;
    setDirty(true);
  };

  const toggleAssessment = (idx: number, field: "assessOnline" | "assessOffline", option: string) => {
    const current = items[idx][field];
    const list = current ? current.split(", ").filter(Boolean) : [];
    const updated = list.includes(option)
      ? list.filter((l) => l !== option).join(", ")
      : [...list, option].join(", ");
    update(idx, field, updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await savePersonas(projectId, items as unknown as Array<Record<string, string>>);
      dirtyRef.current = false;
      setDirty(false);
      showToast("保存成功");
    } catch {
      showToast("保存失败", "error");
    } finally { setSaving(false); }
  };

  const csvQuote = (v: string) => v.includes(",") || v.includes("\n") || v.includes("\"") ? `"${v.replace(/"/g, '""')}"` : v;

  const handleDownload = (idx: number) => {
    const p = items[idx];
    const lines = Object.entries(p).map(([k, v]) => `${csvQuote(k)},${csvQuote(v)}`).join("\n");
    const blob = new Blob(["\uFEFF" + "字段,内容\n" + lines], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `学员画像_${p.name || idx + 1}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    const headers = Object.keys(emptyPersona).map(csvQuote).join(",");
    const rows = items.map((p) => Object.values(p).map(csvQuote).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + headers + "\n" + rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "全部学员画像.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {items.map((p, idx) => (
        <Card key={idx}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">画像 {idx + 1}: {p.name || "未命名"}</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleDownload(idx)}>下载此画像</Button>
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => { setItems((prev) => prev.filter((_, i) => i !== idx)); dirtyRef.current = true; setDirty(true); }}>
                  删除画像
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 基本信息 */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>画像名称</Label><Input value={p.name} onChange={(e) => update(idx, "name", e.target.value)} placeholder="如：变革推动者·张总监" /></div>
              <div className="space-y-2"><Label>年龄</Label><Input value={p.age} onChange={(e) => update(idx, "age", e.target.value)} placeholder="42" /></div>
              <div className="space-y-2"><Label>部门</Label><Input value={p.department} onChange={(e) => update(idx, "department", e.target.value)} placeholder="运营部门" /></div>
              <div className="space-y-2"><Label>岗位</Label><Input value={p.position} onChange={(e) => update(idx, "position", e.target.value)} placeholder="总监" /></div>
              <div className="space-y-2"><Label>工作年限</Label><Input value={p.yearsExp} onChange={(e) => update(idx, "yearsExp", e.target.value)} placeholder="15" /></div>
              <div className="space-y-2"><Label>管理年限</Label><Input value={p.mgmtYears} onChange={(e) => update(idx, "mgmtYears", e.target.value)} placeholder="8" /></div>
            </div>
            <div className="space-y-2"><Label>性格特征（逗号分隔）</Label><Input value={p.traits} onChange={(e) => update(idx, "traits", e.target.value)} placeholder="结果导向, 执行力强, 善于沟通" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>学习动机</Label><Textarea rows={2} value={p.motivation} onChange={(e) => update(idx, "motivation", e.target.value)} placeholder="参加培训的核心驱动力..." /></div>
              <div className="space-y-2"><Label>主要挑战</Label><Textarea rows={2} value={p.challenges} onChange={(e) => update(idx, "challenges", e.target.value)} placeholder="当前面临的管理难题..." /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>偏好的学习方式</Label>
                <Select value={p.learnStyle || ""} onValueChange={(v) => update(idx, "learnStyle", v ?? "")}>
                  <SelectTrigger><SelectValue placeholder="选择学习方式..." /></SelectTrigger>
                  <SelectContent>
                    {LEARNING_STYLE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>数字化水平</Label>
                <Select value={p.techLevel || ""} onValueChange={(v) => update(idx, "techLevel", v ?? "")}>
                  <SelectTrigger><SelectValue placeholder="选择..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="高">高</SelectItem>
                    <SelectItem value="中等">中等</SelectItem>
                    <SelectItem value="低">低</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 测评数据 - 分线上/线下 */}
            <div className="border-t pt-4 mt-4">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">测评数据</h4>

              <div className="grid grid-cols-2 gap-6 mb-4">
                <div>
                  <Label className="text-xs text-blue-700 mb-2 block">线上测评工具（可多选）</Label>
                  <div className="flex flex-wrap gap-2">
                    {ONLINE_ASSESSMENT_OPTIONS.map((opt) => (
                      <label key={opt} className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border cursor-pointer transition-colors ${p.assessOnline?.includes(opt) ? "border-blue-400 bg-blue-50 text-blue-700" : "border-slate-200 hover:bg-slate-50"}`}>
                        <Checkbox
                          checked={p.assessOnline?.includes(opt) || false}
                          onCheckedChange={() => toggleAssessment(idx, "assessOnline", opt)}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-emerald-700 mb-2 block">线下测评工具（可多选）</Label>
                  <div className="flex flex-wrap gap-2">
                    {OFFLINE_ASSESSMENT_OPTIONS.map((opt) => (
                      <label key={opt} className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border cursor-pointer transition-colors ${p.assessOffline?.includes(opt) ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "border-slate-200 hover:bg-slate-50"}`}>
                        <Checkbox
                          checked={p.assessOffline?.includes(opt) || false}
                          onCheckedChange={() => toggleAssessment(idx, "assessOffline", opt)}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>DISC测评结果</Label><Input value={p.assessDisc} onChange={(e) => update(idx, "assessDisc", e.target.value)} placeholder="D型-支配型 / I型-影响型 / S型-稳健型 / C型-谨慎型" /></div>
                <div className="space-y-2"><Label>MBTI类型</Label><Input value={p.assessMbti} onChange={(e) => update(idx, "assessMbti", e.target.value)} placeholder="ENTJ / ISTJ / ..." /></div>
                <div className="space-y-2"><Label>360度评估摘要</Label><Textarea rows={2} value={p.assess360} onChange={(e) => update(idx, "assess360", e.target.value)} placeholder="优势：XX；发展领域：YY" /></div>
                <div className="space-y-2"><Label>其他测评（自行添加）</Label><Textarea rows={2} value={p.assessCustom} onChange={(e) => update(idx, "assessCustom", e.target.value)} placeholder="如：盖洛普优势识别器结果 / Hogan评鉴报告等" /></div>
              </div>
            </div>

            {/* 重要培训项目经历 + 重大项目经验 */}
            <div className="border-t pt-4 mt-4">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">经验与经历</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>重要培训项目经历</Label>
                  <Textarea
                    rows={3}
                    value={p.trainingHistory}
                    onChange={(e) => update(idx, "trainingHistory", e.target.value)}
                    placeholder="如：2023年高管领导力项目（6个月）&#10;2022年战略思维工作坊（3天）&#10;2021年MBA研修班..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>重大项目经验</Label>
                  <Textarea
                    rows={3}
                    value={p.projectExp}
                    onChange={(e) => update(idx, "projectExp", e.target.value)}
                    placeholder="如：主导过组织变革项目&#10;参与公司上市筹备&#10;负责新业务线从0到1建设..."
                  />
                </div>
              </div>
            </div>

            {/* 长期跟踪记录 */}
            <div className="border-t pt-4 mt-4">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">长期跟踪记录</h4>
              <div className="space-y-2">
                <Label>跟踪备注</Label>
                <Textarea
                  rows={3}
                  value={p.trackNotes}
                  onChange={(e) => update(idx, "trackNotes", e.target.value)}
                  placeholder="记录每次培训后的行为变化、成长观察、后续发展建议..."
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="outline" onClick={() => { setItems((prev) => [...prev, { ...emptyPersona }]); dirtyRef.current = true; setDirty(true); }}>
          添加画像
        </Button>
        {items.length === 0 && (
          <Button variant="outline" className="text-blue-600" onClick={() => { setItems(PERSONA_TEMPLATES); dirtyRef.current = true; setDirty(true); }}>
            使用示例模板
          </Button>
        )}
        {items.length > 0 && (
          <Button variant="outline" className="text-emerald-600" onClick={handleDownloadAll}>
            下载全部画像
          </Button>
        )}
        <div className="flex-1" />
        {dirty && <span className="text-xs text-amber-500">● 有未保存的更改</span>}
        <Button onClick={handleSave} disabled={saving}>{saving ? "保存中..." : "保存画像"}</Button>
      </div>
    </div>
  );
}

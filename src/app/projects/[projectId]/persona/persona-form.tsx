"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { savePersonas } from "@/lib/actions";

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
  assessDisc: string;
  assessMbti: string;
  assess360: string;
  assessCustom: string;
  trackNotes: string;
}

const emptyPersona: Persona = {
  name: "", age: "", department: "", position: "", yearsExp: "", mgmtYears: "",
  traits: "", motivation: "", challenges: "", learnStyle: "", techLevel: "",
  assessDisc: "", assessMbti: "", assess360: "", assessCustom: "", trackNotes: "",
};

const PERSONA_TEMPLATES: Persona[] = [
  {
    name: "变革推动者·张总监", age: "42", department: "运营部门", position: "总监",
    yearsExp: "15", mgmtYears: "8", traits: "结果导向,执行力强,善于沟通",
    motivation: "希望带领团队突破业绩瓶颈", challenges: "战略思维不够系统，跨部门协作有待加强",
    learnStyle: "案例学习+实践", techLevel: "中等",
    assessDisc: "D型-支配型", assessMbti: "ENTJ", assess360: "", assessCustom: "", trackNotes: "",
  },
  {
    name: "稳健执行者·李经理", age: "38", department: "财务部门", position: "高级经理",
    yearsExp: "12", mgmtYears: "5", traits: "严谨细致,风险意识强,偏保守",
    motivation: "提升管理能力，为晋升做准备", challenges: "创新意识不足，领导风格偏控制型",
    learnStyle: "结构化学习+工具方法", techLevel: "中等",
    assessDisc: "C型-谨慎型", assessMbti: "ISTJ", assess360: "", assessCustom: "", trackNotes: "",
  },
];

export function PersonaForm({ projectId, personas }: { projectId: string; personas: Persona[] }) {
  const [items, setItems] = useState<Persona[]>(personas.length > 0 ? personas : []);
  const [saving, setSaving] = useState(false);

  const update = (idx: number, key: keyof Persona, value: string) => {
    setItems((prev) => prev.map((p, i) => (i === idx ? { ...p, [key]: value } : p)));
  };

  const handleSave = async () => {
    setSaving(true);
    try { await savePersonas(projectId, items as unknown as Array<Record<string, string>>); } finally { setSaving(false); }
  };

  const handleDownload = (idx: number) => {
    const p = items[idx];
    const lines = Object.entries(p).map(([k, v]) => `${k},${v}`).join("\n");
    const blob = new Blob(["\uFEFF" + "字段,内容\n" + lines], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `学员画像_${p.name || idx + 1}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    const headers = Object.keys(emptyPersona).join(",");
    const rows = items.map((p) => Object.values(p).join(",")).join("\n");
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
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}>
                  删除画像
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <div className="space-y-2"><Label>偏好的学习方式</Label><Input value={p.learnStyle} onChange={(e) => update(idx, "learnStyle", e.target.value)} placeholder="案例学习+实践" /></div>
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

            <div className="border-t pt-4 mt-4">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">测评数据</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>DISC测评结果</Label><Input value={p.assessDisc} onChange={(e) => update(idx, "assessDisc", e.target.value)} placeholder="D型-支配型 / I型-影响型 / S型-稳健型 / C型-谨慎型" /></div>
                <div className="space-y-2"><Label>MBTI类型</Label><Input value={p.assessMbti} onChange={(e) => update(idx, "assessMbti", e.target.value)} placeholder="ENTJ / ISTJ / ..." /></div>
                <div className="space-y-2"><Label>360度评估摘要</Label><Input value={p.assess360} onChange={(e) => update(idx, "assess360", e.target.value)} placeholder="优势：XX；发展领域：YY" /></div>
                <div className="space-y-2"><Label>其他测评（自定义）</Label><Input value={p.assessCustom} onChange={(e) => update(idx, "assessCustom", e.target.value)} placeholder="如：盖洛普优势/领导力风格等" /></div>
              </div>
            </div>

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
        <Button variant="outline" onClick={() => setItems((prev) => [...prev, { ...emptyPersona }])}>
          添加画像
        </Button>
        {items.length === 0 && (
          <Button variant="outline" className="text-blue-600" onClick={() => setItems(PERSONA_TEMPLATES)}>
            使用示例模板
          </Button>
        )}
        {items.length > 0 && (
          <Button variant="outline" className="text-emerald-600" onClick={handleDownloadAll}>
            下载全部画像
          </Button>
        )}
        <div className="flex-1" />
        <Button onClick={handleSave} disabled={saving}>{saving ? "保存中..." : "保存画像"}</Button>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EditableTable, ColumnDef } from "@/components/shared/editable-table";
import { saveCharter, saveStakeholders } from "@/lib/actions";
import { STAKEHOLDER_TEMPLATES } from "@/lib/templates";
import { useToast } from "@/components/ui/toast-provider";

interface CharterData {
  projectName: string;
  orgName: string;
  sponsor: string;
  projectManager: string;
  startDate: string;
  endDate: string;
  background: string;
  targetAudience: string;
  expectedOutcome: string;
  scope: string;
  outOfScope: string;
  successCriteria: string;
  constraints: string;
}

interface StakeholderData {
  name: string;
  role: string;
  expectations: string;
  influence: string;
  participation: string;
  frequency: string;
  method: string;
}

const stakeholderColumns: ColumnDef[] = [
  { key: "name", label: "干系人", placeholder: "姓名/角色" },
  { key: "role", label: "角色/职位", placeholder: "项目发起人" },
  { key: "expectations", label: "对项目的期望", width: "200px", placeholder: "期望..." },
  { key: "influence", label: "影响力", type: "select", width: "100px", options: [{ value: "高", label: "高" }, { value: "中", label: "中" }, { value: "低", label: "低" }] },
  { key: "participation", label: "参与程度", type: "select", width: "100px", options: [{ value: "高", label: "高" }, { value: "中", label: "中" }, { value: "低", label: "低" }] },
  { key: "frequency", label: "沟通频次", placeholder: "每周/月度" },
  { key: "method", label: "沟通方式", placeholder: "邮件/会议" },
];

const BACKGROUND_PRESETS = [
  "组织战略转型，需要培养变革领导力",
  "新业务拓展，需要提升管理团队经营能力",
  "高管继任计划，加速高潜人才成长",
  "组织合并/重组后的文化融合与团队建设",
  "新晋管理者角色转型与能力提升",
  "业务快速扩张，管理能力跟不上业务发展",
  "绩效考核结果显示管理层能力差距明显",
  "员工敬业度调查反映管理水平需要提升",
];

const AUDIENCE_PRESETS = [
  "中层管理者（总监/高级经理级别），30-50人",
  "高潜人才（后备干部池），20-30人",
  "新晋管理者（管理经验1-3年），20-40人",
  "高管团队（VP及以上），10-15人",
  "业务部门负责人及核心骨干，25-35人",
  "跨部门项目经理/敏捷团队负责人，15-25人",
];

const OUTCOME_PRESETS = [
  "管理者领导力测评得分提升15%以上",
  "团队敬业度分数提升10%以上",
  "关键岗位继任准备度从40%提升至70%",
  "跨部门协作项目成功率提升20%",
  "管理者教练式领导行为转化率80%以上",
  "行动学习课题产出可落地方案并启动实施",
];

export function CharterForm({
  projectId,
  charter,
  stakeholders,
}: {
  projectId: string;
  charter: CharterData | null;
  stakeholders: StakeholderData[];
}) {
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  const [form, setForm] = useState<CharterData>({
    projectName: charter?.projectName || "",
    orgName: charter?.orgName || "",
    sponsor: charter?.sponsor || "",
    projectManager: charter?.projectManager || "",
    startDate: charter?.startDate || "",
    endDate: charter?.endDate || "",
    background: charter?.background || "",
    targetAudience: charter?.targetAudience || "",
    expectedOutcome: charter?.expectedOutcome || "",
    scope: charter?.scope || "",
    outOfScope: charter?.outOfScope || "",
    successCriteria: charter?.successCriteria || "",
    constraints: charter?.constraints || "",
  });
  const formRef = useRef(form);
  const dirtyRef = useRef(false);

  useEffect(() => { formRef.current = form; }, [form]);

  const update = (key: keyof CharterData, value: string) => {
    setForm((p) => ({ ...p, [key]: value }));
    dirtyRef.current = true;
  };

  // Auto-save every 3 minutes
  useEffect(() => {
    const timer = setInterval(async () => {
      if (dirtyRef.current) {
        try {
          await saveCharter(projectId, formRef.current as unknown as Record<string, string>);
          dirtyRef.current = false;
          showToast("已自动保存", "info");
        } catch { /* silent */ }
      }
    }, 180000);
    return () => clearInterval(timer);
  }, [projectId, showToast]);

  const handleSaveCharter = async () => {
    setSaving(true);
    try {
      await saveCharter(projectId, form as unknown as Record<string, string>);
      dirtyRef.current = false;
      showToast("保存成功");
    } catch {
      showToast("保存失败", "error");
    } finally {
      setSaving(false);
    }
  };

  const appendToField = useCallback((key: keyof CharterData, text: string) => {
    setForm((p) => ({
      ...p,
      [key]: p[key] ? p[key] + "\n" + text : text,
    }));
    dirtyRef.current = true;
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">基本信息</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>项目名称</Label>
            <Input value={form.projectName} onChange={(e) => update("projectName", e.target.value)} placeholder="完整项目名称" />
          </div>
          <div className="space-y-2">
            <Label>所属组织</Label>
            <Input value={form.orgName} onChange={(e) => update("orgName", e.target.value)} placeholder="委托方/公司名称" />
          </div>
          <div className="space-y-2">
            <Label>项目发起人</Label>
            <Input value={form.sponsor} onChange={(e) => update("sponsor", e.target.value)} placeholder="发起人姓名/职位" />
          </div>
          <div className="space-y-2">
            <Label>项目经理</Label>
            <Input value={form.projectManager} onChange={(e) => update("projectManager", e.target.value)} placeholder="项目经理姓名" />
          </div>
          <div className="space-y-2">
            <Label>计划开始日期</Label>
            <Input type="date" value={form.startDate} onChange={(e) => update("startDate", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>计划结束日期</Label>
            <Input type="date" value={form.endDate} onChange={(e) => update("endDate", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">项目背景与目标</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>项目背景</Label>
            <div className="flex flex-wrap gap-1 mb-1">
              {BACKGROUND_PRESETS.map((t, i) => (
                <button key={i} type="button" onClick={() => appendToField("background", t)} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded hover:bg-blue-100 transition-colors">+ {t.slice(0, 15)}...</button>
              ))}
            </div>
            <Textarea rows={4} value={form.background} onChange={(e) => update("background", e.target.value)} placeholder="描述项目发起的业务背景和动因（可点击上方快速添加）..." />
          </div>
          <div className="space-y-2">
            <Label>目标学员群体</Label>
            <div className="flex flex-wrap gap-1 mb-1">
              {AUDIENCE_PRESETS.map((t, i) => (
                <button key={i} type="button" onClick={() => update("targetAudience", t)} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded hover:bg-emerald-100 transition-colors">+ {t.slice(0, 18)}...</button>
              ))}
            </div>
            <Textarea rows={3} value={form.targetAudience} onChange={(e) => update("targetAudience", e.target.value)} placeholder="描述学员群体特征（可点击上方选择或自行输入）..." />
          </div>
          <div className="space-y-2">
            <Label>预期成果</Label>
            <div className="flex flex-wrap gap-1 mb-1">
              {OUTCOME_PRESETS.map((t, i) => (
                <button key={i} type="button" onClick={() => appendToField("expectedOutcome", t)} className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded hover:bg-amber-100 transition-colors">+ {t.slice(0, 18)}...</button>
              ))}
            </div>
            <Textarea rows={3} value={form.expectedOutcome} onChange={(e) => update("expectedOutcome", e.target.value)} placeholder="项目完成后期望达到的效果（可点击上方快速添加）..." />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">项目范围与约束</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>项目范围（包含）</Label>
              <Textarea rows={3} value={form.scope} onChange={(e) => update("scope", e.target.value)} placeholder="项目包含的内容..." />
            </div>
            <div className="space-y-2">
              <Label>项目范围（不包含）</Label>
              <Textarea rows={3} value={form.outOfScope} onChange={(e) => update("outOfScope", e.target.value)} placeholder="明确排除的内容..." />
            </div>
          </div>
          <div className="space-y-2">
            <Label>成功标准</Label>
            <Textarea rows={2} value={form.successCriteria} onChange={(e) => update("successCriteria", e.target.value)} placeholder="使用SMART原则定义可衡量的成功标准..." />
          </div>
          <div className="space-y-2">
            <Label>约束条件</Label>
            <Textarea rows={2} value={form.constraints} onChange={(e) => update("constraints", e.target.value)} placeholder="时间、预算、资源等约束条件..." />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveCharter} disabled={saving}>
              {saving ? "保存中..." : "保存章程"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">干系人分析</CardTitle>
          <p className="text-sm text-muted-foreground">识别并分析项目的关键干系人，这些数据将自动同步到沟通计划</p>
        </CardHeader>
        <CardContent>
          <EditableTable
            columns={stakeholderColumns}
            data={stakeholders as unknown as Array<Record<string, unknown>>}
            onSave={async (data) => {
              await saveStakeholders(projectId, data as Array<Record<string, string>>);
            }}
            templateRows={STAKEHOLDER_TEMPLATES}
            addLabel="添加干系人"
          />
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { EditableTable, ColumnDef } from "@/components/shared/editable-table";
import { saveBusinessNeeds, saveCompetencyGaps } from "@/lib/actions";

const BUSINESS_CHALLENGE_PRESETS = [
  { challenge: "战略落地执行力不足", strategic: "战略执行", affectedRoles: "中高层管理者" },
  { challenge: "业务增长放缓/营收下滑", strategic: "增长战略", affectedRoles: "业务团队" },
  { challenge: "数字化转型推进困难", strategic: "数字化战略", affectedRoles: "全层级" },
  { challenge: "跨部门协作效率低", strategic: "组织效能", affectedRoles: "中层管理者" },
  { challenge: "人才流失率偏高", strategic: "人才保留", affectedRoles: "直线经理" },
  { challenge: "新业务/产品上市速度慢", strategic: "创新战略", affectedRoles: "产品/研发团队" },
  { challenge: "客户满意度/NPS持续下降", strategic: "客户体验", affectedRoles: "客户服务团队" },
  { challenge: "管理者领导力水平参差不齐", strategic: "组织能力建设", affectedRoles: "中层管理者" },
  { challenge: "企业文化融合困难（并购/重组后）", strategic: "文化整合", affectedRoles: "全员" },
  { challenge: "组织变革阻力大", strategic: "变革管理", affectedRoles: "中高层管理者" },
  { challenge: "绩效管理体系形同虚设", strategic: "绩效提升", affectedRoles: "各级管理者" },
  { challenge: "关键岗位继任者储备不足", strategic: "继任计划", affectedRoles: "高潜人才" },
  { challenge: "创新能力不足，缺乏创新文化", strategic: "创新驱动", affectedRoles: "中层/骨干" },
  { challenge: "成本控制压力增大", strategic: "降本增效", affectedRoles: "运营管理层" },
  { challenge: "市场竞争加剧，差异化优势弱", strategic: "竞争战略", affectedRoles: "营销/业务团队" },
  { challenge: "员工敬业度/满意度偏低", strategic: "组织健康", affectedRoles: "直线经理" },
  { challenge: "团队协作能力不足项目频繁延期", strategic: "项目管理", affectedRoles: "项目经理/技术骨干" },
  { challenge: "国际化业务拓展受限", strategic: "全球化战略", affectedRoles: "国际业务团队" },
  { challenge: "新晋管理者角色转型困难", strategic: "管理者加速", affectedRoles: "新晋管理者" },
  { challenge: "决策质量与决策速度不匹配", strategic: "决策效能", affectedRoles: "中高层管理者" },
  { challenge: "团队沟通不畅信息孤岛严重", strategic: "组织协同", affectedRoles: "全层级管理者" },
  { challenge: "风险管控意识薄弱", strategic: "风险管理", affectedRoles: "运营/合规团队" },
  { challenge: "产品/服务质量波动大", strategic: "质量战略", affectedRoles: "生产/运营团队" },
  { challenge: "供应链不稳定影响交付", strategic: "供应链优化", affectedRoles: "供应链管理层" },
  { challenge: "新技术/AI应用推进缓慢", strategic: "技术战略", affectedRoles: "技术/管理团队" },
  { challenge: "合规风险增加监管趋严", strategic: "合规管理", affectedRoles: "法务/合规团队" },
  { challenge: "组织架构臃肿决策链过长", strategic: "组织优化", affectedRoles: "高层管理者" },
  { challenge: "品牌影响力与市场地位不匹配", strategic: "品牌战略", affectedRoles: "市场/品牌团队" },
  { challenge: "核心技术/能力被外包依赖大", strategic: "核心能力建设", affectedRoles: "技术管理层" },
  { challenge: "ESG/可持续发展要求提升", strategic: "可持续发展", affectedRoles: "战略/运营团队" },
];

const bnColumns: ColumnDef[] = [
  { key: "challenge", label: "业务挑战/机会", width: "200px", type: "textarea", placeholder: "描述挑战..." },
  { key: "strategic", label: "战略关联性", type: "textarea", placeholder: "与哪项战略相关", minWidth: "140px" },
  { key: "affectedRoles", label: "影响的岗位群", type: "textarea", placeholder: "中层管理者", minWidth: "120px" },
  { key: "expectedResult", label: "期望业务结果", type: "textarea", placeholder: "期望结果...", minWidth: "150px" },
  { key: "metric", label: "衡量指标", type: "textarea", placeholder: "KPI指标", minWidth: "120px" },
  { key: "currentData", label: "当前数据", placeholder: "现状", minWidth: "90px" },
  { key: "targetData", label: "目标数据", placeholder: "目标", minWidth: "90px" },
  { key: "priority", label: "优先级", type: "select", width: "100px", options: [{ value: "高", label: "高" }, { value: "中", label: "中" }, { value: "低", label: "低" }] },
];

const cgColumns: ColumnDef[] = [
  { key: "dimension", label: "能力维度", type: "textarea", placeholder: "如：经营决策思维", minWidth: "140px" },
  { key: "targetGroup", label: "目标群体", placeholder: "中层干部", minWidth: "100px" },
  { key: "currentLevel", label: "当前水平", type: "number", width: "80px" },
  { key: "requiredLevel", label: "要求水平", type: "number", width: "80px" },
  { key: "gapScore", label: "差距分", type: "number", width: "80px" },
  { key: "recommendation", label: "学习建议", type: "textarea", placeholder: "正式培训+实践", minWidth: "140px" },
  { key: "method", label: "建议方法", type: "textarea", placeholder: "沙盘+案例", minWidth: "120px" },
  { key: "priority", label: "优先级", type: "select", width: "100px", options: [{ value: "高优先级", label: "高优先级" }, { value: "中优先级", label: "中优先级" }, { value: "低优先级", label: "低优先级" }] },
];

const cgTemplates = [
  { dimension: "经营决策思维", targetGroup: "中层干部", currentLevel: 5, requiredLevel: 5, gapScore: 25, recommendation: "正式培训+实践演练", method: "沙盘+案例", priority: "高优先级" },
  { dimension: "团队领导力", targetGroup: "中层干部", currentLevel: 6, requiredLevel: 4, gapScore: 24, recommendation: "工作坊+辅导", method: "情境模拟+360反馈", priority: "高优先级" },
  { dimension: "变革管理", targetGroup: "中层干部", currentLevel: 4, requiredLevel: 4, gapScore: 16, recommendation: "案例学习+行动学习", method: "变革工作坊", priority: "中优先级" },
];

export function TnaForm({
  projectId,
  businessNeeds,
  competencyGaps,
}: {
  projectId: string;
  businessNeeds: Array<Record<string, unknown>>;
  competencyGaps: Array<Record<string, unknown>>;
}) {
  const [showPresets, setShowPresets] = useState(false);
  const [selectedChallenges, setSelectedChallenges] = useState<Set<number>>(new Set());

  const toggleChallenge = (idx: number) => {
    setSelectedChallenges((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Business Challenge Presets (30 items) */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-blue-800">业务挑战快速选择（{BUSINESS_CHALLENGE_PRESETS.length}个常见挑战）</CardTitle>
            <Button size="sm" variant="ghost" onClick={() => setShowPresets(!showPresets)}>
              {showPresets ? "收起" : "展开选择"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">勾选后一键导入到下方业务需求表格，可继续编辑补充</p>
        </CardHeader>
        {showPresets && (
          <CardContent>
            <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
              {BUSINESS_CHALLENGE_PRESETS.map((item, idx) => (
                <label
                  key={idx}
                  className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition-colors text-xs ${selectedChallenges.has(idx) ? "border-blue-400 bg-blue-100/50" : "border-slate-200 hover:bg-slate-50"}`}
                >
                  <Checkbox
                    checked={selectedChallenges.has(idx)}
                    onCheckedChange={() => toggleChallenge(idx)}
                    className="mt-0.5"
                  />
                  <div>
                    <span className="font-medium">{item.challenge}</span>
                    <div className="text-slate-400 mt-0.5">
                      <Badge variant="outline" className="text-[10px] mr-1">{item.strategic}</Badge>
                      <Badge variant="outline" className="text-[10px]">{item.affectedRoles}</Badge>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            {selectedChallenges.size > 0 && (
              <p className="text-xs text-blue-700 mt-2">已选择 {selectedChallenges.size} 项 — 请点击下方「使用示例模板」或直接添加行后填入</p>
            )}
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">业务需求分析</CardTitle>
          <p className="text-sm text-muted-foreground">从业务挑战出发，识别培训能解决的问题。表格格子支持多行输入。</p>
        </CardHeader>
        <CardContent>
          <EditableTable
            columns={bnColumns}
            data={businessNeeds}
            onSave={async (data) => {
              await saveBusinessNeeds(projectId, data as Array<Record<string, string>>);
            }}
            templateRows={selectedChallenges.size > 0
              ? Array.from(selectedChallenges).map((idx) => ({
                  challenge: BUSINESS_CHALLENGE_PRESETS[idx].challenge,
                  strategic: BUSINESS_CHALLENGE_PRESETS[idx].strategic,
                  affectedRoles: BUSINESS_CHALLENGE_PRESETS[idx].affectedRoles,
                  expectedResult: "",
                  metric: "",
                  currentData: "",
                  targetData: "",
                  priority: "中",
                }))
              : undefined}
            addLabel="添加业务需求"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">能力差距矩阵</CardTitle>
          <p className="text-sm text-muted-foreground">差距分 = 当前水平 x 要求水平（数值越大，优先级越高）。此数据将自动流入学习目标矩阵。</p>
        </CardHeader>
        <CardContent>
          <EditableTable
            columns={cgColumns}
            data={competencyGaps}
            onSave={async (data) => {
              await saveCompetencyGaps(projectId, data);
            }}
            templateRows={cgTemplates}
            addLabel="添加能力维度"
          />
        </CardContent>
      </Card>
    </div>
  );
}

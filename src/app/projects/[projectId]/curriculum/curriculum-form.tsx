"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditableTable, ColumnDef } from "@/components/shared/editable-table";
import { saveCurriculumModules } from "@/lib/actions";
import { CAKE_DIMENSIONS } from "@/lib/templates";

const columns: ColumnDef[] = [
  { key: "code", label: "课程代码", width: "90px", placeholder: "LJ-01" },
  { key: "name", label: "模块名称", placeholder: "战略解码营" },
  { key: "topic", label: "核心主题", placeholder: "战略理解与承接" },
  { key: "objective", label: "教学目标", width: "200px", placeholder: "学员能够..." },
  { key: "method", label: "主要教学方法", placeholder: "工作坊+共创" },
  { key: "format", label: "媒介形式", type: "select", width: "100px", options: [{ value: "现场", label: "现场" }, { value: "线上", label: "线上" }, { value: "混合", label: "混合" }, { value: "自学", label: "自学" }] },
  { key: "hours", label: "学时", type: "number", width: "70px" },
  { key: "facilitatorType", label: "师资类型", type: "select", width: "120px", options: [{ value: "外部顾问", label: "外部顾问" }, { value: "内部讲师", label: "内部讲师" }, { value: "高管", label: "高管" }, { value: "混合", label: "混合" }] },
  { key: "competency", label: "CAKE关联", type: "select", width: "120px", options: CAKE_DIMENSIONS },
  { key: "businessAlign", label: "业务对齐", placeholder: "对齐任务..." },
];

const moduleTemplates = [
  { code: "LJ-00", name: "战略解码营", topic: "战略理解与承接", objective: "学员能将公司战略解码为部门SMART行动计划", method: "工作坊+共创", format: "现场", hours: 2, facilitatorType: "混合", competency: "C", businessAlign: "" },
  { code: "LJ-01", name: "领导力认知", topic: "角色转型与自我认知", objective: "理解管理者角色定位和领导力发展路径", method: "测评+反馈+工作坊", format: "现场", hours: 4, facilitatorType: "外部顾问", competency: "A", businessAlign: "" },
  { code: "LJ-02", name: "团队管理实战", topic: "团队建设与绩效管理", objective: "掌握团队诊断和绩效辅导的方法", method: "情境模拟+角色扮演", format: "现场", hours: 4, facilitatorType: "外部顾问", competency: "C", businessAlign: "" },
];

export function CurriculumForm({ projectId, modules }: { projectId: string; modules: Array<Record<string, unknown>> }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">课程模块架构</CardTitle>
          <p className="text-sm text-muted-foreground">设计课程模块，每个模块对应一个学习主题。模块信息将自动同步到讲师管理和预算追踪。</p>
        </CardHeader>
        <CardContent>
          <EditableTable
            columns={columns}
            data={modules}
            onSave={async (data) => { await saveCurriculumModules(projectId, data); }}
            templateRows={moduleTemplates}
            addLabel="添加模块"
          />
        </CardContent>
      </Card>

      <Card className="bg-emerald-50/50 border-emerald-200">
        <CardContent className="py-4">
          <p className="text-sm text-emerald-800 font-medium mb-1">70-20-10学习配比参考</p>
          <div className="grid grid-cols-3 gap-4 mt-2">
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-emerald-700">70%</div>
              <div className="text-xs text-slate-500 mt-1">在岗实践</div>
              <div className="text-xs text-slate-400">行动学习·项目实战·岗位轮换</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-blue-700">20%</div>
              <div className="text-xs text-slate-500 mt-1">社交学习</div>
              <div className="text-xs text-slate-400">导师辅导·同侪学习·反馈</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-purple-700">10%</div>
              <div className="text-xs text-slate-500 mt-1">正式培训</div>
              <div className="text-xs text-slate-400">课堂·工作坊·在线课程</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ExportPanel({ projectId, projectName }: { projectId: string; projectName: string }) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch(`/api/export/${projectId}`);
      if (!res.ok) throw new Error("导出失败");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${projectName}_学习项目设计全景工具手册.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("导出失败，请稍后重试");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Excel 全量导出</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            导出完整的Excel工作簿，包含16个Sheet页，保留原有模板结构。
            可用于离线编辑、客户交付或归档。
          </p>
          <div className="text-sm space-y-1 text-slate-600">
            <p>包含的Sheet页：</p>
            <div className="grid grid-cols-3 gap-1 text-xs">
              <span>01 项目章程</span>
              <span>02 需求分析TNA</span>
              <span>03 学员画像</span>
              <span>04 学习目标矩阵</span>
              <span>05 学习旅程地图</span>
              <span>06 课程架构</span>
              <span>07 单元设计详案</span>
              <span>08 评估体系</span>
              <span>09 讲师供应商管理</span>
              <span>10 预算追踪</span>
              <span>11 运营日历</span>
              <span>12 学员管理</span>
              <span>13 沟通计划</span>
              <span>14 风险管理</span>
              <span>15 项目复盘</span>
            </div>
          </div>
          <Button onClick={handleExport} disabled={exporting} className="w-full">
            {exporting ? "正在生成Excel..." : "下载 Excel 工作簿"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base text-muted-foreground">PDF 报告导出</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">PDF报告导出功能将在后续版本中上线，敬请期待。</p>
          <Button disabled className="w-full mt-3" variant="outline">Coming Soon</Button>
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base text-muted-foreground">AI 智能生成</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">AI辅助内容生成功能将在后续版本中接入，届时可基于项目参数自动生成TNA、学习目标、课程架构等内容。</p>
          <Button disabled className="w-full mt-3" variant="outline">Coming Soon</Button>
        </CardContent>
      </Card>
    </div>
  );
}

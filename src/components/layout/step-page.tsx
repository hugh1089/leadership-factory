"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { updateStepStatus } from "@/lib/actions";
import Link from "next/link";
import { STEPS } from "@/lib/steps";

interface Props {
  projectId: string;
  stepNumber: number;
  title: string;
  titleEn: string;
  description?: string;
  status: string;
  children: ReactNode;
  hints?: string[];
}

export function StepPage({ projectId, stepNumber, title, titleEn, description, status, children, hints }: Props) {
  const prevStep = STEPS.find((s) => s.step === stepNumber - 1);
  const nextStep = STEPS.find((s) => s.step === stepNumber + 1);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">{STEPS.find((s) => s.step === stepNumber)?.icon}</span>
            <h1 className="text-2xl font-bold">{title}</h1>
            <span className="text-sm text-muted-foreground">{titleEn}</span>
            <Badge variant={status === "completed" ? "outline" : status === "in_progress" ? "default" : "secondary"}>
              {status === "completed" ? "已完成" : status === "in_progress" ? "进行中" : "待开始"}
            </Badge>
          </div>
          {description && <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{description}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-green-700 border-green-300 hover:bg-green-50"
            disabled={status === "completed"}
            onClick={async () => {
              await updateStepStatus(projectId, stepNumber, "completed");
            }}
          >
            标记完成
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-amber-700"
            disabled={status !== "completed"}
            onClick={async () => {
              await updateStepStatus(projectId, stepNumber, "in_progress");
            }}
          >
            重新编辑
          </Button>
        </div>
      </div>

      {hints && hints.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm font-medium text-blue-800 mb-1">填写提示</p>
          <ul className="text-sm text-blue-700 space-y-0.5">
            {hints.map((h, i) => (
              <li key={i}>• {h}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-8">{children}</div>

      <div className="flex items-center justify-between pt-4 border-t">
        {prevStep ? (
          <Link href={`/projects/${projectId}/${prevStep.route}`}>
            <Button variant="outline">← {prevStep.icon} {prevStep.label}</Button>
          </Link>
        ) : (
          <div />
        )}
        {nextStep ? (
          <Link href={`/projects/${projectId}/${nextStep.route}`}>
            <Button>{nextStep.icon} {nextStep.label} →</Button>
          </Link>
        ) : (
          <Link href={`/projects/${projectId}/export`}>
            <Button>导出项目</Button>
          </Link>
        )}
      </div>
    </div>
  );
}

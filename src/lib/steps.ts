export interface StepDef {
  step: number;
  key: string;
  label: string;
  labelEn: string;
  phase: number;
  phaseLabel: string;
  icon: string;
  route: string;
}

export const TOTAL_STEPS = 17;

export const PHASES = [
  { id: 1, label: "项目定义", labelEn: "Project Definition" },
  { id: 2, label: "学员与目标", labelEn: "Learners & Objectives" },
  { id: 3, label: "方案设计", labelEn: "Solution Design" },
  { id: 4, label: "保障体系", labelEn: "Support System" },
  { id: 5, label: "运营执行", labelEn: "Operations" },
  { id: 6, label: "实践深化", labelEn: "Practice & Coaching" },
  { id: 7, label: "复盘总结", labelEn: "Review" },
] as const;

export const STEPS: StepDef[] = [
  { step: 1, key: "charter", label: "项目章程", labelEn: "Project Charter", phase: 1, phaseLabel: "项目定义", icon: "📊", route: "charter" },
  { step: 2, key: "tna", label: "需求分析", labelEn: "TNA", phase: 1, phaseLabel: "项目定义", icon: "🔍", route: "tna" },
  { step: 3, key: "persona", label: "学员画像", labelEn: "Learner Persona", phase: 2, phaseLabel: "学员与目标", icon: "👤", route: "persona" },
  { step: 4, key: "objectives", label: "学习目标", labelEn: "Learning Objectives", phase: 2, phaseLabel: "学员与目标", icon: "🎯", route: "objectives" },
  { step: 5, key: "journey", label: "学习旅程", labelEn: "Learning Journey", phase: 3, phaseLabel: "方案设计", icon: "🗺️", route: "journey" },
  { step: 6, key: "curriculum", label: "课程架构", labelEn: "Curriculum", phase: 3, phaseLabel: "方案设计", icon: "📚", route: "curriculum" },
  { step: 7, key: "sessions", label: "单元详案", labelEn: "Session Plans", phase: 3, phaseLabel: "方案设计", icon: "📝", route: "sessions" },
  { step: 8, key: "assessment", label: "评估体系", labelEn: "Assessment", phase: 4, phaseLabel: "保障体系", icon: "📏", route: "assessment" },
  { step: 9, key: "facilitators", label: "讲师管理", labelEn: "Facilitators", phase: 4, phaseLabel: "保障体系", icon: "🎓", route: "facilitators" },
  { step: 10, key: "budget", label: "预算追踪", labelEn: "Budget", phase: 4, phaseLabel: "保障体系", icon: "💰", route: "budget" },
  { step: 11, key: "calendar", label: "运营日历", labelEn: "Calendar", phase: 5, phaseLabel: "运营执行", icon: "📅", route: "calendar" },
  { step: 12, key: "learners", label: "学员管理", labelEn: "Learners", phase: 5, phaseLabel: "运营执行", icon: "👥", route: "learners" },
  { step: 13, key: "communication", label: "沟通计划", labelEn: "Communication", phase: 5, phaseLabel: "运营执行", icon: "📢", route: "communication" },
  { step: 14, key: "risks", label: "风险管理", labelEn: "Risk Management", phase: 5, phaseLabel: "运营执行", icon: "⚠️", route: "risks" },
  { step: 15, key: "action-learning", label: "行动学习", labelEn: "Action Learning", phase: 6, phaseLabel: "实践深化", icon: "🚀", route: "action-learning" },
  { step: 16, key: "coaching", label: "教练辅导", labelEn: "Coaching", phase: 6, phaseLabel: "实践深化", icon: "💬", route: "coaching" },
  { step: 17, key: "review", label: "项目复盘", labelEn: "Project Review", phase: 7, phaseLabel: "复盘总结", icon: "🔄", route: "review" },
];

export const EXTRA_ROUTES = [
  { key: "knowledge", label: "知识管理", icon: "📁", route: "knowledge" },
];

export function getStepsByPhase(phaseId: number): StepDef[] {
  return STEPS.filter((s) => s.phase === phaseId);
}

export function getStep(stepNum: number): StepDef | undefined {
  return STEPS.find((s) => s.step === stepNum);
}

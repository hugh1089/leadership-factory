export const STAKEHOLDER_TEMPLATES = [
  { name: "公司高管/主要领导", role: "项目发起人", expectations: "看到干部能力提升对业务的贡献", influence: "高", participation: "中", frequency: "季度", method: "PPT汇报+书面报告" },
  { name: "HR负责人/首席人才官", role: "项目管理者", expectations: "项目按时交付、预算可控、效果可量化", influence: "高", participation: "高", frequency: "每周", method: "周报+周会" },
  { name: "业务部门负责人", role: "需求方/评价方", expectations: "下属能力切实提升，减少管理问题", influence: "高", participation: "中", frequency: "月度", method: "邮件+座谈" },
  { name: "学员直线主管", role: "支持者/评价方", expectations: "学员学以致用，行为可见改变", influence: "中", participation: "中", frequency: "阶段性", method: "面谈+问卷" },
  { name: "学员本人", role: "学习主体", expectations: "实用、不占太多工作时间、获得认可", influence: "中", participation: "高", frequency: "每次培训", method: "现场+微信群" },
];

export const BLOOM_LEVELS = [
  { value: "L1", label: "L1 记忆 Remember" },
  { value: "L2", label: "L2 理解 Understand" },
  { value: "L3", label: "L3 应用 Apply" },
  { value: "L4", label: "L4 分析 Analyze" },
  { value: "L5", label: "L5 评价 Evaluate" },
  { value: "L6", label: "L6 创造 Create" },
];

export const CAKE_DIMENSIONS = [
  { value: "C", label: "C-能力 Competence" },
  { value: "A", label: "A-态度 Attitude" },
  { value: "K", label: "K-知识 Knowledge" },
  { value: "E", label: "E-经验 Experience" },
];

export const RISK_CATEGORIES = [
  "人员风险", "资源风险", "技术风险", "进度风险", "质量风险", "外部风险",
];

export const ASSESSMENT_LEVELS = [
  { value: "L1", label: "L1 反应层 Reaction", desc: "学员对培训体验的满意度" },
  { value: "L2", label: "L2 学习层 Learning", desc: "知识、技能、态度的变化" },
  { value: "L3", label: "L3 行为层 Behavior", desc: "工作中行为的改变" },
  { value: "L4", label: "L4 结果层 Results", desc: "对组织绩效的影响" },
  { value: "ROI", label: "ROI 投资回报", desc: "培训投入产出比" },
];

export const JOURNEY_PHASE_TEMPLATES = [
  { phase: "启动前 Pre-Launch", duration: "2周", description: "项目启动准备、学员通知", emotion: "好奇/忐忑" },
  { phase: "测评期", duration: "1周", description: "前测、能力盘点、学习需求确认", emotion: "紧张/期待" },
  { phase: "密集培训", duration: "4周", description: "核心课程交付、工作坊", emotion: "兴奋/疲惫" },
  { phase: "认知内化", duration: "2周", description: "反思、总结、知识沉淀", emotion: "思考/沉淀" },
  { phase: "实践应用", duration: "8周", description: "行动学习、实践任务", emotion: "挑战/成长" },
  { phase: "深化迭代", duration: "4周", description: "辅导反馈、迭代改进", emotion: "自信/焦虑" },
  { phase: "成果展示", duration: "1周", description: "汇报答辩、成果展示", emotion: "成就/紧张" },
  { phase: "收尾沉淀", duration: "1周", description: "项目复盘、知识资产化", emotion: "满足/不舍" },
];

export const BUDGET_CATEGORIES = [
  { category: "A", label: "人才测评模块" },
  { category: "B", label: "课程开发/采购" },
  { category: "C", label: "讲师/顾问费用" },
  { category: "D", label: "场地与设备" },
  { category: "E", label: "学员教材与物料" },
  { category: "F", label: "差旅与餐饮" },
  { category: "G", label: "平台与技术" },
  { category: "H", label: "项目管理" },
  { category: "I", label: "其他/备用金" },
];

export const RISK_TEMPLATES = [
  { riskId: "R01", description: "高管对项目的支持力度下降，导致资源减少或项目被搁置", category: "人员风险", probability: 3, impact: 5, strategy: "规避", measures: "项目启动前与高管1对1确认承诺；定期汇报成果" },
  { riskId: "R02", description: "学员工学矛盾突出，出勤率低于预期", category: "人员风险", probability: 4, impact: 4, strategy: "缓解", measures: "提前与业务部门协调时间；采用混合学习降低时间占用" },
  { riskId: "R03", description: "外部讲师质量不达标或临时取消", category: "资源风险", probability: 2, impact: 4, strategy: "转移", measures: "合同约定违约条款；备选讲师名单" },
  { riskId: "R04", description: "预算超支", category: "资源风险", probability: 3, impact: 3, strategy: "缓解", measures: "月度预算审查；设置10%备用金" },
  { riskId: "R05", description: "培训效果无法有效衡量", category: "质量风险", probability: 3, impact: 4, strategy: "缓解", measures: "提前设定可量化的KPI；建立完整的评估体系" },
];

export const OBJECTIVE_PRESETS = [
  { moduleName: "战略解码与承接", objective: "学员能将公司战略解码为部门级SMART行动计划", bloomLevel: "L4", competency: "C", businessGoal: "战略落地执行", assessMethod: "行动计划评审", assessTiming: "培训后1周", difficulty: 4 },
  { moduleName: "经营分析与决策", objective: "学员能运用财务和业务数据进行经营分析并做出有效决策", bloomLevel: "L5", competency: "C", businessGoal: "经营质量提升", assessMethod: "案例分析报告", assessTiming: "培训后2周", difficulty: 4 },
  { moduleName: "团队领导力", objective: "学员能诊断团队发展阶段并采用匹配的领导风格", bloomLevel: "L4", competency: "C", businessGoal: "团队效能提升", assessMethod: "360度评估", assessTiming: "项目中期", difficulty: 3 },
  { moduleName: "绩效管理与辅导", objective: "学员能运用GROW模型进行绩效辅导对话", bloomLevel: "L3", competency: "C", businessGoal: "绩效改善", assessMethod: "辅导实录评估", assessTiming: "实践阶段", difficulty: 3 },
  { moduleName: "变革管理", objective: "学员能识别变革阻力来源并设计变革推进策略", bloomLevel: "L5", competency: "C", businessGoal: "组织变革成功率", assessMethod: "变革方案答辩", assessTiming: "培训后1月", difficulty: 5 },
  { moduleName: "跨部门协作", objective: "学员能运用利益相关者分析推动跨部门协作项目", bloomLevel: "L3", competency: "A", businessGoal: "跨部门协作效率", assessMethod: "项目成果汇报", assessTiming: "项目结束", difficulty: 3 },
  { moduleName: "创新思维与方法", objective: "学员能运用设计思维流程产出创新解决方案", bloomLevel: "L6", competency: "K", businessGoal: "创新成果数量", assessMethod: "创新方案路演", assessTiming: "培训后2周", difficulty: 4 },
  { moduleName: "高效沟通与影响力", objective: "学员能根据对象特点调整沟通策略并有效施加影响", bloomLevel: "L3", competency: "A", businessGoal: "管理沟通满意度", assessMethod: "情境模拟评估", assessTiming: "培训当天", difficulty: 3 },
  { moduleName: "人才识别与发展", objective: "学员能运用九宫格工具识别高潜人才并制定IDP", bloomLevel: "L4", competency: "C", businessGoal: "人才梯队健康度", assessMethod: "人才盘点成果", assessTiming: "项目结束", difficulty: 4 },
  { moduleName: "教练式领导", objective: "学员能运用教练技术进行有效的发展性对话", bloomLevel: "L3", competency: "E", businessGoal: "下属成长速度", assessMethod: "教练对话实录", assessTiming: "实践阶段", difficulty: 4 },
  { moduleName: "情绪与压力管理", objective: "学员能识别自身情绪模式并运用调节策略保持最佳状态", bloomLevel: "L3", competency: "A", businessGoal: "管理者心理韧性", assessMethod: "自我评估问卷", assessTiming: "培训后1月", difficulty: 2 },
  { moduleName: "项目管理基础", objective: "学员能运用项目管理方法论规划和推进重点项目", bloomLevel: "L3", competency: "K", businessGoal: "项目交付成功率", assessMethod: "项目计划评审", assessTiming: "培训后2周", difficulty: 3 },
  { moduleName: "数据驱动决策", objective: "学员能从业务数据中提取洞察并转化为管理行动", bloomLevel: "L4", competency: "K", businessGoal: "数据化管理水平", assessMethod: "数据分析报告", assessTiming: "培训后1周", difficulty: 4 },
  { moduleName: "客户导向思维", objective: "学员能运用客户旅程地图优化内外部客户体验", bloomLevel: "L4", competency: "A", businessGoal: "客户满意度NPS", assessMethod: "改善方案评审", assessTiming: "项目结束", difficulty: 3 },
  { moduleName: "自我认知与反思", objective: "学员能基于测评结果制定个人领导力发展计划", bloomLevel: "L5", competency: "E", businessGoal: "领导力自我觉察", assessMethod: "IDP质量评估", assessTiming: "培训后1周", difficulty: 2 },
];

export const FACILITATOR_SOURCES = [
  "内部讲师",
  "外部培训机构",
  "管理咨询公司",
  "高校/商学院",
  "独立顾问",
  "行业协会",
  "在线平台",
  "其他",
];

export const COMM_TEMPLATES = [
  { stakeholder: "公司高管/决策层", infoNeeds: "项目整体进展·高潜识别", purpose: "战略对齐·决策支持", frequency: "季度1次", channel: "PPT+面对面汇报", format: "高管简报（≤10页）", initiator: "项目负责人", feedback: "会议纪要+决策记录" },
  { stakeholder: "HR团队", infoNeeds: "执行细节·问题预警", purpose: "协调执行·问题解决", frequency: "每周", channel: "周会+企业微信", format: "周报表格", initiator: "项目经理", feedback: "任务跟踪表" },
  { stakeholder: "业务部门负责人", infoNeeds: "学员表现·业务关联", purpose: "争取支持·反馈收集", frequency: "月度", channel: "邮件+座谈", format: "月度简报", initiator: "HR负责人", feedback: "反馈问卷" },
  { stakeholder: "学员", infoNeeds: "课程安排·作业要求·成绩", purpose: "学习引导·动力激发", frequency: "每次培训前后", channel: "微信群+邮件", format: "通知函+学习手册", initiator: "项目组", feedback: "满意度问卷+即时反馈" },
];

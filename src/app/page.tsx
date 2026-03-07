import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";

export default async function HomePage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-[55%] bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, rgba(59,130,246,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(99,102,241,0.2) 0%, transparent 50%)" }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-lg font-bold">LF</div>
            <div>
              <h1 className="text-lg font-bold tracking-wide">Leadership Factory</h1>
              <p className="text-xs text-blue-300 tracking-widest">学习项目设计全景工作台</p>
            </div>
          </div>

          <p className="text-xs uppercase tracking-[0.3em] text-blue-400 mb-4">PLATFORM MISSION</p>
          <h2 className="text-4xl font-bold leading-tight mb-2">成为和成就</h2>
          <h2 className="text-4xl font-bold leading-tight mb-6">卓越的领导者</h2>
          <p className="text-sm text-slate-300 leading-relaxed max-w-lg mb-12">
            自上而下体系设计 x 自下而上原子积累<br />
            从需求分析到项目复盘的全流程数字化工作台<br />
            让每一个领导力发展项目都有据可依、有迹可循
          </p>

          <div className="grid grid-cols-4 gap-4 mb-12">
            <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-2xl font-bold text-blue-300">17</div>
              <div className="text-xs text-slate-400 mt-1">标准工作流</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-2xl font-bold text-blue-300">7</div>
              <div className="text-xs text-slate-400 mt-1">核心阶段</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-2xl font-bold text-blue-300">15+</div>
              <div className="text-xs text-slate-400 mt-1">预设模板</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-2xl font-bold text-blue-300">1键</div>
              <div className="text-xs text-slate-400 mt-1">Excel 导出</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-blue-400 mb-3">核心能力</p>
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">A</div>
            <div>
              <p className="text-sm font-medium">项目设计与运营</p>
              <p className="text-xs text-slate-400">TNA · 课程设计 · 学习旅程 · 评估体系</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-sm font-bold">B</div>
            <div>
              <p className="text-sm font-medium">实践深化</p>
              <p className="text-xs text-slate-400">行动学习 · 教练辅导 · 知识管理</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-sm font-bold">C</div>
            <div>
              <p className="text-sm font-medium">数据驱动</p>
              <p className="text-xs text-slate-400">数据追踪 · Excel导出 · 管理后台</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">LF</div>
              <span className="text-lg font-bold text-slate-900">Leadership Factory</span>
            </div>
            <p className="text-sm text-slate-500">学习项目设计全景工作台</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

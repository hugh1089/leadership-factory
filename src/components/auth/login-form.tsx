"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { enterPlatformAction } from "@/lib/actions";

export function LoginForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    try {
      await enterPlatformAction(formData);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "操作失败";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">访问平台</h2>
      <p className="text-sm text-slate-500 mb-8">输入您的邮箱与管理员提供的访问密码</p>

      <form action={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-slate-700">邮箱地址</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="your@company.com"
            required
            className="h-11 bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-slate-700">访问密码</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="请输入管理员提供的访问密码"
            required
            className="h-11 bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </div>
        )}
        <Button
          type="submit"
          className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
          disabled={loading}
        >
          {loading ? "验证中..." : "进入平台 →"}
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-200">
        <p className="text-xs text-slate-400 text-center leading-relaxed">
          本平台向受邀企业客户及合作伙伴开放。<br />
          如需获取访问权限，请联系平台管理员。
        </p>
      </div>
    </div>
  );
}

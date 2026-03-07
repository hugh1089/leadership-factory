"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface ColumnDef {
  key: string;
  label: string;
  type?: "text" | "number" | "select" | "textarea";
  options?: Array<{ value: string; label: string }>;
  width?: string;
  placeholder?: string;
}

interface Props {
  columns: ColumnDef[];
  data: Array<Record<string, unknown>>;
  onSave: (data: Array<Record<string, unknown>>) => Promise<void>;
  templateRows?: Array<Record<string, unknown>>;
  addLabel?: string;
}

export function EditableTable({ columns, data: initialData, onSave, templateRows, addLabel = "添加行" }: Props) {
  const [rows, setRows] = useState<Array<Record<string, unknown>>>(
    initialData.length > 0 ? initialData : []
  );
  const [saving, setSaving] = useState(false);

  const updateCell = useCallback((rowIdx: number, key: string, value: unknown) => {
    setRows((prev) => prev.map((r, i) => (i === rowIdx ? { ...r, [key]: value } : r)));
  }, []);

  const addRow = () => {
    const empty: Record<string, unknown> = {};
    columns.forEach((c) => { empty[c.key] = c.type === "number" ? 0 : ""; });
    setRows((prev) => [...prev, empty]);
  };

  const addTemplateRows = () => {
    if (templateRows) setRows((prev) => [...prev, ...templateRows]);
  };

  const removeRow = (idx: number) => {
    setRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setSaving(true);
    try { await onSave(rows); } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-2 py-2 text-left text-xs font-medium text-slate-500 w-10">#</th>
              {columns.map((col) => (
                <th key={col.key} className="px-2 py-2 text-left text-xs font-medium text-slate-500" style={{ width: col.width }}>
                  {col.label}
                </th>
              ))}
              <th className="px-2 py-2 w-16" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((row, ri) => (
              <tr key={ri} className="hover:bg-slate-50/50">
                <td className="px-2 py-1 text-xs text-slate-400">{ri + 1}</td>
                {columns.map((col) => (
                  <td key={col.key} className="px-1 py-1">
                    {col.type === "select" && col.options ? (
                      <Select value={String(row[col.key] || "")} onValueChange={(v) => updateCell(ri, col.key, v)}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="选择..." /></SelectTrigger>
                        <SelectContent>
                          {col.options.map((o) => (
                            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : col.type === "number" ? (
                      <Input
                        type="number"
                        className="h-8 text-xs"
                        value={row[col.key] as number || ""}
                        onChange={(e) => updateCell(ri, col.key, Number(e.target.value) || 0)}
                        placeholder={col.placeholder}
                      />
                    ) : (
                      <Input
                        className="h-8 text-xs"
                        value={String(row[col.key] || "")}
                        onChange={(e) => updateCell(ri, col.key, e.target.value)}
                        placeholder={col.placeholder}
                      />
                    )}
                  </td>
                ))}
                <td className="px-1 py-1">
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={() => removeRow(ri)}>
                    删除
                  </Button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length + 2} className="px-4 py-8 text-center text-muted-foreground text-sm">
                  暂无数据，请添加行或使用模板
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-2 mt-3">
        <Button variant="outline" size="sm" onClick={addRow}>{addLabel}</Button>
        {templateRows && templateRows.length > 0 && (
          <Button variant="outline" size="sm" onClick={addTemplateRows} className="text-blue-600">
            使用示例模板
          </Button>
        )}
        <div className="flex-1" />
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? "保存中..." : "保存"}
        </Button>
      </div>
    </div>
  );
}

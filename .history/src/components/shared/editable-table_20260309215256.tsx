"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast-provider";

export interface ColumnDef {
  key: string;
  label: string;
  type?: "text" | "number" | "select" | "textarea";
  options?: Array<{ value: string; label: string }>;
  width?: string;
  minWidth?: string;
  placeholder?: string;
}

interface Props {
  columns: ColumnDef[];
  data: Array<Record<string, unknown>>;
  onSave: (data: Array<Record<string, unknown>>) => Promise<void>;
  templateRows?: Array<Record<string, unknown>>;
  addLabel?: string;
  autoSaveInterval?: number; // ms, default 180000 (3min)
  minWidth?: string; // min-width for the table container
  onChange?: (rows: Array<Record<string, unknown>>) => void;
  computeRow?: (row: Record<string, unknown>, key: string, value: unknown) => Record<string, unknown>;
}

export function EditableTable({ columns, data: initialData, onSave, templateRows, addLabel = "添加行", autoSaveInterval = 180000, minWidth, onChange, computeRow }: Props) {
  const [rows, setRows] = useState<Array<Record<string, unknown>>>(
    initialData.length > 0 ? initialData : []
  );
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const { showToast } = useToast();
  const dirtyRef = useRef(false);
  const rowsRef = useRef(rows);

  // Sync when parent data changes externally (e.g., preset import)
  const [prevData, setPrevData] = useState(initialData);
  if (initialData !== prevData) {
    setRows(initialData.length > 0 ? initialData : []);
    setPrevData(initialData);
  }

  useEffect(() => { rowsRef.current = rows; }, [rows]);
  useEffect(() => { dirtyRef.current = dirty; }, [dirty]);
  useEffect(() => { onChange?.(rows); }, [rows]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save every N minutes if dirty
  useEffect(() => {
    const timer = setInterval(async () => {
      if (dirtyRef.current && rowsRef.current.length > 0) {
        try {
          await onSave(rowsRef.current);
          dirtyRef.current = false;
          setDirty(false);
          showToast("已自动保存", "info");
        } catch { /* silent */ }
      }
    }, autoSaveInterval);
    return () => clearInterval(timer);
  }, [onSave, autoSaveInterval, showToast]);

  const updateCell = useCallback((rowIdx: number, key: string, value: unknown) => {
    setRows((prev) => prev.map((r, i) => {
      if (i !== rowIdx) return r;
      const updated = { ...r, [key]: value };
      return computeRow ? computeRow(updated, key, value) : updated;
    }));
    setDirty(true);
  }, [computeRow]);

  const addRow = () => {
    const empty: Record<string, unknown> = {};
    columns.forEach((c) => { empty[c.key] = c.type === "number" ? 0 : ""; });
    setRows((prev) => [...prev, empty]);
    setDirty(true);
  };

  const insertRow = (idx: number) => {
    const empty: Record<string, unknown> = {};
    columns.forEach((c) => { empty[c.key] = c.type === "number" ? 0 : ""; });
    setRows((prev) => [...prev.slice(0, idx + 1), empty, ...prev.slice(idx + 1)]);
    setDirty(true);
  };

  const moveRow = (idx: number, direction: "up" | "down") => {
    setRows((prev) => {
      const next = [...prev];
      const target = direction === "up" ? idx - 1 : idx + 1;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
    setDirty(true);
  };

  const addTemplateRows = () => {
    if (templateRows) {
      setRows((prev) => [...prev, ...templateRows]);
      setDirty(true);
    }
  };

  const removeRow = (idx: number) => {
    setRows((prev) => prev.filter((_, i) => i !== idx));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(rows);
      setDirty(false);
      showToast("保存成功");
    } catch {
      showToast("保存失败，请重试", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm" style={minWidth ? { minWidth } : undefined}>
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-2 py-2 text-left text-xs font-medium text-slate-500 w-10">#</th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-2 py-2 text-left text-xs font-medium text-slate-500"
                  style={{ width: col.width, minWidth: col.minWidth || (col.type === "textarea" ? "180px" : "100px") }}
                >
                  {col.label}
                </th>
              ))}
              <th className="px-2 py-2 w-24" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((row, ri) => (
              <tr key={ri} className="hover:bg-slate-50/50 group">
                <td className="px-2 py-1 text-xs text-slate-400 align-top pt-2">{ri + 1}</td>
                {columns.map((col) => (
                  <td key={col.key} className="px-1 py-1">
                    {col.type === "select" && col.options ? (
                      <Select value={String(row[col.key] || "")} onValueChange={(v) => updateCell(ri, col.key, v)}>
                        <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="选择..." /></SelectTrigger>
                        <SelectContent>
                          {col.options.map((o) => (
                            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : col.type === "number" ? (
                      <Input
                        type="number"
                        className="h-9 text-xs"
                        value={row[col.key] != null && row[col.key] !== "" ? String(row[col.key]) : ""}
                        onChange={(e) => updateCell(ri, col.key, e.target.value === "" ? 0 : Number(e.target.value))}
                        placeholder={col.placeholder}
                      />
                    ) : col.type === "textarea" ? (
                      <textarea
                        className="w-full min-h-[60px] px-2 py-1.5 text-xs border rounded-md bg-background resize-y focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                        value={String(row[col.key] || "")}
                        onChange={(e) => updateCell(ri, col.key, e.target.value)}
                        placeholder={col.placeholder}
                        rows={2}
                      />
                    ) : (
                      <Input
                        className="h-9 text-xs"
                        value={String(row[col.key] || "")}
                        onChange={(e) => updateCell(ri, col.key, e.target.value)}
                        placeholder={col.placeholder}
                      />
                    )}
                  </td>
                ))}
                <td className="px-1 py-1 align-top pt-1">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="text-xs text-slate-400 hover:text-slate-600 px-1"
                        title="上移"
                        onClick={() => moveRow(ri, "up")}
                      >↑</button>
                      <button
                        className="text-xs text-slate-400 hover:text-slate-600 px-1"
                        title="下移"
                        onClick={() => moveRow(ri, "down")}
                      >↓</button>
                      <button
                        className="text-xs text-slate-400 hover:text-blue-600 px-1"
                        title="在下方插入行"
                        onClick={() => insertRow(ri)}
                      >+</button>
                    </div>
                    <Button variant="ghost" size="sm" className="h-6 text-xs text-destructive px-2" onClick={() => removeRow(ri)}>
                      删除
                    </Button>
                  </div>
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
        {dirty && <span className="text-xs text-amber-500">● 有未保存的更改</span>}
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? "保存中..." : "保存"}
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface ShiftBulkEditBarProps {
  selectedCount: number;
  shiftIds: number[];
  onCancel: () => void;
  onSuccess: () => void;
}

export function ShiftBulkEditBar({
  selectedCount,
  shiftIds,
  onCancel,
  onSuccess,
}: ShiftBulkEditBarProps) {
  const [shiftCode, setShiftCode] = useState("");
  const [isRemote, setIsRemote] = useState(false);
  const [isPaidLeave, setIsPaidLeave] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleBulkUpdate = async () => {
    setLoading(true);
    try {
      const updates: Record<string, unknown> = {};
      if (shiftCode) updates.shiftCode = shiftCode;
      if (isRemote) updates.isRemote = true;
      if (isPaidLeave) updates.isPaidLeave = true;

      const res = await fetch("/api/shifts/bulk", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shiftIds,
          updates,
          note: "一括変更",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(`${data.count}件のシフトを更新しました`);
        onSuccess();
      } else {
        toast.error("一括変更に失敗しました");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-background border rounded-lg shadow-lg p-4 min-w-[500px]">
      <div className="space-y-3">
        <p className="text-sm font-medium">
          {selectedCount}セル選択中（{shiftIds.length}件のシフト）
        </p>
        <div className="flex items-end gap-3">
          <div className="space-y-1">
            <Label className="text-xs">シフトコード</Label>
            <Input
              className="w-24 h-8"
              value={shiftCode}
              onChange={(e) => setShiftCode(e.target.value)}
              placeholder="A"
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="bulk-remote"
              checked={isRemote}
              onCheckedChange={(c) => setIsRemote(c === true)}
            />
            <Label htmlFor="bulk-remote" className="text-sm">
              テレワーク
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="bulk-leave"
              checked={isPaidLeave}
              onCheckedChange={(c) => setIsPaidLeave(c === true)}
            />
            <Label htmlFor="bulk-leave" className="text-sm">
              有給
            </Label>
          </div>
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" size="sm" onClick={onCancel}>
              キャンセル
            </Button>
            <Button size="sm" onClick={handleBulkUpdate} disabled={loading}>
              {loading ? "更新中..." : "一括変更"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

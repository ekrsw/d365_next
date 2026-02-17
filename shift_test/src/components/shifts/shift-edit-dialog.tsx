"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { shiftEditSchema } from "@/lib/validations/shift";
import { toast } from "sonner";

type FormData = z.infer<typeof shiftEditSchema>;

interface ShiftData {
  id: number;
  shiftCode: string | null;
  startTime: string | null;
  endTime: string | null;
  isHoliday: boolean;
  isPaidLeave: boolean;
  isRemote: boolean;
}

interface ShiftEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift: ShiftData | null;
  employeeId?: number;
  employeeName: string;
  date: string;
  onSuccess: () => void;
}

export function ShiftEditDialog({
  open,
  onOpenChange,
  shift,
  employeeId,
  employeeName,
  date,
  onSuccess,
}: ShiftEditDialogProps) {
  const isCreateMode = !shift;
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(shiftEditSchema),
  });

  const isHoliday = watch("isHoliday");
  const isPaidLeave = watch("isPaidLeave");
  const timeDisabled = isHoliday || isPaidLeave;

  useEffect(() => {
    if (shift) {
      reset({
        shiftCode: shift.shiftCode || "",
        startTime: shift.startTime || "",
        endTime: shift.endTime || "",
        isHoliday: shift.isHoliday,
        isPaidLeave: shift.isPaidLeave,
        isRemote: shift.isRemote,
        note: "",
      });
    } else {
      reset({
        shiftCode: "",
        startTime: "",
        endTime: "",
        isHoliday: false,
        isPaidLeave: false,
        isRemote: false,
        note: "",
      });
    }
  }, [shift, reset]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const payload = {
        shiftCode: data.shiftCode || null,
        startTime: timeDisabled ? null : data.startTime || null,
        endTime: timeDisabled ? null : data.endTime || null,
        isHoliday: data.isHoliday,
        isPaidLeave: data.isPaidLeave,
        isRemote: data.isRemote,
        note: data.note || null,
      };

      let res: Response;
      if (isCreateMode) {
        res = await fetch("/api/shifts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payload,
            employeeId,
            shiftDate: date,
          }),
        });
      } else {
        res = await fetch(`/api/shifts/${shift!.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        toast.success(isCreateMode ? "シフトを登録しました" : "シフトを更新しました");
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(isCreateMode ? "登録に失敗しました" : "更新に失敗しました");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isCreateMode ? "シフトの登録" : "シフトの編集"}</DialogTitle>
          <DialogDescription>
            {employeeName} — {date}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shiftCode">シフトコード</Label>
            <Input
              id="shiftCode"
              placeholder="例: A, B, C, 夜, 休"
              {...register("shiftCode")}
            />
            <p className="text-xs text-muted-foreground">
              自由入力（例: A, B, C, 夜, 休）
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">開始時刻</Label>
              <Input
                id="startTime"
                type="time"
                disabled={timeDisabled}
                {...register("startTime")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">終了時刻</Label>
              <Input
                id="endTime"
                type="time"
                disabled={timeDisabled}
                {...register("endTime")}
              />
            </div>
          </div>
          {errors.startTime && (
            <p className="text-sm text-destructive">{errors.startTime.message}</p>
          )}

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="isHoliday"
                checked={isHoliday}
                onCheckedChange={(checked) =>
                  setValue("isHoliday", checked === true)
                }
              />
              <Label htmlFor="isHoliday">休日</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="isPaidLeave"
                checked={isPaidLeave}
                onCheckedChange={(checked) =>
                  setValue("isPaidLeave", checked === true)
                }
              />
              <Label htmlFor="isPaidLeave">有給休暇</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="isRemote"
                checked={watch("isRemote")}
                onCheckedChange={(checked) =>
                  setValue("isRemote", checked === true)
                }
              />
              <Label htmlFor="isRemote">テレワーク</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">変更理由メモ（任意）</Label>
            <Textarea id="note" {...register("note")} />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "保存中..." : isCreateMode ? "登録する" : "保存する"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

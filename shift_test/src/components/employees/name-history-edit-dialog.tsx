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
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { nameChangeSchema } from "@/lib/validations/employee";
import { toast } from "sonner";

type FormData = z.infer<typeof nameChangeSchema>;

interface NameHistoryEntry {
  id: number;
  name: string;
  nameKana: string | null;
  validFrom: string;
  note: string | null;
}

interface NameHistoryEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: number;
  entry: NameHistoryEntry;
  onSuccess: () => void;
}

export function NameHistoryEditDialog({
  open,
  onOpenChange,
  employeeId,
  entry,
  onSuccess,
}: NameHistoryEditDialogProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(nameChangeSchema),
  });

  useEffect(() => {
    if (open && entry) {
      reset({
        name: entry.name,
        nameKana: entry.nameKana ?? "",
        validFrom: entry.validFrom,
        note: entry.note ?? "",
      });
    }
  }, [open, entry, reset]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/employees/${employeeId}/name-history/${entry.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (res.ok) {
        toast.success("氏名履歴を更新しました");
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error("更新に失敗しました");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>氏名履歴を編集</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">氏名 *</Label>
            <Input id="edit-name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-kana">フリガナ</Label>
            <Input id="edit-kana" {...register("nameKana")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-date">変更日（有効開始日） *</Label>
            <Input id="edit-date" type="date" {...register("validFrom")} />
            {errors.validFrom && (
              <p className="text-sm text-destructive">
                {errors.validFrom.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-note">備考</Label>
            <Textarea
              id="edit-note"
              placeholder="例: 結婚に伴う改姓"
              {...register("note")}
            />
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
              {loading ? "保存中..." : "保存する"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

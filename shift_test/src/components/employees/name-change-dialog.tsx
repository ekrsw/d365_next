"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Info } from "lucide-react";
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

interface NameChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: number;
  onSuccess: () => void;
}

export function NameChangeDialog({
  open,
  onOpenChange,
  employeeId,
  onSuccess,
}: NameChangeDialogProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(nameChangeSchema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/employees/${employeeId}/name-history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast.success("改姓を登録しました");
        reset();
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error("登録に失敗しました");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>改姓を登録</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nc-name">新しい氏名 *</Label>
            <Input id="nc-name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="nc-kana">新しいフリガナ</Label>
            <Input id="nc-kana" {...register("nameKana")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nc-date">変更日（有効開始日） *</Label>
            <Input id="nc-date" type="date" {...register("validFrom")} />
            {errors.validFrom && (
              <p className="text-sm text-destructive">
                {errors.validFrom.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="nc-note">備考</Label>
            <Textarea
              id="nc-note"
              placeholder="例: 結婚に伴う改姓"
              {...register("note")}
            />
          </div>

          <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm flex items-start gap-2 text-blue-800">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <span>登録すると従業員マスタの氏名も自動的に更新されます。</span>
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
              {loading ? "登録中..." : "登録する"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

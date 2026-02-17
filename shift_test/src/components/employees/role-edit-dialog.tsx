"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { roleEditSchema } from "@/lib/validations/employee";
import { toast } from "sonner";

type FormData = z.infer<typeof roleEditSchema>;

interface Role {
  id: number;
  roleName: string;
  roleType: string;
  isPrimary: boolean | null;
  startDate: string | null;
  endDate?: string | null;
}

interface RoleEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: number;
  role: Role;
  onSuccess: () => void;
}

export function RoleEditDialog({
  open,
  onOpenChange,
  employeeId,
  role,
  onSuccess,
}: RoleEditDialogProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(roleEditSchema),
  });

  const endDateValue = watch("endDate");

  useEffect(() => {
    if (open && role) {
      reset({
        isPrimary: role.isPrimary ?? false,
        startDate: role.startDate ?? "",
        endDate: role.endDate ?? "",
      });
    }
  }, [open, role, reset]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/employees/${employeeId}/roles/${role.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            isPrimary: data.isPrimary,
            startDate: data.startDate,
            endDate: data.endDate || null,
          }),
        }
      );
      if (res.ok) {
        toast.success("役割を更新しました");
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
          <DialogTitle>役割を編集</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>役割名</Label>
            <Input value={role.roleName} disabled />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="editIsPrimary"
              checked={watch("isPrimary")}
              onCheckedChange={(checked) =>
                setValue("isPrimary", checked === true)
              }
            />
            <Label htmlFor="editIsPrimary">主担当にする</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="editStartDate">開始日 *</Label>
            <Input
              id="editStartDate"
              type="date"
              {...register("startDate")}
            />
            {errors.startDate && (
              <p className="text-sm text-destructive">
                {errors.startDate.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="editEndDate">終了日</Label>
            <div className="flex gap-2">
              <Input
                id="editEndDate"
                type="date"
                {...register("endDate")}
                className="flex-1"
              />
              {endDateValue && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setValue("endDate", "")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              終了日を入力すると役割が終了します。クリアすると再びアクティブになります。
            </p>
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

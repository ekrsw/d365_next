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
import { groupSchema } from "@/lib/validations/group";
import { toast } from "sonner";

type FormData = z.infer<typeof groupSchema>;

interface Group {
  id: number;
  name: string;
}

interface GroupEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group?: Group | null;
  onSuccess: () => void;
}

export function GroupEditDialog({
  open,
  onOpenChange,
  group,
  onSuccess,
}: GroupEditDialogProps) {
  const [loading, setLoading] = useState(false);
  const isEdit = !!group;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(groupSchema),
  });

  useEffect(() => {
    if (group) {
      reset({ name: group.name });
    } else {
      reset({ name: "" });
    }
  }, [group, reset]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const url = isEdit ? `/api/groups/${group.id}` : "/api/groups";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success(isEdit ? "更新しました" : "追加しました");
        reset();
        onOpenChange(false);
        onSuccess();
      } else {
        const err = await res.json();
        toast.error(err.error || "エラーが発生しました");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "グループを編集" : "グループを追加"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="groupName">グループ名 *</Label>
            <Input id="groupName" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
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

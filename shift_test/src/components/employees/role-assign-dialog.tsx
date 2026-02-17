"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { roleAssignSchema } from "@/lib/validations/employee";
import { toast } from "sonner";

type FormData = z.infer<typeof roleAssignSchema>;

const roleTypeLabels: Record<string, string> = {
  FUNCTION: "業務役割",
  AUTHORITY: "監督権限",
  POSITION: "役職",
};

interface RoleAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: number;
  currentRoles: { roleType: string; roleName: string }[];
  functionRoles: {
    id: number;
    roleCode: string;
    roleName: string;
    roleType: string;
  }[];
  onSuccess: () => void;
}

export function RoleAssignDialog({
  open,
  onOpenChange,
  employeeId,
  currentRoles,
  functionRoles,
  onSuccess,
}: RoleAssignDialogProps) {
  const [loading, setLoading] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(roleAssignSchema),
    defaultValues: { isPrimary: false },
  });

  const conflictWarning = useMemo(() => {
    if (!selectedRoleId) return null;
    const selectedRole = functionRoles.find((r) => r.id === selectedRoleId);
    if (!selectedRole) return null;
    const conflict = currentRoles.find(
      (r) => r.roleType === selectedRole.roleType
    );
    if (!conflict) return null;
    return {
      category: roleTypeLabels[selectedRole.roleType] || selectedRole.roleType,
      existingRole: conflict.roleName,
    };
  }, [selectedRoleId, currentRoles, functionRoles]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/employees/${employeeId}/roles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast.success("役割を追加しました");
        reset();
        setSelectedRoleId(null);
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error("追加に失敗しました");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>役割を追加</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>役割 *</Label>
            <Select
              onValueChange={(v) => {
                const id = parseInt(v);
                setSelectedRoleId(id);
                setValue("functionRoleId", id);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="選択してください" />
              </SelectTrigger>
              <SelectContent>
                {functionRoles.map((r) => (
                  <SelectItem key={r.id} value={String(r.id)}>
                    {r.roleName}（{roleTypeLabels[r.roleType]}）
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.functionRoleId && (
              <p className="text-sm text-destructive">
                {errors.functionRoleId.message}
              </p>
            )}
          </div>

          {conflictWarning && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm">
              <div className="flex items-center gap-2 text-amber-800">
                <AlertTriangle className="h-4 w-4" />
                <span>
                  「{conflictWarning.category}」カテゴリには既に「
                  {conflictWarning.existingRole}」が割り当てられています。
                  追加すると自動的に終了されます。
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Checkbox
              id="isPrimary"
              onCheckedChange={(checked) =>
                setValue("isPrimary", checked === true)
              }
            />
            <Label htmlFor="isPrimary">主担当にする</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">開始日 *</Label>
            <Input id="startDate" type="date" {...register("startDate")} />
            {errors.startDate && (
              <p className="text-sm text-destructive">
                {errors.startDate.message}
              </p>
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
              {loading ? "追加中..." : "追加する"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

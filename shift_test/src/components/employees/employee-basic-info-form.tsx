"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { employeeUpdateSchema } from "@/lib/validations/employee";
import { toast } from "sonner";

type FormData = z.infer<typeof employeeUpdateSchema>;

interface EmployeeData {
  id: number;
  name: string;
  nameKana: string | null;
  group: { id: number; name: string } | null;
  groupId: number | null;
  assignmentDate: string | null;
  terminationDate: string | null;
}

interface EmployeeBasicInfoFormProps {
  employee: EmployeeData;
  groups: { id: number; name: string }[];
  onUpdate: () => void;
}

export function EmployeeBasicInfoForm({
  employee,
  groups,
  onUpdate,
}: EmployeeBasicInfoFormProps) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(employeeUpdateSchema),
    defaultValues: {
      groupId: employee.groupId,
      assignmentDate: employee.assignmentDate,
      terminationDate: employee.terminationDate,
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/employees/${employee.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast.success("保存しました");
        setEditing(false);
        onUpdate();
      } else {
        toast.error("保存に失敗しました");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    setEditing(false);
  };

  if (!editing) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            編集する
          </Button>
        </div>
        <div className="grid grid-cols-[180px_1fr] gap-y-4 text-sm">
          <div className="text-muted-foreground font-medium">氏名</div>
          <div>{employee.name}</div>
          <div className="text-muted-foreground font-medium">フリガナ</div>
          <div>{employee.nameKana || "—"}</div>
          <div className="text-muted-foreground font-medium">グループ</div>
          <div>{employee.group?.name || "—"}</div>
          <div className="text-muted-foreground font-medium">配属日</div>
          <div>{employee.assignmentDate || "—"}</div>
          <div className="text-muted-foreground font-medium">退職日</div>
          <div>{employee.terminationDate || "—"}</div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-[180px_1fr] gap-y-4 text-sm">
        <div className="text-muted-foreground font-medium">氏名</div>
        <div>{employee.name}</div>
        <div className="text-muted-foreground font-medium">フリガナ</div>
        <div>{employee.nameKana || "—"}</div>
      </div>
      <p className="text-xs text-muted-foreground">
        ※ 氏名の変更は「氏名変更履歴」タブから行ってください
      </p>
      <div className="space-y-2">
        <Label>グループ</Label>
        <Select
          defaultValue={employee.groupId ? String(employee.groupId) : undefined}
          onValueChange={(v) => setValue("groupId", parseInt(v))}
        >
          <SelectTrigger>
            <SelectValue placeholder="選択してください" />
          </SelectTrigger>
          <SelectContent>
            {groups.map((g) => (
              <SelectItem key={g.id} value={String(g.id)}>
                {g.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-assignment">配属日</Label>
          <Input
            id="edit-assignment"
            type="date"
            {...register("assignmentDate")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-termination">退職日</Label>
          <Input
            id="edit-termination"
            type="date"
            {...register("terminationDate")}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={handleCancel}>
          キャンセル
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "保存中..." : "保存する"}
        </Button>
      </div>
    </form>
  );
}

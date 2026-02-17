"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GroupEditDialog } from "./group-edit-dialog";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { toast } from "sonner";

interface Group {
  id: number;
  name: string;
  employeeCount: number;
}

interface GroupTableProps {
  groups: Group[];
  onUpdate: () => void;
}

export function GroupTable({ groups, onUpdate }: GroupTableProps) {
  const [editGroup, setEditGroup] = useState<Group | null>(null);
  const [deleteGroup, setDeleteGroup] = useState<Group | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDelete = async () => {
    if (!deleteGroup) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/groups/${deleteGroup.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("グループを削除しました");
        setDeleteGroup(null);
        onUpdate();
      } else {
        const data = await res.json();
        toast.error(data.error || "削除に失敗しました");
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead>グループ名</TableHead>
              <TableHead className="w-32">所属人数</TableHead>
              <TableHead className="w-40">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.map((group) => (
              <TableRow key={group.id}>
                <TableCell>{group.id}</TableCell>
                <TableCell className="font-medium">{group.name}</TableCell>
                <TableCell>{group.employeeCount}名</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditGroup(group)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteGroup(group)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <GroupEditDialog
        open={!!editGroup}
        onOpenChange={(open) => !open && setEditGroup(null)}
        group={editGroup}
        onSuccess={() => {
          setEditGroup(null);
          onUpdate();
        }}
      />

      <ConfirmDialog
        open={!!deleteGroup}
        onOpenChange={(open) => !open && setDeleteGroup(null)}
        title="グループの削除"
        description={
          deleteGroup && deleteGroup.employeeCount > 0
            ? `「${deleteGroup.name}」には${deleteGroup.employeeCount}名の従業員が所属しています。削除できません。`
            : `「${deleteGroup?.name}」を削除してもよろしいですか？`
        }
        confirmLabel="削除する"
        variant="destructive"
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </>
  );
}

"use client";

import { useState } from "react";
import { Plus, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RoleTypeBadge } from "@/components/common/role-type-badge";
import { RoleAssignDialog } from "./role-assign-dialog";
import { RoleEditDialog } from "./role-edit-dialog";
import { toast } from "sonner";

const roleTypeLabels: Record<string, string> = {
  FUNCTION: "業務役割",
  AUTHORITY: "監督権限",
  POSITION: "役職",
};

interface Role {
  id: number;
  functionRoleId: number | null;
  roleName: string;
  roleCode: string;
  roleType: string;
  isPrimary: boolean | null;
  startDate: string | null;
  endDate?: string | null;
}

interface FunctionRole {
  id: number;
  roleCode: string;
  roleName: string;
  roleType: string;
}

interface EmployeeRoleManagerProps {
  employeeId: number;
  currentRoles: Role[];
  pastRoles: Role[];
  functionRoles: FunctionRole[];
  onUpdate: () => void;
}

export function EmployeeRoleManager({
  employeeId,
  currentRoles,
  pastRoles,
  functionRoles,
  onUpdate,
}: EmployeeRoleManagerProps) {
  const [assignOpen, setAssignOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const handleDeleteRole = async (roleId: number) => {
    const res = await fetch(`/api/employees/${employeeId}/roles/${roleId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      toast.success("役割を削除しました");
      onUpdate();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">現在の役割</h3>
        <Button size="sm" onClick={() => setAssignOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          役割を追加
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>役割名</TableHead>
              <TableHead>カテゴリ</TableHead>
              <TableHead>主担当</TableHead>
              <TableHead>開始日</TableHead>
              <TableHead>終了日</TableHead>
              <TableHead className="w-32">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentRoles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                  役割が割り当てられていません
                </TableCell>
              </TableRow>
            ) : (
              currentRoles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.roleName}</TableCell>
                  <TableCell>
                    <RoleTypeBadge roleType={role.roleType} roleName={roleTypeLabels[role.roleType]} />
                  </TableCell>
                  <TableCell>{role.isPrimary ? "●" : "—"}</TableCell>
                  <TableCell>{role.startDate || "—"}</TableCell>
                  <TableCell>{role.endDate || "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingRole(role)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRole(role.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pastRoles.length > 0 && (
        <>
          <h3 className="text-lg font-semibold">過去の役割</h3>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>役割名</TableHead>
                  <TableHead>カテゴリ</TableHead>
                  <TableHead>主担当</TableHead>
                  <TableHead>開始日</TableHead>
                  <TableHead>終了日</TableHead>
                  <TableHead className="w-20">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pastRoles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>{role.roleName}</TableCell>
                    <TableCell>
                      <RoleTypeBadge roleType={role.roleType} roleName={roleTypeLabels[role.roleType]} />
                    </TableCell>
                    <TableCell>{role.isPrimary ? "●" : "—"}</TableCell>
                    <TableCell>{role.startDate || "—"}</TableCell>
                    <TableCell>{role.endDate || "—"}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingRole(role)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <RoleAssignDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        employeeId={employeeId}
        currentRoles={currentRoles}
        functionRoles={functionRoles}
        onSuccess={onUpdate}
      />

      {editingRole && (
        <RoleEditDialog
          open={!!editingRole}
          onOpenChange={(open) => {
            if (!open) setEditingRole(null);
          }}
          employeeId={employeeId}
          role={editingRole}
          onSuccess={onUpdate}
        />
      )}
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/common/status-badge";
import { RoleTypeBadge } from "@/components/common/role-type-badge";

interface Employee {
  id: number;
  name: string;
  nameKana: string | null;
  group: { id: number; name: string } | null;
  roles: {
    id: number;
    roleName: string;
    roleType: string;
    isPrimary: boolean | null;
  }[];
  assignmentDate: string | null;
  isActive: boolean;
}

interface EmployeeTableProps {
  employees: Employee[];
}

export function EmployeeTable({ employees }: EmployeeTableProps) {
  const router = useRouter();

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-48">氏名</TableHead>
            <TableHead>グループ</TableHead>
            <TableHead>役割</TableHead>
            <TableHead>配属日</TableHead>
            <TableHead className="w-24">状態</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                従業員が見つかりません
              </TableCell>
            </TableRow>
          ) : (
            employees.map((emp) => (
              <TableRow
                key={emp.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => router.push(`/employees/${emp.id}`)}
              >
                <TableCell>
                  <div>
                    <div className="font-medium">{emp.name}</div>
                    {emp.nameKana && (
                      <div className="text-xs text-muted-foreground">
                        {emp.nameKana}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{emp.group?.name || "—"}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {emp.roles.map((role) => (
                      <RoleTypeBadge
                        key={role.id}
                        roleType={role.roleType}
                        roleName={role.roleName}
                      />
                    ))}
                  </div>
                </TableCell>
                <TableCell>{emp.assignmentDate || "—"}</TableCell>
                <TableCell>
                  <StatusBadge isActive={emp.isActive} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
